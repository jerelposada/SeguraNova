import { Component, provideZonelessChangeDetection } from '@angular/core';
import { By } from '@angular/platform-browser';
import { Router, RouterLink, RouterLinkActive, RouterOutlet, Routes } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ADMIN_ROUTES } from '../../../app.routes';
import { AdminLayoutComponent } from './admin-layout.component';

@Component({
  standalone: true,
  template: '',
})
class StubAdminChildComponent {}

@Component({
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
class RouterHostComponent {}

const ADMIN_CHILD_ROUTES: Routes = [
  { path: 'admin/principal', component: StubAdminChildComponent },
  { path: 'admin/documentos', component: StubAdminChildComponent },
  { path: 'admin/agente', component: StubAdminChildComponent },
  { path: 'admin/usuarios-permisos', component: StubAdminChildComponent },
  { path: 'admin/monitoreo', component: StubAdminChildComponent },
];

const ADMIN_LAYOUT_INTEGRATION_ROUTES: Routes = [
  {
    path: 'admin',
    component: AdminLayoutComponent,
    children: ADMIN_ROUTES,
  },
];

describe('AdminLayoutComponent', () => {
  let fixture: ComponentFixture<AdminLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminLayoutComponent, StubAdminChildComponent],
      providers: [provideRouter(ADMIN_CHILD_ROUTES), provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminLayoutComponent);
    fixture.detectChanges();
  });

  it('should render topbar, sidebar and router outlet', () => {
    const rootElement = fixture.nativeElement as HTMLElement;

    expect(rootElement.querySelector('[data-testid="admin-topbar"]')).not.toBeNull();
    expect(rootElement.querySelector('[data-testid="admin-sidebar"]')).not.toBeNull();
    expect(rootElement.querySelector('router-outlet')).not.toBeNull();
  });

  it('should render the exact five sidebar sections', () => {
    const rootElement = fixture.nativeElement as HTMLElement;
    const sidebarLabels = Array.from(
      rootElement.querySelectorAll('[data-testid="admin-sidebar-item-label"]'),
    ).map((item) => item.textContent?.trim());

    expect(sidebarLabels).toEqual([
      'Principal',
      'Documentos',
      'Agente',
      'Usuarios y Permisos',
      'Monitoreo',
    ]);
  });

  it('should wire routerLink and routerLinkActive for each sidebar item', async () => {
    const router = TestBed.inject(Router);

    await router.navigateByUrl('/admin/agente');
    fixture.detectChanges();

    const routerLinkElements = fixture.debugElement.queryAll(By.directive(RouterLink));
    const linksWithActiveDirective = routerLinkElements.filter(
      (element) => element.injector.get(RouterLinkActive, null) !== null,
    );
    const rootElement = fixture.nativeElement as HTMLElement;
    const activeLinks = rootElement.querySelectorAll('.admin-layout__nav-link--active');
    const activeLabel = activeLinks
      .item(0)
      ?.querySelector('[data-testid="admin-sidebar-item-label"]')
      ?.textContent?.trim();

    expect(routerLinkElements.length).toBe(5);
    expect(linksWithActiveDirective.length).toBe(5);
    expect(activeLinks.length).toBe(1);
    expect(activeLabel).toBe('Agente');
  });

  it('should style layout with global design tokens', () => {
    const styles = (AdminLayoutComponent as unknown as { ɵcmp: { styles: string[] } }).ɵcmp.styles.join(' ');

    expect(styles).toContain('var(--clr-');
    expect(styles).toContain('var(--sp-');
    expect(styles).toContain('var(--fs-');
    expect(styles).not.toMatch(/\b\d+px\b/);
    expect(styles).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(styles).not.toMatch(/rgba?\(/);
  });
});

describe('AdminLayoutComponent /admin/documentos integration', () => {
  let fixture: ComponentFixture<RouterHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterHostComponent, AdminLayoutComponent],
      providers: [
        provideRouter(ADMIN_LAYOUT_INTEGRATION_ROUTES),
        provideZonelessChangeDetection(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RouterHostComponent);
  });

  it('should navigate to /admin/documentos and render the document shell inside the admin layout', async () => {
    const router = TestBed.inject(Router);

    await router.navigateByUrl('/admin/documentos');
    fixture.detectChanges();

    const rootElement = fixture.nativeElement as HTMLElement;
    const documentShell = rootElement.querySelector('app-admin-documents-shell');

    expect(rootElement.querySelector('[data-testid="admin-topbar"]')).not.toBeNull();
    expect(rootElement.querySelector('[data-testid="admin-sidebar"]')).not.toBeNull();
    expect(documentShell).not.toBeNull();
    expect(documentShell?.querySelector('[data-testid="documents-shell"]')).not.toBeNull();
  });
});
