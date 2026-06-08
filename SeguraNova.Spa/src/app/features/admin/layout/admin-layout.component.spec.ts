import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { AdminLayoutComponent } from './admin-layout.component';

describe('AdminLayoutComponent (T1)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminLayoutComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
  });

  it('should render topbar, sidebar and main content', () => {
    const fixture = TestBed.createComponent(AdminLayoutComponent);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;

    const topbar = el.querySelector('[role="banner"], [data-testid="admin-topbar"], .admin-topbar, .admin-layout__topbar');
    const sidebar = el.querySelector('[role="navigation"], [data-testid="admin-sidebar"], .admin-sidebar, .admin-layout__sidebar');
    const main = el.querySelector('[role="main"], .admin-main, .admin-layout__content');

    expect(topbar).toBeTruthy();
    expect(sidebar).toBeTruthy();
    expect(main).toBeTruthy();
  });
});
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AdminLayoutComponent } from './admin-layout.component';
import { DashboardComponent } from '../../../Pages/dashboard/dashboard.component';

describe('AdminLayoutComponent (UX)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminLayoutComponent, RouterTestingModule.withRoutes([
        { path: 'admin', component: DashboardComponent },
      ])]
    }).compileComponents();
  });

  it('renders topbar, sidebar and main content (R1)', () => {
    const fixture = TestBed.createComponent(AdminLayoutComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.admin-topbar')).toBeTruthy();
    expect(el.querySelector('.admin-sidebar')).toBeTruthy();
    expect(el.querySelector('.admin-main')).toBeTruthy();
  });

  it('marks link active when navigating to admin (R2)', async () => {
    const router = TestBed.inject(Router);
    const fixture = TestBed.createComponent(AdminLayoutComponent);
    await router.navigate(['/admin']);
    fixture.detectChanges();
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const active = el.querySelector('.nav-link.active');
    expect(active).toBeTruthy();
    expect(active?.textContent).toContain('Dashboard');
  });

  it('adds is-mobile class for small viewport (R4)', () => {
    (global as any).innerWidth = 360;
    global.dispatchEvent(new Event('resize'));
    const fixture = TestBed.createComponent(AdminLayoutComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.admin-layout')?.classList.contains('is-mobile')).toBeTrue();

    const body = el.querySelector('.admin-body') as HTMLElement | null;
    if (body) {
      const style = getComputedStyle(body);
      expect(style.flexDirection === 'column' || style.flexDirection === 'column-reverse').toBeTrue();
    }
  });
});
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
    expect(styles).toContain('--neu-');
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
