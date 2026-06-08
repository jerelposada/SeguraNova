# Spec — user-authentication-password-recovery

## Requirements
Agregar el flujo de recuperacion de contrasena con dos etapas: solicitud de recuperacion por email y confirmacion de nueva contrasena por token.
El sistema debe proteger contra enumeracion de usuarios, expiracion de token y reutilizacion del token, manteniendo compatibilidad con el flujo de autenticacion existente.
El frontend debe exponer pantallas de solicitud y reset y consumir endpoints de backend orientados a este flujo.

### Criterios de aceptacion
- WHEN a user submits an email to password recovery THE SYSTEM SHALL return a generic success response regardless of whether the email exists.
- WHEN the email exists THE SYSTEM SHALL generate a unique recovery token with 1-hour expiration and persist it as unused.
- WHEN the token is generated THE SYSTEM SHALL send an email with a reset URL containing the token.
- WHEN a user submits a new password with a valid, unexpired, unused token THE SYSTEM SHALL update the password hash and mark the token as used.
- WHEN a token is invalid, expired, or already used THE SYSTEM SHALL reject password reset and must not update the password.
- WHEN password reset succeeds THE SYSTEM SHALL invalidate token reuse attempts and keep existing login/refresh behavior unchanged.
- R1: Recovery request endpoint responds in constant shape and non-revealing message for both existing and non-existing emails.
- R2: Generated token has explicit expiration of 60 minutes and one-time-use persistence flag.
- R3: Reset endpoint validates token status and applies BCrypt hash update only on valid token.
- R4: Frontend exposes `/forgot-password` and `/reset-password` UX with form validation and success/error states.
- R5: Existing auth unit tests for login/interceptor/guard continue passing.

### Non-goals
- No account lockout/unlock policy changes.
- No MFA or security questions implementation.
- No redesign of global auth architecture beyond password recovery boundaries.
- No changes to role routing logic (`admin_ti`, `agente_siniestros`, `empleado`).

---

## Design
### Flujo
[Login page] --click forgot--> [Forgot Password Form]
      |
      v
POST /api/auth/password-recovery/request {email}
      |
      +--> [email not found] --return generic 200--> [show generic confirmation]
      |
      +--> [email found] --create token(60m, unused)--> [persist token]
                                         |
                                         v
                                [send email reset link]
                                         |
                                         v
                          [User opens /reset-password?token=...]
                                         |
                                         v
POST /api/auth/password-recovery/reset {token,newPassword}
      |
      +--> [invalid/expired/used token] --> [reject 400/401]
      |
      +--> [valid token] --> [hash password + update user + mark token used] --> [success]

### Archivos afectados
| Archivo | Accion |
|---------|--------|
| src/app/app.routes.ts | Modificar |
| src/app/Pages/login/login.component.html | Modificar |
| projects/core/src/lib/services/auth.service.ts | Modificar |
| src/app/Pages/auth/forgot-password/forgot-password.component.ts | Crear |
| src/app/Pages/auth/forgot-password/forgot-password.component.html | Crear |
| src/app/Pages/auth/reset-password/reset-password.component.ts | Crear |
| src/app/Pages/auth/reset-password/reset-password.component.html | Crear |
| src/app/Pages/auth/forgot-password/forgot-password.component.spec.ts | Crear |
| src/app/Pages/auth/reset-password/reset-password.component.spec.ts | Crear |
| projects/core/src/lib/services/auth.service.spec.ts | Modificar |
| src/app/core/auth/auth.interceptor.spec.ts | Verificar sin cambios funcionales |
| src/app/core/auth/auth.guard.spec.ts | Verificar sin cambios funcionales |
| backend/Application/Authentication/IPasswordRecoveryService.cs | Crear (si backend esta en repo objetivo) |
| backend/Application/Authentication/PasswordRecoveryDtos.cs | Crear (si backend esta en repo objetivo) |
| backend/Domain/Entities/PasswordRecoveryToken.cs | Crear (si backend esta en repo objetivo) |
| backend/Infrastructure/Services/PasswordRecoveryService.cs | Crear (si backend esta en repo objetivo) |
| backend/Infrastructure/Services/EmailSenderService.cs | Modificar o Crear (si backend esta en repo objetivo) |
| backend/Api/Controllers/AuthController.cs | Modificar (si backend esta en repo objetivo) |
| backend/tests/Auth/PasswordRecoveryTests.cs | Crear (si backend esta en repo objetivo) |

