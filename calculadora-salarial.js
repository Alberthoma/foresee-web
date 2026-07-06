'use strict';

/* ==========================================================================
   Calculadora de Salario Neto — lógica
   Datos fiscales: año fiscal 2026 (IRS + agencias tributarias estatales).
   Estimador de nómina — no sustituye asesoría fiscal profesional.
   ========================================================================== */

const PAY_PERIODS = 26; // Quincenal

const FEDERAL_TAX_2026 = {
  standardDeduction: { single: 16100, married: 32200 },
  brackets: {
    single: [
      { rate: 0.10, upto: 12400 },
      { rate: 0.12, upto: 50400 },
      { rate: 0.22, upto: 105700 },
      { rate: 0.24, upto: 201775 },
      { rate: 0.32, upto: 256225 },
      { rate: 0.35, upto: 640600 },
      { rate: 0.37, upto: Infinity },
    ],
    married: [
      { rate: 0.10, upto: 24800 },
      { rate: 0.12, upto: 100800 },
      { rate: 0.22, upto: 211400 },
      { rate: 0.24, upto: 403550 },
      { rate: 0.32, upto: 512450 },
      { rate: 0.35, upto: 768700 },
      { rate: 0.37, upto: Infinity },
    ],
  },
};

const FICA_2026 = {
  socialSecurityRate: 0.062,
  socialSecurityWageBase: 184500,
  medicareRate: 0.0145,
};

// Estados soportados. type: 'none' (sin impuesto estatal), 'flat' (tasa plana),
// 'bracket' (tramos progresivos, como el federal).
const STATES = {
  FL: { name: 'Florida', type: 'none' },
  TX: { name: 'Texas', type: 'none' },
  GA: {
    name: 'Georgia',
    type: 'flat',
    rate: 0.0499,
    standardDeduction: { single: 15000, married: 30000 },
  },
  IN: {
    name: 'Indiana',
    type: 'flat',
    rate: 0.0295,
    standardDeduction: { single: 1000, married: 2000 }, // exención personal, no deducción estándar
  },
  NC: {
    name: 'Carolina del Norte',
    type: 'flat',
    rate: 0.0399,
    standardDeduction: { single: 12750, married: 25500 },
  },
  NY: {
    name: 'New York',
    type: 'bracket',
    standardDeduction: { single: 8000, married: 16050 },
    brackets: {
      single: [
        { rate: 0.039, upto: 8500 },
        { rate: 0.044, upto: 11700 },
        { rate: 0.0515, upto: 13900 },
        { rate: 0.054, upto: 80650 },
        { rate: 0.059, upto: 215400 },
        { rate: 0.0685, upto: 1077550 },
        { rate: 0.0965, upto: 5000000 },
        { rate: 0.103, upto: 25000000 },
        { rate: 0.109, upto: Infinity },
      ],
      married: [
        { rate: 0.039, upto: 17150 },
        { rate: 0.044, upto: 23600 },
        { rate: 0.0515, upto: 27900 },
        { rate: 0.054, upto: 161550 },
        { rate: 0.059, upto: 323200 },
        { rate: 0.0685, upto: 2155350 },
        { rate: 0.0965, upto: 5000000 },
        { rate: 0.103, upto: 25000000 },
        { rate: 0.109, upto: Infinity },
      ],
    },
  },
  CA: {
    name: 'California',
    type: 'bracket',
    standardDeduction: { single: 5706, married: 11412 },
    sdiRate: 0.013,
    brackets: {
      single: [
        { rate: 0.01, upto: 10756 },
        { rate: 0.02, upto: 25499 },
        { rate: 0.04, upto: 40245 },
        { rate: 0.06, upto: 55866 },
        { rate: 0.08, upto: 70612 },
        { rate: 0.093, upto: 360659 },
        { rate: 0.103, upto: 432787 },
        { rate: 0.113, upto: 721314 },
        { rate: 0.123, upto: 1000000 },
        { rate: 0.133, upto: Infinity },
      ],
      married: [
        { rate: 0.01, upto: 21512 },
        { rate: 0.02, upto: 50998 },
        { rate: 0.04, upto: 80490 },
        { rate: 0.06, upto: 111732 },
        { rate: 0.08, upto: 141224 },
        { rate: 0.093, upto: 721318 },
        { rate: 0.103, upto: 865574 },
        { rate: 0.113, upto: 1442628 },
        { rate: 0.123, upto: 2000000 },
        { rate: 0.133, upto: Infinity },
      ],
    },
  },
};

