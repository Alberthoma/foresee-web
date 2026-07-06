# Reglas de trabajo en este repositorio

## Flujo obligatorio para cambios de código

Antes de generar código nuevo o modificar un archivo existente:

1. Mostrar un **Plan de ejecución** explícito: qué archivos se van a crear o
   tocar y qué hará cada cambio.
2. Si hay una idea o instrucción del usuario que se pueda mejorar, **aportar
   la sugerencia** en ese mismo plan (con el trade-off), sin descartar la
   idea original.
3. **Esperar aprobación explícita del usuario** sobre el plan (y sus
   sugerencias) antes de ejecutar cualquier creación o modificación de
   código.

Esto aplica a todo el repositorio, no solo a `calculadora-salarial`.

## Versionado de `calculadora-salarial`

La app `calculadora-salarial` (`index.html`, `calculadora-salarial.css`,
`calculadora-salarial.js`, `sw.js`) tiene un número de versión visible en el
footer (`#app-version`, formato `V 000XX`). **Cada cambio a alguno de esos
archivos debe incrementar ese número en 1**, y actualizar en el mismo commit
la constante `CACHE_VERSION` de `sw.js` al mismo valor (esto invalida la
caché del Service Worker en los dispositivos que ya tengan la app
instalada). Ver `calculadora-salarial.md` para el detalle de la app.
