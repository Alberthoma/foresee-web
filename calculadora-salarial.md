# Calculadora de Salario Neto

> **Estado actual (2026-07-06)**: PR #2 (login con Firebase) abierto y sin
> fusionar todavía en https://github.com/Alberthoma/foresee-web/pull/2.
> Pendiente verificar reglas de seguridad de Firestore en la consola de
> Firebase y probar el flujo de login con conexión real. Ver
> `calculadora-salarial-bitacora.md` para el detalle completo de lo hecho
> en cada sesión y lo que queda pendiente.

## Qué es

App web (no oficial, de uso personal) para estimar el **salario neto** a
partir de datos de nómina: tarifa por hora, horas regulares/feriado/overtime,
estado civil tributario y deducciones voluntarias (401(k), seguro médico,
dental, visión, préstamos, otras). No es un procedimiento para uso oficial —
así lo indica el descargo de responsabilidad dentro de la propia app — es
solo una aproximación desde el punto de vista personal.

Es de un único período de pago **quincenal** (26 períodos/año) y proyecta el
resultado a base anual para calcular los impuestos correspondientes.

## Estados soportados

Florida (FL), Texas (TX), Georgia (GA), Indiana (IN), Carolina del Norte (NC),
New York (NY) y California (CA). FL y TX no tienen impuesto estatal; GA, IN y
NC usan tasa plana; NY y CA usan tramos progresivos. California además aplica
SDI (0.13%).

Los datos fiscales (tramos federales, deducciones estándar, FICA) corresponden
al **año fiscal 2026** y están hardcodeados en `calculadora-salarial.js`
(`FEDERAL_TAX_2026`, `FICA_2026`, `STATES`). Actualizarlos requiere editar
esas constantes cuando cambien las tasas oficiales.

## Stack técnico

- HTML + CSS + JS puro (sin frameworks, sin build step).
- **Cuenta e inicio de sesión** (email/contraseña, con recuperación de
  contraseña) vía Firebase Authentication. El historial de cálculos se
  guarda en Firebase Firestore bajo el usuario autenticado
  (`artifacts/calculadora-salarial/users/{uid}/entries`), lo que permite
  usar la app desde el celular y la PC con los mismos datos sincronizados.
  Usa el mismo proyecto de Firebase que la app de gestión financiera
  (`wittfinances-282f1`), pero con su propia colección de datos, aislada.
  La preferencia de tema claro/oscuro se mantiene en `localStorage` (no
  necesita sincronizarse).
- Los módulos de Firebase se cargan con *import dinámico*: si no hay
  conexión, el resto de la app (tema, formulario) sigue respondiendo en vez
  de quedar inerte; solo el login queda deshabilitado con un aviso.
- Diseño responsivo (mobile-first, breakpoints en 800px y 560px).
- PWA instalable: `manifest.json` + `sw.js` (Service Worker) + íconos
  (`icon-192.png`, `icon-512.png`, `apple-touch-icon.png`).

## Archivos de la app

| Archivo | Función |
|---|---|
| `index.html` | Marcado y punto de entrada de la app |
| `calculadora-salarial.css` | Estilos (tema claro/oscuro vía `[data-theme]`) |
| `calculadora-salarial.js` | Lógica de cálculo, persistencia, UI, registro del Service Worker |
| `manifest.json` | Metadatos de instalación PWA (nombre, íconos, colores) |
| `sw.js` | Service Worker: caché de la app shell y funcionamiento offline |
| `icon-192.png`, `icon-512.png` | Íconos para Android/Chrome (manifest) |
| `apple-touch-icon.png` | Ícono para "Añadir a inicio" en iOS |
| `calculadora-salarial-bitacora.md` | Historial detallado de cada sesión de trabajo (qué se hizo, decisiones, pendientes) |

## Cómo correrla

**En PC**: al ser estática, basta con abrir `index.html` en el navegador, o
servirla con cualquier servidor estático desde la raíz del repo, por ejemplo:

```
npx http-server . -p 8080
```

y visitar `http://localhost:8080`.

**Instalar como app (móvil o escritorio)**:
- **Android / Chrome desktop**: al visitar el sitio aparece el banner
  "Instalar app", o desde el menú (⋮) → "Instalar Calculadora de Salario
  Neto...". Queda como ícono en el escritorio/launcher, abre en su propia
  ventana (sin barra de direcciones).
- **iOS / Safari**: botón Compartir → "Añadir a pantalla de inicio".

Una vez instalada, el Service Worker permite abrirla sin conexión (usa la
última versión cacheada de `index.html`, CSS y JS). Para ver/editar cálculos
hace falta conexión e iniciar sesión, ya que el historial vive en Firestore.

## Cuenta y sincronización

Al abrir la app pide iniciar sesión (o crear cuenta) con correo y
contraseña. Un mismo usuario ve el mismo historial de cálculos en cualquier
dispositivo donde inicie sesión (celular, PC, etc.), ya que los datos viven
en Firestore, no en `localStorage` del dispositivo.

**Nota importante sobre seguridad**: las reglas de Firestore (quién puede
leer/escribir qué) se configuran en la consola de Firebase, no en este
repositorio. Verifica ahí que la ruta `artifacts/calculadora-salarial/users/{uid}/**`
solo sea accesible por el usuario dueño de ese `uid`.

## Versionado

El número de versión vive en el footer de `index.html`
(`<span id="app-version">V 000XX</span>`) y en `sw.js`
(`CACHE_VERSION`). **Cada vez que se modifica cualquiera de los archivos de
esta app**, ambos números se incrementan en 1 en el mismo cambio — el de
`sw.js` fuerza la invalidación automática de la caché antigua en los
dispositivos donde ya estaba instalada. Ver `CLAUDE.md` para el flujo de
trabajo completo.
