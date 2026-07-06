# Informe Sesión 019 — 2026-05-31

## Archivo activo
`New 0020.html` → renombrado a **`FS 0001.html`** (nuevo prefijo FS = Foresee).
Punto de restauración: `Backup\FS 0001 — Restauracion 2026-05-31.html`.

---

## Cambios aplicados

### 1. Copy del tutorial motivacional

| # | Título anterior | Título nuevo |
|---|----------------|--------------|
| 1 | Paso 1: Configuración Inicial | Paso 1: Empieza Fuerte |
| 2 | Paso 2: Gastos Recurrentes | Paso 2: Automatiza tu Tranquilidad |
| 3 | Paso 3: Tarjetas de Crédito | Paso 3: Domina tus Deudas |
| 4 | Paso 4: Registro Diario | Paso 4: El Hábito que Cambia Todo |
| 5 | Paso 5: Reportes, Presupuesto y Tablas | Paso 5: Conoce tu Dinero |
| 6 | Paso 6: Proyección | Paso 6: Viaja al Futuro |
| 7 | Paso 7: Gastos Comunes | Paso 7: Divide sin Conflictos |

Título modal: "Videos Tutoriales" → "Aprende Foresee" · Panel: "Lista de videos" → "Paso a paso"

### 2. Modo oscuro — tokens CSS + transición suave

- 5 tokens nuevos en `:root`: `--color-primary`, `--color-bg-secondary`, `--color-bg-tertiary`, `--color-input`, `--color-overlay`
- 5 tokens equivalentes en `html[data-theme='light']` con valores para fondo claro
- Transición suave 0.25s en body, header, modales, inputs, tablas — el cambio de tema hace fade
- Overlay de modales usa `var(--color-overlay)` en lugar de `rgba` hardcoded

### 3. manifest.json conectado (PWA)

`manifest.json` existía en la carpeta pero no estaba referenciado. Se agregaron al `<head>`:
```html
<link rel="manifest" href="manifest.json" />
<meta name="theme-color" content="#1f2937" />
```
La app ahora es instalable como PWA en Android Chrome. `sw.js` existe pero no está registrado — pendiente Tarea 17.

### 4. CSV oculto

Los 3 botones CSV recibieron clase `hidden`. Función `exportCSV()` y listeners preservados — solo invisible al usuario. Motivo: reemplazado por Export Excel de 4 hojas.

---

## Tareas pendientes

### Fase 2 (en curso)
| # | Tarea | Estado |
|---|-------|--------|
| **10** | **Reportes avanzados** | 🔥 Próxima |

### Fase 3 — Monetización
| # | Tarea |
|---|-------|
| 11 | Lógica freemium (límites plan gratis) |
| 12 | Pantalla de upgrade en la app |
| 13 | Stripe + Firebase Cloud Functions |
| 14 | Textos legales (Privacy, Terms, Refund) |

### Fase 4 — Lanzamiento
| # | Tarea |
|---|-------|
| 15 | Dominio propio (foreseefinances.com) |
| 16 | Landing page con demo y CTA |
| 17 | PWA — manifest.json |
| 18 | Email de soporte visible |
