# Foresee Finances — Blueprint Progresivo

> Documento de referencia técnica y documento vivo del proyecto.
> Se actualiza al finalizar cada fase o modificación significativa.

---

## ESTADO ACTUAL

| Campo | Valor |
|-------|-------|
| **Archivo activo** | `Foresee Cln 0001.html` |
| **Archivo de referencia** | `Edicion Cld 0003.html` (no modificar) |
| **Líneas del archivo** | 7 213 |
| **Última actualización** | 2026-05-17 |
| **Última fase completada** | Fase 11 — Acabados |
| **Próxima fase** | — Proyecto completo ✅ |

### Fases

| # | Sección | Estado |
|---|---------|--------|
| 1 | Fundación (CSS, HTML shell, Firebase init, Auth, switchTab) | ✅ Completa |
| 2 | Dashboard (loadUserData, renderDashboard, alertas) | ✅ Completa |
| 3 | Registros + Modal Calculadora + modales auxiliares | ✅ Completa |
| 4 | Configuración (CRUD listas, alias, password, export/import JSON) | ✅ Completa |
| 5 | Presupuesto (tabla editable, barra de progreso, alertas) | ✅ Completa |
| 6 | Gastos Recurrentes (CRUD, recordatorios, migración) | ✅ Completa |
| 7 | Gastos Comunes (cards, distribución por ítem, pago compartido) | ✅ Completa |
| 8 | Tarjetas de Crédito (tabla, inline edit, alerta 80%) | ✅ Completa |
| 9 | Proyección (getDynamicProjections, 3 tipos de fila, CRUD manual) | ✅ Completa |
| 10 | Reportes (Chart.js doughnut + bar chart) | ✅ Completa |
| 11 | Acabados (Saldos de cuentas, PDF, info modals) | ✅ Completa |

### Protocolo de inicio de sesión nueva

1. Leer este blueprint (estado actual + fase correspondiente)
2. Leer las secciones del HTML activo que se van a modificar (`Read` con `offset`/`limit`)
3. Confirmar punto de continuación antes de tocar código
4. Al terminar la sesión: actualizar la tabla de fases y agregar el detalle de lo implementado

---

---

## 1. Resumen Ejecutivo

**Foresee Finances** es un gestor de presupuesto personal web. Todo el código vive en un **único archivo HTML** (~6 400 líneas) que combina CSS, JS y HTML. Usa Firebase Auth + Firestore para autenticación y persistencia en tiempo real, Chart.js para gráficos y jsPDF para exportar PDF.

El rewrite `Foresee Cln 0001.html` nació para eliminar la deuda técnica del archivo original (`Edicion Cld 0003.html`, ~13 000 líneas, 503 KB): CSS duplicado, listeners acumulados, patrones `window.*` y falta de estructura.

**Principio rector:** misma funcionalidad, código limpio y mantenible.

---

## 2. Decisiones de Arquitectura (invariantes)

| Decisión | Elección | Motivo |
|----------|----------|--------|
| Formato | Archivo único HTML | Despliegue sin build step, compatible con Firebase Hosting |
| Backend | Firebase 11.6.1 (mismo proyecto `wittfinances-282f1`) | Mismos datos que el archivo original |
| CSS | 100% puro, mobile-first | Sin Tailwind, sin Bootstrap, zero dependencias de estilos |
| Cambios visuales en JS | Solo `classList.add/remove/toggle` o `element.style.setProperty('--var', val)` | Nunca atributos `style=""` inline en el HTML |
| Datos en DOM | `textContent` / `createTextNode` — nunca `innerHTML` con datos del usuario | Prevención XSS |
| Listeners | Event delegation en contenedores dinámicos — nunca por elemento | Prevención de fuga de memoria |
| Tiempo real | `onSnapshot` para todas las colecciones Firestore | Re-render automático al cambiar datos |
| Console | Solo `console.error` para errores reales — ningún `console.log` | Producción limpia |
| `window.*` | No se usa para ninguna comunicación nueva entre módulos | Módulo único ES6 |
| `eval()` | Prohibido. La calculadora usa `Function()` en `safeEval()` solo con expresiones numéricas validadas | Seguridad |

---

## 3. CDN (dependencias externas)

```html
<!-- Chart.js — gráficos de la sección Reportes (Fase 10) -->
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.min.js"></script>

<!-- jsPDF + AutoTable — export PDF (Fase 11) -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.23/jspdf.plugin.autotable.min.js"></script>
```

Firebase se importa como módulo ES desde `gstatic.com`:
```js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword,
         signOut, updatePassword, reauthenticateWithCredential, EmailAuthProvider }
  from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js';
import { getFirestore, doc, collection, addDoc, setDoc, updateDoc, deleteDoc,
         getDocs, getDoc, onSnapshot, query, orderBy, writeBatch }
  from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js';
```

El `<script>` principal usa `type="module"`.

---

## 4. Sistema de Diseño CSS

### 4.1 Tokens globales (`:root`)

```css
:root {
  /* Colores */
  --color-bg:          #0f1117;
  --color-surface:     #1a1d27;
  --color-surface-2:   #22253a;
  --color-border:      #2a2d3a;
  --color-text:        #e8eaf0;
  --color-text-muted:  #8b8fa8;
  --color-accent:      #4f8fff;  /* sobreescrito por sección */
  --color-danger:      #f05252;
  --color-success:     #22c97a;
  --color-warning:     #f59e0b;

  /* Espaciado */
  --space-xs: 0.25rem; --space-sm: 0.5rem; --space-md: 1rem;
  --space-lg: 1.5rem;  --space-xl: 2rem;

  /* Tipografía */
  --font-xs: 0.7rem; --font-sm: 0.8rem; --font-base: 0.9rem;
  --font-md: 1rem;   --font-lg: 1.15rem; --font-xl: 1.35rem;

  /* Radios */
  --radius-sm: 4px; --radius-md: 8px; --radius-lg: 12px;
  --radius-xl: 16px; --radius-full: 9999px;

  /* Sombras */
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.3);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.4);
  --shadow-lg: 0 8px 24px rgba(0,0,0,0.5);

  --transition: 0.2s ease;
  --header-bar-h: 4rem;
  --tab-bar-h:    5.5rem;
  --tab-bar-mobile-h: 5rem;
}
```

### 4.2 Acento por sección

Cada sección sobreescribe `--color-accent` en su contenedor. El resto de tokens (fondos, texto, bordes) no cambian.

| Sección HTML ID | `--color-accent` |
|-----------------|-----------------|
| `#section-registros` | `#4f8fff` (azul) |
| `#section-proyeccion` | `#06b6d4` (cyan) |
| `#section-recurrentes` | `#22c97a` (verde) |
| `#section-comunes` | `#f59e0b` (ámbar) |
| `#section-tarjetas` | `#f05252` (rojo) |
| `#section-saldos` | `#a78bfa` (violeta) |
| `#section-reportes` | `#a78bfa` (violeta) |
| `#section-presupuesto` | `#7c5cfc` (purple) |
| `#section-configuracion` | `#64748b` (slate) |

### 4.3 Clases base reutilizables

