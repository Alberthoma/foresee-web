# Foresee — Blueprint Completo
**Versión:** New 0018.html  
**Fecha:** 2026-05-27  
**Estado:** Operativo — 2 bugs críticos en demo data pendientes de fix

---

## 1. VISIÓN GENERAL

### Qué es
App web de gestión de finanzas personales. Todo el código vive en un único archivo HTML (~380KB, 10.346 líneas). Sin frameworks de JS ni de CSS.

### Propuesta de valor
> "Todo tu dinero en un solo lugar — desde el registro diario hasta la proyección del mes que viene."

### Tech Stack

| Tecnología | Versión | Uso |
|------------|---------|-----|
| Firebase Auth | 11.6.1 | Autenticación email/password |
| Firebase Firestore | 11.6.1 | Persistencia de datos + offline cache |
| Chart.js | 4.4.4 | Gráficos de reportes |
| jsPDF | 2.5.1 | Exportación PDF |
| jsPDF AutoTable | 3.5.23 | Tablas en PDF |
| Browser Notification API | nativa | Alertas de vencimiento |
| Cloudinary | CDN | Íconos de categorías + videos tutorial |

### Estructura del archivo

```
New 0018.html (10.346 líneas)
├── <head>
│   ├── Detección de tema antes del render (L13–17)
│   ├── Chart.js CDN (L18)
│   └── jsPDF CDN (L19–20)
├── <style> (L21–L3346) — 3.325 líneas, 33 secciones CSS
│   ├── S1–S2:   Variables CSS + modo claro
│   ├── S3–S6:   Loading, Fullscreen, Toast, Pull-to-refresh
│   ├── S7–S9:   Header, Tab bar, View state
│   ├── S10–S19: Layout, Dashboard, Modales, Formularios, Auth
│   ├── S20:     Responsive móvil (≤768px)
│   ├── S21–S27: Registros, Calculadora, Categorías, Configuración
│   ├── S28+:    Gastos Comunes, Tarjetas, Saldos, Reportes, Proyección
│   └── Onboarding, Tutorial, Presupuesto, Legales
└── <body> (L3348–end)
    ├── HTML (L3348–L4889) — 1.541 líneas
    │   ├── Loading overlay
    │   ├── Fullscreen prompt
    │   ├── Toast container
    │   ├── Pull-to-refresh
    │   ├── #app-header (logo, título, botones desktop)
    │   ├── #tab-bar (9 pestañas)
    │   ├── #main-wrapper
    │   │   ├── #dashboard (3 tarjetas + alertas)
    │   │   └── #content-area (action-bar + 9 tab-panes)
    │   ├── Footer (legal links)
    │   ├── 15+ modales
    │   ├── Tutorial modal
    │   └── Onboarding modal (3 pasos)
    └── <script type="module"> (L4890–L10344) — 5.454 líneas
```

---

## 2. ARQUITECTURA DE DATOS (FIRESTORE)

### Estructura de colecciones

```
artifacts/wittfinances-282f1/users/{uid}/
├── user_data/
│   ├── preferences (documento)
│   │   ├── categories:       [{name, icon}]
│   │   ├── banks:            [string]
│   │   ├── descriptions:     [string]  ← autocomplete
│   │   ├── openingBalance:   number
│   │   ├── userAlias:        string
│   │   ├── currency:         'USD' | 'EUR' | ...
│   │   ├── notificationsEnabled: boolean
│   │   └── categoryBudgets:  { [categoryName]: number }
│   └── gastosComunes (documento)
│       └── items: [{id, name, total, people:[{name,amount,paid}]}]
├── transactions/       ← colección
│   └── {id}: {date, type, amount, description, category, bank, transferLeg?, isArchived?}
├── recurringExpenses/  ← colección
│   └── {id}: {description, amount, category, bank, day, active}
├── creditCards/        ← colección
│   └── {id}: {bank, amount, limit, closingDay, dueDay}
└── projections/        ← colección
    └── {id}: {date, type, amount, description, category, bank}
```

### Helpers de ruta

```js
DB_COL = (uid, col) => `artifacts/${APP_ID}/users/${uid}/${col}`
DB_PREF = (uid)     => `artifacts/${APP_ID}/users/${uid}/user_data/preferences`
```

---

## 3. ESTADO DE LA APLICACIÓN (appState)

```js
const appState = {
  // Datos del usuario
  transactions:        [],      // array de objetos de transacción
  projections:         [],      // proyecciones manuales
  recurringExpenses:   [],      // gastos recurrentes
  creditCards:         [],      // tarjetas de crédito
  gastosComunes:       { items: [] },
  categories:          [],      // [{name, icon}]
  banks:               [],      // [string]
  descriptions:        [],      // [string] autocomplete
  categoryBudgets:     {},      // { catName: number }
  openingBalance:      0,
  userAlias:           '',
  currency:            'USD',
  notificationsEnabled: false,

  // Estado de sesión
  currentUser:         null,    // Firebase User
  currentTab:          null,    // 'registros' | 'proyeccion' | ...
  budgetAlertsShown:   {},      // { 'YYYY-MM-catName': true }

  // Filtros activos
  filterMonth:         'YYYY-MM',
  filterBank:          '',
  filterCategory:      '',
};
```

