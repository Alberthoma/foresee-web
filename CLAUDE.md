# Foresee — Gestor de Presupuesto Web

## Qué es este proyecto
App web de gestión de presupuesto personal. Todo el código vive en **un único archivo HTML**
(~13.000+ líneas) que incluye CSS, JS y HTML en un solo fichero. Usa Firebase Auth + Firestore
para autenticación y persistencia, Chart.js para gráficos y jsPDF para exportar PDF.

---

## Archivo principal de trabajo
El archivo activo se renombra con cada versión. Buscar el `.html` más reciente en la carpeta
raíz del proyecto. Actualmente: `FS 0002.html` (renombrado sesión 020 — 2026-06-01). Punto de restauración: `Backup\FS 0001 — Restauracion 2026-05-31.html`.
El archivo de referencia (producción, no tocar) es `Edicion Cld 0003.html`.

Existe una carpeta `Backup\` con el historial de versiones anteriores — no modificar.
Los ejemplos de skin están en `skin\` — no son archivos de producción.

---

## ⚡ TAREAS PENDIENTES
Ver lista completa con estado en memoria: `project_pendientes.md`

### TAREA B — Rediseño Gastos Comunes (Nivel 3) — ✅ COMPLETA
Verificado en sesión 005 contra `Edicion Cld 0002.html`

**Próxima: Fase 2 del plan de comercialización.** Ver `project_pendientes.md` en memoria para la lista completa.

---

## 🔄 Protocolo de inicio de sesión
Al comenzar una sesión nueva, hacer esto en orden antes de tocar código:

1. Leer este `CLAUDE.md` — contexto del proyecto y tarea pendiente
2. Leer el informe de la sesión anterior en memoria (`informe_sesion_NNN.md`) para conocer el estado exacto
3. Leer las secciones CSS/JS relevantes del HTML principal (solo las que se van a modificar)
4. Confirmar con el usuario desde qué punto continuar si el trabajo estaba en progreso
5. Nunca asumir que el trabajo anterior se completó — verificar el estado real del archivo

---

## 📋 Protocolo de cierre de sesión
**Obligatorio al finalizar cada sesión** — garantiza continuidad aunque el contexto se comprima.

Al terminar toda sesión de trabajo, crear siempre dos archivos:

### 1. Memoria interna (`memory/informe_sesion_NNN.md`)
```
C:\Users\Albert\.claude\projects\d------Proyectos-1-Foresee-Edicion\memory\informe_sesion_NNN.md
```
Con frontmatter:
```
---
name: informe-sesion-NNN
description: "Sesión NNN (YYYY-MM-DD): resumen de N cambios"
metadata:
  type: project
  date: YYYY-MM-DD
---
```
Contenido mínimo: lista numerada de todos los cambios, causa de cada bug, fix aplicado, estado final del archivo.

### 2. Archivo exportado (carpeta del proyecto)
```
d:\$$$ Proyectos\1 Foresee\Edicion\Informes\Informe Sesion NNN — YYYY-MM-DD.md
```
Mismo contenido, formateado para leer con `Ctrl+Shift+V` en VS Code.

Estructura de carpetas para documentos:
- `Informes\` — informes de sesión
- `MD\` — planes, blueprints y otros documentos markdown

### 3. Actualizar el índice de memoria
Agregar una línea al `MEMORY.md` con el nuevo informe.

### 4. Actualizar este CLAUDE.md
- Nombre del archivo activo si hubo renombre
- Número de sesión en el historial de cambios

---

## 🛡️ Estrategia anti-límite de tokens (archivo de 13.000+ líneas)

El archivo principal es muy grande. Para trabajar de forma segura:

- **Nunca usar `Write` para reescribir el archivo completo** — siempre usar `Edit` (solo el diff)
- **Un bloque a la vez** — aplicar, verificar funcionamiento, luego pasar al siguiente
- **Leer solo las secciones necesarias** — usar `Read` con `offset` y `limit`, no leer todo
- **Si el output se corta**: el usuario dice "continúa" y se retoma desde el siguiente bloque
- **Checkpoint**: después de cada bloque confirmado, anotar en el historial de cambios

---

## Directrices de trabajo (leer antes de generar cualquier código)

### Rol y enfoque
- Actuar como programador experto. Analizar el código completo antes de proponer cambios.
- Verificar siempre que el código generado no rompe funcionalidad existente.
- Aceptar sugerir mejoras proactivamente aunque el usuario no las pida, indicando claramente
  que son sugerencias opcionales.

### Entrega de código
- **Nunca** entregar código truncado, resumido o con comentarios `// ... resto igual`.
  Siempre bloques completos y funcionales listos para copiar/pegar.
