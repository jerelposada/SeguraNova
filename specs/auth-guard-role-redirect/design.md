# Design - auth-guard-role-redirect

## Resumen tecnico
Se mantiene un guard funcional de Angular para controlar acceso por estado de token y expiracion. La redireccion por rol post-login permanece en AuthService, que decodifica claims usando atob y normaliza formatos de roles.

## Diagrama de flujo (ASCII)

Navegacion a ruta protegida

+------------------+
| authGuard()      |
+--------+---------+
         |
         v
  getAccessToken()
         |
   +-----+------+
   | token null?|
   +--+------+-+
      |yes   |no
      v      v
 navigate   decode payload (atob)
 /login          |
 deny            v
            exp valido?
             +--+--+
             |no |si
             v   v
          navigate allow
          /login
           deny

Post-login routing

+--------------------------+
| resolvePostLoginRoute()  |
+------------+-------------+
             |
             v
       decode roles claim
             |
    +--------+---------+
    | admin_ti present?|
    +----+---------+---+
         |yes      |no
         v         v
       /admin   empleado/agente?
                  +----+----+
                  |yes | no |
                  v    v
                 /chat /login

## Archivos afectados
| Archivo | Tipo | Motivo |
|---|---|---|
| SeguraNova.Spa/src/app/core/auth/auth.guard.ts | Modificar/confirmar | Validacion de token y expiracion con atob |
| SeguraNova.Spa/src/app/core/auth/auth.guard.spec.ts | Modificar/expandir | Cobertura de token invalido/malformado |
| SeguraNova.Spa/projects/core/src/lib/services/auth.service.spec.ts | Modificar/expandir | Cobertura de role redirect y fallback |
| SeguraNova.Spa/src/app/app.routes.ts | Verificar | Presencia de canActivate en rutas protegidas |

## Contratos de interfaces (sin implementacion)
- authGuard: CanActivateFn
- AuthService.getAccessToken(): string | null
- AuthService.resolvePostLoginRoute(): string

Reglas de negocio de redireccion:
- admin_ti -> /admin
- agente_siniestros -> /chat
- empleado -> /chat
- fallback seguro -> /login

## Dependencias y justificacion
- @angular/router para canActivate y redireccion.
- AuthService como fuente de token y logica de roles.
- atob nativo para parseo de JWT payload sin dependencias adicionales.

## Decisiones descartadas
- Usar libreria jwt-decode: descartado por requisito explicito de atob sin libreria.
- Duplicar logica de roles dentro del guard: descartado para evitar inconsistencias; se centraliza en AuthService.
- Permitir acceso con token malformado: descartado por seguridad defensiva.