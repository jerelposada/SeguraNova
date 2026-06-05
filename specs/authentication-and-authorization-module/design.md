# Design - authentication-and-authorization-module

## Resumen tecnico
El modulo se compone de tres capas: dominio (entidades y enum), infraestructura EF Core (DbContext, migraciones, seed) y aplicacion/API (IAuthService/AuthService + AuthController + JWT + rate limiting).

## Diagrama de flujo (ASCII)

Login flow

+---------+      +----------------+      +-----------------------+
| Client  | ---> | AuthController | ---> | IAuthService.LoginAsync|
+----+----+      +--------+-------+      +-----------+-----------+
     |                    |                          |
     |                    |                 BCrypt.Verify + DB
     |                    |                          |
     |                    |                generate JWT + refresh
     |                    |                          |
     |<-------------------+--------------------------+

Refresh flow

Client -> POST /api/auth/refresh -> RefreshAsync
  -> validate hash/expiry -> revoke previous -> issue new pair -> 200/401

Logout flow

Client (Bearer) -> POST /api/auth/logout -> RevokeAsync -> 204

Rate limiting

POST /api/auth/login -> policy login (FixedWindow/IP, 5 req/min)

## Archivos afectados
| Archivo | Tipo | Motivo |
|---|---|---|
| SeguroNova.Api/src/Domain/Entities/User.cs | Modificar/confirmar | Dominio User Guid |
| SeguroNova.Api/src/Domain/Entities/Role.cs | Modificar/confirmar | Dominio Role Guid |
| SeguroNova.Api/src/Domain/Entities/UserRole.cs | Modificar/confirmar | Join user-role |
| SeguroNova.Api/src/Domain/Entities/UserKnowledgeBase.cs | Modificar/confirmar | Join user-knowledgebase |
| SeguroNova.Api/src/Domain/Enums/KnowledgeBase.cs | Crear/modificar | Enum requerido |
| SeguroNova.Api/src/Repository/Persistence/ApplicationDbContext.cs | Modificar | Mapeo, constraints, seed |
| SeguroNova.Api/src/Repository/Persistence/Migrations/* | Crear/modificar | Migracion inicial |
| SeguroNova.Api/src/Application/Abstractions/Authentication/IAuthService.cs | Verificar | Contrato Login/Refresh/Revoke |
| SeguroNova.Api/src/Repository/Authentication/AuthService.cs | Modificar/confirmar | BCrypt + JWT + refresh hash TTL |
| SeguroNova.Api/src/API/Controllers/AuthController.cs | Modificar/confirmar | Endpoints login/refresh/logout |
| SeguroNova.Api/src/API/Program.cs | Modificar/confirmar | JWT auth + rate limiter + DI |
| SeguroNova.Api/tests/**/* | Modificar/agregar | Cobertura de servicio, controller, EF, rate limit |

## Contratos de interfaces (sin implementacion)
- `Task<AuthTokensResponse?> LoginAsync(LoginRequest request, CancellationToken ct)`
- `Task<AuthTokensResponse?> RefreshAsync(RefreshRequest request, CancellationToken ct)`
- `Task<bool> RevokeAsync(Guid userId, string refreshToken, CancellationToken ct)`

Response esperado:
- `AuthTokensResponse { access_token, refresh_token, token_type, expires_in }`

## Dependencias y justificacion
- EF Core + Npgsql para persistencia PostgreSQL.
- BCrypt.Net-Next para hashing de credenciales y refresh tokens.
- JwtBearer + HMAC SHA256 para autenticacion stateless.
- RateLimiter .NET 8 para proteccion de brute force en login.

## Decisiones descartadas
- ASP.NET Core Identity: descartado por requerimiento explicito.
- Refresh token en texto plano en DB: descartado por seguridad.
- Claims custom no requeridos: descartado para mantener contrato estable con frontend.