import { Routes } from "@angular/router";
import { WorkListComponent } from "./components/work-list/work-list.component";
import { WorkDetailComponent } from "./components/work-detail/work-detail.component";
import { WorkNewComponent } from "./components/work-new/work-new.component";

export const Work_ROUTES: Routes = [
    {path: '', component: WorkListComponent},
    {path: 'new', component: WorkNewComponent},
    {path: ':id', component: WorkDetailComponent}
    
];
