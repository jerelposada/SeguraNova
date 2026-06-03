import { Routes } from '@angular/router';

export const routes: Routes = [
    {'path': 'login', 'loadComponent': () => import('./Pages/login/login.component').then(m => m.LoginComponent)},
    {'path': 'dashboard', 'loadComponent': () => import('./Pages/dashboard/dashboard.component').then(m => m.DashboardComponent)},
    {'path': '**', 'redirectTo': 'login'},
    {'path': '', 'redirectTo': 'login', 'pathMatch': 'full'}
];
