import { Component, DestroyRef, OnInit, signal, computed, effect, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
     CONSTANTS
  ========================================================== */
  private readonly VALID_FILTERS: ClientFilter[] = [
    'all', 'dentists', 'students', 'technicians'
  ];

  /* ==========================================================
     COMPUTED
  ========================================================== */
  pages = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i)
  );

  /* ==========================================================
     TRACK FUNCTIONS
  ========================================================== */
  trackClient = (_: number, item: Client) => item.id;
  trackIndex = (i: number) => i;

  constructor(
    private clientService: ClientService,
    private router: Router,
    private route: ActivatedRoute,
    private destroyRef: DestroyRef
  ) {
    // Efecto reactivo que recarga datos cuando cambian los filtros
    effect(() => {
      // Capturar valores de las señales para trackearlas
      const filter = this.selectedFilter();
      const page = this.page();
      const size = this.size();

      // Pasar los valores directamente para evitar lecturas adicionales
      this.loadClientsWithParams(filter, page, size);
    }, { allowSignalWrites: true }); // Permitir escrituras en señales durante la carga
  }

  /* ==========================================================
     INIT
  ========================================================== */
  ngOnInit(): void {
    // Parsear parámetros iniciales
    const params = this.route.snapshot.queryParamMap;
    
    untracked(() => {
      this.parseQueryParams(params);
    });

    // Escuchar cambios en los query params (navegación desde navbar u otros componentes)
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        untracked(() => {
          this.parseQueryParams(params);
        });
      });
  }

  /* ==========================================================
     PARSE QUERYPARAMS
  ========================================================== */
  private parseQueryParams(params: any): void {
    const filterParam = params.get('filter') as ClientFilter;
    const pageParam = Number(params.get('page')) || 0;

    this.selectedFilter.set(
      this.VALID_FILTERS.includes(filterParam)
        ? filterParam
        : 'all'
    );
    
    // Validar que la página sea válida
    this.page.set(Math.max(0, pageParam));
  }

  /* ==========================================================
     LOAD CLIENTS
  ========================================================== */
  private loadClients(): void {
    const filter = this.selectedFilter();
    const page = this.page();
    const size = this.size();
    this.loadClientsWithParams(filter, page, size);
  }

  private loadClientsWithParams(filter: ClientFilter, page: number, size: number): void {
    this.loading.set(true);
    this.error.set(undefined);

    const requestMap: Record<ClientFilter, () => any> = {
      dentists: () => this.clientService.getDentistsPaged(page, size),
      students: () => this.clientService.getStudentsPaged(page, size),
      technicians: () => this.clientService.getTechniciansPaged(page, size),
      all: () => this.clientService.getAllPaged(page, size)
    };

    requestMap[filter]()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data: Page<Client>) => {
          this.clients.set(data?.content ?? []);
          this.totalElements.set(data?.totalElements ?? 0);
          this.totalPages.set(data?.totalPages ?? 1);
          this.loading.set(false);

          // Si la página actual excede el total de páginas, ajustar
          if (this.page() >= this.totalPages() && this.totalPages() > 0) {
            this.page.set(Math.max(0, this.totalPages() - 1));
          }
        },
        error: (err: any) => {
          console.error('Error loading clients:', err);
          this.error.set('No se pudieron cargar los clientes');
          this.loading.set(false);
        }
      });
  }

  /* ==========================================================
     FILTERS
  ========================================================== */
  onFilterChange(filter: ClientFilter): void {
    if (!this.VALID_FILTERS.includes(filter)) {
      console.warn(`Invalid filter: ${filter}`);
      return;
    }

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
  private updateUrlParams(): void {
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

  goToNewClient(): void {
    this.router.navigate(['/clients/new']);
  }

  /* ==========================================================
     REFRESH
  ========================================================== */
  reload(): void {
    this.loadClients();
  }

  /* ==========================================================
     UTILITY
  ========================================================== */
  getFilterLabel(filter: ClientFilter): string {
    const labels: Record<ClientFilter, string> = {
      all: 'Todos',
      dentists: 'Dentistas',
      students: 'Estudiantes',
      technicians: 'Técnicos'
    };
    return labels[filter];
  }
}