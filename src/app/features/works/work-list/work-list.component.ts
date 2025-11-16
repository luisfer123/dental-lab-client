import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkService } from '../services/work.service';
import { Work } from '../models/work.model';
import { Page } from 'src/app/shared/models/page.model';

/** Broad categories of work (work family) */
type WorkFamily = 'ALL' | 'FIXED_PROSTHESIS' | 'REMOVABLE_PROSTHESIS' | 'FULL_DENTURE';

@Component({
  selector: 'app-work-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './work-list.component.html',
  styleUrls: ['./work-list.component.scss']
})
export class WorkListComponent implements OnInit {

  /* ==========================================================
     STATE
  ========================================================== */
  works: Work[] = [];
  loading = true;
  error?: string;

  // Pagination
  page = 0;
  size = 10;
  totalElements = 0;
  totalPages = 0;

  // Filters
  selectedWorkFamily: WorkFamily = 'ALL';
  selectedType = 'ALL';
  selectedStatus = 'ALL';
  searchTerm = '';
  clientId?: number;

  constructor(
    private workService: WorkService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  /* ==========================================================
     INIT
  ========================================================== */
  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const familyParam = params.get('family');
      const family = (familyParam?.toUpperCase() as WorkFamily) || 'ALL';
      const page = Number(params.get('page')) || 0;
      const type = params.get('type');
      const status = params.get('status');
      const search = params.get('search');
      const clientId = params.get('clientId');

      // Apply values to component state
      if (['ALL', 'FIXED_PROSTHESIS', 'REMOVABLE_PROSTHESIS', 'FULL_DENTURE'].includes(family)) {
        this.selectedWorkFamily = family as WorkFamily;
      } else {
        this.selectedWorkFamily = 'ALL';
      }

      this.page = page;
      if (status) this.selectedStatus = status;
      if (type) this.selectedType = type;
      if (search) this.searchTerm = search;
      if (clientId) this.clientId = +clientId;

      this.loadWorks();
    });
  }

  /* ==========================================================
     LOAD DATA
  ========================================================== */
  loadWorks(): void {
    this.loading = true;
    this.error = undefined;

    // The back end does not support filtering by 'ALL', so we pass undefined
    const family = this.selectedWorkFamily !== 'ALL' ? this.selectedWorkFamily : undefined;
    const type = this.selectedType !== 'ALL' ? this.selectedType : undefined;
    const status = this.selectedStatus !== 'ALL' ? this.selectedStatus : undefined;

    this.workService
      .getAll(this.page, this.size, 'createdAt,desc', family, type, status, this.clientId)
      .subscribe({
        next: (worksPage: Page<Work>) => {
          // Since backend may return paginated or simple array, handle both
          if (worksPage && Array.isArray(worksPage.content)) {
            this.works = worksPage.content;
            this.totalElements = worksPage.totalElements;
            this.totalPages = 1;
          } else {
            this.works = [];
            this.totalElements = 0;
            this.totalPages = 0;
          }
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading works', err);
          this.error = 'No se pudieron cargar los trabajos.';
          this.loading = false;
        }
      });
  }

  /* ==========================================================
     FILTERS
  ========================================================== */
  onFamilyChange(family?: WorkFamily): void {
    if (family) this.selectedWorkFamily = family;

    if(this.selectedWorkFamily !== 'FIXED_PROSTHESIS') this.resetWorkFamilyFilters();
    
    this.page = 0;
    this.updateUrlParams();
    this.loadWorks();
  }

  resetWorkFamilyFilters(): void {
    this.selectedType = 'ALL';
    this.selectedStatus = 'ALL';
    this.searchTerm = '';
  }

  onFilterChange(): void {
    this.page = 0;
    this.updateUrlParams();
    this.loadWorks();
  }

  onSearch(): void {
    this.page = 0;
    this.updateUrlParams();
    this.loadWorks();
  }

  /* ==========================================================
     NAVIGATION
  ========================================================== */
  goToDetails(id: number): void {
    this.router.navigate(['/works', id], {
      queryParams: {
        family: this.selectedWorkFamily,
        page: this.page
      }
    });
  }

  /* ==========================================================
     PAGINATION
  ========================================================== */
  nextPage(): void {
    if (this.page + 1 < this.totalPages) {
      this.page++;
      this.updateUrlParams();
      this.loadWorks();
    }
  }

  prevPage(): void {
    if (this.page > 0) {
      this.page--;
      this.updateUrlParams();
      this.loadWorks();
    }
  }

  goToPage(p: number): void {
    if (p >= 0 && p < this.totalPages) {
      this.page = p;
      this.updateUrlParams();
      this.loadWorks();
    }
  }

  /* ==========================================================
     URL SYNC
  ========================================================== */
  updateUrlParams(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        family: this.selectedWorkFamily,
        page: this.page,
        type: this.selectedType !== 'ALL' ? this.selectedType : null,
        status: this.selectedStatus !== 'ALL' ? this.selectedStatus : null,
        search: this.searchTerm?.trim() || null,
        clientId: this.clientId ?? null
      },
      queryParamsHandling: 'merge'
    });
  }

  /* ==========================================================
     REFRESH
  ========================================================== */
  reload(): void {
    this.loadWorks();
  }
}
