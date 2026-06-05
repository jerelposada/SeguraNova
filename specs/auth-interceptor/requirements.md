# Requirements - auth-interceptor

## Objetivo
Implementar y asegurar un `HttpInterceptor` funcional en Angular 18 usando `withInterceptors` que adjunte token bearer en requests protegidos, excluya endpoints de autenticacion y gestione renovacion de token ante respuestas `401`.

## Requisitos funcionales (EARS)
- R1. WHEN se envie un request HTTP a un endpoint distinto de login y refresh THE SYSTEM SHALL adjuntar el header `Authorization: Bearer <access_token>` si existe access token.
- R2. WHEN el request sea a `/api/auth/login` o `/api/auth/refresh` THE SYSTEM SHALL NO adjuntar header `Authorization`.
- R3. WHEN un request protegido retorne `401` THE SYSTEM SHALL invocar `refreshToken()` y reintentar el request original con el nuevo access token.
- R4. WHEN el flujo de refresh falle THE SYSTEM SHALL invocar `signOut()` y propagar el error.
- R5. WHEN multiples requests reciban `401` concurrentemente THE SYSTEM SHALL compartir una sola llamada de refresh en vuelo para evitar duplicados.
- R6. WHEN un request ya fue reintentado por refresh THE SYSTEM SHALL no entrar en ciclo infinito de reintentos.
- R7. WHEN se inicie la app THE SYSTEM SHALL registrar el interceptor con `provideHttpClient(withInterceptors([...]))`.

## Criterios de aceptacion verificables
- A1. Existe prueba que valida header bearer en endpoint no auth.
- A2. Existe prueba que valida ausencia de header en login y refresh.
- A3. Existe prueba que valida flujo `401 -> refresh -> retry`.
- A4. Existe prueba que valida `signOut()` cuando refresh falla.
- A5. Existe prueba que valida coalescencia de refresh concurrente (una sola invocacion de `refreshToken()`).
- A6. Existe prueba que valida no loop infinito en request ya reintentado.
- A7. Existe validacion de wiring en configuracion de aplicacion con `withInterceptors`.

## Non-goals
- No cambiar politicas de expiracion JWT del backend.
- No mover almacenamiento de tokens fuera de `AuthService`.
- No rediseñar guard de rutas (feature separada).
- No introducir interceptores de logging/retry general ajenos a auth.