| Clase | Propósito |
|-------|-----------|
| `.hidden` | `display: none !important` |
| `.modal-overlay` / `.modal-overlay.active` | Overlay de fondo + `display: flex` |
| `.modal-box` | Contenedor blanco con `max-width: 460px` |
| `.modal-header` / `.modal-body` / `.modal-footer` | Estructura interna de modal |
| `.btn-modal-close` | Botón ✕ de cierre de modal |
| `.form-group` / `.form-label` / `.form-input` / `.form-select` / `.form-textarea` | Campos de formulario compartidos |
| `.input-error` | Span de error bajo un campo |
| `.btn-primary` / `.btn-outline` | Botones principales (azul sólido / borde) |
| `.btn-action` / `.btn-action--primary` / `.btn-action--danger` | Botones del action bar |
| `.data-table` | Tabla base (`width:100%`, `border-collapse:collapse`) |
| `.table-wrapper` | Contenedor con borde, radius, `overflow-x:auto` |
| `.tab-pane` / `.tab-pane--active` | Visibilidad de secciones (`display:none`/`display:block`) |
| `.badge` / `.badge--accent/success/danger/warning` | Etiquetas pill |
| `.empty-state` | Párrafo centrado cuando no hay datos |
| `.amount--income` / `.amount--expense` / `.amount--transfer` | Colores de montos en tablas |
| `.btn-icon` / `.btn-icon--danger` | Botones SVG de acción en filas (editar/eliminar) |
| `.filter-bar` | Barra de filtros (selects flexbox) |
| `.progress-bar` / `.progress-bar__fill` | Barra de progreso de presupuesto |
| `.spinner` / `.btn-spinner` | Indicadores de carga |
| `.toast` / `.toast--success/error/warning` | Notificaciones emergentes |
| `.dash-card` / `.dash-card__label` / `.dash-card__value` / `.dash-card__icon` | Cards del dashboard |
| `.alert-item` / `.alert-item--danger/success` | Alertas de advertencia en dashboard |

---

## 5. Constantes y Estado Global

### 5.1 Firebase Config

```js
const FIREBASE_CONFIG = {
  apiKey:            'AIzaSyCTicX5tqqVr3pK_RFqgvqpRavsUuTvS2g',
  authDomain:        'wittfinances-282f1.firebaseapp.com',
  projectId:         'wittfinances-282f1',
  storageBucket:     'wittfinances-282f1.firebasestorage.app',
  messagingSenderId: '998192322959',
  appId:             '1:998192322959:web:e2afcdd7f47da3767853fa',
};
const APP_ID = FIREBASE_CONFIG.projectId;  // 'wittfinances-282f1'
```

### 5.2 Helpers de rutas Firestore

```js
const DB_COL  = (uid, col) => `artifacts/${APP_ID}/users/${uid}/${col}`;
const DB_PREF = (uid)      => `artifacts/${APP_ID}/users/${uid}/user_data/preferences`;
```

Colecciones usadas:
- `DB_PREF(uid)` → documento de preferencias (categorías, bancos, descripciones, presupuestos, alias, saldo inicial)
- `DB_COL(uid, 'transactions')`
- `DB_COL(uid, 'recurringExpenses')`
- `DB_COL(uid, 'creditCards')`
- `DB_COL(uid, 'projections')`
- `artifacts/${APP_ID}/users/${uid}/user_data/gastosComunes` → documento único (no colección)

### 5.3 appState

```js
const appState = {
  // Datos en memoria (reflejados desde Firestore)
  transactions:      [],
  projections:       [],
  recurringExpenses: [],
  creditCards:       [],
  gastosComunes:     { people: [], items: [] },
  categories:        [],   // [{ name, icon }]
  banks:             [],   // ['Banco 1', 'Banco 2']
  descriptions:      [],   // ['Supermercado', ...]
  categoryBudgets:   {},   // { 'Categoría': 50000 }
  openingBalance:    0,
  userAlias:         '',
  // Estado UI
  currentTab:        null,
  currentUser:       null,
  budgetAlertsShown: {},
  filterMonth:       getCurrentMonthStr(),  // 'YYYY-MM'
  filterBank:        '',
  filterCategory:    '',
};
let unsubscribers = [];  // funciones de limpieza de onSnapshot
```

### 5.4 Iconos

```js
const DEFAULT_ICON = 'https://res.cloudinary.com/datwdagbf/image/upload/.../dinero_hgnyz4.png';
const PRESET_ICONS = [ /* array de ~50 URLs de Cloudinary */ ];
```

### 5.5 TAB_ACTIONS y ALL_ACTION_BTNS

Controlan qué botones del action bar son visibles en cada tab:

```js
const TAB_ACTIONS = {
  registros:      ['btn-add-transaction', 'btn-transfer', 'btn-delete-selected'],
  proyeccion:     ['btn-add-projection'],
  recurrentes:    [],
  presupuesto:    ['btn-save-budgets'],
  'gastos-comunes': [],
  tarjetas:       [],
  saldos:         [],
  reportes:       [],
  configuracion:  [],
};

const ALL_ACTION_BTNS = [
  'btn-add-transaction', 'btn-transfer', 'btn-save-budgets',
  'btn-delete-selected', 'btn-add-projection',
];
```

### 5.6 renderAll() — función de enrutado central

Llamada en cada cambio de datos. Renderiza el dashboard siempre, y la sección activa según `appState.currentTab`:

```js
function renderAll() {
  renderDashboard();
  if (!appState.currentTab) return;
  switch (appState.currentTab) {
    case 'registros':       renderTransactionsTable(); break;
    case 'proyeccion':      renderProyeccionTable();   break;
    case 'recurrentes':     renderRecurringTable();    break;
    case 'presupuesto':     renderBudgetTable();       break;
    case 'tarjetas':        renderCreditCardsTable();  break;
    case 'gastos-comunes':  renderGastosComunesTable(); break;
    case 'configuracion':   renderConfigurationLists(); break;
    case 'reportes': /* Fase 10 */ break;
    case 'saldos':   /* Fase 11 */ break;
  }
}
```

---

## 6. Fase 1 — Fundación

**Objetivo:** HTML shell funcional con auth, navegación y Firebase init. El login debe funcionar antes de continuar.

### HTML Shell

```
<html>
  <head>
    CDN (Chart.js, jsPDF, jsPDF-AutoTable)
    <style> /* todo el CSS */ </style>
  </head>
  <body class="view-dashboard">
    #ptr-container            ← pull-to-refresh indicator
    #loading-overlay          ← spinner de carga (.active al inicio)
    #toast-container          ← notificaciones flotantes
    #fullscreen-prompt        ← pantalla inicial en móvil (solicita fullscreen)
    #auth-modal               ← modal de login/registro
    <header id="app-header">  ← logo + título + botones (solo desktop)
    <nav id="tab-bar">        ← 9 tabs con data-tab + 2 botones extra
    <main id="main-wrapper">
      <section id="dashboard">       ← 3 cards (saldo, ingresos, gastos)
      <section id="alerts-area">     ← alertas dinámicas
      <div id="content-area">
        <div id="action-bar">        ← botones de acción contextuales
        <!-- tab panes por fase -->
      </div>
    </main>
    <footer> ... </footer>
    <script type="module"> /* TODO el JS */ </script>
  </body>
</html>
```

### Vista dashboard vs. contenido

El `<body>` alterna entre dos clases CSS que controlan qué se muestra:
- `body.view-dashboard` → muestra `#dashboard` + `#alerts-area`, oculta `#content-area`
- `body.view-content` → muestra `#content-area`, oculta `#dashboard` + `#alerts-area` + `#app-header`

