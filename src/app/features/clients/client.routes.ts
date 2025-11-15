import { Routes } from '@angular/router';
import { ClientListComponent } from './components/client-list/client-list.component';
import { ClientDetailComponent } from './components/client-detail/client-detail.component';
import { ClientFormComponent } from './components/client-form/client-form.component';

export const CLIENT_ROUTES: Routes = [
  { path: '', component: ClientListComponent },
  { path: 'new', component: ClientFormComponent },
  { path: ':id', component: ClientDetailComponent },
];