---

## 4. MÓDULOS PRINCIPALES

### 4.1 Autenticación
- Login / Registro / Reset password / Cambiar password / Eliminar cuenta
- Guard `_authInProgress` evita doble-submit
- `_showFullscreenOnLoad` → muestra prompt de fullscreen post-login

### 4.2 Dashboard
- Saldo total (openingBalance + ingresos – gastos)
- Ingresos y gastos del mes activo
- Alertas de tarjetas de crédito (>80% del límite)
- Alertas de gastos recurrentes (≤5 días para vencer)
- Click en tarjetas navega a sección + abre calculadora preconfigurada

### 4.3 Registros
- Tabla con: checkbox, fecha, descripción, categoría, banco, monto, saldo acumulado, acciones
- Saldo acumulado calculado sobre TODAS las transacciones, mostrado en la filtrada
- Filtros: mes, banco, categoría
- Mobile: columnas ocultas (descripción, acciones), botón info expandible
- Edición vía calc-modal
- Selección múltiple: editar / eliminar en batch

### 4.4 Proyección
- Tabla idéntica a Registros pero sobre colección `projections`
- Filas virtuales (de recurrentes) mostradas con opacidad reducida
- Saldo proyectado acumulado

### 4.5 Gastos Recurrentes
- Auto-registro al iniciar sesión: detecta meses sin registrar y crea transacciones
- Cap de 12 meses hacia atrás para importaciones masivas
- Recordatorios: toast + browser notification el día antes del vencimiento
- Dedup: sessionStorage (toast) + localStorage (browser notif)

### 4.6 Tarjetas de Crédito
- Seguimiento de deuda vs límite con % de utilización
- Alertas automáticas al >80% del límite
- Browser notification una vez al día (localStorage dedup)

### 4.7 Gastos Comunes
- Cards por ítem de gasto compartido
- Distribución proporcional o manual por persona
- Estado pagado/pendiente por persona
- Revertir pago incluido
- Datos guardados como documento único (no colección)

### 4.8 Saldos
- Balance por banco calculado desde todas las transacciones

### 4.9 Reportes
- Gráfico de barras: ingresos vs gastos por mes (Chart.js)
- Gráfico de dona: gastos por categoría
- Tabla de totales

### 4.10 Presupuesto
- Tabla de presupuesto por categoría con input editable
- Progress bar con colores (verde/amarillo/rojo)
- Alertas en-app al 80% y 90% del presupuesto

### 4.11 Configuración
- Alias, saldo inicial, divisa, tema
- CRUD de categorías (con ícono de 53 opciones)
- CRUD de bancos y descripciones
- Notificaciones: activar/desactivar
- Exportar CSV (mes / todo) + PDF
- Cambiar contraseña / Eliminar cuenta

---

## 5. FLUJO DE CALCULADORA (Registro de transacción)

```
1. Click "+" / botón "+ Registrar" / click en dash-income / dash-expense
   ↓
2. calc-modal abre
   - Selector de tipo (Ingreso / Gasto) con glow de color
   - Fecha (picker)
   - Descripción (con autocomplete desde descriptions[])
   - Banco (select desde banks[])
   - Keypad (4×4 con operadores)
   ↓
3. Enter / OK → evalúa expresión → tempTxData.amount
   ↓
4. cat-modal abre (grid de categorías)
   ↓
5. Click en categoría → tempTxData.category
   ↓
6. finalizeTransaction() → addDoc a Firestore
   ↓
7. Toast de éxito → snapshot de Firestore → re-render tabla
```

---

## 6. SISTEMA DE NOTIFICACIONES

### Flujo de activación
```
cfg-notif-btn click
  → handleNotificationToggle()
    → Si ya activas: desactivar (setDoc merge notificationsEnabled: false)
    → Si no soportado: toast warning
    → Si bloqueadas: toast warning
    → Si default: Notification.requestPermission()
      → Si granted: setDoc merge notificationsEnabled: true
```

### Disparadores automáticos
| Evento | Cuándo | Dedup |
|--------|--------|-------|
| Gasto recurrente vence mañana | Al cargar recurrentes | sessionStorage (toast) + localStorage (notif) |
| Tarjeta >80% del límite | Al cargar tarjetas | localStorage diario |
| Presupuesto >80% | Al render dashboard | appState.budgetAlertsShown (en memoria) |

---

## 7. ONBOARDING (nuevo usuario)

```
handleRegister → localStorage.setItem('foresee-new-user', '1')
  ↓
onAuthStateChanged → hideAuthModal, loadUserData
  ↓
preferences snapshot carga →
  if foresee-new-user === '1' && !ONBOARDING_KEY:
    setTimeout(showOnboarding, 800)
  ↓
PASO 0: ¿Cómo te llamamos? → _onboardingSaveAlias()
  ↓
PASO 1: ¿Demo data? 
  → Sí: loadDemoData() → scheduleRenderAll()
  → No: seguir
  ↓
PASO 2: Ver tutorial / Explorar solo
  → Tutorial: closeBonboarding() + openTutorialModal(0)
  → Solo: closeOnboarding()
  ↓
closeOnboarding() → localStorage.setItem(ONBOARDING_KEY, '1')
```

