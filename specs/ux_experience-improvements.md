# Spec — ux_experience-improvements

## Requirements
El login por rol ya redirige a `/admin` para `admin_ti`, pero la experiencia visual del panel administrativo no cumple expectativa UX: jerarquia visual debil, espaciado inconsistente, contraste irregular y separacion de secciones insuficiente. Esta feature define un rediseño de maquetacion orientado a claridad operativa y estilo neumorphism consistente con los design tokens globales.

### Criterios de aceptación
- WHEN un usuario con rol `admin_ti` accede a `/admin` THE SYSTEM SHALL renderizar un layout administrativo con topbar, sidebar y contenido principal claramente diferenciados mediante espaciado, elevacion y bordes consistentes.
- WHEN se visualiza el panel administrativo en desktop THE SYSTEM SHALL mantener una grilla legible con sidebar fija y area de contenido con separacion minima uniforme entre bloques.
- WHEN se visualiza el panel administrativo en tablet o mobile THE SYSTEM SHALL adaptar la maquetacion sin solapamientos, overflow horizontal ni perdida de jerarquia visual.
- WHEN se renderizan componentes administrativos (KPIs, tarjetas y secciones) THE SYSTEM SHALL usar tipografia, colores y sombras neumorphism del sistema global (`styles.css`) sin introducir paletas paralelas incompatibles.
- WHEN el usuario navega entre secciones de sidebar THE SYSTEM SHALL mostrar estados visuales `default/hover/active/focus-visible` con contraste accesible y feedback inmediato.
- WHEN una ruta reutiliza la misma vista base de dashboard (por ejemplo `/chat`) THE SYSTEM SHALL reflejar los ajustes visuales compartidos de maquetacion sin introducir cambios de flujo funcional.
- R1: Existe prueba que valida estructura base del layout admin (topbar + sidebar + main content) y presencia de clases/landmarks esperados.
- R2: Existe prueba que valida navegacion activa del sidebar (`routerLinkActive`) y estado seleccionado visible.
- R3: Existe prueba que valida que `/admin` carga el dashboard administrativo y no una vista placeholder.
- R4: Existe prueba que valida comportamiento responsive basico del layout (sin overflow horizontal en viewport pequeno).
- R5: Existe evidencia visual (test DOM/CSS class assertions) de separacion consistente entre secciones de dashboard (kpis + bloques de gobierno/monitoreo).
- R6: Existe prueba que valida que las mejoras visuales compartidas del dashboard se mantienen cuando la vista es consumida por una ruta distinta como `/chat`.

### Non-goals
- No incluye cambios de logica de autenticacion/autorizacion, tokens o guards.
- No incluye integracion HTTP nueva ni persistencia de configuraciones UI.
- No incluye rediseño funcional del flujo de `/chat` (mensajeria, estados de conversacion, integraciones).
- No incluye reescritura completa del design system global, solo consumo consistente de tokens existentes.

---

## Design
### Flujo
```text
Login exitoso (admin_ti)
        |
        v
  resolvePostLoginRoute() -> /admin
        |
        v
 app.routes (admin + children)
        |
        v
 AdminLayoutComponent
  |      |        |
  |      |        +--> Sidebar (navegacion)
  |      +-----------> Topbar (contexto)
  +------------------> RouterOutlet (contenido)
                           |
                           v
                    DashboardComponent
                           |
                           v
             KPIs + Secciones admin separadas
```

