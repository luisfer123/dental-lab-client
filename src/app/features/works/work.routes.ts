import { Routes } from "@angular/router";
import { WorkListComponent } from "./components/work-list/work-list.component";
import { WorkDetailComponent } from "./components/work-detail/work-detail.component";

export const Work_ROUTES: Routes = [
    {path: '', component: WorkListComponent},
    {path: ':id', component: WorkDetailComponent}
];