---

## 8. RENDERIZADO

### Árbol de render
```
scheduleRenderAll() [debounce 50ms]
  → renderAll()
    → renderDashboard()          ← siempre
    → switch(currentTab):
        registros   → renderTransactionsTable()
        proyeccion  → renderProyeccionTable()
        recurrentes → renderRecurringTable()
        presupuesto → renderBudgetTable()
        tarjetas    → renderCreditCardsTable()
        saldos      → renderBankBalances()
        gastos-comunes → renderGastosComunesTable()
        reportes    → renderReportes()
        configuracion → renderConfigurationLists()
```

### Optimizaciones activas
- `scheduleRenderAll()` debounce 50ms para coalescer múltiples snapshots
- `createDocumentFragment` en tablas grandes
- Event delegation en todas las tablas (no re-adjunta listeners)
- Solo renderiza la tab activa (no todas)

---

## 9. RESPONSIVE / MOBILE

### Breakpoints
- `≤768px`: Header oculto, tab-bar al top, modales 90vh fullscreen, columnas de tabla ocultas, tap targets 58px, prevención de zoom iOS (font-size 16px en inputs)
- `≤480px`: Grid de dashboard a 1 columna
- `≥768px`: Tutorial modal en layout side-by-side (video + lista)

### Mobile-specific UX
- Pull-to-refresh (touchstart/move/end)
- Botón "ⓘ" en tabla reemplaza columna de banco en mobile
- Filtros colapsables (toggle)
- Fullscreen API con prompt visual de solicitud

---

## 10. MODALES REGISTRADOS

### En MODAL_IDS (con trap de foco + scroll lock)
`auth-modal`, `calc-modal`, `cat-modal`, `confirm-modal`, `transfer-modal`, `cfg-cat-icon-modal`, `rec-modal`, `cc-modal`, `dist-input-modal`, `shared-bank-modal`, `proj-modal`, `philosophy-modal`, `privacy-modal`, `terms-modal`

### Fuera de MODAL_IDS (⚠️ sin trap de foco)
`cookies-modal`, `delete-account-modal`, `onboarding-modal`, `tutorial-modal`

---

## 11. BUGS ACTIVOS

| # | Severidad | Descripción | Línea | Fix |
|---|-----------|-------------|-------|-----|
| 1 | 🔴 Crítico | Demo categories con emoji como img src | 7085–7091 | Usar URLs de PRESET_ICONS |
| 2 | 🔴 Crítico | demoRecurring usa `dueDay` en lugar de `day` | 7153 | Cambiar a `day: 20` |
| 3 | 🟡 Moderado | `delete-account-modal` fuera de MODAL_IDS | 10261 | Agregar al array |
| 4 | 🟢 Menor | `renderRecurringAlerts` usa innerHTML = '' | 5789 | Cambiar a textContent = '' |
| 5 | 🟢 Menor | `appState.gastosComunes.people` en unloadUserData (legacy) | 5548 | Limpiar residuo |

---

## 12. ESTADO DE COMERCIALIZACIÓN

### Listo
✅ Autenticación completa  
✅ Persistencia offline  
✅ Tutorial en video (7 episodios)  
✅ Onboarding 3 pasos  
✅ Mobile-first responsive  
✅ Dark/light mode  
✅ Multi-divisa  
✅ Exportación CSV + PDF  
✅ Legales (Privacy / Terms / Cookies)  
✅ Notificaciones browser  

### Falta para lanzar
❌ Fix bugs críticos en demo data  
❌ Landing page (el login no vende)  
❌ Modelo de monetización (sin Stripe ni tiers)  
❌ PWA real (manifest + service worker)  
❌ Soporte al usuario (email / chat / FAQ)  
❌ Revisión Firestore Security Rules  

### Estimación de completitud
**70% listo para comercializar** — 2–3 semanas de trabajo para fix de bugs + landing + modelo freemium básico.

---

## 13. HISTORIAL DE SESIONES

| Sesión | Archivo | Cambios clave |
|--------|---------|---------------|
| 001–003 | Edicion Cld 0001 | CSS fixes, calculadora modal, XSS, listeners |
| 004–009 | Edicion Cld 0002/0003 | Navegación, autocomplete, transferir, rewrite fases 1-11 |
| 010 | New 0015 | Revisión exhaustiva + 5 fixes UI |
| 011 | New 0015 | Spinner, revertir pago, edición modal, fullscreen |
| 012 | New 0016 | scheduleRenderAll, 4 bugs calidad, overlay bloqueante |
| 013 | New 0017 | Mantenimiento sistema (sin cambios de código) |
| 014 | New 0017 | Fase 1: divisa, tutorial, onboarding, demo data, fix modales |
| 015 | New 0018 | Fix tabs bloqueados (pointer-events en _syncModalState) |
| 016 | New 0018 | Task 9 notificaciones, fix login/fullscreen bloqueante |

---

*Blueprint generado el 2026-05-27 a partir del análisis estático de New 0018.html*
