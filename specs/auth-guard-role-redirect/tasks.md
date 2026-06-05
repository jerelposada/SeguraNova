# Tasks - auth-guard-role-redirect

## Reglas para el Coder
- TDD estricto por tarea: rojo -> verde -> refactor.
- Guard funcional (sin clases) y parseo JWT con atob.
- Funciones nuevas o modificadas <= 20 lineas cuando sea posible.
- No duplicar logica de roles si ya existe en AuthService.

## Tareas atomicas (test/implementacion/refactor)
- [x] T1-a (test): validar redireccion a /login cuando no hay token.
- [x] T1-b (implement): confirmar guardia de token faltante.
- [x] T1-c (refactor): limpiar setup repetido del guard spec.

- [x] T2-a (test): validar redireccion a /login cuando token expirado.
- [x] T2-b (implement): asegurar evaluacion de exp en segundos vs Date.now.
- [x] T2-c (refactor): extraer helper de tokens de prueba.

- [x] T3-a (test): validar acceso permitido cuando token valido.
- [x] T3-b (implement): confirmar retorno true en path valido.
- [x] T3-c (refactor): simplificar nombre de casos y expectativas.

- [x] T4-a (test): validar token malformado tratado como expirado.
- [x] T4-b (implement): reforzar manejo defensivo del parseo atob/JSON.
- [x] T4-c (refactor): mantener isTokenExpired legible y acotado.

- [x] T5-a (test): validar resolvePostLoginRoute para admin_ti.
- [x] T5-b (implement): asegurar ruta /admin para admin_ti.
- [x] T5-c (refactor): deduplicar builders de payload con roles.

- [x] T6-a (test): validar resolvePostLoginRoute para empleado y agente_siniestros.
- [x] T6-b (implement): asegurar ruta /chat para ambos roles.
- [x] T6-c (refactor): mejorar legibilidad de normalizacion de roles.

- [x] T7-a (test): validar fallback /login cuando roles falta o es invalido.
- [x] T7-b (implement): asegurar fallback seguro.
- [x] T7-c (refactor): consolidar pruebas de fallback en bloque consistente.

- [x] T8-a (test): validar que rutas protegidas usan authGuard.
- [x] T8-b (implement): ajustar app.routes.ts si faltara canActivate.
- [x] T8-c (refactor): ordenar definicion de rutas sin alterar comportamiento.

## Criterio de done
- Tests de auth guard y role redirect en verde.
- Rutas protegidas con guard funcional verificadas.
- Sin librerias JWT externas.
- Reviewer aprueba contra requirements y design.