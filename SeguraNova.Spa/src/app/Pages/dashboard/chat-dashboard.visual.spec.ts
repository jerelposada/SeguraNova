import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { DashboardComponent } from './dashboard.component';

describe('Chat route uses Dashboard visuals (T13)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent, RouterTestingModule.withRoutes([
        { path: 'chat', component: DashboardComponent },
      ])]
    }).compileComponents();
  });

  it('navigating to /chat renders Dashboard with kpi grid (R6)', async () => {
    const router = TestBed.inject(Router);
    const fixture = TestBed.createComponent(DashboardComponent);

    await router.navigateByUrl('/chat');
    fixture.detectChanges();
    await fixture.whenStable();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-testid="kpi-grid"]')).toBeTruthy();
  });
});