En modo contenido, el tab-bar sube a `top: 0` (el header desaparece).

### Auth Modal (`#auth-modal`)

Campos: `#auth-email`, `#auth-password`  
Botones: `#login-btn` (submit), `#register-btn` (type="button")  
Errors: `#auth-email-error`, `#auth-password-error`  
Spinner: `#login-spinner`, `#register-spinner`

### Tab Bar — tabs y botones especiales

```
data-tab="registros"       → Registros
id="btn-voice"             → Voz (botón especial, sin data-tab)
data-tab="proyeccion"      → Proyección
data-tab="recurrentes"     → Gastos Recurrentes
data-tab="gastos-comunes"  → Gastos Comunes
data-tab="tarjetas"        → Tarjetas de Crédito
data-tab="saldos"          → Saldos de Cuentas
data-tab="reportes"        → Reportes
data-tab="presupuesto"     → Presupuesto
data-tab="configuracion"   → Configuración
id="logout-tab-btn"        → Salir (botón especial)
```

**Importante:** El `data-section` de cada `.tab-pane` debe coincidir con el `data-tab` del botón.  
Excepción: `#section-comunes` usa `data-section="gastos-comunes"`.

### Action Bar (`#action-bar`)

Todos los botones existen desde el inicio, visibilidad gestionada por `updateActionBar()`:
```html
<button class="btn-action btn-action--primary" id="btn-add-transaction">+ Registrar</button>
<button class="btn-action" id="btn-transfer">⇄ Transferir</button>
<button class="btn-action btn-action--purple" id="btn-save-budgets">Guardar Presupuestos</button>
<button class="btn-action btn-action--danger" id="btn-delete-selected">Eliminar Seleccionados</button>
<button class="btn-action btn-action--primary" id="btn-add-projection">+ Proyección</button>
```

### Funciones JS de Fase 1

| Función | Propósito |
|---------|-----------|
| `getFilteredTransactions()` | Filtra `appState.transactions` por mes/banco/categoría |
| `formatCurrency(amount)` | `$1.234.56` — formato local |
| `formatDate(dateStr)` | `'2026-05-16'` → `'16/05/2026'` |
| `toTitleCase(str)` | Primera letra mayúscula |
| `getCurrentMonthStr()` | `'YYYY-MM'` del mes actual |
| `showLoading()` / `hideLoading()` | Activa/desactiva `#loading-overlay` |
| `showToast(message, type)` | Toast con auto-remove memory-safe (`{ once: true }` en `transitionend`) |
| `showAuthModal()` / `hideAuthModal()` | Muestra/oculta `#auth-modal` |
| `setAuthLoading(isLoading)` | Spinner en botones de auth |
| `clearAuthErrors()` | Limpia mensajes de error del form de auth |
| `handleLogin(email, password)` | Firebase `signInWithEmailAndPassword` |
| `handleRegister(email, password)` | Firebase `createUserWithEmailAndPassword` |
| `handleLogout()` | Firebase `signOut` + `unloadUserData()` + `showAuthModal()` |
| `showDashboardView()` | `body.classList` → `view-dashboard` |
| `showContentView()` | `body.classList` → `view-content` |
| `updateActionBar(tabName)` | Oculta/muestra botones según `TAB_ACTIONS` |
| `switchTab(tabName)` | Activa tab btn, activa pane, llama `renderAll()` |
| `loadUserData(userId)` | Registra 6 `onSnapshot` para todas las colecciones |
| `unloadUserData()` | Cancela subscripciones y resetea `appState` |
| `requestFullscreen()` / `exitFullscreen()` | Fullscreen API con fallback webkit |
| `setupPullToRefresh()` | Touch events → llama `renderAll()` al arrastrar ≥60px |
| `setupEventListeners()` | Wiring central de todos los eventos de la app |

### Flujo principal (`onAuthStateChanged`)

```js
onAuthStateChanged(auth, (user) => {
  if (user) {
    appState.currentUser = user;
    hideAuthModal();
    loadUserData(user.uid);
  } else {
    unloadUserData();
    showAuthModal();
    hideLoading();
  }
});
```

### Criterio de test — Fase 1

- Abrir en navegador → aparece `#auth-modal`
- Login con cuenta real → modal desaparece → spinner de carga → dashboard vacío
- Tabs navegan sin errores en consola
- Logout → vuelve al modal de auth

---

## 7. Fase 2 — Dashboard

**Objetivo:** Cards de saldo/ingresos/gastos con datos reales de Firestore. Alertas contextuales.

### HTML del Dashboard

```html
<section id="dashboard">
  <div class="dash-card" id="dash-balance" data-goto="registros">
    <div>
      <p class="dash-card__label">Saldo Actual</p>
      <p class="dash-card__value" id="dash-balance-value">$0.00</p>
    </div>
    <div class="dash-card__icon"><img src="..."/></div>
  </div>
  <!-- #dash-income (data-goto="registros") → #dash-income-value -->
  <!-- #dash-expense (data-goto="registros") → #dash-expense-value -->
</section>
<section id="alerts-area"></section>
```

Las cards tienen `::after` para la línea de acento superior:
- `#dash-balance::after` → gradiente con `--color-accent` (azul)
- `#dash-income::after` → gradiente con `--color-success` (verde)
- `#dash-expense::after` → gradiente con `--color-danger` (rojo)

Cada icon wrapper `#dash-balance .dash-card__icon` tiene `background: rgba(79,143,255,0.12)`.

### Funciones JS de Fase 2

| Función | Propósito |
|---------|-----------|
| `renderHeaderAlias()` | Actualiza `#user-alias` con `appState.userAlias` |
| `renderDashboard()` | Calcula saldo (openingBalance + ingresos − gastos) en una sola pasada `reduce()` |
| `checkRecurringPaymentReminders()` | Detecta recurrentes próximos a vencer este mes → `renderRecurringAlerts()` |
| `checkBudgetLimits()` | Compara gastos por categoría vs. presupuesto → alerta si ≥95% |
| `renderRecurringAlerts()` | Crea `.alert-item` en `#alerts-area` con `createTextNode` |

**Patrón clave de `renderDashboard()`:**  
Una sola pasada `reduce()` sobre `appState.transactions` del mes filtrando por `date.substring(0,7) === appState.filterMonth`. Resultado: `totalIncome`, `totalExpenses`. Saldo = `openingBalance + totalIncome − totalExpenses`.

### Criterio de test — Fase 2

- Login → dashboard muestra valores reales de Firestore
- Cambiar mes en el filtro de registros → dashboard se actualiza
- Alerta de presupuesto aparece si gastos ≥ 95% del límite

---

## 8. Fase 3 — Registros + Modal Calculadora

**Objetivo:** CRUD completo de transacciones. Calculadora como interfaz de entrada. Modales auxiliares para categoría, descripción, transferencia y edición.

### HTML — Sección Registros (`#section-registros`)

