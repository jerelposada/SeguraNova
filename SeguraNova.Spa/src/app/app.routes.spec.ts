import { authGuard } from './core/auth/auth.guard';
import { routes } from './app.routes';

describe('app routes auth guard', () => {
  const protectedPaths = ['admin', 'chat', 'dashboard'];

  protectedPaths.forEach((path) => {
    it(`should protect ${path} route with authGuard`, () => {
      const route = routes.find((currentRoute) => currentRoute.path === path);

      expect(route).toBeDefined();
      expect(route?.canActivate).toContain(authGuard);
    });
  });
});
