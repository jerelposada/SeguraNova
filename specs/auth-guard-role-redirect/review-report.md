# Review Report - auth-guard-role-redirect
**Veredicto:** APROBADO

## Tests
- Comando ejecutado por Reviewer: npx ng test --watch=false --browsers=ChromeHeadless
- Resultado verificado: 32 pasando, 0 fallando (20 + 12)
- Cobertura: no reportada por la configuracion de pruebas actual

## Trazabilidad Requirements -> Tests
- R1 -> should redirect to login when token is missing en src/app/core/auth/auth.guard.spec.ts
- R2 -> should redirect to login when token is expired en src/app/core/auth/auth.guard.spec.ts
- R3 -> should allow access when token is valid en src/app/core/auth/auth.guard.spec.ts
- R4 -> R4: should decode JWT payload with atob when evaluating expiration en src/app/core/auth/auth.guard.spec.ts (spy explicito a window.atob)
- R5 -> should redirect to login when token is malformed en src/app/core/auth/auth.guard.spec.ts
- R6 -> should resolve route by role using access token payload, should resolve chat route for empleado role, should resolve chat route for agente_siniestros role en projects/core/src/lib/services/auth.service.spec.ts
- R7 -> should fallback to login route when token roles are missing y should fallback to login route when token roles are invalid en projects/core/src/lib/services/auth.service.spec.ts
- A7 (guard en rutas protegidas) -> should protect <path> route with authGuard en src/app/app.routes.spec.ts

## Observaciones menores (no bloqueantes)
- Ninguna.
