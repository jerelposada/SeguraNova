# Design - auth-service-frontend

## Resumen tecnico
La feature se concentra en el servicio de autenticacion del frontend Angular para consumir endpoints reales y administrar tokens de forma consistente para login, logout y refresh.

## Diagrama de flujo (ASCII)

+----------------+        +--------------------+        +-------------------+
| LoginComponent | -----> | AuthService.signIn | -----> | POST /api/auth/login |
+----------------+        +--------------------+        +-------------------+
                                   |                              |
                                   | 200 tokens                   |
                                   v                              v
                           +-------------------+         +-------------------+
                           | localStorage      |         | access/refresh    |
                           | sn_access_token   |         | token payload     |
                           | sn_refresh_token  |         +-------------------+
                           +-------------------+
                                   |
                                   v
                          +---------------------+
                          | resolvePostLogin... |
                          +---------------------+

Error 401 en requests protegidos:
Interceptor -> AuthService.refreshToken -> POST /api/auth/refresh -> storeTokens -> retry
si refresh falla -> signOut

## Archivos afectados
| Archivo | Tipo de cambio | Motivo |
|---|---|---|
| `SeguraNova.Spa/projects/core/src/lib/services/auth.service.ts` | Modificar o confirmar | Contrato principal de `signIn`, `refreshToken`, `signOut`, persistencia de tokens |
| `SeguraNova.Spa/projects/core/src/lib/services/auth.service.spec.ts` | Modificar/crear pruebas | Cobertura de login real, persistencia y refresh |
| `SeguraNova.Spa/src/app/Pages/login/login.component.ts` | Verificar compatibilidad | Asegurar que contrato de `signIn()` no rompe consumo |
| `SeguraNova.Spa/src/app/core/auth/auth.interceptor.ts` | Verificar contrato | Asegurar que `refreshToken()` sigue retornando access token para retry |

## Contratos de interfaces (sin implementacion)
- `AuthService.signIn(email: string, password: string): Observable<void>`
- `AuthService.refreshToken(): Observable<string>`
- `AuthService.signOut(): void`
- `AuthService.getAccessToken(): string | null`
- `AuthService.getRefreshToken(): string | null`

Request/Response esperados:
- `POST /api/auth/login`
  - request: `{ email: string, password: string }`
  - response: `{ access_token: string, refresh_token: string, token_type: string, expires_in: number }`
- `POST /api/auth/refresh`
  - request: `{ refresh_token: string }`
  - response: `{ access_token: string, refresh_token: string, token_type: string, expires_in: number }`

## Dependencias y justificacion
- `@angular/common/http` para consumo HTTP tipado.
- `rxjs` (`tap`, `map`) para transformar side effects y mantener API limpia.
- `localStorage` para persistencia simple requerida por especificacion.
- Sin dependencias externas nuevas: se mantiene superficie tecnica minima.

## Decisiones descartadas
- Guardar tokens en `sessionStorage`: descartado porque requisito explicita `localStorage`.
- Cambiar retorno de `signIn()` a `Observable<LoginResponse>`: descartado para no romper `LoginComponent` ni exponer detalles innecesarios.
- Introducir libreria de storage segura: descartado en esta feature para acotar alcance y cumplir objetivo actual.