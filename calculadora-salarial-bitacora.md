# Bitácora de sesiones — Calculadora de Salario Neto

Historial cronológico de trabajo sobre esta app. Cada sesión nueva debería
leer este archivo (y `calculadora-salarial.md`) para entrar en contexto
rápido: qué se hizo, qué decisiones se tomaron y qué queda pendiente.

---

## Sesión 2026-07-06

### Contexto de partida

El repositorio `foresee-web` contenía dos proyectos sin relación entre sí:
una app de gestión financiera (con su propio sitio, cuenta de Firebase,
informes, etc.) y los 3 archivos sueltos de `calculadora-salarial`
(`.html`, `.css`, `.js`) en la raíz. El usuario aclaró explícitamente que
**calculadora-salarial es un proyecto aparte, sin relación con "Foresee"**,
y pidió separar limpiamente ambos dentro del mismo repo.

### 1. Separación de proyectos

- Se movió **todo** lo que no es de calculadora-salarial (el sitio de
  finanzas, `Backup/`, `Informes/`, `Json/`, `MD/`, `bat usados/`,
  `.gitignore`, `.nojekyll`, el `.bat`, `index.html`, `manifest.json`,
  `numberParser.js`, `sw.js` originales) a la carpeta **`backup Foresee/`**
  en la raíz del repo.
- Se preguntó al usuario si quería renombrar esa carpeta (para no llevar la
  palabra "foresee"); **decidió dejar el nombre `backup Foresee` tal cual
  está** — no se debe volver a tocar ese punto salvo que lo pida de nuevo.
- Estos archivos **no tienen relación con calculadora-salarial** y no deben
  modificarse ni consultarse al trabajar en esta app (salvo que el usuario
  lo pida explícitamente).

### 2. Calculadora-salarial convertida en PWA instalable

- `calculadora-salarial.html` → renombrado a **`index.html`** (queda como
  punto de entrada del repo; `calculadora-salarial.css`/`.js` mantienen su
  nombre para que quede claro a qué app pertenecen si en el futuro se agrega
  otro proyecto al repo).
- Se agregó `manifest.json` propio (no confundir con el de la app de
  finanzas, que quedó en `backup Foresee/`).
- Se generaron íconos `icon-192.png`, `icon-512.png` y
  `apple-touch-icon.png` (rasterizados con Chromium headless vía
  Playwright, ya que el entorno de desarrollo no tenía ImageMagick/PIL
  disponibles).
- Se agregó `sw.js` (Service Worker) con caché de la app shell versionada,
  para que funcione offline una vez instalada.
- Se creó `CLAUDE.md` con las reglas de trabajo pedidas por el usuario:
  mostrar plan de ejecución + sugerencias y esperar aprobación explícita
  antes de tocar código, y la regla de subir el número de versión (footer +
  `CACHE_VERSION` de `sw.js`) en cada cambio a esta app.
- Se creó `calculadora-salarial.md` (documento de conocimiento de la app).
- Versión subida a `V 00006`.
- **PR #1** (`Reorganizar repo: calculadora-salarial como PWA propia`):
  verificado localmente con Chromium headless (sin errores de consola,
  Service Worker activo, cálculo funcional), fusionado a `main` por
  petición del usuario. Sitio publicado en GitHub Pages:
  **https://alberthoma.github.io/foresee-web/** (no hay `CNAME`, así que es
  la URL por defecto `usuario.github.io/repo`).

### 3. Login y sincronización entre dispositivos (Firebase)

El usuario preguntó si podía reutilizar la cuenta/base de datos de Firebase
que ya usaba la app de finanzas (`wittfinances-282f1`) para que
calculadora-salarial también guarde datos en la nube, en vez de solo
`localStorage` (que no sincroniza entre celular y PC). Se confirmó que sí
es posible (un proyecto Firebase no está atado a una sola app), y se
implementó:

- **Firebase Authentication** (email/contraseña) con **registro de
  cuenta** y **recuperación de contraseña** (`sendPasswordResetEmail`),
  igual que en la app de finanzas.
