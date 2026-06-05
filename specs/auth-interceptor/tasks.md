# Tasks - auth-interceptor

## Reglas para el Coder
- TDD estricto por tarea: rojo -> verde -> refactor.
- Funciones nuevas/modificadas <= 20 lineas cuando sea posible.
- No cambiar contrato publico de `AuthService`.
- Mantener interceptor funcional (`HttpInterceptorFn`) y wiring con `withInterceptors`.

## Tareas atomicas (test/implementacion/refactor)
- [x] T1-a (test): validar que agrega `Authorization` en endpoint no auth.
- [x] T1-b (implement): ajustar interceptor para bearer condicional.
- [x] T1-c (refactor): extraer helper de deteccion de endpoint auth si mejora legibilidad.

- [x] T2-a (test): validar que login y refresh no reciben `Authorization`.
- [x] T2-b (implement): asegurar excepcion de endpoints auth.
- [x] T2-c (refactor): reducir duplicacion de asserts de headers.

- [x] T3-a (test): validar flujo `401 -> refresh -> retry`.
- [x] T3-b (implement): asegurar `switchMap` con retry del request original y nuevo token.
- [x] T3-c (refactor): encapsular marcado tecnico de retry sin cambiar semantica.

- [x] T4-a (test): validar `signOut()` cuando refresh falla.
- [x] T4-b (implement): asegurar captura de error de refresh y logout.
- [x] T4-c (refactor): clarificar cadena de errores y propagacion.

- [x] T5-a (test): agregar prueba de `401` concurrentes que comparten una sola llamada a refresh.
- [x] T5-b (implement): asegurar coalescencia con stream compartido en vuelo.
- [x] T5-c (refactor): resetear estado de refresh en finalize para siguientes ciclos.

- [x] T6-a (test): validar no-loop infinito en request reintentado.
- [x] T6-b (implement): agregar guardia de retry (header tecnico o equivalente).
- [x] T6-c (refactor): documentar decision tecnica en test names y constantes.

- [x] T7-a (test): verificar wiring de interceptor en configuracion principal.
- [x] T7-b (implement): ajustar `app.config.ts` si aplica para `withInterceptors([authInterceptor])`.
- [x] T7-c (refactor): limpiar imports/configuracion redundante.

## Criterio de done
- Tests de interceptor y auth flow frontend en verde.
- No hay loops de refresh ni duplicidad de refresh concurrente.
- Wiring de app confirmado.
- Reviewer aprueba contra `requirements.md` y `design.md`.