```html
<div id="section-registros" class="tab-pane" data-section="registros">
  <div class="filter-bar">
    <select id="reg-filter-month">...</select>
    <select id="reg-filter-bank">...</select>
    <select id="reg-filter-cat">...</select>
  </div>
  <div class="table-wrapper">
    <table class="data-table" id="reg-table">
      <thead>
        <tr>
          <th><input type="checkbox" class="tx-select" id="reg-select-all"/></th>
          <th>Fecha</th><th>Tipo</th><th>Descripción / Categoría</th>
          <th>Banco</th><th>Monto</th><th><!-- acciones --></th>
        </tr>
      </thead>
      <tbody id="reg-tbody"></tbody>
      <tfoot id="reg-tfoot">
        <tr><td colspan="5" class="tfoot-label">Ingresos del mes:</td>
            <td id="reg-total-income" class="amount--income"></td><td></td></tr>
        <tr><td colspan="5" class="tfoot-label">Gastos del mes:</td>
            <td id="reg-total-expenses" class="amount--expense"></td><td></td></tr>
      </tfoot>
    </table>
  </div>
  <p id="reg-empty" class="empty-state hidden">No hay registros para este período.</p>
  <datalist id="description-list"></datalist>
</div>
```

Clases de fila: `.row--income` / `.row--expense` / `.row--transfer` (borde izquierdo de color).

### Modales de Fase 3

| ID Modal | Propósito |
|----------|-----------|
| `#calc-modal` | Calculadora principal (tipo, fecha, banco, keypad) |
| `#cat-modal` | Grid de categorías con ícono para seleccionar |
| `#confirm-modal` | Confirmación genérica (título, mensaje, callback `onOk`) |
| `#transfer-modal` | Formulario de transferencia entre cuentas |
| `#edit-modal` | Edición de transacción existente |

#### `#calc-modal` — estructura interna

```html
<div class="tipo-bar">
  <button class="btn-tipo" data-tipo="income">Ingreso</button>
  <button class="btn-tipo" data-tipo="expense">Gasto</button>
</div>
<div class="calc-meta">
  <input type="date" id="calc-date"/>
  <select id="calc-bank">...</select>
</div>
<div class="calc-display" id="calc-display">0</div>
<div class="keypad">
  <!-- 4 filas: 7 8 9 DEL / 4 5 6 × / 1 2 3 - / . 0 + OK -->
  <!-- OK tiene grid-column: span 2, clase .btn-key--ok -->
</div>
<div class="desc-prompt" id="desc-prompt">
  <!-- pregunta si agregar descripción después de seleccionar categoría -->
</div>
```

#### `#cat-modal` — estructura interna

```html
<div class="cat-grid" id="cat-grid">
  <!-- generado por openCatModal(): un .btn-cat por categoría -->
</div>
```

#### `#transfer-modal` — campos

`#transfer-from` (select banco origen), `#transfer-to` (select banco destino),  
`#transfer-amount` (number), `#transfer-date` (date), `#transfer-desc` (text)

#### `#edit-modal` — campos

`#edit-type` (select income/expense), `#edit-date`, `#edit-bank` (select),  
`#edit-category` (select), `#edit-amount` (number), `#edit-description` (text)

### CSS de Fase 3

| Clase | Uso |
|-------|-----|
| `.tipo-bar` / `.btn-tipo` | Segmented control Ingreso/Gasto |
| `.btn-tipo.active--income` | Fondo verde cuando activo |
| `.btn-tipo.active--expense` | Fondo rojo cuando activo |
| `.calc-meta` | Row de fecha y banco (flex, gap) |
| `.calc-display` | Display de la expresión matemática (font-size 1.8rem) |
| `.keypad` | Grid 4 columnas |
| `.btn-key` / `.btn-key--op` / `.btn-key--del` / `.btn-key--ok` | Teclas del keypad |
| `.cat-grid` | Grid 4 columnas para íconos de categoría |
| `.btn-cat` | Botón de categoría (ícono + nombre) |
| `.desc-prompt` / `.desc-prompt.visible` | Sección de descripción en calc modal |
| `.desc-btn-row` / `.btn-desc` / `.btn-desc--yes` | Botones Sí/No de descripción |
| `.cat-display` | Div con ícono + nombre de categoría en filas de tabla |
| `.tx-select` | Checkbox de selección en filas |

### Funciones JS de Fase 3

| Función | Propósito |
|---------|-----------|
| `renderTransactionsTable()` | Genera filas con event delegation en `#reg-tbody`; botones `.btn-icon` SVG |
| `updateDeleteButtonVisibility()` | Muestra/oculta `#btn-delete-selected` según checkboxes |
| `updateFilterDropdowns()` | Actualiza selects de filtro (mes, banco, categoría) |
| `openCalcModal()` / `closeCalcModal()` | Abre/cierra `#calc-modal`; inicializa fecha y banco |
| `setCalcTipo(tipo)` | Cambia clase activa en `.btn-tipo` |
| `handleCalcKey(key)` | Procesa tecla del keypad (número, operador, DEL) |
| `handleCalcKeyboard(e)` | Mapea teclas físicas al keypad |
| `safeEval(expr)` | Evalúa expresión numérica con `Function('return ' + sanitized)` |
| `handleCalcTotal()` | Calcula resultado con `safeEval`, avanza al selector de categoría |
| `openCatModal()` / `closeCatModal()` | Grid de categorías desde `appState.categories` |
| `showDescPrompt(categoryName)` | Muestra `.desc-prompt` con botones Sí/No |
| `finalizeTransaction(description)` | Escribe en Firestore `addDoc` y actualiza `descriptions` |
| `openTransferModal()` / `closeTransferModal()` | Modal de transferencia |
| `handleTransferSubmit(e)` | Escribe 2 transacciones en Firestore (out + in con mismo `transferGroup`) |
| `openEditModal(txId)` / `closeEditModal()` | Carga datos de `tx` en el form de edición |
| `handleEditSubmit(e)` | `setDoc` (sobreescribe) la transacción editada |
| `deleteTransaction(txId)` | `openConfirmModal` → `deleteDoc` |
| `deleteSelectedTransactions()` | `writeBatch` para eliminar múltiples |
| `openConfirmModal(title, msg, onOk)` / `closeConfirmModal()` | Modal genérico de confirmación |
| `buildCatDisplay(name)` | Retorna `div.cat-display` con ícono + nombre (para celdas de tabla) |
| `populateBankSelects(...selectIds)` | Llena selects de banco desde `appState.banks` |
| `populateCategorySelect(selectId)` | Llena select de categoría desde `appState.categories` |
| `updateDescriptionDatalist()` | Actualiza `#description-list` para autocomplete |

**Patrón de event delegation en `#reg-tbody`:**
```js
document.getElementById('reg-tbody').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const { action, id } = btn.dataset;
  if (action === 'edit') openEditModal(id);
  if (action === 'delete') deleteTransaction(id);
});
```

**Botones SVG de acción (editar/eliminar):**
```js
btnEdit.className = 'btn-icon';
btnEdit.dataset.action = 'edit';
btnEdit.innerHTML = '<svg viewBox="0 0 24 24" ...><path d="M15.232 5.232l3.536 3.536M3 17.25V21h3.75l11-11.03-3.75-3.75L3 17.25z"/></svg>';

btnDel.className = 'btn-icon btn-icon--danger';
btnDel.dataset.action = 'delete';
btnDel.innerHTML = '<svg viewBox="0 0 24 24" ...><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>';
```

### Criterio de test — Fase 3

- Botón "Registrar" → calculadora → Enter → categoría → descripción → transacción en tabla
- Filtrar por mes/banco/categoría → tabla se actualiza
- Editar transacción → modal pre-cargado → guardar → tabla actualizada
- Eliminar → modal de confirmación → eliminado
- Transferencia → 2 filas con `.row--transfer`

