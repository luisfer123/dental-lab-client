import { Routes } from '@angular/router';
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
        children: [
            {
                path: '',
                loadComponent: () => import('./features/works/components/work-list/work-list.component')
                    .then(m => m.WorkListComponent)
            },
            {
                path: 'new',
                loadComponent: () => import('./features/works/components/work-new/work-new.component')
                    .then(m => m.WorkNewComponent)
            },
            {
                path: ':id',
                loadComponent: () => import('./features/works/components/work-detail/work-detail.component')
                    .then(m => m.WorkDetailComponent)
            }
        ]
    },
    {
        path: 'orders',
        loadChildren: () =>
            import('./features/orders/order.routes')
            .then(r => r.ORDER_ROUTES)
    }
];