- Entregar los cambios **por bloques** numerados y ordenados, indicando para cada bloque:
  1. Número de línea exacto o rango de líneas donde se aplica
  2. Si es REEMPLAZO, INSERCIÓN o ELIMINACIÓN
  3. Una referencia visual: texto único del código circundante para ubicar el punto exacto
- Antes de cada bloque, describir en 1-2 líneas qué hace y por qué.

### Interfaz y estilos
- La UI debe ser **moderna, limpia y coherente** con la identidad de Foresee
  (app de finanzas personales: paleta sobria, tipografía clara, componentes funcionales).
- **CSS puro únicamente** — sin Tailwind, sin Bootstrap, sin librerías de estilos externas.
- Todo el CSS debe ser **responsivo**: diseño **mobile-first** — la app es principalmente móvil.
  Breakpoints de referencia: 480px, 640px, 768px, 1024px, 1280px.
- Mantener coherencia visual con los estilos ya existentes en el archivo.

### Seguridad (obligatorio en cada cambio)
- Nunca insertar datos del usuario en el DOM vía `innerHTML` — usar `createTextNode`
  o `textContent`.
- Escapar siempre atributos HTML con datos del usuario (`&quot;`, `&#39;`, etc.).
- No exponer información sensible en consola — solo `console.error` para errores reales.
- Validar inputs en el lado cliente antes de enviar a Firestore.
- No introducir nuevas llamadas a `eval()`, `new Function()` ni `innerHTML` con datos dinámicos.

### Rendimiento y calidad
- Preferir una sola pasada de array (`reduce`) sobre múltiples `filter` + `map` encadenados.
- Usar event delegation en lugar de listeners individuales por elemento en listas dinámicas.
- No acumular listeners — verificar que no se re-adjunten en cada render.
- Evitar re-renders innecesarios del DOM.

### Convenciones del proyecto
- No usar `window.*` para nuevas comunicaciones entre módulos (deuda técnica existente,
  no ampliar).
- No agregar `console.log` — solo `console.error` para errores reales de producción.
- No crear archivos nuevos — todo el código va en el único archivo HTML principal.
- No agregar dependencias externas nuevas (CDN u otras) sin consultarlo primero.

---

## Historial de sesiones
Ver informes completos en memoria: `informe_sesion_NNN.md`

| Sesión | Fecha | Archivo | Cambios clave |
|--------|-------|---------|---------------|
| 001-003 | 2026-05-14/15 | Edicion Cld 0001 | CSS fixes, modal calculadora, XSS, listeners |
| 004-009 | 2026-05-15/17 | Edicion Cld 0002/0003 | Navegación, autocomplete, transferir, rewrite fases 1-11 |
| 010 | 2026-05-18 | New 0015 | Revisión exhaustiva + 5 fixes UI |
| 011 | 2026-05-24 | New 0015 | Flechas spinner, revertir pago, edición calc-modal, modales fullscreen |
| 012 | 2026-05-25 | New 0015 → **New 0016** | scheduleRenderAll, 4 bugs calidad, fix navegación (overlay bloqueando clicks), null guards |
| 013 | 2026-05-25 | New 0016 → **New 0017** | Sin cambios de código — sesión de mantenimiento del sistema (limpieza disco C:) |
| 014 | 2026-05-25 | New 0017 | Fase 1 completa: fix X modales, divisa, tutorial videos, onboarding 3 pasos, demo data, reorganización carpetas |
| 015 | 2026-05-25 | New 0017 → **New 0018** | Bug fix: tabs tarjetas/saldos/reportes bloqueados — causa: `pointer-events: none` en `_syncModalState` |
| 016 | 2026-05-26 | New 0018 | Task 9 notificaciones (Browser API, toggle, dedup localStorage), bug fix login bloqueante (_authInProgress, finally), fullscreen post-login vía #fullscreen-prompt |
| 017 | 2026-05-30 | New 0018 → **New 0019** | Export Excel (.xlsx) 4 hojas con fórmulas de balance en cascada, SUM en totales, freeze panes. Punto de restauración en Backup\. |
| 018 | 2026-05-31 | New 0019 → **New 0020** | Entrada por voz (Web Speech API): parser NLP español, confirmación editable, keywords ingreso/gasto, detección fecha/entidad/categoría/banco. Fix CSV columna única (sep=,). |
| 019 | 2026-05-31 | New 0020 → **FS 0001** | Copy tutorial motivacional (7 videos), modo oscuro mejorado (tokens + transición 0.25s), CSV oculto (reemplazado por Excel). Análisis comparativo vs Edicion Cld 0003. manifest.json conectado al `<head>` (PWA instalable). |
| 020 | 2026-06-01 | FS 0001 → **FS 0002** | Fix cambio de mes automático (8 cambios: `tryCheckMonthTransition`, `runMonthTransition`, `lastMonthProcessed`). Fix Gastos Comunes: total no editable (re-render en cada tecla) + monto manual no guardaba (race condition click/submit con `distPopoverPersonIndex`). |