---

## 9. Fase 4 — Configuración

**Objetivo:** CRUD de categorías, bancos y descripciones. Alias de usuario. Cambio de contraseña. Saldo inicial. Export/Import JSON. Gestión de períodos.

### HTML — Sección Configuración (`#section-configuracion`)

Estructura de 3 bloques principales:

```
#section-configuracion > .cfg-body
  ├── .cfg-grid (3 columnas)
  │     ├── .cfg-grid-section "Categorías"
  │     │     ├── .cfg-form > #cfg-cat-name (input) + #cfg-cat-add-btn
  │     │     ├── #cfg-cat-error
  │     │     └── .cfg-list-container > ul.cfg-list#cfg-cat-list
  │     ├── .cfg-grid-section "Bancos / Cuentas"
  │     │     ├── .cfg-form > #cfg-bank-name + #cfg-bank-add-btn
  │     │     ├── #cfg-bank-error
  │     │     └── .cfg-list-container > ul.cfg-list#cfg-bank-list
  │     └── .cfg-grid-section "Descripciones"
  │           └── .cfg-list-container > ul.cfg-list#cfg-desc-list
  ├── .cfg-section "Configuración de Usuario"
  │     └── .cfg-form > #cfg-alias + #cfg-alias-btn
  ├── .cfg-section "Cambiar Contraseña"
  │     └── form#cfg-password-form > .cfg-form > #cfg-pwd-current + #cfg-pwd-new + #cfg-pwd-confirm + #cfg-pwd-btn
  ├── .cfg-section "Saldo Inicial"
  │     └── .cfg-form > #cfg-opening-balance (number) + #cfg-balance-btn
  ├── .cfg-section "Acciones de Período"
  │     └── #cfg-new-month-btn (outline)
  ├── .cfg-section "Importar y Exportar"
  │     └── .cfg-actions > #cfg-export-btn + #cfg-import-btn + #cfg-import-file (hidden)
  └── .cfg-section.cfg-danger "Zona de Peligro"
        └── botón de resetear
```

### CSS de Fase 4

| Clase | Uso |
|-------|-----|
| `.cfg-body` | `flex-direction: column` — no grid |
| `.cfg-grid` | 3 columnas para listas (responsive: 1 col en móvil) |
| `.cfg-grid-section h3` | Título con `border-bottom` |
| `.cfg-list-container` | Scroll interno, borde, `max-height: 18rem` |
| `.cfg-section` | `border-top: 1px solid var(--color-border)` — separador plano |
| `.cfg-form` | `flex-direction: column` — etiquetas encima de inputs |
| `.cfg-form label` | `font-size: var(--font-xs)`, color muted |
| `.cfg-error` | Span de error inline |
| `.btn-cfg` | `width: 100%` — botón full-width en el form |
| `.cfg-desc` | Texto descriptivo pequeño bajo sección |
| `.cfg-actions` | Row de botones de export/import |
| `.cfg-danger` | `border-top-color: rgba(240,82,82,0.35)` |
| `.cfg-list li` | Item con botón eliminar a la derecha |

### Modal `#cfg-cat-icon-modal`

Permite asignar un ícono de `PRESET_ICONS` a la categoría recién creada.  
Campos: `.icon-grid` con botones de selección, `#icon-modal-preview`, `#icon-modal-save-btn`.

### Funciones JS de Fase 4

| Función | Propósito |
|---------|-----------|
| `renderConfigurationLists()` | Genera `<li>` con botón eliminar para categorías, bancos, descripciones |
| `handleSaveAlias()` | `setDoc` en `DB_PREF` con `userAlias` |
| `handleSaveOpeningBalance()` | `setDoc` en `DB_PREF` con `openingBalance` |
| `handleChangePassword(e)` | Reautentica con `reauthenticateWithCredential` luego `updatePassword` |
| `cfgAddCategory()` | Valida nombre único → `openCatIconModal` |
| `openCatIconModal(categoryName)` / `closeCatIconModal()` | Modal de selección de ícono |
| `saveCategoryWithIcon()` | Guarda `{ name, icon }` en `preferences.categories` vía `setDoc` |
| `cfgDeleteCategory(name)` | Elimina de `preferences.categories` |
| `cfgAddBank()` / `cfgDeleteBank(name)` | CRUD de bancos en `preferences.banks` |
| `cfgDeleteDescription(name)` | Elimina de `preferences.descriptions` |
| `cfgExportJson()` | Exporta todo a un archivo `.json` (transacciones, proyecciones, recurrentes, tarjetas, gastosComunes, preferences) |
| `cfgImportJson(file)` | Lee el JSON, usa `writeBatch` para restaurar colecciones |
| `initiateNewMonth()` | Archiva mes actual: actualiza `openingBalance` con saldo final del mes, borra transacciones |
| `resetPeriod()` | Confirmación → elimina todas las transacciones del período |

### Criterio de test — Fase 4

- Agregar categoría → ícono → aparece en `#cfg-cat-list` y en el selector del modal calculadora
- Agregar banco → aparece en selects de transacciones
- Cambiar contraseña → login funciona con nueva contraseña
- Export JSON → abrir archivo → estructura correcta
- Import JSON → datos aparecen en la app

---

## 10. Fase 5 — Presupuesto

**Objetivo:** Definir límites de gasto por categoría y comparar contra gastos reales del mes.

### HTML — Sección Presupuesto (`#section-presupuesto`)

```html
<div id="section-presupuesto" class="tab-pane" data-section="presupuesto">
  <div class="table-wrapper">
    <table class="data-table" id="budget-table">
      <thead>
        <tr><th>Categoría</th><th>Presupuesto</th><th>Gastado</th><th>Disponible</th></tr>
      </thead>
      <tbody id="budget-tbody"></tbody>
      <tfoot>
        <tr>
          <td class="tfoot-label">Totales</td>
          <td id="budget-total-budgeted" class="amount--income"></td>
          <td id="budget-total-spent" class="amount--expense"></td>
          <td id="budget-total-remaining"></td>
        </tr>
      </tfoot>
    </table>
  </div>
  <p id="budget-empty" class="empty-state hidden">
    Agrega categorías en Configuración para asignar presupuestos.
  </p>
</div>
```

### CSS de Fase 5

| Clase | Uso |
|-------|-----|
| `.progress-bar` | Contenedor de barra (`height: 6px`, fondo `--color-border`) |
| `.progress-bar__fill` | Relleno animado (`transition: width 0.4s`) |
| `.progress-bar__fill--warning` | Amarillo (75–94% del límite) |
| `.progress-bar__fill--danger` | Rojo (≥95% del límite) |

La barra de progreso se inyecta dinámicamente en la celda de "Gastado" via `element.style.setProperty('--fill-pct', pct + '%')` o `element.style.width = pct + '%'` en la barra.

### Funciones JS de Fase 5

| Función | Propósito |
|---------|-----------|
| `renderBudgetTable()` | Por cada categoría: input editable con límite, celda de gasto real, barra de progreso inline |
| `handleSaveBudgets()` | Lee todos los inputs `#budget-tbody input`, hace `setDoc` en `DB_PREF` con `categoryBudgets` |
| `checkBudgetLimits()` | Compara gastos del mes por categoría vs. `categoryBudgets` → alerta si ≥95% |

