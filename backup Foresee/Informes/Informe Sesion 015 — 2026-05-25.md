# Informe Sesión 015 — 2026-05-25

## Archivo activo
`New 0017 - copia.html` → renombrado a **`New 0018.html`**

---

## Cambios aplicados

### 1. Bug fix — Tabs tarjetas/saldos/reportes bloqueados

- **Síntoma:** Los botones tab "Tarjetas de Crédito", "Saldos" y "Reportes" no respondían a clics.
- **Causa raíz:** La 3ª reforma de sesión 13 había añadido `el.style.pointerEvents = 'none'` a `_syncModalState`. Cuando cualquier modal se abría, aplicaba `pointer-events: none` a `#app-header`, `#tab-bar` y `#main-wrapper`. Si el modal se cerraba por una ruta inesperada, el `pointer-events` quedaba sin restaurarse indefinidamente (hasta recargar la página).
- **Fix:** Eliminadas las líneas `el.style.pointerEvents = 'none'` y `el.style.pointerEvents = ''` de `_syncModalState`. Los modals bloquean clics por sí solos con `position: fixed; inset: 0; z-index: alto`. Se conservan `aria-hidden` y `body.overflow`.
- **Archivos:** `New 0017 - copia.html` (→ `New 0018.html`) y `New 0017.html`.

### 2. Renombre de archivo

- `New 0017 - copia.html` → `New 0018.html`
- `New 0018.html` contiene **todas** las features de sesión 014: modo claro/tema toggle, exportar CSV, header CSS Grid `1fr auto 1fr`, altura `6.5rem`, selector de divisa, tutorial, onboarding, datos de demo.

---

## Estado final

| Elemento | Estado |
|----------|--------|
| Archivo activo | `New 0018.html` ✅ |
| Bug tabs bloqueados | Corregido ✅ |
| Fase 1 (comercialización) | ✅ completa en versión base |
| Fase 2 pendiente | CSV export, notificaciones, reportes avanzados |

---

## Próxima tarea
**Fase 2 del plan de comercialización.** Archivo activo: `New 0018.html` (completo con todas las features de sesiones 001–014).
