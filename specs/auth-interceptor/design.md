# Design - auth-interceptor

## Resumen tecnico
Se usa un interceptor funcional (`HttpInterceptorFn`) que consulta `AuthService` para token actual, excluye endpoints de autenticacion, y ante `401` dispara refresh compartido con `shareReplay(1)` para reintentar requests pendientes sin duplicar llamadas de refresh.

## Diagrama de flujo (ASCII)

+--------- Request ---------+
| endpoint auth?            |
+-------------+-------------+
              | yes
              v
           next(req)
              |
              | no
              v
+------------------------------+
| add Authorization if token   |
+--------------+---------------+
               v
           next(req)
               |
      +--------+--------+
      |  status != 401? |
      +---+---------+---+
          |yes      |no
          v         v
       return    refresh flow
                    |
                    v
         +----------------------+
         | shared refresh call  |
         +----------+-----------+
                    |
            +-------+--------+
            | success | fail |
            v         v
      retry original  signOut + throw

## Archivos afectados
| Archivo | Tipo | Motivo |
|---|---|---|
| `SeguraNova.Spa/src/app/core/auth/auth.interceptor.ts` | Modificar/confirmar | Logica principal de header, 401, refresh, retry, signOut |
| `SeguraNova.Spa/src/app/core/auth/auth.interceptor.spec.ts` | Modificar/expandir pruebas | Cobertura de concurrentes y no-loop |
| `SeguraNova.Spa/src/app/app.config.ts` | Verificar | Registro funcional con `withInterceptors` |

## Contratos de interfaces (sin implementacion)
- `authInterceptor: HttpInterceptorFn`
- `AuthService.getAccessToken(): string | null`
- `AuthService.refreshToken(): Observable<string>`
- `AuthService.signOut(): void`

Reglas de request:
- Excluir `/api/auth/login` y `/api/auth/refresh` de bearer.
- Marcar retries con header tecnico `X-Refresh-Retry: 1` (o mecanismo equivalente) para prevenir loops.

## Dependencias y justificacion
- `@angular/common/http` para interceptor funcional y clon de requests.
- `rxjs` (`catchError`, `switchMap`, `defer`, `shareReplay`, `finalize`) para orquestar refresh compartido.
- `AuthService` como unica abstraccion para token lifecycle, evitando duplicar storage en interceptor.

## Decisiones descartadas
- Interceptor basado en clase: descartado por requisito explicito de funcional en Angular 18.
- Ejecutar refresh por cada `401` sin coalescencia: descartado por riesgo de tormenta de requests.
- Reintentos ilimitados: descartado por riesgo de loops y bloqueo de UI.