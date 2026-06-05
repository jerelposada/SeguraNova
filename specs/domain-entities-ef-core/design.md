# Design - domain-entities-ef-core

## Resumen tecnico
Se consolidara el modelo de dominio y su persistencia en EF Core con Npgsql. Las entidades base usaran `Guid` y tablas de union para modelar relaciones many-to-many de usuarios con roles y knowledge bases.

## Diagrama de flujo (ASCII)

+------------------+      +------------------+
| User             |      | Role             |
| Id (Guid) PK     |      | Id (Guid) PK     |
| Email            |      | Name             |
| PasswordHash     |      +------------------+
+--------+---------+
         | 1..*                    
         | via UserRole
         v
+------------------+
| UserRole         |
| Id (Guid) PK     |
| UserId FK        |
| RoleId FK        |
| Unique(UserId,RoleId)
+------------------+

+---------------------------+
| UserKnowledgeBase         |
| Id (Guid) PK              |
| UserId FK                 |
| KnowledgeBase enum value  |
| Unique(UserId,KnowledgeBase)
+---------------------------+

Seed inicial:
- Role admin_ti
- User admin (password hash BCrypt)
- UserRole que vincula admin con admin_ti

## Archivos afectados
| Archivo | Tipo | Motivo |
|---|---|---|
| SeguroNova.Api/src/Domain/Entities/User.cs | Modificar/confirmar | PK Guid y relacion con roles/knowledge bases |
| SeguroNova.Api/src/Domain/Entities/Role.cs | Modificar/confirmar | PK Guid y nombre de rol |
| SeguroNova.Api/src/Domain/Entities/UserRole.cs | Modificar/confirmar | Tabla union usuario-rol |
| SeguroNova.Api/src/Domain/Entities/UserKnowledgeBase.cs | Modificar/confirmar | Tabla union usuario-knowledge base |
| SeguroNova.Api/src/Domain/Enums/KnowledgeBase.cs (o equivalente) | Crear/modificar | Enum requerido |
| SeguroNova.Api/src/Repository/Persistence/ApplicationDbContext.cs | Modificar | DbSet + Fluent API + seed |
| SeguroNova.Api/src/Repository/Persistence/Migrations/* | Crear | Migracion inicial EF Core |
| SeguroNova.Api/tests/* | Modificar/agregar | Pruebas de mapping/constraints/seed |

## Contratos de interfaces (sin implementacion)
- `ApplicationDbContext : DbContext`
- `DbSet<User> Users`
- `DbSet<Role> Roles`
- `DbSet<UserRole> UserRoles`
- `DbSet<UserKnowledgeBase> UserKnowledgeBases`

Reglas de integridad:
- PK Guid en todas las entidades.
- `UserRole` unico por `(UserId, RoleId)`.
- `UserKnowledgeBase` unico por `(UserId, KnowledgeBase)`.
- `Email` de usuario idealmente unico (si el dominio actual ya lo exige, mantenerlo).

## Dependencias y justificacion
- `Microsoft.EntityFrameworkCore` para ORM y migraciones.
- `Npgsql.EntityFrameworkCore.PostgreSQL` para proveedor PostgreSQL.
- `BCrypt.Net-Next` para hashing de password seed, sin Identity.

## Decisiones descartadas
- ASP.NET Core Identity: descartado por requerimiento explicito.
- PK enteros autoincrementales: descartado por requerimiento de Guid.
- Modelar roles y knowledge bases como JSON embebido en User: descartado para mantener normalizacion y constraints SQL.