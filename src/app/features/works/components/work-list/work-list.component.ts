import { Component, DestroyRef, OnInit, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

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
    // Efecto reactivo que solo recarga datos
    effect((onCleanup) => {
      this.fetchWorks(onCleanup);
    }, {allowSignalWrites: true});
  }

  /* ==========================================================
     INIT
  ========================================================== */
  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;
    this.parseQueryParams(params);
  }

  /* ==========================================================
     PARSE QUERYPARAMS
  ========================================================== */
  private parseQueryParams(params: any): void {
    const familyParam = params.get('family')?.toUpperCase() as WorkFamily;
    this.selectedWorkFamily.set(
      ALLOWED_FAMILIES.includes(familyParam) ? familyParam : 'ALL'
    );

    this.page.set(Number(params.get('page')) || 0);

    this.selectedType.set(params.get('type') || 'ALL');
    this.selectedStatus.set(params.get('status') || 'ALL');
    this.searchTerm.set(params.get('search') || '');

    const cid = params.get('clientId');
    this.clientId.set(cid && cid !== 'null' ? +cid : undefined);
  }

  /* ==========================================================
     LOAD WORKS (Reactive with cleanup)
  ========================================================== */
  private fetchWorks(onCleanup: (fn: () => void) => void): void {
    this.loading.set(true);
    this.error.set(undefined);

    const family =
      this.selectedWorkFamily() !== 'ALL' ? this.selectedWorkFamily() : undefined;
    const type =
      this.selectedType() !== 'ALL' ? this.selectedType() : undefined;
    const status =
      this.selectedStatus() !== 'ALL' ? this.selectedStatus() : undefined;

    const p = this.page();
    const s = this.size();

    const sub = this.workService
      .getAll(p, s, 'createdAt,desc', family, type, status, this.clientId())
      .subscribe({
        next: (data: Page<Work>) => {
          this.works.set(data?.content ?? []);
          this.totalElements.set(data?.totalElements ?? 0);
          this.totalPages.set(data?.totalPages ?? 1);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.error.set('No se pudieron cargar los trabajos.');
        }
      });

    // Cleanup de la suscripción si el effect se vuelve a ejecutar
    onCleanup(() => sub.unsubscribe());
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

  onSearch(): void {
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

  /* ==========================================================
     REFRESH
  ========================================================== */
  reload(): void {
    this.fetchWorks(() => {});
  }
}
