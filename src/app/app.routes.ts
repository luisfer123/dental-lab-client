import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { LoginComponent } from './features/auth/login/login.component';

export const routes: Routes = [
    { path: 'auth/login', component: LoginComponent },
    {
        path: 'clients',
        loadChildren: () => 
            import('./features/clients/client.routes')
            .then(m => m.CLIENT_ROUTES)
    },
    {
        path: 'works',
        loadChildren: () => 
            import('./features/works/work.routes')
            .then(m => m.Work_ROUTES)
    }
];
