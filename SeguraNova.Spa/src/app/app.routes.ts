import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
    {'path': 'login', 'loadComponent': () => import('./Pages/login/login.component').then(m => m.LoginComponent)},
    {'path': 'admin', 'canActivate': [authGuard], 'loadComponent': () => import('./Pages/dashboard/dashboard.component').then(m => m.DashboardComponent)},
    {'path': 'chat', 'canActivate': [authGuard], 'loadComponent': () => import('./Pages/dashboard/dashboard.component').then(m => m.DashboardComponent)},
    {'path': 'dashboard', 'canActivate': [authGuard], 'loadComponent': () => import('./Pages/dashboard/dashboard.component').then(m => m.DashboardComponent)},
    {'path': '**', 'redirectTo': 'login'},
    {'path': '', 'redirectTo': 'login', 'pathMatch': 'full'}
];
