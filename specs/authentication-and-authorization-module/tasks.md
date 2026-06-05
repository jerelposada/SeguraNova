# Tasks - authentication-and-authorization-module

## Reglas para el Coder
- TDD estricto por bloque: test -> implementacion -> refactor.
- Funciones nuevas o modificadas <= 20 lineas cuando sea viable.
- Mantener compatibilidad con contrato frontend existente.
- No introducir ASP.NET Core Identity.

## Tareas atomicas (test/implementacion/refactor)
- [x] T1-a (test): validar entidades User/Role/UserRole/UserKnowledgeBase con Guid y navegaciones.
- [x] T1-b (implement): ajustar entidades del dominio para cumplir modelo.
- [x] T1-c (refactor): limpieza de nullability y convenciones.

- [x] T2-a (test): validar ApplicationDbContext, DbSet y relaciones/indices unicos.
- [x] T2-b (implement): configurar Fluent API para joins y constraints.
- [x] T2-c (refactor): separar configuracion por entidad si mejora claridad.

- [x] T3-a (test): validar enum KnowledgeBase con 5 valores exactos.
- [x] T3-b (implement): crear/ajustar enum y mapeo persistente.
- [x] T3-c (refactor): unificar conversion enum-string/int segun convencion del repo.

- [x] T4-a (test): validar seed admin (usuario + rol admin_ti + relacion) y hash BCrypt verificable.
- [x] T4-b (implement): agregar seed idempotente en infraestructura.
- [x] T4-c (refactor): encapsular valores de seed y evitar duplicidad.

- [x] T5-a (test): validar migracion inicial aplicable sobre PostgreSQL de pruebas.
- [x] T5-b (implement): generar/versionar migracion inicial.
- [x] T5-c (refactor): revisar nombres de tablas/constraints.

- [x] T6-a (test): cubrir LoginAsync exito/fallo y claims requeridos.
- [x] T6-b (implement): ajustar AuthService login con BCrypt.Verify y JWT HS256.
- [x] T6-c (refactor): extraer helpers de claims/token.

- [x] T7-a (test): cubrir RefreshAsync (rotacion, expiracion 7 dias, hash storage).
- [x] T7-b (implement): ajustar refresh token lifecycle.
- [x] T7-c (refactor): mejorar eficiencia de busqueda/validacion de tokens.

- [x] T8-a (test): cubrir RevokeAsync y revocacion efectiva.
- [x] T8-b (implement): asegurar revocacion por usuario+token.
- [x] T8-c (refactor): clarificar semantica booleana del resultado.

- [x] T9-a (test): cubrir AuthController login/refresh/logout (200/401/204).
- [x] T9-b (implement): ajustar endpoints y mensajes genericos.
- [x] T9-c (refactor): consolidar responses y manejo de errores.

- [x] T10-a (test): cubrir rate limiting de login por IP (5/min).
- [x] T10-b (implement): configurar policy login en Program y atributo en endpoint.
- [x] T10-c (refactor): centralizar nombres de politicas/config keys.

- [x] T11-a (test): alinear contrato IAuthService con design actual (nullable + RefreshRequest) y validar por pruebas.
- [x] T11-b (test/implement): agregar pruebas de comportamiento explicitas de AuthService para login/refresh/revoke (exito/fallo clave) y ajustar implementacion.
- [x] T11-c (test): validar aplicabilidad de migracion inicial orientada a PostgreSQL mediante SQL de migraciones del proveedor Npgsql.

## Criterio de done
- Tests backend auth y persistencia en verde.
- Migracion inicial generada y aplicable.
- Seed admin con BCrypt verificado.
- Endpoints y rate limiting validados.
- Reviewer aprueba contra requirements/design/tasks.