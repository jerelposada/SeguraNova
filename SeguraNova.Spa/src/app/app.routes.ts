import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

function loadAdminLayoutComponent() {
    return import('./features/admin/layout/admin-layout.component').then(m => m.AdminLayoutComponent);
}

export function loadAdminHomeComponent() {
    return import('./Pages/dashboard/dashboard.component').then(m => m.DashboardComponent);
}

export function loadAdminDocumentsShellComponent() {
    return import('./features/admin/pages/admin-documents-shell.component').then(m => m.AdminDocumentsShellComponent);
}

export function loadAdminAgentShellComponent() {
    return import('./features/admin/pages/admin-agent-shell.component').then(m => m.AdminAgentShellComponent);
}

export function loadAdminUsersPermissionsShellComponent() {
    return import('./features/admin/pages/admin-users-permissions-shell.component').then(m => m.AdminUsersPermissionsShellComponent);
}

export function loadAdminMonitoringShellComponent() {
    return import('./features/admin/pages/admin-monitoring-shell.component').then(m => m.AdminMonitoringShellComponent);
}

export const ADMIN_ROUTES: Routes = [
    {'path': '', 'pathMatch': 'full', 'loadComponent': loadAdminHomeComponent},
    {'path': 'principal', 'loadComponent': loadAdminHomeComponent},
    {'path': 'documentos', 'loadComponent': loadAdminDocumentsShellComponent},
    {'path': 'agente', 'loadComponent': loadAdminAgentShellComponent},
    {'path': 'usuarios-permisos', 'loadComponent': loadAdminUsersPermissionsShellComponent},
    {'path': 'monitoreo', 'loadComponent': loadAdminMonitoringShellComponent}
];

export const routes: Routes = [
    {'path': 'login', 'loadComponent': () => import('./Pages/login/login.component').then(m => m.LoginComponent)},
    {
        'path': 'admin',
        'canActivate': [authGuard],
        'loadComponent': loadAdminLayoutComponent,
        'children': ADMIN_ROUTES
    },
    {'path': 'chat', 'canActivate': [authGuard], 'loadComponent': () => import('./Pages/dashboard/dashboard.component').then(m => m.DashboardComponent)},
    {'path': 'dashboard', 'canActivate': [authGuard], 'loadComponent': () => import('./Pages/dashboard/dashboard.component').then(m => m.DashboardComponent)},
    {'path': '**', 'redirectTo': 'login'},
    {'path': '', 'redirectTo': 'login', 'pathMatch': 'full'}
];
