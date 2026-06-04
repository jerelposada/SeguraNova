# SeguraNova

## Ejecutar con Docker

Este repositorio ahora incluye una configuracion completa con Docker Compose para levantar:

- PostgreSQL (`postgres:16-alpine`)
- API .NET 8
- SPA Angular servida por Nginx

### Requisitos

- Docker Desktop instalado
- Docker daemon encendido

### Levantar el entorno

Desde la raiz del repo:

```powershell
docker compose up -d --build
```

### URLs de prueba manual

- SPA: `http://localhost:4200`
- API (Swagger): `http://localhost:5132/swagger`
- PostgreSQL: `localhost:5432` (`postgres/postgres`, DB `seguranova_dev`)

### Ver logs

```powershell
docker compose logs -f
```

### Bajar el entorno

```powershell
docker compose down
```

Para borrar tambien el volumen de base de datos:

```powershell
docker compose down -v
```