**Patrón de `renderBudgetTable()`:**  
Calcula gastos del mes por categoría en una pasada `reduce()`. Por cada categoría en `appState.categories`, crea una fila con `<input type="number">` prellenado con `appState.categoryBudgets[cat.name] || 0`.

### Criterio de test — Fase 5

- Definir límite de categoría → guardar → reabre y muestra el valor guardado
- Gastar > 95% del límite → alerta aparece en dashboard
- Totales en tfoot coinciden con suma de filas

---

## 11. Fase 6 — Gastos Recurrentes

**Objetivo:** Lista de gastos recurrentes mensuales con recordatorios en dashboard.

### HTML — Sección Recurrentes (`#section-recurrentes`)

```html
<div id="section-recurrentes" class="tab-pane" data-section="recurrentes">
  <div class="rec-header">
    <button class="btn-primary" id="btn-add-rec">+ Añadir</button>
  </div>
  <div class="table-wrapper">
    <table class="data-table" id="rec-table">
      <thead>
        <tr><th>Día</th><th>Descripción</th><th>Categoría</th>
            <th>Monto</th><th>Banco/Cuenta</th><th>Acciones</th></tr>
      </thead>
      <tbody id="rec-tbody"></tbody>
      <tfoot id="rec-tfoot" class="hidden">
        <tr><td colspan="3">Total Mensual Proyectado</td>
            <td id="rec-total" class="rec-amount">$0.00</td>
            <td colspan="2"></td></tr>
      </tfoot>
    </table>
    <p id="rec-empty" class="rec-empty">No has añadido ningún gasto recurrente.</p>
  </div>
</div>
```

### Modal `#rec-modal`

Campos: `#rec-description`, `#rec-day` (1–31), `#rec-category` (select), `#rec-bank` (select), `#rec-amount` (number).  
Modo: alta o edición (detectado por presencia de `id` en el objeto pasado a `openRecModal`).

### Funciones JS de Fase 6

| Función | Propósito |
|---------|-----------|
| `renderRecurringTable()` | Genera filas con event delegation en `#rec-tbody`; muestra tfoot si hay datos |
| `openRecModal(id = null)` / `closeRecModal()` | Abre modal en modo alta o edición según `id` |
| `handleRecFormSubmit(e)` | `addDoc` (alta) o `setDoc` (edición) en `recurringExpenses` |
| `deleteRecurring(id)` | `openConfirmModal` → `deleteDoc` |
| `checkRecurringPaymentReminders()` | Para cada recurrente, si su día está en los próximos 7 días → `renderRecurringAlerts()` |
| `renderRecurringAlerts()` | Crea `.alert-item` en `#alerts-area` para recordatorios |

**Dato clave de `recurringExpenses`:** cada documento tiene `{ description, day, category, bank, amount }`.  
El campo `day` (1–31) indica el día del mes en que vence.

### Criterio de test — Fase 6

- Agregar recurrente → aparece en tabla con total en tfoot
- Editar → modal pre-cargado → guardar → actualizado
- Si su día está próximo → alerta en dashboard
- La Fase 9 (Proyección) usa estos recurrentes como entradas virtuales

---

## 12. Fase 7 — Gastos Comunes

**Objetivo:** Gastos compartidos entre personas. Distribución por ítem (igual, porcentaje o monto manual).

### HTML — Sección Comunes (`#section-comunes`)

```html
<div id="section-comunes" class="tab-pane" data-section="gastos-comunes">
  <div class="comunes-header">
    <button class="btn-primary" id="btn-add-comun">+ Añadir Ítem</button>
  </div>
  <p id="comunes-empty" class="comunes-empty hidden">
    No hay gastos comunes. Usa "Añadir Ítem" para comenzar.
  </p>
  <div id="comunes-cards"></div>
  <!-- Popover de método de distribución -->
  <div id="dist-popover" class="hidden">
    <div class="dist-popover-item" data-method="equal">Dividir en partes iguales</div>
    <div class="dist-popover-item" data-method="percentage">Dividir por Porcentaje (%)</div>
    <div class="dist-popover-item" data-method="manual">Ingresar Monto Manual</div>
  </div>
</div>
```

### Estructura de datos `gastosComunes`

```js
// Documento único en Firestore (no colección):
// artifacts/{APP_ID}/users/{uid}/user_data/gastosComunes
{
  items: [
    {
      id: 'uuid',
      description: 'Alquiler',
      amount: 500000,
      bank: 'Santander',
      people: [
        { name: 'Alberto', color: '#4f8fff', distribution: 250000, method: 'manual' },
        { name: 'María',   color: '#22c97a', distribution: 250000, method: 'manual' },
      ]
    }
  ]
}
```

### Modales de Fase 7

| ID Modal | Propósito |
|----------|-----------|
| `#dist-input-modal` | Ingresa porcentaje o monto manual para distribución |
| `#shared-bank-modal` | Selecciona banco para registrar el pago de un ítem compartido |

### CSS de Fase 7 (clases clave)

| Clase | Uso |
|-------|-----|
| `.item-card` | Card por ítem de gasto compartido |
| `.item-card__header` | Nombre + total + botones del ítem |
| `.person-chip` | Chip colored por persona (nombre + monto) |
| `.dist-row` | Fila de distribución por persona |
| `.dist-popover` / `.dist-popover-item` | Popover flotante para elegir método de distribución |
| `AVATAR_COLORS` | Array de colores para asignar a personas nuevas |

### Funciones JS de Fase 7

| Función | Propósito |
|---------|-----------|
| `computeAllAmounts(item)` | Calcula distribución total del ítem según método de cada persona |
| `saveGastosComunesState()` | `setDoc` del documento único `gastosComunes` |
| `renderGastosComunesTable()` | Genera cards con chips por persona y event delegation |
| `showDistPopover(triggerEl, itemId, personIndex)` | Muestra popover de método de distribución |
| `hideDistPopover()` | Oculta el popover |
| `openDistInputModal({ method, currentValue, callback })` | Input de monto o porcentaje |
| `closeDistInputModal()` | Cierra modal |
| `openSharedBankModal(payload)` / `closeSharedBankModal()` | Selección de banco para registrar pago |
| `handleConfirmSharedPayment()` | Registra la transacción del pago compartido en Firestore |

### Criterio de test — Fase 7

- Añadir ítem → aparece card
- Asignar distribución igual entre 3 personas → montos correctos
- Cambiar a porcentaje → recalcula
- Botón "Pagar" → `#shared-bank-modal` → transacción en Registros

---

## 13. Fase 8 — Tarjetas de Crédito

**Objetivo:** Seguimiento de deuda, disponible y pago mensual por tarjeta. Alerta en dashboard si deuda > 80% del límite.

### HTML — Sección Tarjetas (`#section-tarjetas`)

