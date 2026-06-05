# Requirements - authentication-and-authorization-module

## Objetivo
Implementar de forma integral el modulo de autenticacion y autorizacion backend, consolidando dominio, persistencia EF Core, seed inicial, servicio de autenticacion JWT con refresh token, endpoints de AuthController y rate limiting de login.

## Requisitos funcionales (EARS)
- R1. WHEN se modele identidad y acceso THE SYSTEM SHALL definir entidades `User`, `Role`, `UserRole` y `UserKnowledgeBase` con claves Guid.
- R2. WHEN se configure EF Core THE SYSTEM SHALL exponer `ApplicationDbContext` con relaciones e indices para usuarios, roles, knowledge bases y refresh tokens.
- R3. WHEN se inicialice base de datos THE SYSTEM SHALL tener una migracion inicial aplicable en PostgreSQL.
- R4. WHEN se represente conocimiento THE SYSTEM SHALL definir `KnowledgeBase` con valores: `polizas`, `siniestros`, `rrhh`, `legal`, `operaciones`.
- R5. WHEN se levante entorno de desarrollo THE SYSTEM SHALL sembrar un usuario admin con password hasheado via BCrypt.
- R6. WHEN se invoque `LoginAsync` con credenciales validas THE SYSTEM SHALL validar con BCrypt.Verify y emitir access token HS256 (exp 60 min) y refresh token.
- R7. WHEN se invoque `RefreshAsync` con refresh token valido THE SYSTEM SHALL rotar refresh token, mantener expiracion de 7 dias y devolver nuevo par de tokens.
- R8. WHEN se invoque `RevokeAsync` THE SYSTEM SHALL revocar el refresh token activo correspondiente.
- R9. WHEN se genere JWT THE SYSTEM SHALL incluir claims `sub`, `email`, `roles`, `knowledge_bases`.
- R10. WHEN se configure autenticacion THE SYSTEM SHALL obtener clave JWT desde IConfiguration.
- R11. WHEN se llame `POST /api/auth/login` THE SYSTEM SHALL responder 200 en exito o 401 con mensaje generico.
- R12. WHEN se llame `POST /api/auth/refresh` THE SYSTEM SHALL responder 200 en exito o 401 en fallo.
- R13. WHEN se llame `POST /api/auth/logout` autenticado THE SYSTEM SHALL responder 204 tras revocacion.
- R14. WHEN un cliente exceda intentos de login por IP THE SYSTEM SHALL limitar a maximo 5 intentos/minuto con Rate Limiter nativo .NET 8.

## Criterios de aceptacion verificables
- A1. Entidades y PK Guid verificadas por pruebas/mapeo.
- A2. Contexto EF con DbSet, relaciones e indices unicos validado por pruebas.
- A3. Migracion inicial versionada y aplicable sin errores.
- A4. Enum KnowledgeBase exacto verificado.
- A5. Seed de admin existente y password BCrypt verificable.
- A6. Pruebas de IAuthService para login, refresh y revoke en verde.
- A7. Pruebas de claims JWT requeridos en verde.
- A8. Pruebas de endpoints login/refresh/logout en verde (200/401/204 segun caso).
- A9. Prueba de rate limiting de login por IP en verde.

## Non-goals
- No se implementa ASP.NET Core Identity.
- No se agrega MFA/2FA en esta iteracion.
- No se modifica el frontend mas alla de compatibilidad de contrato existente.
- No se implementa autorizacion por permisos finos adicionales.