import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AdminLayoutComponent } from './admin-layout.component';
import { DashboardComponent } from '../../../Pages/dashboard/dashboard.component';

describe('AdminLayout Navigation (T3)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminLayoutComponent, RouterTestingModule.withRoutes([
        { path: 'admin', component: DashboardComponent },
        { path: 'admin/principal', component: DashboardComponent },
      ])]
    }).compileComponents();
  });

  it('applies active class to the matching sidebar link', async () => {
    const router = TestBed.inject(Router);
    const fixture = TestBed.createComponent(AdminLayoutComponent);
    await router.navigateByUrl('/admin/principal');
    fixture.detectChanges();
    await fixture.whenStable();

    const el = fixture.nativeElement as HTMLElement;
    const active = el.querySelector('.admin-nav-link--active');

    expect(active).toBeTruthy();
    expect(active?.textContent).toContain('Principal');
  });
});
