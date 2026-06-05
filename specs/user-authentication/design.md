# Design: user-authentication

## Resumen tecnico
Se implementara autenticacion basada en JWT de corta duracion (60 min) y refresh token rotativo (7 dias), con hash en BD para mitigar exfiltracion de tokens persistentes.

## Flujo (ASCII)

```text
[Angular Login Form]
        |
        v
POST /api/auth/login (email,password)
        |
        v
[AuthController] -> [IAuthService.LoginAsync]
        |
        v
[BCrypt.Verify + carga usuario/roles/kbs]
        |
   ok?  |---- no ----> 401 (mensaje generico)
        |
       si
        v
[Generar JWT HS256 exp+60m + refresh UUID]
        |
        v
[Persistir hash(refresh), expires_at=+7d]
        |
        v
200 {access_token, refresh_token}
        |
        v
[Angular AuthService guarda en localStorage]
        |
        v
[Peticiones con Interceptor: Authorization Bearer]
        |
 401?   |---- no ----> respuesta normal
        |
       si
        v
POST /api/auth/refresh (refresh_token)
        |
        v
[IAuthService.RefreshAsync -> valida hash+TTL+revocado]
        |
  ok?   |---- no ----> signOut + redirect /login
        |
       si
        v
[Rotar refresh + nuevo access]
        |
        v
Retry request original
```

## Archivos afectados (plan)
| Tipo | Archivo | Accion |
|---|---|---|
| Backend | src/Application/Abstractions/Authentication/IAuthService.cs | Crear/ajustar contrato |
| Backend | src/Application/DTOs/Auth/LoginRequest.cs | Crear |
| Backend | src/Application/DTOs/Auth/AuthTokensResponse.cs | Crear |
| Backend | src/Domain/Entities/User.cs | Crear/ajustar |
| Backend | src/Domain/Entities/Role.cs | Crear/ajustar |
| Backend | src/Domain/Entities/UserRole.cs | Crear/ajustar |
| Backend | src/Domain/Entities/UserKnowledgeBase.cs | Crear/ajustar |
| Backend | src/Domain/Entities/RefreshToken.cs | Crear |
| Backend | src/Infrastructure/Persistence/ApplicationDbContext.cs | Crear/ajustar |
| Backend | src/Infrastructure/Authentication/AuthService.cs | Crear |
| Backend | src/API/Controllers/AuthController.cs | Crear |
| Backend | src/API/Program.cs | Ajustar middleware, auth, authorization, rate limiter |
| Backend | src/API/appsettings.Development.json | Ajustar Jwt:Secret y CORS |
| Frontend | frontend/src/app/core/auth/auth.service.ts | Ajustar login real + storage + refresh + signOut |
| Frontend | frontend/src/app/core/auth/auth.interceptor.ts | Crear interceptor funcional |
| Frontend | frontend/src/app/core/auth/auth.guard.ts | Crear guard funcional |
| Frontend | frontend/src/app/app.routes.ts | Ajustar rutas protegidas y redirecciones |
| Tests | tests/** | Crear pruebas unitarias/integracion/frontend segun tareas |

Nota: la ruta exacta puede variar segun estructura real; el Coder debe mapear al arbol existente manteniendo el contrato.

## Contratos de interfaces (sin implementacion)

### Application
- `Task<AuthTokensResponse> LoginAsync(LoginRequest request, CancellationToken ct)`
- `Task<AuthTokensResponse> RefreshAsync(string refreshToken, CancellationToken ct)`
- `Task RevokeAsync(Guid userId, string? refreshToken, CancellationToken ct)`

### API
- `POST /api/auth/login`
  - Request: `{ email: string, password: string }`
  - Response 200: `{ access_token: string, refresh_token: string, token_type: "Bearer", expires_in: number }`
  - Response 401: `{ message: string }`

- `POST /api/auth/refresh`
  - Request: `{ refresh_token: string }`
  - Response 200: igual a login
  - Response 401: `{ message: string }`

- `POST /api/auth/logout` (requiere bearer)
  - Request: opcional `{ refresh_token?: string }`
  - Response 204 sin body

### Frontend AuthService
- `signIn(email: string, password: string): Observable<void>`
- `refreshToken(): Observable<string>` (devuelve access token nuevo)
- `signOut(): void`
- `getAccessToken(): string | null`

## Dependencias y justificacion
- `BCrypt.Net-Next`: hashing y verificacion de password sin ASP.NET Core Identity.
- `Microsoft.AspNetCore.Authentication.JwtBearer`: validacion de bearer tokens.
- `System.IdentityModel.Tokens.Jwt`: emision de JWT HS256.
- `Npgsql.EntityFrameworkCore.PostgreSQL`: persistencia PostgreSQL.
- `Microsoft.AspNetCore.RateLimiting`: limite de intentos de login por IP.

## Decisiones descartadas
- ASP.NET Core Identity: descartado por requerimiento explicito de simplicidad y control total de entidades.
- Guardar refresh token en texto plano: descartado por riesgo en caso de fuga de BD.
- Tokens de larga duracion sin refresh: descartado por seguridad y UX.
- Libreria externa para decodificar JWT en guard frontend: descartado por requerimiento de usar `atob`.

## Riesgos tecnicos
- Diferencias de reloj entre cliente y servidor: mitigado con ClockSkew=0 y manejo robusto de 401+refresh.
- Condiciones de carrera en refresh concurrente: mitigar serializando refresh en frontend.
- Configuracion insegura de Jwt:Secret: exigir longitud minima y no hardcodear fuera de config de entorno.
