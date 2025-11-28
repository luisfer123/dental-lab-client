import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkOrderService } from '../../services/work-order.service';
import { Work } from 'src/app/features/works/models/work.model';
import { WorkService } from 'src/app/features/works/services/work.service';
import { FullWorkOrder } from 'src/app/features/works/models/full-work-order.model';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss']
})
export class OrderDetailComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private orderService = inject(WorkOrderService);
  private workService = inject(WorkService);

  order = signal<FullWorkOrder | null>(null);
  works = signal<Work[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  orderId!: number;

  ngOnInit(): void {
    this.orderId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadOrder();
    this.loadWorks();
  }

  loadOrder() {
    this.loading.set(true);
    this.orderService.getOrder(this.orderId).subscribe({
      next: data => {
        this.order.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la orden.');
        this.loading.set(false);
      }
    });
  }

  loadWorks() {
    this.workService.getWorksByOrder(this.orderId).subscribe({
      next: data => this.works.set(data),
      error: () => this.error.set('No se pudieron cargar los trabajos de la orden.')
    });
  }

  addWorkToOrder() {
    const o = this.order();
    if (!o) return;

    this.router.navigate(['/works/new'], {
      queryParams: {
        clientId: o.clientId,
        orderId: o.id
      }
    });
  }

  markDelivered() {
    if (!confirm('¿Marcar esta orden como entregada?')) return;

    this.orderService.markAsDelivered(this.orderId).subscribe({
      next: updated => {
        this.order.set(updated);
      },
      error: () => {
        this.error.set('No se pudo marcar como entregada.');
      }
    });
  }

  goToWorkDetail(id: number) {
    this.router.navigate(['']);
  }

  goBack() {
    this.router.navigate(['/orders']);
  }

}
