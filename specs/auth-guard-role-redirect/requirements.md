# Requirements - auth-guard-role-redirect

## Objetivo
Asegurar control de acceso en frontend con un guard funcional que valide presencia y expiracion de JWT, y mantener redireccion post-login por rol segun claim roles del token.

## Requisitos funcionales (EARS)
- R1. WHEN se intente navegar a una ruta protegida sin access token THE SYSTEM SHALL redirigir a /login y negar activacion.
- R2. WHEN se intente navegar con token expirado THE SYSTEM SHALL redirigir a /login y negar activacion.
- R3. WHEN se intente navegar con token valido THE SYSTEM SHALL permitir activacion.
- R4. WHEN el guard evalua expiracion THE SYSTEM SHALL decodificar el JWT con atob sin librerias externas.
- R5. WHEN el token sea invalido o no parseable THE SYSTEM SHALL tratarlo como expirado y redirigir a /login.
- R6. WHEN el login sea exitoso THE SYSTEM SHALL redirigir segun rol: admin_ti a /admin, resto permitido (agente_siniestros o empleado) a /chat.
- R7. WHEN el claim roles no exista o no sea reconocible THE SYSTEM SHALL dirigir a /login como fallback seguro.

## Criterios de aceptacion verificables
- A1. Existe prueba unitaria del guard para token faltante con redireccion a /login.
- A2. Existe prueba unitaria del guard para token expirado con redireccion a /login.
- A3. Existe prueba unitaria del guard para token valido permitiendo acceso.
- A4. Existe prueba unitaria del guard para token malformado tratado como expirado.
- A5. Existen pruebas de resolucion de ruta post-login para admin_ti, empleado y agente_siniestros.
- A6. Existe prueba de fallback a /login cuando roles no esta presente o no es valido.
- A7. Rutas protegidas relevantes conservan canActivate con el guard funcional.

## Non-goals
- No implementar permisos finos por conocimiento o permisos granulares.
- No cambiar contrato del backend de claims JWT.
- No introducir librerias JWT externas en frontend.
- No modificar interceptor ni flujo de refresh en esta feature.