---

## Historial de cambios aplicados

### v0.0.6.0 — Sesión 1
1. 6 comentarios CSS malformados corregidos (`/* ... /*` → `/* ... */`)
2. Padding duplicado eliminado en media queries 640px y 768px
3. Chart.js fijado a versión `@4.4.4` en CDN
4. Calculadora 401k wrapeada en `DOMContentLoaded` (evitaba crash si DOM no listo)
5. 43 `console.log` de producción eliminados (se conservan solo `console.error`)
6. `gastosComunes` agregado al reset de `appState` al cerrar sesión

### v0.0.6.0 — Sesión 2
7. Bug: mensaje "Sin saldos" aparecía aunque hubiera datos (`remove` → `add 'hidden'`)
8. Bug: modal de confirmación se bloqueaba con errores de red → `try/catch` +
   `closeConfirmModal()` siempre se llama
9. Bug: fuga de memoria en toast por `transitionend` → `{ once: true }` +
   fallback `setTimeout` 500ms
10. Seguridad: `data-description` con comillas dobles rompía HTML → escapado con
    `&quot;` y `&#39;`
11. XSS: alertas de tarjetas de crédito → `innerHTML` reemplazado con `createTextNode`
12. XSS: alertas de gastos recurrentes → `innerHTML` reemplazado con `createTextNode`
13. Rendimiento: listeners de editar/eliminar acumulados en cada render →
    1 único listener delegado en el tbody
14. Rendimiento: `renderDashboard` con 4 pasadas de array → 1 sola pasada con `reduce()`

### Edicion Cld 0001 — Sesión 3 (renombre desde v0.0.7.0)
15. Archivo renombrado: `index actual en gibhub 0.0.7.0 correccion claude.html` → `Edicion Cld 0001.html`
16. Formulario de alta reemplazado por modal calculadora (copiado de `Formulario Ejemplo.html`):
    - 2 botones separados (+ Ingreso / + Gasto) → 1 botón unificado `#add-transaction-btn` (+ Registrar)
    - Modal `#add-registro-calculator-modal`: pestañas Ingreso/Gasto, fecha, botón comentario, banco, calculadora
    - Modal `#calc-category-select-modal`: grid de íconos de categoría
    - Flujo automático: tipo → fecha → banco → calculadora → Enter → categoría → prompt descripción → guardar
17. Prompt de descripción (NUEVO — no estaba en Formulario Ejemplo):
    - Al seleccionar categoría aparece: "¿Deseas agregar una descripción?"
    - Botón "No" enfocado por defecto — Enter registra sin descripción
    - Botón "Sí" → aparece textarea → Enter guarda con descripción
18. `switchTab()` corregido: sustituye referencias a `addIncome`/`addExpense` por `addTransaction`
    (las antiguas eran null y habrían lanzado TypeError)

---

## Deuda técnica pendiente (no urgente)
- **Archivo único ~503KB** — Separar en CSS/JS/HTML independientes para mejor caché y carga.
- **Patrón `window.*`** — El módulo Firebase exporta funciones a `window.*` para el script
  principal. Unificar en un solo módulo ES es la práctica ideal, pero requiere refactorización
  mayor.
