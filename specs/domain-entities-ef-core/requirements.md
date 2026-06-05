# Requirements - domain-entities-ef-core

## Objetivo
Definir y persistir entidades de dominio para autenticacion/autorizacion en EF Core con PostgreSQL, incluyendo relaciones, claves Guid, enum de knowledge bases, migracion inicial y seed de usuario administrador con password hasheado en BCrypt.

## Requisitos funcionales (EARS)
- R1. WHEN se modele el dominio de usuarios y permisos THE SYSTEM SHALL definir entidades `User`, `Role`, `UserRole` y `UserKnowledgeBase` con `Guid` como clave primaria.
- R2. WHEN se configure la persistencia THE SYSTEM SHALL exponer `ApplicationDbContext` con mapeos EF Core para las entidades anteriores y sus relaciones.
- R3. WHEN se ejecute la migracion inicial THE SYSTEM SHALL crear tablas y constraints necesarias en PostgreSQL para dichas entidades.
- R4. WHEN se represente el dominio de conocimiento THE SYSTEM SHALL definir `KnowledgeBase` como enum con valores exactos: `polizas`, `siniestros`, `rrhh`, `legal`, `operaciones`.
- R5. WHEN se inicialice el entorno de desarrollo THE SYSTEM SHALL sembrar al menos un usuario admin con password hasheado usando `BCrypt.Net-Next`.
- R6. WHEN se consulte un usuario THE SYSTEM SHALL permitir resolver sus roles y knowledge bases por relaciones normalizadas (join tables).
- R7. WHEN se intente insertar duplicados logicos (por ejemplo mismo par UserId/RoleId) THE SYSTEM SHALL prevenir inconsistencias mediante llaves/indices unicos apropiados.

## Criterios de aceptacion verificables
- A1. Existen clases de entidad para `User`, `Role`, `UserRole`, `UserKnowledgeBase` con PK Guid.
- A2. `ApplicationDbContext` registra `DbSet` y mapeos/relaciones de estas entidades.
- A3. Existe migracion inicial versionada que crea esquema esperado.
- A4. El enum `KnowledgeBase` contiene exactamente los 5 valores requeridos.
- A5. Existe seed de admin con password BCrypt verificable.
- A6. Existen pruebas (unitarias o integracion) que validan constraints de unicidad en tablas de relacion.
- A7. `dotnet ef database update` (o flujo equivalente del proyecto) aplica sin errores en entorno local.

## Non-goals
- No implementar aun login/refresh completo (feature separada).
- No introducir ASP.NET Core Identity.
- No agregar permisos granulares adicionales fuera de roles y knowledge bases.
- No diseñar auditoria avanzada de entidades en esta feature.