```html
<div id="section-tarjetas" class="tab-pane" data-section="tarjetas">
  <div class="rec-header">
    <button class="btn-primary" id="btn-add-card">+ Añadir Tarjeta</button>
  </div>
  <div class="table-wrapper">
    <table class="data-table" id="cc-table">
      <thead>
        <tr>
          <th title="Excluir del total adeudado">Excluir</th>
          <th>Banco</th><th>Día Pago</th><th>Monto Adeudado</th>
          <th>Línea de Crédito</th><th>Saldo Disponible</th>
          <th>Interés Anual %</th><th>Meses p/Saldar</th>
          <th>Pago Mensual</th><th>Acciones</th>
        </tr>
      </thead>
      <tbody id="cc-tbody"></tbody>
      <tfoot id="cc-tfoot" class="hidden">
        <tr>
          <td colspan="3">Totales</td>
          <td id="cc-total-amount">$0.00</td>
          <td id="cc-total-limit">$0.00</td>
          <td id="cc-total-available">$0.00</td>
          <td colspan="2">Total Pago Mensual</td>
          <td id="cc-total-monthly">$0.00</td>
          <td></td>
        </tr>
      </tfoot>
    </table>
    <p id="cc-empty" class="cc-empty">No has añadido ninguna tarjeta de crédito.</p>
  </div>
</div>
```

### Modal `#cc-modal`

Campos: `#cc-bank` (text), `#cc-day` (1–31), `#cc-amount` (deuda actual), `#cc-limit` (línea de crédito), `#cc-rate` (tasa anual %), `#cc-months` (meses para saldar), `#cc-exclude` (checkbox).

### Funciones JS de Fase 8

| Función | Propósito |
|---------|-----------|
| `calculateMonthlyPayment(principal, annualRate, months)` | Fórmula de cuota fija (amortización francesa) |
| `renderCreditCardsTable()` | Genera filas con checkbox exclude, pago mensual calculado, tfoot totales |
| `handleCardDataChange(e)` | Actualiza inline el campo editado (inline editing) → `updateDoc` |
| `openCcModal()` / `closeCcModal()` | Abre/cierra `#cc-modal` |
| `handleCcFormSubmit(e)` | `addDoc` nueva tarjeta en `creditCards` |
| `deleteCreditCard(id)` | `openConfirmModal` → `deleteDoc` |

**Alerta de tarjeta:** `checkBudgetLimits()` también verifica si `amount / limit > 0.8` para cada tarjeta.

### Criterio de test — Fase 8

- Agregar tarjeta → fila con pago mensual calculado
- Editar monto inline → actualiza en tiempo real
- Deuda > 80% del límite → alerta en dashboard
- Excluir tarjeta → no suma al total de deuda

---

## 14. Fase 9 — Proyección

**Objetivo:** Vista unificada de transacciones reales + gastos recurrentes virtuales + proyecciones manuales para el mes seleccionado.

### HTML — Sección Proyección (`#section-proyeccion`)

```html
<div id="section-proyeccion" class="tab-pane" data-section="proyeccion">
  <div class="filter-bar">
    <select id="proj-filter-month" aria-label="Filtrar por mes"></select>
  </div>
  <div class="table-wrapper">
    <table class="data-table" id="proj-table">
      <thead>
        <tr>
          <th>Fecha</th><th>Descripción</th><th>Categoría</th>
          <th>Monto</th><th>Saldo</th><th>Acciones</th>
        </tr>
      </thead>
      <tbody id="proj-tbody"></tbody>
      <tfoot id="proj-tfoot" class="hidden">
        <tr><td colspan="3" class="tfoot-label">Ingresos proyectados:</td>
            <td id="proj-total-income" class="amount--income"></td><td colspan="2"></td></tr>
        <tr><td colspan="3" class="tfoot-label">Gastos proyectados:</td>
            <td id="proj-total-expenses" class="amount--expense"></td><td colspan="2"></td></tr>
      </tfoot>
    </table>
    <p id="proj-empty" class="empty-state hidden">No hay entradas para este período.</p>
  </div>
</div>
```

### Modal `#proj-modal`

Campos: `#proj-type` (select income/expense), `#proj-date`, `#proj-desc` (con datalist `#proj-desc-list`), `#proj-cat` (select), `#proj-bank` (select), `#proj-amount` (number).  
Botones: `#proj-cancel-btn`, `#proj-save-btn`.

### CSS de Fase 9

| Clase | Uso |
|-------|-----|
| `.proj-virtual` | Filas virtuales (recurrentes): italic, `opacity: 0.65` |
| `.proj-manual` | Filas de proyección manual |
| `.proj-label` | Etiqueta pequeña `(proyectado)` bajo la descripción |

### Tipos de fila en `renderProyeccionTable()`

Hay 3 tipos de entrada que `getDynamicProjections()` fusiona:

| Tipo | Fuente | `isVirtual` | `isPureProjection` | Acciones |
|------|--------|-------------|-------------------|---------|
| Transacción real | `appState.transactions` | — | — | Editar/Eliminar transacción |
| Proyección manual | `appState.projections` | — | `true` | Editar/Eliminar proyección |
| Recurrente virtual | `appState.recurringExpenses` | `true` | — | Sin acciones |

**Las filas virtuales** se filtran: solo aparecen si no hay transacción real que coincida en `(date, description.toLowerCase(), category)`.

La columna **Saldo** es acumulativa: empieza en `openingBalance` y suma/resta cada entrada en orden cronológico.

### Funciones JS de Fase 9

| Función | Propósito |
|---------|-----------|
| `getDynamicProjections()` | Fusiona reales + manuales + virtuales de recurrentes; filtra duplicados |
| `populateProjFilterMonth()` | Llena `#proj-filter-month` con meses disponibles (desde transacciones + manuales) |
| `renderProyeccionTable()` | Renderiza las 3 tipos de fila; calcula saldo acumulativo; usa event delegation en `#proj-tbody` |
| `openProjModal(id = null)` / `closeProjModal()` | Alta o edición de proyección manual |
| `handleProjSubmit()` | `addDoc` o `setDoc` en `projections` |
| `deleteProjection(id)` | `openConfirmModal` → `deleteDoc` |

**Event delegation en `#proj-tbody`:**
```js
document.getElementById('proj-tbody').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const { action, id } = btn.dataset;
  if (action === 'delete-proj') deleteProjection(id);
  if (action === 'edit-proj')   openProjModal(id);
  if (action === 'delete-tx')   deleteTransaction(id);
  if (action === 'edit-tx')     openEditModal(id);
});
```

Las filas reales reutilizan `openEditModal()` y `deleteTransaction()` — mismas funciones de Fase 3.

### Criterio de test — Fase 9

- Seleccionar mes → tabla muestra reales + virtuales de recurrentes + manuales
- Recurrente ya pagado ese mes → no aparece como virtual
- Agregar proyección manual → reaparece con botones de editar/eliminar
- Saldo acumulativo aumenta con ingresos y disminuye con gastos en orden cronológico

---

## 15. Fases Pendientes

### Fase 10 — Reportes (✅ Completa)

#### HTML — Sección Reportes (`#section-reportes`)

```html
<div id="section-reportes" class="tab-pane" data-section="reportes">
  <div class="filter-bar">
    <select id="rep-filter-month" aria-label="Filtrar período"></select>
  </div>
  <div class="rep-grid">
    <div class="rep-card">
      <p class="rep-card__title">Gastos por Categoría</p>
      <div class="rep-canvas-wrap"><canvas id="rep-donut-canvas"></canvas></div>
      <div class="rep-legend" id="rep-donut-legend"></div>
    </div>
    <div class="rep-card">
      <p class="rep-card__title">Flujo de Caja (últimos 6 meses)</p>
      <div class="rep-canvas-wrap"><canvas id="rep-bar-canvas"></canvas></div>
    </div>
  </div>
  <p id="rep-empty" class="empty-state hidden">No hay gastos registrados para este período.</p>
</div>
```

