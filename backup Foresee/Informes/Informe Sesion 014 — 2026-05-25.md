# Informe Sesión 014 — 2026-05-25

## Archivo activo
`New 0017.html` — sin renombre en esta sesión.

---

## Cambios aplicados

### 1. Fix — Botones X de modales no cerraban en escritorio
- **Causa:** `guardClose()` mostraba un diálogo de confirmación que el usuario no veía en escritorio.
- **Fix:** Eliminado `guardClose` de los 4 botones X. Ahora llaman directamente a su función de cierre.
- Afecta: `calc-close-btn`, `proj-close-btn`, `cc-close-btn`, `rec-close-btn`.

### 2. Feature — Selección de divisa
- `appState.currency` (default `'USD'`) en init, reset y carga desde Firestore.
- `formatCurrency()` lee `appState.currency` dinámicamente.
- `<select id="cfg-currency">` con 15 monedas en Configuración.
- `handleSaveCurrency()`: guarda en Firestore + re-renderiza toda la app.

### 3. Feature — Tutorial de videos (Tarea 4 Fase 1)
- Botón flotante `▶` fijo abajo-izquierda, oculto durante el auth.
- Modal con reproductor `<video>` nativo y lista lateral de 7 videos (Cloudinary mp4).
- Layout vertical en móvil, horizontal en escritorio (≥768px).
- Funciones: `openTutorialModal`, `closeTutorialModal`, `buildTutorialList`, `playTutorialVideo`.

### 4. Feature — Onboarding 3 pasos (Tarea 5 Fase 1)
- Solo aparece al registrarse por primera vez (flag en `localStorage`).
- Paso 1: alias → Paso 2: datos de demo → Paso 3: tutorial.
- Barra de progreso visual. Al completar o cerrar, escribe `foresee-onboarding-done`.

### 5. Feature — Datos de demo (Tarea 6 Fase 1)
- `loadDemoData()` crea: 5 categorías, 2 bancos, saldo $2.000, 6 transacciones, 1 recurrente.
- Solo se ejecuta si el usuario elige "Sí" en el paso 2 del onboarding.

### 6. Reorganización de carpetas y documentación
- Carpeta `MD\`: planes y blueprints.
- Carpeta `Informes\`: informes de sesión (desde sesión 012).
- `CLAUDE.md` actualizado con nuevas rutas.
- Plan de comercialización reordenado a 4 fases y guardado en memoria y en `MD\`.

---

## Estado Fase 1 — COMPLETA ✅

| # | Tarea | Estado |
|---|-------|--------|
| 1 | Recuperación de contraseña | ✅ |
| 2 | Eliminar cuenta y datos | ✅ |
| 3 | Selección de moneda | ✅ |
| 4 | Tutorial de videos | ✅ |
| 5 | Onboarding 3 pasos | ✅ |
| 6 | Datos de demo | ✅ |

---

## Próxima tarea
**Fase 2, tarea 7 — Exportar CSV**
Archivo activo: `New 0017.html`
