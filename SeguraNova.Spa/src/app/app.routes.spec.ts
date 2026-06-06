import { authGuard } from './core/auth/auth.guard';
import { routes } from './app.routes';
import { GapAnalysisComponent } from './features/admin/agent/components/gap-analysis.component';
import { HistorialConversacionesComponent } from './features/admin/agent/components/historial-conversaciones.component';
import { RetrievalEffortComponent } from './features/admin/agent/components/retrieval-effort.component';
import { SemanticCacheConfigComponent } from './features/admin/agent/components/semantic-cache-config.component';
import { AdminLayoutComponent } from './features/admin/layout/admin-layout.component';
import { ChunkPreviewComponent } from './features/admin/documents/components/chunk-preview.component';
import { ListaDocumentosComponent } from './features/admin/documents/components/lista-documentos.component';
import { UploadDocumentoComponent } from './features/admin/documents/components/upload-documento.component';
import { VersionesDocumentoComponent } from './features/admin/documents/components/versiones-documento.component';
import { AdminAgentShellComponent } from './features/admin/pages/admin-agent-shell.component';
import { AdminDocumentsShellComponent } from './features/admin/pages/admin-documents-shell.component';
import { AdminHomeComponent } from './features/admin/pages/admin-home.component';
import { AdminMonitoringShellComponent } from './features/admin/pages/admin-monitoring-shell.component';
import { AdminUsersPermissionsShellComponent } from './features/admin/pages/admin-users-permissions-shell.component';

describe('app routes auth guard', () => {
  const adminUiComponents = [
    AdminLayoutComponent,
    AdminHomeComponent,
    AdminDocumentsShellComponent,
    UploadDocumentoComponent,
    ListaDocumentosComponent,
    VersionesDocumentoComponent,
    ChunkPreviewComponent,
    AdminAgentShellComponent,
    HistorialConversacionesComponent,
    GapAnalysisComponent,
    SemanticCacheConfigComponent,
    RetrievalEffortComponent,
    AdminUsersPermissionsShellComponent,
    AdminMonitoringShellComponent,
  ];

  const protectedPaths = ['admin', 'chat', 'dashboard'];

  protectedPaths.forEach((path) => {
    it(`should protect ${path} route with authGuard`, () => {
      const route = routes.find((currentRoute) => currentRoute.path === path);

      expect(route).toBeDefined();
      expect(route?.canActivate).toContain(authGuard);
    });
  });

  it('should configure admin route with lazy layout component and lazy-loaded children', () => {
    const adminRoute = routes.find((currentRoute) => currentRoute.path === 'admin');

    expect(adminRoute?.loadComponent).toBeDefined();
    expect(adminRoute?.children?.length).toBeGreaterThan(0);
    expect(adminRoute?.children?.every((childRoute) => typeof childRoute.loadComponent === 'function')).toBeTrue();
  });

  it('should define lazy-loaded admin children for all expected sections', () => {
    const adminRoute = routes.find((currentRoute) => currentRoute.path === 'admin');
    const adminChildPaths = adminRoute?.children?.map((childRoute) => childRoute.path);

    expect(adminChildPaths).toEqual([
      '',
      'principal',
      'documentos',
      'agente',
      'usuarios-permisos',
      'monitoreo',
    ]);
    expect(adminRoute?.children?.every((childRoute) => typeof childRoute.loadComponent === 'function')).toBeTrue();
  });

  it('should preserve admin/agente route as lazy child under admin layout', () => {
    const adminRoute = routes.find((currentRoute) => currentRoute.path === 'admin');
    const agentChild = adminRoute?.children?.find((childRoute) => childRoute.path === 'agente');

    expect(agentChild).toBeDefined();
    expect(typeof agentChild?.loadComponent).toBe('function');
  });

  it('should keep admin feature as static UI without service or HttpClient injections', () => {
    const hasDependencyInjection = adminUiComponents.some((componentType) => {
      const factorySource = String((componentType as unknown as { ɵfac?: unknown }).ɵfac ?? '');

      return /HttpClient|directiveInject\(|inject\(/.test(factorySource);
    });

    expect(hasDependencyInjection).toBeFalse();
  });
});