const DEFAULT_STATE = 'FL';
const STORAGE_KEY_ENTRIES = 'calculadoraSalarialEntries';
const STORAGE_KEY_THEME = 'calculadoraSalarialTheme';

const formatCurrency = (value) =>
  `$${Math.max(0, value)
    .toFixed(2)
    .replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;

/** Suma progresiva de impuesto por tramos (federal, NY, CA). */
function calculateBracketTax(taxableAnnual, brackets) {
  let tax = 0;
  let previousLimit = 0;
  for (const bracket of brackets) {
    if (taxableAnnual <= previousLimit) break;
    const taxableInBracket = Math.min(taxableAnnual, bracket.upto) - previousLimit;
    tax += taxableInBracket * bracket.rate;
    previousLimit = bracket.upto;
  }
  return tax;
}

function calculateStateTax(stateCode, filingStatus, annualTaxableBeforeStateDeduction) {
  const cfg = STATES[stateCode];
  if (!cfg || cfg.type === 'none') return 0;

  const deduction = cfg.standardDeduction[filingStatus];
  const taxable = Math.max(0, annualTaxableBeforeStateDeduction - deduction);

  if (cfg.type === 'flat') return taxable * cfg.rate;
  if (cfg.type === 'bracket') return calculateBracketTax(taxable, cfg.brackets[filingStatus]);
  return 0;
}

/**
 * Calcula el desglose completo de un cálculo de salario.
 * @param {object} data - campos crudos del formulario/fila
 * @returns {object} desglose con todos los montos por período
 */
function calculatePaycheck(data) {
  const hourlyRate = Number(data.hourlyRate) || 0;
  const regularHours = Number(data.regularHours) || 0;
  const holidayHours = Number(data.holidayHours) || 0;
  const overtimeHours = Number(data.overtimeHours) || 0;
  const filingStatus = data.filingStatus === 'married' ? 'married' : 'single';
  const stateCode = STATES[data.state] ? data.state : DEFAULT_STATE;

  const contribution401kType = data.contribution401kType === 'amount' ? 'amount' : 'percent';
  const contribution401kValue = Number(data.contribution401kValue) || 0;
  const medicalDeduction = Number(data.medicalDeduction) || 0;
  const dentalDeduction = Number(data.dentalDeduction) || 0;
  const visionDeduction = Number(data.visionDeduction) || 0;
  const loan401k = Number(data.loan401k) || 0;
  const otherPostTaxDeduction = Number(data.otherPostTaxDeduction) || 0;

  // Salario bruto: regulares y feriado se pagan a tarifa normal, overtime a 1.5x.
  // Las horas de feriado NO cuentan como overtime (se reportan aparte, ya
  // clasificadas por quien ingresa los datos).
  const regularPayHours = regularHours + holidayHours;
  const overtimeRate = hourlyRate * 1.5;
  const grossPay = regularPayHours * hourlyRate + overtimeHours * overtimeRate;

  // Deducciones pre-impuestos
  const contribution401kAmount =
    contribution401kType === 'percent' ? grossPay * (contribution401kValue / 100) : contribution401kValue;
  const preTaxDeductions = contribution401kAmount + medicalDeduction + dentalDeduction + visionDeduction;

  // Base imponible anualizada (misma base para federal y estatal, cada uno resta su propia deducción estándar)
  const annualTaxableBase = Math.max(0, (grossPay - preTaxDeductions)) * PAY_PERIODS;

  // Impuesto federal
  const federalStandardDeduction = FEDERAL_TAX_2026.standardDeduction[filingStatus];
  const federalTaxableAnnual = Math.max(0, annualTaxableBase - federalStandardDeduction);
  const federalTaxAnnual = calculateBracketTax(federalTaxableAnnual, FEDERAL_TAX_2026.brackets[filingStatus]);
  const federalTaxPerPeriod = federalTaxAnnual / PAY_PERIODS;

  // Impuesto estatal
  const stateTaxAnnual = calculateStateTax(stateCode, filingStatus, annualTaxableBase);
  const stateTaxPerPeriod = stateTaxAnnual / PAY_PERIODS;

  // FICA: el 401(k) tradicional SÍ es imponible para FICA, pero las primas
  // pre-impuesto de salud/dental/visión (plan de cafetería, Sección 125 del
  // IRC) están exentas de FICA. Seguro Social con tope anual (proyectado
  // asumiendo ingreso uniforme todo el año), Medicare sin tope.
  const ficaWages = Math.max(0, grossPay - medicalDeduction - dentalDeduction - visionDeduction);
  const annualFicaWagesProjected = ficaWages * PAY_PERIODS;
  const ssTaxableAnnual = Math.min(annualFicaWagesProjected, FICA_2026.socialSecurityWageBase);
  const socialSecurityTaxPerPeriod = (ssTaxableAnnual / PAY_PERIODS) * FICA_2026.socialSecurityRate;
  const medicareTaxPerPeriod = ficaWages * FICA_2026.medicareRate;

  // SDI (solo California)
  const sdiPerPeriod = stateCode === 'CA' ? grossPay * STATES.CA.sdiRate : 0;

  // Deducciones post-impuestos
  const postTaxDeductions = loan401k + otherPostTaxDeduction;

  const totalDeductions =
    preTaxDeductions +
    federalTaxPerPeriod +
    socialSecurityTaxPerPeriod +
    medicareTaxPerPeriod +
    stateTaxPerPeriod +
    sdiPerPeriod +
    postTaxDeductions;
  const netPay = grossPay - totalDeductions;

  return {
    stateCode,
    grossPay,
    // Desglose del salario bruto (para la tarjeta "Salario Bruto" del historial)
    regularSubtotal: regularHours * hourlyRate,
    holidaySubtotal: holidayHours * hourlyRate,
    overtimeSubtotal: overtimeHours * overtimeRate,
    overtimeRate,
    // Desglose de deducciones pre-impuestos
    preTaxDeductions,
    contribution401kAmount,
    medicalDeduction,
    dentalDeduction,
    visionDeduction,
    // Impuestos
    federalTaxPerPeriod,
    socialSecurityTaxPerPeriod,
    medicareTaxPerPeriod,
    stateTaxPerPeriod,
    sdiPerPeriod,
    // Desglose de deducciones post-impuestos
    postTaxDeductions,
    loan401k,
    otherPostTaxDeduction,
    netPay,
  };
}

/* ---------------------------------------------------------------------- */
/* Persistencia                                                          */
/* ---------------------------------------------------------------------- */

function loadEntries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ENTRIES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveEntries(entries) {
  localStorage.setItem(STORAGE_KEY_ENTRIES, JSON.stringify(entries));
}

/* ---------------------------------------------------------------------- */
/* Tema claro/oscuro                                                     */
/* ---------------------------------------------------------------------- */

function initTheme() {
  const stored = localStorage.getItem(STORAGE_KEY_THEME);
  if (stored === 'light' || stored === 'dark') {
    document.documentElement.setAttribute('data-theme', stored);
  }

  document.getElementById('theme-toggle').addEventListener('click', () => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const current = document.documentElement.getAttribute('data-theme') || (prefersDark ? 'dark' : 'light');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(STORAGE_KEY_THEME, next);
  });
}

/* ---------------------------------------------------------------------- */
/* Formulario y tabla                                                    */
/* ---------------------------------------------------------------------- */

let editingEntryId = null;

function readFormData() {
  return {
    state: document.getElementById('state').value,
    hourlyRate: document.getElementById('hourlyRate').value,
    regularHours: document.getElementById('regularHours').value,
    holidayHours: document.getElementById('holidayHours').value,
    overtimeHours: document.getElementById('overtimeHours').value,
    filingStatus: document.getElementById('filingStatus').value,
    contribution401kType: document.getElementById('contribution401kType').value,
    contribution401kValue: document.getElementById('contribution401kValue').value,
    medicalDeduction: document.getElementById('medicalDeduction').value,
    dentalDeduction: document.getElementById('dentalDeduction').value,
    visionDeduction: document.getElementById('visionDeduction').value,
    loan401k: document.getElementById('loan401k').value,
    otherPostTaxDeduction: document.getElementById('otherPostTaxDeduction').value,
  };
}

function fillForm(entry) {
  document.getElementById('state').value = entry.state;
  document.getElementById('hourlyRate').value = entry.hourlyRate;
  document.getElementById('regularHours').value = entry.regularHours;
  document.getElementById('holidayHours').value = entry.holidayHours;
  document.getElementById('overtimeHours').value = entry.overtimeHours;
  document.getElementById('filingStatus').value = entry.filingStatus;
  document.getElementById('contribution401kType').value = entry.contribution401kType;
  document.getElementById('contribution401kValue').value = entry.contribution401kValue;
  document.getElementById('medicalDeduction').value = entry.medicalDeduction;
  document.getElementById('dentalDeduction').value = entry.dentalDeduction;
  document.getElementById('visionDeduction').value = entry.visionDeduction;
  document.getElementById('loan401k').value = entry.loan401k;
  document.getElementById('otherPostTaxDeduction').value = entry.otherPostTaxDeduction;
  updateContribution401kLabel();
}

function resetFormToAddMode() {
  editingEntryId = null;
  document.getElementById('salary-form').reset();
  updateContribution401kLabel();
  document.getElementById('form-title').textContent = 'Nuevo Cálculo';
  document.getElementById('submit-btn').textContent = 'Agregar Cálculo';
  document.getElementById('cancel-edit-btn').classList.add('hidden');
}

function updateContribution401kLabel() {
  const type = document.getElementById('contribution401kType').value;
  const label = document.getElementById('contribution401kLabel');
  label.textContent = type === 'percent' ? 'Valor 401(k) (%)' : 'Valor 401(k) ($)';
}

function populateStateSelect() {
  const select = document.getElementById('state');
  select.innerHTML = '';
  Object.entries(STATES).forEach(([code, cfg]) => {
    const option = document.createElement('option');
    option.value = code;
    option.textContent = cfg.name;
    if (code === DEFAULT_STATE) option.selected = true;
    select.appendChild(option);
  });
}

function stateTaxLabel(stateCode) {
  const cfg = STATES[stateCode];
  if (cfg.type === 'none') return 'Sin impuesto estatal';
  return null;
}

function renderTable() {
  const entries = loadEntries();
  const list = document.getElementById('results-list');
  list.innerHTML = '';
  document.getElementById('empty-hint').classList.toggle('hidden', entries.length > 0);

  entries.forEach((entry) => {
    list.appendChild(buildEntryCard(entry));
  });
}

function buildEntryCard(entry) {
  const result = calculatePaycheck(entry);

  const card = document.createElement('div');
  card.className = 'entry-card';
  card.dataset.id = entry.id;

  const header = document.createElement('div');
  header.className = 'entry-card__header';
  header.append(
    buildSelectField('Estado', Object.entries(STATES).map(([code, cfg]) => [code, cfg.name]), entry.state, (value) =>
      updateEntryField(entry.id, 'state', value),
    ),
    buildNumberField('Tarifa/Hora ($)', entry.hourlyRate, '0.01', (value) =>
      updateEntryField(entry.id, 'hourlyRate', value),
    ),
    buildNumberField('H. Regulares', entry.regularHours, '0.1', (value) =>
      updateEntryField(entry.id, 'regularHours', value),
    ),
    buildNumberField('H. Feriado', entry.holidayHours, '0.1', (value) =>
      updateEntryField(entry.id, 'holidayHours', value),
    ),
    buildNumberField('H. Overtime', entry.overtimeHours, '0.01', (value) =>
      updateEntryField(entry.id, 'overtimeHours', value),
    ),
    buildSelectField(
      'Estado Civil',
      [
        ['single', 'Soltero/a'],
        ['married', 'Casado/a'],
      ],
      entry.filingStatus,
      (value) => updateEntryField(entry.id, 'filingStatus', value),
    ),
    buildEntryActions(entry.id),
  );

  const categories = document.createElement('div');
  categories.className = 'category-list';

  categories.appendChild(
    buildCategoryRow('gross', 'Salario Bruto', result.grossPay, [
      [`Regulares (${entry.regularHours} h × ${formatCurrency(entry.hourlyRate)}/h)`, result.regularSubtotal],
      [`Feriado (${entry.holidayHours} h × ${formatCurrency(entry.hourlyRate)}/h)`, result.holidaySubtotal],
      [`Overtime (${entry.overtimeHours} h × ${formatCurrency(result.overtimeRate)}/h)`, result.overtimeSubtotal],
    ]),
  );

  categories.appendChild(
    buildCategoryRow('pretax', 'Deducciones Pre-Impuestos', result.preTaxDeductions, [
      ['401(k)', result.contribution401kAmount],
      ['Seguro Médico', result.medicalDeduction],
      ['Seguro Dental', result.dentalDeduction],
      ['Seguro Visión', result.visionDeduction],
    ]),
  );

  const stateLabel = stateTaxLabel(entry.state);
  const taxDetails = [
    ['Impuesto Federal', result.federalTaxPerPeriod],
    ['Seguro Social', result.socialSecurityTaxPerPeriod],
    ['Medicare', result.medicareTaxPerPeriod],
    [`Impuesto Estatal (${STATES[entry.state].name})`, stateLabel || result.stateTaxPerPeriod],
  ];
  if (entry.state === 'CA') taxDetails.push(['SDI California', result.sdiPerPeriod]);
  const totalTax =
    result.federalTaxPerPeriod + result.socialSecurityTaxPerPeriod + result.medicareTaxPerPeriod + result.stateTaxPerPeriod + result.sdiPerPeriod;
  categories.appendChild(buildCategoryRow('tax', 'Impuestos', totalTax, taxDetails));

  categories.appendChild(
    buildCategoryRow('posttax', 'Deducciones Post-Impuestos', result.postTaxDeductions, [
      ['Préstamo de 401(k)', result.loan401k],
      ['Otras Deducciones', result.otherPostTaxDeduction],
    ]),
  );

  const net = document.createElement('div');
  net.className = 'net-row';
  net.innerHTML = `
    <div class="net-row__bar"></div>
    <div class="net-row__name">Salario Neto</div>
    <div class="net-row__amount">${formatCurrency(result.netPay)}</div>
  `;
  categories.appendChild(net);

  card.append(header, categories);
  return card;
}

function buildEntryActions(entryId) {
  const wrapper = document.createElement('div');
  wrapper.className = 'entry-card__actions';

  const editBtn = document.createElement('button');
  editBtn.type = 'button';
  editBtn.className = 'icon-btn';
  editBtn.textContent = 'Editar';
  editBtn.addEventListener('click', () => startEdit(entryId));

  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'icon-btn icon-btn--danger';
  deleteBtn.textContent = 'Eliminar';
  deleteBtn.addEventListener('click', () => deleteEntry(entryId));

  wrapper.append(editBtn, deleteBtn);
  return wrapper;
}

function buildSelectField(labelText, options, selectedValue, onChange) {
  const field = document.createElement('div');
  field.className = 'entry-card__field';

  const label = document.createElement('label');
  label.textContent = labelText;

  const select = document.createElement('select');
  options.forEach(([value, text]) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = text;
    if (value === selectedValue) option.selected = true;
    select.appendChild(option);
  });
  select.addEventListener('change', () => onChange(select.value));

  field.append(label, select);
  return field;
}

function buildNumberField(labelText, value, step, onChange) {
  const field = document.createElement('div');
  field.className = 'entry-card__field';

  const label = document.createElement('label');
  label.textContent = labelText;

  const input = document.createElement('input');
  input.type = 'number';
  input.min = '0';
  input.step = step;
  input.value = value;
  input.addEventListener('input', () => onChange(input.value));

  field.append(label, input);
  return field;
}

/**
 * Tarjeta de categoría desplegable (Salario Bruto / Deducciones Pre-Impuestos /
 * Impuestos / Deducciones Post-Impuestos). Colapsada muestra el total; al
 * expandir revela el desglose línea por línea, igual que un paystub real.
 */
function buildCategoryRow(kind, name, total, details) {
  const row = document.createElement('div');
  row.className = 'category-row';

  const summary = document.createElement('button');
  summary.type = 'button';
  summary.className = 'category-row__summary';
  summary.innerHTML = `
    <span class="category-row__bar category-row__bar--${kind}"></span>
    <span class="category-row__name">${name}</span>
    <span class="category-row__amount">${formatCurrency(total)}</span>
    <span class="category-row__chevron">▾</span>
  `;
  summary.addEventListener('click', () => row.classList.toggle('is-open'));

  const detailsEl = document.createElement('div');
  detailsEl.className = 'category-row__details';
  details.forEach(([label, value]) => {
    const item = document.createElement('div');
    item.className = 'category-row__detail-item';
    const valueText = typeof value === 'string' ? value : formatCurrency(value);
    item.innerHTML = `<span>${label}</span><span>${valueText}</span>`;
    detailsEl.appendChild(item);
  });

  row.append(summary, detailsEl);
  return row;
}

function updateEntryField(id, field, value) {
  const entries = loadEntries();
  const entry = entries.find((e) => e.id === id);
  if (!entry) return;
  entry[field] = value;
  saveEntries(entries);
  renderTable();
}

function deleteEntry(id) {
  const entries = loadEntries().filter((e) => e.id !== id);
  saveEntries(entries);
  if (editingEntryId === id) resetFormToAddMode();
  renderTable();
}

function startEdit(id) {
  const entries = loadEntries();
  const entry = entries.find((e) => e.id === id);
  if (!entry) return;
  editingEntryId = id;
  fillForm(entry);
  document.getElementById('form-title').textContent = 'Editar Cálculo';
  document.getElementById('submit-btn').textContent = 'Guardar Cambios';
  document.getElementById('cancel-edit-btn').classList.remove('hidden');
  document.getElementById('salary-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function handleFormSubmit(event) {
  event.preventDefault();
  const data = readFormData();
  const entries = loadEntries();

  if (editingEntryId) {
    const index = entries.findIndex((e) => e.id === editingEntryId);
    if (index !== -1) entries[index] = { ...entries[index], ...data };
  } else {
    entries.push({ id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, ...data });
  }

  saveEntries(entries);
  resetFormToAddMode();
  renderTable();
}

/* ---------------------------------------------------------------------- */
/* Inicialización                                                        */
/* ---------------------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  populateStateSelect();

  document.getElementById('contribution401kType').addEventListener('change', () => {
    updateContribution401kLabel();
    const type = document.getElementById('contribution401kType').value;
    document.getElementById('contribution401kValue').value = type === 'percent' ? '5' : '100';
  });

  document.getElementById('salary-form').addEventListener('submit', handleFormSubmit);
  document.getElementById('cancel-edit-btn').addEventListener('click', resetFormToAddMode);

  renderTable();
});