- **Firestore** como almacenamiento del historial de cálculos, en una
  colección **propia y aislada**: `artifacts/calculadora-salarial/users/{uid}/entries`
  (mismo proyecto Firebase que la app de finanzas, pero sin mezclar datos).
  Como es el mismo proyecto, cualquier cuenta ya creada en la app de
  finanzas funciona igual aquí (mismo pool de usuarios de Firebase Auth).
- Se reemplazó por completo la persistencia de entradas en `localStorage`
  (la preferencia de tema claro/oscuro sí se queda en `localStorage`, no
  necesita sincronizarse).
- **Pantalla de login/registro** con estilo propio: tarjeta centrada,
  sobria, reutilizando la paleta de color existente, con soporte
  claro/oscuro. Botón "Cerrar sesión" en el header con el email del
  usuario visible.
- **Bug encontrado y corregido durante la implementación**: los imports de
  Firebase estaban como `import` estático de módulos remotos; si el CDN de
  Firebase no cargaba (sin conexión), **toda la app quedaba inerte** (ni el
  botón de tema respondía), justo lo contrario del objetivo del Service
  Worker offline. Se corrigió usando *import dinámico* (`await import(...)`)
  dentro de una función `initFirebase()` con try/catch: si falla, el resto
  de la UI (tema, formulario) sigue funcionando y se muestra un aviso de
  error en el login en vez de romper la app. Verificado en este entorno de
  desarrollo (donde el CDN de Firebase está bloqueado por la red del
  sandbox) que efectivamente el resto de la app sigue respondiendo.
- Versión subida a `V 00007`.
- Como el PR #1 ya estaba fusionado, se reinició la rama de trabajo desde
  `main` antes de subir estos cambios (siguiendo las reglas de git del
  repo para ramas ya fusionadas).
- **PR #2** (`Agregar login con Firebase a calculadora-salarial`):
  abierto en https://github.com/Alberthoma/foresee-web/pull/2, **sin
  fusionar todavía**. Sesión suscrita a su actividad (comentarios/CI), con
  chequeo de seguimiento automático cada ~1 hora mientras siga abierto.

### Pendientes / puntos abiertos

1. **Fusionar el PR #2** (o revisarlo primero) — sigue abierto en `main`
   hasta que el usuario decida.
2. **Reglas de seguridad de Firestore**: hay que verificar/configurar en la
   consola de Firebase (no en este repo, no existe `firestore.rules`
   versionado) que la ruta `artifacts/calculadora-salarial/users/{uid}/**`
   solo sea accesible por el propio usuario dueño de ese `uid`. Si la regla
   existente ya es genérica por `appId`, probablemente no hace falta
   tocar nada — pero no se pudo confirmar desde este entorno.
3. **Prueba real de login/registro/reset de contraseña con internet real**:
   en este sandbox de desarrollo el CDN de Firebase (`gstatic.com`) está
   bloqueado por la red, así que el flujo de autenticación en sí
   (crear cuenta, iniciar sesión, recibir el correo de recuperación) solo
   se validó por revisión de código y por el comportamiento de
   degradación cuando falla la carga — falta probarlo en un dispositivo
   real con conexión.
4. **Datos previos en `localStorage`**: si el usuario ya tenía cálculos
   guardados con la versión anterior (antes del login), esos quedan en el
   `localStorage` del navegador pero **la app ya no los lee** (ahora todo
   viene de Firestore). No se migraron automáticamente; si se necesitan,
   habría que exportarlos manualmente antes de que se pierda ese dato del
   navegador.

### Cosas ya resueltas — no repreguntar

- El nombre de la carpeta `backup Foresee/` se queda como está (decisión
  explícita del usuario).
- La app usa el mismo proyecto Firebase que la app de finanzas, con
  colección de datos separada — esto ya fue decidido y confirmado, no es
  necesario volver a preguntar por esta arquitectura.
- El flujo de trabajo de este repo (plan + sugerencias + aprobación antes
  de tocar código, versionado en cada cambio) está documentado en
  `CLAUDE.md` y se carga automáticamente en cada sesión.
