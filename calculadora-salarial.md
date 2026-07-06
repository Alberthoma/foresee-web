# Calculadora de Salario Neto

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
- Persistencia en `localStorage` del navegador (historial de cálculos y
  preferencia de tema claro/oscuro) — los datos no salen del dispositivo.
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
última versión cacheada de `index.html`, CSS y JS).

## Versionado

El número de versión vive en el footer de `index.html`
(`<span id="app-version">V 000XX</span>`) y en `sw.js`
(`CACHE_VERSION`). **Cada vez que se modifica cualquiera de los archivos de
esta app**, ambos números se incrementan en 1 en el mismo cambio — el de
`sw.js` fuerza la invalidación automática de la caché antigua en los
dispositivos donde ya estaba instalada. Ver `CLAUDE.md` para el flujo de
trabajo completo.
