import { Routes } from "@angular/router";

export const ORDER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/order-list/order-list.component')
        .then(m => m.OrderListComponent)
  },
//   {
//     path: 'new',
//     loadComponent: () =>
//       import('./components/order-new/order-new.component')
//         .then(m => m.OrderNewComponent)
//   },
  {
    path: ':id',
    loadComponent: () =>
      import('./components/order-detail/order-detail.component')
        .then(m => m.OrderDetailComponent)
  }
];
