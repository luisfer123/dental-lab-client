import { Routes } from "@angular/router";
import { WorkListComponent } from "./components/work-list/work-list.component";
import { WorkDetailComponent } from "./components/work-detail/work-detail.component";
import { WorkNewComponent } from "./components/work-new/work-new.component";

export const WORK_ROUTES: Routes = [
    {
        path: '', 
        loadComponent: () => import('./components/work-list/work-list.component')
            .then(m => m.WorkListComponent)
    },
    {
        path: 'new', 
        loadComponent: () => import('./components/work-new/work-new.component')
            .then(m => m.WorkNewComponent)
    },
    {
        path: ':id', 
        loadComponent: () => import('./components/work-detail/work-detail.component')
            .then(m => m.WorkDetailComponent)
    }
    
];