#### CSS de Fase 10

| Clase | Uso |
|-------|-----|
| `.rep-grid` | Grid 2 columnas (1 col en móvil ≤768px) |
| `.rep-card` | Card con borde y padding para cada gráfico |
| `.rep-card__title` | Título en mayúsculas, muted |
| `.rep-canvas-wrap` | `position: relative; height: 260px` — requerido por Chart.js responsive |
| `.rep-legend` / `.rep-legend-item` | Leyenda personalizada del doughnut |
| `.rep-legend-dot` | Círculo de color (via `style.setProperty`) |
| `.rep-legend-name` / `.rep-legend-val` | Nombre y porcentaje de cada categoría |

#### Variables globales

```js
let expensesChartInstance = null;
let cashFlowChartInstance = null;
const REP_PALETTE = ['#4f8fff','#22c97a','#f05252','#f59e0b','#a78bfa','#06b6d4','#7c5cfc','#ec4899','#14b8a6','#f97316','#84cc16','#64748b'];
```

#### Funciones JS de Fase 10

| Función | Propósito |
|---------|-----------|
| `populateRepFilterMonth()` | Llena `#rep-filter-month` con meses disponibles en `appState.transactions` |
| `renderReportes()` | Destruye instancias previas → doughnut de gastos por categoría del mes → bar de flujo últimos 6 meses |

**Patrón clave:** destruir antes de crear: `if (expensesChartInstance) { expensesChartInstance.destroy(); expensesChartInstance = null; }`.  
El doughnut usa leyenda personalizada (no la de Chart.js) para controlar el DOM con `createTextNode`/`appendChild`.  
El bar chart siempre muestra los 6 meses previos al mes seleccionado, incluyendo meses sin datos (valor 0).

#### Listener del filtro

```js
document.getElementById('rep-filter-month').addEventListener('change', () => renderReportes());
```

#### Criterio de test — Fase 10

- Navegar a Reportes → doughnut con gastos del mes actual
- Cambiar mes en el filtro → ambos gráficos se actualizan
- Mes sin gastos → doughnut vacío + mensaje "No hay gastos"
- Bar siempre muestra 6 meses (meses sin datos muestran 0)

### Fase 11 — Acabados (⬜ Parcial)

**Implementado:**
- `setupPullToRefresh()` ✅ — touch events → `renderAll()` al arrastrar ≥60px
- `cfgExportJson()` / `cfgImportJson()` ✅ — en Fase 4

**Pendiente:**
- **Saldos de Cuentas** — `renderBankBalances()`: suma transacciones por banco, muestra saldo neto por cuenta
- **PDF Export** — jsPDF + AutoTable: genera tabla de transacciones del mes en PDF
- **Info modals** — historia de la marca, términos, privacidad, cookies, tutoriales

---

## 16. Referencia Rápida

### Modales del proyecto

| ID | Fase | Propósito |
|----|------|-----------|
| `#auth-modal` | 1 | Login y registro |
| `#calc-modal` | 3 | Calculadora de transacciones |
| `#cat-modal` | 3 | Selector de categoría (grid de íconos) |
| `#confirm-modal` | 3 | Confirmación genérica |
| `#transfer-modal` | 3 | Transferencia entre cuentas |
| `#edit-modal` | 3 | Edición de transacción existente |
| `#cfg-cat-icon-modal` | 4 | Selección de ícono para categoría |
| `#rec-modal` | 6 | Alta/edición de gasto recurrente |
| `#cc-modal` | 8 | Alta de tarjeta de crédito |
| `#dist-input-modal` | 7 | Ingreso de monto/porcentaje de distribución |
| `#shared-bank-modal` | 7 | Banco para pago de gasto compartido |
| `#proj-modal` | 9 | Alta/edición de proyección manual |

### IDs HTML clave por sección

| Sección | IDs importantes |
|---------|----------------|
| **Auth** | `#auth-email`, `#auth-password`, `#login-btn`, `#register-btn` |
| **Header** | `#app-header`, `#user-alias`, `#header-subtitle`, `#logout-btn` |
| **Tab bar** | `#tab-bar`, `.tab-btn[data-tab]`, `#logout-tab-btn` |
| **Dashboard** | `#dashboard`, `#dash-balance-value`, `#dash-income-value`, `#dash-expense-value`, `#alerts-area` |
| **Action bar** | `#action-bar`, `#btn-add-transaction`, `#btn-transfer`, `#btn-delete-selected`, `#btn-save-budgets`, `#btn-add-projection` |
| **Registros** | `#section-registros`, `#reg-filter-month/bank/cat`, `#reg-tbody`, `#reg-tfoot`, `#reg-empty`, `#description-list` |
| **Proyección** | `#section-proyeccion`, `#proj-filter-month`, `#proj-tbody`, `#proj-tfoot` |
| **Recurrentes** | `#section-recurrentes`, `#btn-add-rec`, `#rec-tbody`, `#rec-tfoot` |
| **Comunes** | `#section-comunes`, `#btn-add-comun`, `#comunes-cards`, `#dist-popover` |
| **Tarjetas** | `#section-tarjetas`, `#btn-add-card`, `#cc-tbody`, `#cc-tfoot` |
| **Presupuesto** | `#section-presupuesto`, `#budget-tbody`, `#budget-total-budgeted/spent/remaining` |
| **Configuración** | `#section-configuracion`, `#cfg-cat-list`, `#cfg-bank-list`, `#cfg-desc-list`, `#cfg-alias`, `#cfg-opening-balance` |

### Convenciones de nomenclatura

| Ámbito | Convención | Ejemplo |
|--------|-----------|---------|
| Clases CSS | `kebab-case` | `.filter-bar`, `.dash-card__icon` |
| Variables CSS | `--dominio-propiedad` | `--color-accent`, `--space-md` |
| Modificadores CSS | `--estado` | `.tab-btn--active`, `.badge--danger` |
| HTML IDs | `[sección]-[elemento]` | `#reg-filter-month`, `#cfg-alias` |
| Modales | `[sección]-modal` | `#calc-modal`, `#edit-modal` |
| JS funciones | `camelCase` | `renderDashboard()`, `openCalcModal()` |
| JS constantes globales | `SCREAMING_SNAKE` | `APP_ID`, `DEFAULT_ICON` |
| JS state | `appState.propiedad` | `appState.transactions` |

---

## 17. Reglas de Calidad (resumen)

1. **Sin `style=""`** — toda regla visual en `<style>`. JS solo toca `classList` o `element.style.setProperty('--var', val)`.
2. **Sin XSS** — `textContent` / `createTextNode` siempre. Escapar atributos con datos del usuario.
3. **Sin listeners acumulados** — event delegation en contenedores dinámicos. Un listener por contenedor.
4. **Sin `console.log`** — solo `console.error` para errores reales.
5. **Sin `window.*`** — módulo único ES6.
6. **`safeEval()` en lugar de `eval()`** — `Function('return ' + sanitized)` con validación previa.
7. **Firebase en `try/catch`** — todas las operaciones de escritura con manejo de error + `showToast`.
8. **Validación de inputs** — antes de escribir en Firestore.
9. **Array eficiente** — `reduce()` en lugar de `filter` + `map` encadenados.
10. **Re-renders** — `renderAll()` solo cuando los datos cambian (en los callbacks de `onSnapshot`).
