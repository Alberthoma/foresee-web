# Informe Sesión 012 — Foresee
**Fecha:** 2026-05-25  
**Archivo:** `New 0015.html` → renombrado a `New 0016.html`

---

## Resumen

Sesión de corrección de bugs y mejoras de calidad. Se aplicaron **10 cambios** al archivo activo. El hallazgo más crítico fue un **loading overlay invisible bloqueando todos los clicks** cuando Firestore fallaba al conectar.

---

## Cambios aplicados

### ✅ 1. Debounce de renderAll() — Over-rendering en login

**Problema:** 6 listeners Firebase (`onSnapshot`) llamaban `renderAll()` cada uno al recibir datos. Al iniciar sesión, los 6 disparaban simultáneamente → hasta 6 renders completos en cascada.

**Fix:** Nueva función `scheduleRenderAll()` con debounce 50ms. Los 6 listeners la usan en lugar de `renderAll()`. Las acciones del usuario (cambio de pestaña, pull-to-refresh) siguen con `renderAll()` directo.

```javascript
let _renderAllTimer = null;
function scheduleRenderAll() {
  if (_renderAllTimer) clearTimeout(_renderAllTimer);
  _renderAllTimer = setTimeout(renderAll, 50);
}
```

---

### ✅ 2. checkBudgetLimits() — Filtro incorrecto

**Problema:** Calculaba los gastos por categoría usando `getFilteredTransactions()`, que aplica los filtros de banco y categoría activos en la UI — no el total real del mes.

**Fix:** Usa `appState.transactions.filter(...)` con filtro solo por mes, independiente de la selección de la UI.

---

### ✅ 3. renderCreditCardAlerts() — Función faltante

**Problema:** El contenedor `#credit-card-alerts` existía en el HTML pero nunca se poblaba.

**Fix:** Implementada `renderCreditCardAlerts()` y conectada a `renderDashboard()`. Muestra alertas cuando el uso de una tarjeta supera el 80% del límite (⚠️) o el 90% (🔴).

---

### ✅ 4. Teclado del modal calculadora

**Problema:** `handleCalcKeyboard` solo se adjuntaba al abrir el modal desde `btn-add-transaction`. Al abrirlo desde las cards del dashboard o el botón editar de la tabla, el teclado no respondía.

**Fix:** El `removeEventListener` + `addEventListener` se movió al final de `openCalcModal()`, garantizando que siempre se adjunte independientemente de cómo se abra el modal.

---

### ✅ 5. Dashboard cache eliminado

**Problema:** `_dashCache` invalidaba solo cuando cambiaba la cantidad de transacciones. Si se editaba una transacción (mismo count, datos distintos), el dashboard mostraba valores obsoletos.

**Fix:** Eliminado el cache completamente. El cálculo es O(N) — el costo es mínimo y no justifica el riesgo de mostrar datos incorrectos.

---

### ✅ 6. commitInChunks() — Límite 500 ops de Firestore

**Problema:** `initiateNewMonth()`, `resetPeriod()` y `cfgImportJson()` usaban un único `writeBatch` sin límite. Firestore rechaza batches con más de 500 operaciones — con suficientes transacciones, estas funciones fallaban silenciosamente.

**Fix:** Helper `commitInChunks(ops)` que divide en grupos de 499 y ejecuta un batch por grupo.

---

### ✅ 7. O(N×M) fix en processRecurringExpenses()

**Problema:** Por cada gasto recurrente × mes ejecutaba `appState.transactions.some(...)` con `new Date()` interno — complejidad cuadrática.

**Fix:** Pre-computa un `Set` de claves una sola vez → lookup O(1) por cada gasto.

---

### ✅ 8. Timezone fix en construcción de fechas

**Problema:** `new Date(y, m, d).toISOString().split('T')[0]` puede retornar el día anterior en zonas horarias UTC-. Afectaba `processRecurringExpenses()` y `getDynamicProjections()`.

**Fix:** Construcción manual: `` `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}` ``

---

### ✅ 9. Bug crítico de navegación — Loading overlay bloqueaba todos los clicks

**Síntoma:** Todos los botones (pestañas, cards del dashboard, botones de formulario) dejaban de responder completamente.

**Causa raíz:** El overlay de carga (`#loading-overlay`) inicia con `class="active"` en el HTML y tiene `pointer-events: all; z-index: 9999`. Solo se desactiva cuando `hideLoading()` se llama desde el **callback de éxito** del listener `prefRef`. Si Firestore fallaba al conectar (red inestable, modo incógnito, caché corrupta), el **error handler** se ejecutaba pero no llamaba `hideLoading()`. El overlay quedaba cubriendo toda la pantalla y absorbiendo silenciosamente todos los clicks — sin ninguna señal visual del problema.

**Fix:**
```javascript
// ANTES — hideLoading() nunca llamado en error:
(err) => console.error('[Firestore] preferencias:', err)

// DESPUÉS — siempre se llama hideLoading():
(err) => { console.error('[Firestore] preferencias:', err); hideLoading(); }
```

---

### ✅ 10. Fixes defensivos

**10a** — Null guard: `expense.description.toLowerCase()` → `(expense.description || '').toLowerCase()` en `processRecurringExpenses()`.

**10b** — try/catch en `renderDashboard()` alrededor de `renderCreditCardAlerts()` para que un crash no corte el resto del render.

---

### ✅ 11. Renombre del archivo

`New 0015.html` → `New 0016.html`

Referencias actualizadas en: `CLAUDE.md`, memoria del proyecto y blueprint.

---

## Estado final

| Item | Estado |
|---|---|
| Archivo activo | `New 0016.html` |
| Bugs conocidos | Ninguno |
| Deuda técnica activa | Ninguna |
| Funciones nuevas | `renderCreditCardAlerts()`, `commitInChunks()`, `scheduleRenderAll()` |
| Funciones modificadas | `checkBudgetLimits()`, `processRecurringExpenses()`, `getDynamicProjections()`, `renderDashboard()`, `openCalcModal()`, `initiateNewMonth()`, `resetPeriod()`, `cfgImportJson()`, `loadUserData()` |
