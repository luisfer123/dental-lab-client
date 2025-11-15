import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { LoginComponent } from './features/auth/login/login.component';

export const routes: Routes = [
    { path: 'auth/login', component: LoginComponent },
    {
        path: 'clients',
        loadChildren: () => import('./features/clients/client.routes').then(m => m.CLIENT_ROUTES)
    },
     {
        path: 'works',
        loadComponent: () =>
        import('./features/works/work-list/work-list.component')
            .then(m => m.WorkListComponent)
    },
//   { path: 'auth', loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule) },
//   {
//     path: 'worker',
//     canActivate: [authGuard],
//     loadChildren: () => import('./features/worker/worker.module').then(m => m.WorkerModule)
//   },
//   {
//     path: 'admin',
//     canActivate: [authGuard, roleGuard],
//     data: { roles: ['ROLE_ADMIN'] },
//     loadChildren: () => import('./features/admin/admin.module').then(m => m.AdminModule)
//   },
//   { path: '', redirectTo: '/auth/login', pathMatch: 'full' },
//   { path: '**', redirectTo: '/auth/login' }
];
