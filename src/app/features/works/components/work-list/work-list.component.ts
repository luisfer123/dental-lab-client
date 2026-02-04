import { Component, DestroyRef, OnInit, signal, computed, effect, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { WorkService } from '../../services/work.service';
import { Work } from '../../models/work.model';
import { Page } from 'src/app/shared/models/page.model';

/** Broad categories of work (work family) */
type WorkFamily =
  | 'ALL'
  | 'FIXED_PROSTHESIS'
  | 'REMOVABLE_PROSTHESIS'
  | 'FULL_DENTURE';

const ALLOWED_FAMILIES: WorkFamily[] = [
  'ALL',
  'FIXED_PROSTHESIS',
  'REMOVABLE_PROSTHESIS',
  'FULL_DENTURE'
];

@Component({
  selector: 'app-work-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './work-list.component.html',
  styleUrls: ['./work-list.component.scss']
})
export class WorkListComponent implements OnInit {

  /* ==========================================================
     SIGNAL STATE
  ========================================================== */
  works = signal<Work[]>([]);
  loading = signal(true);
  error = signal<string | undefined>(undefined);

  page = signal(0);
  size = signal(10);
  totalElements = signal(0);
  totalPages = signal(1);

  selectedWorkFamily = signal<WorkFamily>('ALL');
  selectedType = signal('ALL');
  selectedStatus = signal('ALL');
  searchTerm = signal('');
  clientId = signal<number | undefined>(undefined);

  /* ==========================================================
     SEARCH SUBJECT (para debouncing)
  ========================================================== */
  private searchSubject = new Subject<string>();

  /* ==========================================================
     COMPUTED & HELPERS
  ========================================================== */
  isFixed = computed(() => this.selectedWorkFamily() === 'FIXED_PROSTHESIS');

  trackWork = (_: number, item: Work) => item.id;
  trackIndex = (i: number) => i;

  pages = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i)
  );

  getStatusClass(status?: string): string {
    switch (status) {
      case 'DELIVERED':
      case 'COMPLETED':
        return 'bg-success';
      case 'IN_PROGRESS':
        return 'bg-warning';
      case 'PENDING':
      default:
        return 'bg-secondary';
    }
  }

  constructor(
    private workService: WorkService,
    private router: Router,
    private route: ActivatedRoute,
    private destroyRef: DestroyRef
  ) {
    // Configurar debouncing para búsqueda
    this.setupSearchDebounce();

    // Efecto reactivo que recarga datos cuando cambian los filtros
    effect(() => {
      // Capturar valores de las señales para trackearlas
      const family = this.selectedWorkFamily();
      const type = this.selectedType();
      const status = this.selectedStatus();
      const search = this.searchTerm();
      const page = this.page();
      const size = this.size();
      const clientId = this.clientId();

      // Pasar los valores directamente
      this.loadWorksWithParams(family, type, status, search, page, size, clientId);
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
     SEARCH DEBOUNCE SETUP
  ========================================================== */
  private setupSearchDebounce(): void {
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(term => {
        this.searchTerm.set(term);
        this.page.set(0);
        this.updateUrlParams();
      });
  }

  /* ==========================================================
     PARSE QUERYPARAMS
  ========================================================== */
  private parseQueryParams(params: any): void {
    const familyParam = params.get('family')?.toUpperCase() as WorkFamily;
    this.selectedWorkFamily.set(
      ALLOWED_FAMILIES.includes(familyParam) ? familyParam : 'ALL'
    );

    // Validar que la página sea válida
    const pageParam = Number(params.get('page')) || 0;
    this.page.set(Math.max(0, pageParam));

    this.selectedType.set(params.get('type') || 'ALL');
    this.selectedStatus.set(params.get('status') || 'ALL');
    this.searchTerm.set(params.get('search') || '');

    const cid = params.get('clientId');
    this.clientId.set(cid && cid !== 'null' ? +cid : undefined);
  }

  /* ==========================================================
     LOAD WORKS
  ========================================================== */
  private loadWorks(): void {
    const family = this.selectedWorkFamily();
    const type = this.selectedType();
    const status = this.selectedStatus();
    const search = this.searchTerm();
    const page = this.page();
    const size = this.size();
    const clientId = this.clientId();

    this.loadWorksWithParams(family, type, status, search, page, size, clientId);
  }

  private loadWorksWithParams(
    family: WorkFamily,
    type: string,
    status: string,
    search: string,
    page: number,
    size: number,
    clientId?: number
  ): void {
    this.loading.set(true);
    this.error.set(undefined);

    const familyParam = family !== 'ALL' ? family : undefined;
    const typeParam = type !== 'ALL' ? type : undefined;
    const statusParam = status !== 'ALL' ? status : undefined;

    this.workService
      .getAll(
        page,
        size,
        'createdAt,desc',
        familyParam,
        typeParam,
        statusParam,
        clientId
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data: Page<Work>) => {
          this.works.set(data?.content ?? []);
          this.totalElements.set(data?.totalElements ?? 0);
          this.totalPages.set(data?.totalPages ?? 1);
          this.loading.set(false);

          // Si la página actual excede el total de páginas, ajustar
          if (this.page() >= this.totalPages() && this.totalPages() > 0) {
            this.page.set(Math.max(0, this.totalPages() - 1));
          }
        },
        error: (err) => {
          console.error('Error loading works:', err);
          this.loading.set(false);
          this.error.set('No se pudieron cargar los trabajos.');
        }
      });
  }

  /* ==========================================================
     FILTERS
  ========================================================== */
  onFamilyChange(family: WorkFamily): void {
    this.selectedWorkFamily.set(family);
    this.page.set(0);

    if (family !== 'FIXED_PROSTHESIS') {
      this.resetWorkFamilyFilters();
    }

    this.updateUrlParams();
  }

  resetWorkFamilyFilters(): void {
    this.selectedType.set('ALL');
    this.selectedStatus.set('ALL');
    this.searchTerm.set('');
  }

  onFilterChange(): void {
    this.page.set(0);
    this.updateUrlParams();
  }

  onSearchInput(term: string): void {
    // Usar el subject para debouncing
    this.searchSubject.next(term);
  }

  onSearch(): void {
    // Búsqueda inmediata (por ejemplo, al presionar Enter)
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
        family: this.selectedWorkFamily(),
        page: this.page(),
        type: this.selectedType() !== 'ALL' ? this.selectedType() : null,
        status: this.selectedStatus() !== 'ALL' ? this.selectedStatus() : null,
        search: this.searchTerm().trim() || null,
        clientId: this.clientId() ?? null
      },
      queryParamsHandling: 'merge'
    });
  }

  /* ==========================================================
     NAVIGATION
  ========================================================== */
  goToDetails(id: number): void {
    this.router.navigate(['/works', id], {
      queryParams: {
        family: this.selectedWorkFamily(),
        page: this.page()
      }
    });
  }

  goToNewWork(): void {
    this.router.navigate(['/works/new']);
  }

  /* ==========================================================
     REFRESH
  ========================================================== */
  reload(): void {
    this.loadWorks();
  }
}