# Tasks: user-authentication

## Reglas para Coder (obligatorias)
- TDD estricto por cada tarea: test rojo -> implementacion minima -> refactor.
- No introducir ASP.NET Core Identity.
- Funciones <= 20 lineas (salvo adapters/framework glue claramente justificados).
- Aplicar SRP; nombres de metodos y variables deben revelar intencion.
- No mezclar cambios de features 2-8 fuera de lo estrictamente necesario para completar la feature 1.

## Tareas atomicas (TDD)

### [x] T1 - Contratos de autenticacion (Application)
- T1-a (test): crear pruebas de contrato para `IAuthService` y DTOs de login/refresh.
- T1-b (impl): definir interfaces y modelos de request/response sin logica de negocio.
- T1-c (refactor): normalizar nombres y convenciones de serializacion.

### [x] T2 - Modelo de dominio y persistencia minima
- T2-a (test): pruebas de mapeo EF Core para User, Role, UserRole, UserKnowledgeBase, RefreshToken.
- T2-b (impl): crear/ajustar entidades y `ApplicationDbContext` con relaciones y restricciones.
- T2-c (refactor): limpiar configuraciones Fluent API repetidas.

### [x] T3 - Login backend
- T3-a (test): integracion de `POST /api/auth/login` para 200 y 401 generico.
- T3-b (impl): implementar validacion de credenciales con BCrypt y emision de tokens.
- T3-c (refactor): extraer generador de tokens y reloj para testeabilidad.

### [x] T4 - Refresh backend con rotacion
- T4-a (test): refresh valido rota token; refresh invalido/expirado devuelve 401.
- T4-b (impl): verificar hash de refresh, TTL 7 dias, revocacion del anterior y emision del nuevo.
- T4-c (refactor): encapsular reglas de rotacion en componente dedicado.

### [x] T5 - Logout backend
- T5-a (test): `POST /api/auth/logout` autenticado devuelve 204 y revoca refresh.
- T5-b (impl): implementar endpoint y revocacion en servicio.
- T5-c (refactor): unificar manejo de errores y respuestas estandar.

### [x] T6 - Configuracion JWT y pipeline
- T6-a (test): pruebas de arranque/config verifican JwtBearer validation y ClockSkew=0.
- T6-b (impl): configurar AddAuthentication/AddAuthorization y orden correcto de middleware.
- T6-c (refactor): extraer extensiones de DI para legibilidad.

### [x] T7 - Rate limiting de login
- T7-a (test): integracion verifica maximo 5 intentos por IP por minuto.
- T7-b (impl): aplicar rate limiter en ruta de login.
- T7-c (refactor): parametrizar politicas en configuracion.

### [x] T8 - AuthService frontend real
- T8-a (test): pruebas unitarias para `signIn`, guardado de tokens y `signOut`.
- T8-b (impl): reemplazar simulacion por llamada real a `/api/auth/login`; persistir claves exactas.
- T8-c (refactor): centralizar acceso a localStorage y manejo de errores.

### [x] T9 - Interceptor frontend
- T9-a (test): pruebas para inyeccion de bearer (excepto login/refresh) y flujo 401->refresh->retry.
- T9-b (impl): crear interceptor funcional con `withInterceptors` y reintento unico.
- T9-c (refactor): prevenir refresh simultaneos y duplicacion de codigo RxJS.

### [x] T10 - Guard y redireccion por rol
- T10-a (test): pruebas de guard para token ausente/expirado y redireccion por rol.
- T10-b (impl): canActivate funcional con decode via `atob` y redirecciones requeridas.
- T10-c (refactor): extraer utilidades de parseo JWT y chequeo de expiracion.

### [x] T11 - Pruebas E2E de flujo completo
- T11-a (test): escenario login->acceso ruta protegida->expiracion simulada->refresh automatico.
- T11-b (impl): ajustes minimos de integracion para estabilizar pipeline.
- T11-c (refactor): reducir fragilidad de fixtures y tiempos.

## Criterio de done
- Todos los tests unitarios, integracion y frontend en verde.
- Cumplidos R1-R15 de `requirements.md`.
- Sin regresiones en rutas protegidas existentes.
- Reviewer subagente aprueba explicitamente.

## [x] T12 - Correcciones post-review (iteracion 2)
- [x] T12-a: logout requiere `refresh_token` y revoca solo la sesion actual (OB-1, R8).
- [x] T12-b: test explicito de refresh expirado devuelve 401 (ONB-1, R7).
- [x] T12-c: test explicito de redireccion post-login por rol desde login component (ONB-2, R12).
- [x] T12-d: limpieza de codigo comentado en login component (ONB-3).
- [x] T12-e: eliminar variable no usada `currentHash` en AuthService (ONB-4).
