# Requirements - auth-service-frontend

## Objetivo
Reemplazar cualquier simulacion de autenticacion en frontend por integracion real contra `POST /api/auth/login`, persistiendo tokens en localStorage y exponiendo operaciones de cierre de sesion y refresh para el resto del flujo de autenticacion.

## Requisitos funcionales (EARS)
- R1. WHEN el usuario envia credenciales validas desde login THE SYSTEM SHALL invocar `POST /api/auth/login` con body `{ email, password }`.
- R2. WHEN `POST /api/auth/login` responde `200` con `access_token` y `refresh_token` THE SYSTEM SHALL guardar los tokens en localStorage usando exactamente las keys `sn_access_token` y `sn_refresh_token`.
- R3. WHEN el login es exitoso THE SYSTEM SHALL completar `signIn()` sin exponer detalles del payload al componente consumidor.
- R4. WHEN se invoca `signOut()` THE SYSTEM SHALL eliminar `sn_access_token` y `sn_refresh_token` de localStorage y redirigir a `/login`.
- R5. WHEN se invoca `refreshToken()` y existe `sn_refresh_token` THE SYSTEM SHALL invocar `POST /api/auth/refresh` con body `{ refresh_token }`.
- R6. WHEN `POST /api/auth/refresh` responde `200` con nuevos tokens THE SYSTEM SHALL reemplazar tokens en localStorage y retornar el nuevo access token al llamador.
- R7. WHEN se invoca `refreshToken()` sin refresh token persistido THE SYSTEM SHALL fallar de forma controlada para que el flujo de interceptor pueda cerrar sesion.

## Criterios de aceptacion verificables
- A1. Existe prueba unitaria que valida que `signIn()` realiza request a `/api/auth/login` con metodo `POST` y body correcto.
- A2. Existe prueba unitaria que valida persistencia en `sn_access_token` y `sn_refresh_token` tras login exitoso.
- A3. Existe prueba unitaria que valida limpieza de ambas keys al ejecutar `signOut()`.
- A4. Existe prueba unitaria que valida request de refresh a `/api/auth/refresh` con `refresh_token`.
- A5. Existe prueba unitaria que valida retorno del nuevo access token desde `refreshToken()`.
- A6. Existe prueba unitaria que valida comportamiento de error al llamar `refreshToken()` sin token de refresh.
- A7. `LoginComponent` sigue compilando y consumiendo `AuthService.signIn()` sin cambios de contrato de tipo.

## Non-goals
- No se modifica la politica de expiracion de JWT ni TTL de refresh (backend).
- No se implementa guard ni interceptor nuevos en esta feature.
- No se cambia estrategia de almacenamiento a cookies/httpOnly.
- No se redefinen rutas de redireccion por rol (eso pertenece a otra feature).