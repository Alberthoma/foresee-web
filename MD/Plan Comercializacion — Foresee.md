# Plan de Comercialización — Foresee

Actualizado: 2026-05-25

---

## Fase 1 — App lista para usuarios ✅ COMPLETA

| # | Tarea | Estado |
|---|-------|--------|
| 1 | Recuperación de contraseña | ✅ |
| 2 | Eliminar cuenta y todos los datos (CCPA/GDPR) | ✅ |
| 3 | Selección de moneda | ✅ |
| 4 | Tutorial de videos (7 videos, modal dentro de la app) | ✅ |
| 5 | Onboarding 3 pasos para usuario nuevo | ✅ |
| 6 | Datos de demo | ✅ |

---

## Fase 2 — Mejoras de producto ⬜ PRÓXIMA

| # | Tarea | Valor |
|---|-------|-------|
| 7 | Exportar CSV | Datos propios portables — muy solicitado |
| 8 | Modo oscuro / claro toggle | Alta percepción de calidad |
| 9 | Notificaciones / recordatorios de gastos | Retención |
| 10 | Reportes avanzados | Diferenciador vs apps básicas |

---

## Fase 3 — Monetización ⬜ PENDIENTE

| # | Tarea |
|---|-------|
| 11 | Lógica freemium en el código (límites plan gratis) |
| 12 | Pantalla de upgrade dentro de la app |
| 13 | Stripe + Firebase Cloud Functions |
| 14 | Textos legales (Privacy Policy, ToS, Refund Policy) |

---

## Fase 4 — Lanzamiento ⬜ PENDIENTE

| # | Tarea |
|---|-------|
| 15 | Dominio propio (`foreseefinances.com`) |
| 16 | Landing page con demo visual y precio |
| 17 | PWA — instalar como app nativa en móvil |
| 18 | Email de soporte visible |

---

## Notas

- **Videos**: actualmente en Cloudinary. Migrar a YouTube (gratis, sin límite de ancho de banda) cuando escale.
- **Firebase API Key**: si hay errores 403, revertir restricción de aplicación a "Ninguno".
- **Orden de fases**: producto sólido → monetización → lanzamiento. La Fase 3 depende de la 2 (el usuario percibe valor antes de ver el precio). La Fase 4 depende de la 3 (no lanzar sin poder cobrar).
