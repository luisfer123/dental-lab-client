import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { WorkOrderService } from '../../services/work-order.service';
import { WorkOrder } from 'src/app/features/works/models/work-order.model';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss']
})
export class OrderListComponent implements OnInit {

  private orderService = inject(WorkOrderService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  orders = signal<WorkOrder[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  // Pagination
  page = signal(0);
  size = signal(10);
  totalPages = signal(0);

  // Optional filter by clientId
  clientId = signal<number | null>(null);

  ngOnInit(): void {
    // Leer clientId opcional de query params (para lista desde client-detail)
    this.route.queryParamMap.subscribe(params => {
      const cid = params.get('clientId');
      if (cid) {
        this.clientId.set(Number(cid));
        this.page.set(0); // reset page if filter changes
      }
      this.loadOrders();
    });
  }

  loadOrders() {
    this.loading.set(true);
    this.error.set(null);

    const page = this.page();
    const size = this.size();
    const sort = 'createdAt,desc';

    if (this.clientId()) {
      // Get orders filtered by client
      this.orderService
        .getOrdersByClient(this.clientId()!, page, size, sort)
        .subscribe({
          next: data => {
            this.orders.set(data.content);
            this.totalPages.set(data.totalPages);
            this.loading.set(false);
          },
          error: () => {
            this.error.set('Error al cargar órdenes.');
            this.loading.set(false);
          }
        });
    } else {
      // Get all orders
      this.orderService
        .getAll(page, size, sort)
        .subscribe({
          next: data => {
            this.orders.set(data.content);
            this.totalPages.set(data.totalPages);
            this.loading.set(false);
          },
          error: () => {
            this.error.set('Error al cargar órdenes.');
            this.loading.set(false);
          }
        });
    }
  }

  // Navigation
  viewOrder(orderId: number) {
    this.router.navigate(['/orders', orderId]);
  }

  createOrder() {
    this.router.navigate(['/orders/new']);
  }

  // Pagination controls
  goToPage(p: number) {
    if (p < 0 || p >= this.totalPages()) return;
    this.page.set(p);
    this.loadOrders();
  }

  nextPage() { this.goToPage(this.page() + 1); }
  prevPage() { this.goToPage(this.page() - 1); }

}
