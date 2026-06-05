# Tasks - auth-service-frontend

## Reglas para el Coder
- Aplicar TDD estricto en cada tarea (rojo -> verde -> refactor).
- No mezclar multiples objetivos en una sola tarea.
- Funciones nuevas o modificadas con maximo 20 lineas (excepto wiring inevitable).
- Respetar SRP y nombres que revelen intencion.
- No alterar contratos publicos fuera del alcance de la feature.

## Tareas atomicas (test/implementacion/refactor)
- [x] T1-a (test): agregar/ajustar prueba de `signIn()` verificando `POST /api/auth/login` con body `{ email, password }`.
- [x] T1-b (implement): ajustar implementacion de `signIn()` para cumplir request real y completar `Observable<void>`.
- [x] T1-c (refactor): limpiar duplicacion en setup de pruebas de login.

- [x] T2-a (test): agregar/ajustar prueba de persistencia de `sn_access_token` y `sn_refresh_token` tras login exitoso.
- [x] T2-b (implement): asegurar `storeTokens()` con keys exactas requeridas.
- [x] T2-c (refactor): consolidar helpers de fixtures de tokens en spec.

- [x] T3-a (test): agregar/ajustar prueba de `signOut()` para eliminar ambas keys y mantener redireccion a `/login`.
- [x] T3-b (implement): asegurar limpieza consistente de storage y navegacion.
- [x] T3-c (refactor): simplificar assertions repetitivas de localStorage.

- [x] T4-a (test): agregar/ajustar prueba de `refreshToken()` verificando `POST /api/auth/refresh` con `{ refresh_token }`.
- [x] T4-b (implement): asegurar envio del refresh token persistido y retorno del nuevo access token.
- [x] T4-c (refactor): mejorar legibilidad de pipeline RxJS sin cambiar comportamiento.

- [x] T5-a (test): agregar/ajustar prueba para caso sin refresh token (error controlado).
- [x] T5-b (implement): asegurar fail-fast de `refreshToken()` cuando falta token.
- [x] T5-c (refactor): centralizar manejo de mensajes/errores para mantenimiento.

- [x] T6-a (test): verificar compatibilidad de contrato con consumidores (`LoginComponent` y flujo de interceptor).
- [x] T6-b (implement): ajustes minimos de tipado o llamadas si alguna prueba de compatibilidad falla.
- [x] T6-c (refactor): remocion de codigo muerto y mantenimiento de imports.

## Criterio de done
- Todos los tests relacionados a `AuthService` y flujo auth frontend en verde.
- Sin regresiones de compilacion en consumidores directos (`LoginComponent`, interceptor).
- Reviewer independiente aprueba contra `requirements.md` y `design.md`.
- `feature_list.json` actualizado a `done` solo despues de aprobacion del Reviewer.

## Correcciones post-review
- [x] OB-1 (test): agregar prueba explicita para R3 validando que `signIn()` emite `void/undefined` y no expone payload.
- [x] OB-2 (refactor): dividir `LoginComponent.onSubmit()` en responsabilidades pequenas cumpliendo regla <=20 lineas.
- [x] OB-3 (implement): asegurar restablecimiento de `isLoading` en exito y error de login.