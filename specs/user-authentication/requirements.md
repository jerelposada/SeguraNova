# Feature: user-authentication

## Objetivo
Implementar autenticacion JWT end-to-end entre Angular 18 y backend .NET 8 con PostgreSQL, incluyendo login, refresh y logout, sin ASP.NET Core Identity.

## Requisitos funcionales (EARS)

### R1 - Login valido
WHEN un usuario envia credenciales validas a POST /api/auth/login THE SYSTEM SHALL responder 200 con access_token, refresh_token, token_type y expires_in.

### R2 - Login invalido
WHEN un usuario envia credenciales invalidas a POST /api/auth/login THE SYSTEM SHALL responder 401 con mensaje generico sin revelar si el email existe.

### R3 - Claims del access token
WHEN el sistema emite un access token THE SYSTEM SHALL incluir los claims sub, email, roles[] y knowledge_bases[].

### R4 - Vigencia de access token
WHEN el sistema emite un access token THE SYSTEM SHALL establecer expiracion exacta de 60 minutos.

### R5 - Emision de refresh token
WHEN un login es exitoso THE SYSTEM SHALL emitir un refresh token con vigencia de 7 dias y almacenar solo su version hasheada en base de datos.

### R6 - Renovacion por refresh
WHEN el cliente envia un refresh token valido a POST /api/auth/refresh THE SYSTEM SHALL invalidar el refresh token anterior, emitir un nuevo par access/refresh y responder 200.

### R7 - Refresh invalido o expirado
WHEN el cliente envia un refresh token invalido, revocado o expirado THE SYSTEM SHALL responder 401.

### R8 - Logout
WHEN un usuario autenticado invoca POST /api/auth/logout THE SYSTEM SHALL revocar el refresh token activo asociado a la sesion y responder 204.

### R9 - Interceptor en frontend
WHEN Angular realiza una peticion HTTP autenticada THE SYSTEM SHALL adjuntar Authorization: Bearer <access_token> excepto para /api/auth/login y /api/auth/refresh.

### R10 - Recuperacion ante 401
WHEN una peticion autenticada recibe 401 THE SYSTEM SHALL intentar una sola renovacion via refresh y reintentar la peticion original; si falla, cerrar sesion.

### R11 - Persistencia de tokens en frontend
WHEN el frontend recibe tokens validos THE SYSTEM SHALL almacenarlos en localStorage con claves sn_access_token y sn_refresh_token.

### R12 - Redireccion por rol
WHEN el login es exitoso THE SYSTEM SHALL redirigir a /admin si el rol incluye admin_ti y a /chat para agente_siniestros o empleado.

### R13 - Guard de ruta
WHEN un usuario intenta acceder a rutas protegidas sin token o con token expirado THE SYSTEM SHALL redirigir a /login.

### R14 - Configuracion JWT backend
WHEN la API valida JWT entrantes THE SYSTEM SHALL usar ValidateIssuerSigningKey=true, ValidateLifetime=true y ClockSkew=0.

### R15 - Rate limiting de login
WHEN una IP supera 5 intentos de login en 1 minuto THE SYSTEM SHALL bloquear nuevos intentos dentro de esa ventana con respuesta de rate limit.

## Criterios de aceptacion verificables
- R1: Prueba de integracion confirma HTTP 200 y payload con ambos tokens.
- R2: Prueba de integracion confirma HTTP 401 y mensaje generico constante.
- R3: Prueba de unidad decodifica JWT y verifica claims requeridos.
- R4: Prueba de unidad valida exp ~= now + 60 min (tolerancia <= 2 s).
- R5: Prueba de repositorio confirma hash de refresh y TTL de 7 dias.
- R6: Prueba de integracion confirma rotacion de refresh (token anterior inutilizable).
- R7: Prueba de integracion confirma 401 para refresh invalido/expirado.
- R8: Prueba de integracion confirma 204 y refresh revocado.
- R9: Prueba frontend confirma header Authorization en rutas no excluidas.
- R10: Prueba frontend confirma flujo 401 -> refresh -> retry una vez.
- R11: Prueba frontend confirma claves localStorage exactas.
- R12: Prueba frontend confirma redireccion por rol.
- R13: Prueba frontend confirma bloqueo de rutas sin token/expirado.
- R14: Prueba backend de configuracion confirma ClockSkew=0 y validaciones activas.
- R15: Prueba de integracion confirma limite 5/min por IP.

## Non-goals
- Registro de usuarios (sign-up) o recuperacion de contrasena.
- MFA, SSO u OIDC externos.
- Gestion de perfiles avanzada.
- Revocacion global multi-dispositivo fuera del logout actual.
- UI/UX de login avanzada mas alla del flujo funcional.