### Contratos de interfaces
Frontend (core auth client):
- `requestPasswordRecovery(email: string): Observable<void>`
- `resetPassword(token: string, newPassword: string): Observable<void>`

Backend application:
- `Task RequestPasswordRecoveryAsync(string email, CancellationToken cancellationToken = default)`
- `Task ResetPasswordAsync(string token, string newPassword, CancellationToken cancellationToken = default)`

Backend HTTP endpoints:
- `POST /api/auth/password-recovery/request`
  - Request: `{ email: string }`
  - Response 200: `{ message: string }` (mensaje generico)
- `POST /api/auth/password-recovery/reset`
  - Request: `{ token: string, new_password: string }`
  - Response 204 on success
  - Response 400/401 on invalid token conditions

Token persistence contract:
- `PasswordRecoveryToken { Id, UserId, TokenHash, ExpiresAtUtc, UsedAtUtc, CreatedAtUtc }`

### Decisiones tecnicas
- Usar token aleatorio de alta entropia y persistir solo hash del token: reduce impacto de fuga de base de datos.
- Respuesta generica en endpoint de solicitud: evita enumeracion de cuentas por email.
- Expiracion fija de 60 minutos y marca de un solo uso (`UsedAtUtc`): cumple requisito funcional y seguridad minima.
- Reutilizar `AuthService` frontend para centralizar consumo de `/api/auth/*` y mantener compatibilidad con interceptor.
- Mantener endpoint bajo `AuthController` para coherencia con login/refresh/logout existentes.
- Se descarta emitir JWT en reset exitoso: reduce superficie de riesgo y mantiene flujo explicito de login posterior.

---

## Tasks
### Reglas para el coder
- TDD estricto: RED -> GREEN -> REFACTOR
- Funciones <= 20 lineas, 1 responsabilidad, <= 3 parametros
- Nombres que revelan intencion
- Sin auto-aprobacion

### Lista
Progreso: 10/10

- [x] T1: test - `AuthService` frontend: request de recuperacion envia payload esperado y maneja respuesta generica (R1)
- [x] T2: implementar - `AuthService.requestPasswordRecovery` minimo para pasar T1
- [x] T3: test - `AuthService` frontend: reset envia token + nueva contrasena y propaga error de token invalido (R4)
- [x] T4: implementar - `AuthService.resetPassword` minimo para pasar T3
- [x] T5: test - routing/UI: existe `/forgot-password` y `/reset-password`, link de login navega correctamente (R4)
- [x] T6: implementar - componentes y rutas de forgot/reset con validaciones minimas
- [x] T7: test - backend: solicitud genera token con expiracion de 1 hora y respuesta no reveladora (R1, R2)
- [x] T8: implementar - servicio de recuperacion + persistencia de token hasheado + envio de email
- [x] T9: test - backend: reset valida token, actualiza hash, marca token usado y bloquea reutilizacion (R3)
- [x] T10: implementar/refactor - endpoint reset final y limpieza de codigo sin cambiar comportamiento

---
## Review Report
**Fecha:** 2026-06-08
**Veredicto:** APROBADO

**Tests:** 46 pasando / 0 fallando
**Trazabilidad:** Criterios R1-R5 cubiertos por pruebas de API, Application, Repository y frontend.

**Observaciones bloqueantes:**
- Ninguna.

**Lo que esta bien:**
- Flujo completo implementado en backend y frontend.
- Tokens de recuperacion con expiracion de 1 hora y un solo uso.
- Respuesta no reveladora en la solicitud de recuperacion.
