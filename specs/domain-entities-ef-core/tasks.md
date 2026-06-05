# Tasks - domain-entities-ef-core

## Reglas para el Coder
- TDD por tarea: rojo -> verde -> refactor.
- Mantener funciones/metodos acotados y nombres expresivos.
- No introducir ASP.NET Core Identity.
- Respetar Guid como PK en las entidades del alcance.

## Tareas atomicas (test/implementacion/refactor)
- T1-a (test): crear pruebas de dominio para validar PK Guid en `User`, `Role`, `UserRole`, `UserKnowledgeBase`.
- T1-b (implement): ajustar entidades para cumplir PK Guid y navegaciones.
- T1-c (refactor): limpiar propiedades redundantes y nullability.

- T2-a (test): crear prueba de `ApplicationDbContext` con DbSet y mappings basicos.
- T2-b (implement): registrar DbSet y configurar relaciones en Fluent API.
- T2-c (refactor): extraer configuraciones por entidad si mejora claridad.

- T3-a (test): validar indices unicos `(UserId,RoleId)` y `(UserId,KnowledgeBase)`.
- T3-b (implement): crear constraints/indices unicos en mapeo EF.
- T3-c (refactor): centralizar nombres de indices y convenciones.

- T4-a (test): validar enum `KnowledgeBase` con valores exactos requeridos.
- T4-b (implement): crear/ajustar enum con `polizas`, `siniestros`, `rrhh`, `legal`, `operaciones`.
- T4-c (refactor): asegurar serializacion/almacenamiento consistente (string/int segun convencion del repo).

- T5-a (test): validar seed inicial con usuario admin, rol admin_ti y relacion UserRole.
- T5-b (implement): agregar seed en contexto (hash BCrypt para password).
- T5-c (refactor): encapsular valores de seed para mantenimiento.

- T6-a (test): agregar prueba de migracion inicial aplicable en entorno de prueba.
- T6-b (implement): generar migracion inicial EF Core para esquema del alcance.
- T6-c (refactor): revisar nombres de tablas/columnas/constraints para coherencia.

- T7-a (test): prueba de consulta de usuario con includes de roles y knowledge bases.
- T7-b (implement): ajustar configuracion de navegaciones para materializacion correcta.
- T7-c (refactor): optimizar claridad de consultas de prueba.

## Criterio de done
- Pruebas del dominio y persistencia en verde.
- Migracion inicial creada y aplicable.
- Seed de admin con BCrypt verificado.
- Reviewer aprueba contra requirements y design.