### Archivos afectados
| Archivo | Acción |
|---------|--------|
| SeguraNova.Spa/src/app/features/admin/layout/admin-layout.component.html | Modificar |
| SeguraNova.Spa/src/app/features/admin/layout/admin-layout.component.css | Modificar |
| SeguraNova.Spa/src/app/features/admin/layout/admin-layout.component.ts | Modificar (solo datos de presentacion si aplica) |
| SeguraNova.Spa/src/app/Pages/dashboard/dashboard.component.html | Modificar |
| SeguraNova.Spa/src/app/Pages/dashboard/dashboard.component.css | Modificar |
| SeguraNova.Spa/src/app/Pages/dashboard/dashboard.component.ts | Modificar (solo estado visual hardcodeado) |
| SeguraNova.Spa/src/app/app.routes.ts | Verificar / ajustar solo si se detecta inconsistencia de carga admin |
| SeguraNova.Spa/src/app/app.routes.spec.ts | Modificar/expandir pruebas de wiring de rutas admin |
| SeguraNova.Spa/src/app/features/admin/layout/admin-layout.component.spec.ts | Crear o expandir pruebas de layout/navegacion |
| SeguraNova.Spa/src/app/Pages/dashboard/dashboard.component.spec.ts | Crear o expandir pruebas de estructura y separacion visual base |

### Contratos de interfaces
- `AdminLayoutComponent.navItems: Signal<ReadonlyArray<{ label: string; route: string; icon: string }>>`
- `DashboardComponent.kpis: Signal<ReadonlyArray<{ label: string; value: string; trend: string }>>`
- `DashboardComponent.operationalStatus: Signal<string>`
- `routes: Routes` mantiene contrato publico de rutas protegidas y `children` bajo `/admin`.

### Decisiones técnicas
- Se conserva Angular standalone + control flow moderno (`@for`) para mantener consistencia con la base existente.
- Se prioriza reutilizar tokens globales (`--sp-*`, `--clr-*`, `--neu-*`, `--fs-*`) para evitar deriva visual y deuda de estilos duplicados.
- Se mantiene enfoque UI-only con datos hardcodeados en dashboard; evita mezclar esta feature con integraciones backend.
- Se descarta introducir librerias de UI externas para no romper identidad visual ni aumentar complejidad.
- Se descarta crear una segunda paleta de colores; se usa la paleta actual neumorphism y se refuerza jerarquia mediante composicion, contraste y espaciado.

---

## Tasks
### Reglas para el coder
- TDD estricto: RED -> GREEN -> REFACTOR.
- Funciones <= 20 lineas, 1 responsabilidad, <= 3 parametros.
- Nombres que revelan intencion.
- Sin auto-aprobacion.

### Lista
Progreso: 13/13

- [x] T1: test — validar que `/admin` renderiza `AdminLayoutComponent` con topbar, sidebar y main content (R1). — 2026-06-06
- [x] T2: implementar — ajustar markup del layout admin para landmarks claros y jerarquia visual minima (R1). — 2026-06-06
- [x] T3: test — validar estado activo de navegacion del sidebar y feedback de seleccion (R2). — 2026-06-06
- [x] T4: implementar — reforzar estilos de navegacion (`default/hover/active/focus-visible`) con tokens existentes (R2). — 2026-06-06
- [x] T5: test — validar que dashboard admin no expone placeholders y contiene bloques KPI + secciones principales (R3, R5). — 2026-06-06
- [x] T6: implementar — maquetar dashboard con separacion consistente entre header, KPI grid y secciones de gobierno/monitoreo (R3, R5). — 2026-06-06
- [x] T7: test — validar reglas responsive del layout en viewport pequeno sin overflow horizontal (R4). — 2026-06-06
- [x] T8: implementar — ajustar breakpoints de sidebar/contenido y espaciados para mobile/tablet (R4). — 2026-06-06
- [x] T9: test — validar uso de clases/tokens neumorphism esperados en contenedores clave del admin (R5). — 2026-06-06
- [x] T10: implementar — alinear sombras, fondos y tipografia del admin al design system global sin paletas paralelas (R5). — 2026-06-06
- [x] T11: test — validar wiring de rutas admin (ruta protegida, children y carga dashboard admin) sin regresion de guards. — 2026-06-06
- [x] T12: refactor — limpiar duplicaciones de estilos/plantillas y estabilizar nombres semanticos sin cambiar comportamiento. — 2026-06-06
- [x] T13: test — validar que `/chat`, al reutilizar dashboard compartido, conserva los ajustes visuales base sin alterar su flujo funcional (R6). — 2026-06-06
