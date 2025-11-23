import { Component, DestroyRef, OnInit, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ClientService } from '../../services/client.service';
import { Client } from '../../models/client.model';
import { Page } from '../../../../shared/models/page.model';

type ClientFilter = 'all' | 'dentists' | 'students' | 'technicians';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './client-list.component.html',
  styleUrls: ['./client-list.component.scss']
})
export class ClientListComponent implements OnInit {

  /* ==========================================================
     SIGNAL STATE
  ========================================================== */
  clients = signal<Client[]>([]);
  loading = signal(true);
  error = signal<string | undefined>(undefined);

  page = signal(0);
  size = signal(10);
  totalElements = signal(0);
  totalPages = signal(1);

  selectedFilter = signal<ClientFilter>('all');

  /* ==========================================================
     VALID FILTERS (para validación estricta)
  ========================================================== */
  private readonly VALID_FILTERS: ClientFilter[] = [
    'all', 'dentists', 'students', 'technicians'
  ];

  /* ==========================================================
     COMPUTED HELPERS (opcional pero recomendado)
  ========================================================== */
  pages = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i)
  );

  constructor(
    private clientService: ClientService,
    private router: Router,
    private route: ActivatedRoute,
    private destroyRef: DestroyRef
  ) {
    // Efecto reactivo: carga clientes cuando cambia filter/page
    effect((onCleanup) => {
      this.loadClients(onCleanup);
    }, {allowSignalWrites: true});
  }

  /* ==========================================================
     INIT
  ========================================================== */
  ngOnInit(): void {
    this.parseQueryParams(this.route.snapshot.queryParamMap);
  }

  /* ==========================================================
     PARSE QUERYPARAMS
  ========================================================== */
  private parseQueryParams(params: any): void {
    // Filtrar el valor inicial estrictamente
    const filterParam = params.get('filter') as ClientFilter;
    const pageParam = Number(params.get('page')) || 0;

    this.selectedFilter.set(
      this.VALID_FILTERS.includes(filterParam)
        ? filterParam
        : 'all'
    );
    this.page.set(pageParam);
  }

  /* ==========================================================
     LOAD DATA (Reactive)
  ========================================================== */
  private loadClients(onCleanup: (fn: () => void) => void): void {
    this.loading.set(true);
    this.error.set(undefined);

    const filter = this.selectedFilter();
    const p = this.page();
    const s = this.size();

    const requestMap: Record<ClientFilter, () => any> = {
      dentists: () => this.clientService.getDentistsPaged(p, s),
      students: () => this.clientService.getStudentsPaged(p, s),
      technicians: () => this.clientService.getTechniciansPaged(p, s),
      all: () => this.clientService.getAllPaged(p, s)
    };

    const sub = requestMap[filter]().subscribe({
      next: (data: Page<Client>) => {
        this.clients.set(data?.content ?? []);
        this.totalElements.set(data?.totalElements ?? 0);
        this.totalPages.set(data?.totalPages ?? 1);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load clients');
        this.loading.set(false);
      }
    });

    // Cleanup para evitar memory leaks en effects
    onCleanup(() => sub.unsubscribe());
  }

  /* ==========================================================
     FILTER CHANGE
  ========================================================== */
  onFilterChange(filter: ClientFilter): void {
    this.selectedFilter.set(filter);
    this.page.set(0);
    this.updateUrlParams();
  }

  /* ==========================================================
     PAGINATION
  ========================================================== */
  nextPage(): void {
    if (this.page() + 1 < this.totalPages()) {
      this.page.update(p => p + 1);
      this.updateUrlParams();
    }
  }

  prevPage(): void {
    if (this.page() > 0) {
      this.page.update(p => p - 1);
      this.updateUrlParams();
    }
  }

  goToPage(p: number): void {
    if (p >= 0 && p < this.totalPages()) {
      this.page.set(p);
      this.updateUrlParams();
    }
  }

  /* ==========================================================
     URL SYNC
  ========================================================== */
  updateUrlParams(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        filter: this.selectedFilter(),
        page: this.page(),
      },
      queryParamsHandling: 'merge'
    });
  }

  /* ==========================================================
     NAVIGATION
  ========================================================== */
  goToDetails(id: number): void {
    this.router.navigate(['/clients', id], {
      queryParams: {
        filter: this.selectedFilter(),
        page: this.page()
      }
    });
  }
}
