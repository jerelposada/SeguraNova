# Spec - user_experience-improvements

## Requirements
El flujo de login muestra correctamente error de credenciales invalidas, pero en algunos escenarios el boton de submit permanece en estado de carga indefinida. La feature corrige la recuperacion de estado de UI para permitir reintento inmediato sin recargar pagina y agrega cobertura para evitar regresion.

### Criterios de aceptaciÃ³n
- WHEN el backend responde error en login THE SYSTEM SHALL restablecer el estado visual del boton de submit a su estado normal en la misma interaccion.
- R1: Al fallar `signIn()`, `isLoading` debe volver a `false` y el boton debe quedar habilitado para un nuevo intento.
- R2: Al fallar `signIn()`, debe mostrarse mensaje de error y no debe existir spinner activo en el submit despues de finalizar la respuesta.

### Non-goals
- Cambiar estilos visuales del formulario fuera de estados ya definidos.
- Introducir cambios de autenticacion backend (endpoint, DTOs o mensajes del API).
- Agregar flujos de recuperacion de contrasena o MFA.

---

## Design
### Flujo
[Usuario envia formulario valido]
            |
            v
   [onSubmit prepara estado]
            |
            v
 [AuthService.signIn(email,password)]
            |
      +-----+-----+
      |           |
      v           v
   [OK]       [ERROR]
      |           |
      v           v
[navegar]   [set loginError]
      |           |
      +-----+-----+
            |
            v
[finalize -> isLoading=false]
            |
            v
 [boton sin spinner + habilitado]

### Archivos afectados
| Archivo | AcciÃ³n |
|---------|--------|
| SeguraNova.Spa/src/app/Pages/login/login.component.spec.ts | Modificar |
| SeguraNova.Spa/src/app/Pages/login/login.component.ts | Verificar/ajustar solo si test lo exige |
| SeguraNova.Spa/src/app/Pages/login/login.component.html | Verificar contrato de estado visual del boton |

### Contratos de interfaces
- `LoginComponent.onSubmit(): void`
- `LoginComponent.isLoading: Signal<boolean>`
- `AuthService.signIn(email: string, password: string): Observable<void>`

### Decisiones tÃ©cnicas
- Se prioriza cobertura de pruebas en `LoginComponent` para validar estado de UI post-error y prevenir regresion.
- Se conserva el uso de `finalize()` para garantizar limpieza de estado en exito y error.
- Se descarta mover logica al servicio porque el problema es de estado de presentacion en componente.

---

## Tasks
### Reglas para el coder
- TDD estricto: RED -> GREEN -> REFACTOR
- Funciones <= 20 lineas, 1 responsabilidad, <= 3 parametros
- Nombres que revelan intenciÃ³n
- Sin auto-aprobaciÃ³n
- Usar modelo gpt 5-5 mini para esta implementacion

### Reglas para el reviewer
- Revisar trazabilidad R1-R2 con pruebas ejecutadas
- Verificar que no haya regresion en login exitoso
- Usar modelo gpt 5-5 mini para esta revision

### Lista
Progreso: 5/5

- [x] T1: test - validar que en error de `signIn()` el submit deja de mostrar spinner y vuelve a estado clickable
- [x] T2: implementar - ajuste minimo en manejo de error/finalize para cumplir T1
- [x] T3: test - validar persistencia del mensaje de error y `isLoading=false` tras fallo asincrono
- [x] T4: implementar - asegurar secuencia de estado consistente sin romper flujo exitoso
- [x] T5: refactor - simplificar nombres/estructura de metodos de submit sin cambiar comportamiento

### Iteracion aprobada para refactor
- Alcance actual: ejecutar solo T5 sin reabrir T1-T4 salvo que el refactor rompa pruebas.
- Criterio de cierre: mantener 49 tests frontend en verde o mas, sin regresion en login exitoso y fallo de login.

---

## Review Report

- Fecha: 2026-06-06
- Veredicto: APROBADO
- Tests: 50 pasando, 0 fallando
- Trazabilidad: R1 cubierto por prueba de reintento tras error asincrono; R2 cubierto por prueba de error con restablecimiento de estado.
- Observaciones bloqueantes: ninguna
- Lo que está bien: `finalize()` garantiza restablecimiento de `isLoading`; flujo exitoso intacto; cobertura para errores sincronos y asincronos.
