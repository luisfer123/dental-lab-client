import { Component, OnInit } from '@angular/core';
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
  clients: Client[] = [];
  loading = true;
  error?: string;

  // Pagination
  page = 0;
  size = 10;
  totalElements = 0;
  totalPages = 0;

  // Filter
  selectedFilter: ClientFilter = 'all';

  constructor(
    private clientService: ClientService, 
    private router: Router,
    private route: ActivatedRoute) {}

  ngOnInit(): void {
    // leer el query param al entrar
    this.route.queryParamMap.subscribe(params => {
      const filter = params.get('filter') as ClientFilter | null;
      const page = Number(params.get('page')) || 0;

      if (filter === 'dentists' || filter === 'students' || filter === 'technicians' || filter === 'all') {
        this.selectedFilter = filter;
      } else {
        this.selectedFilter = 'all';
      }
      this.page = page;
      this.loadClients();
    });
  }

  loadClients(): void {
    this.loading = true;
    this.error = undefined;

    let request$;

    switch (this.selectedFilter) {
      case 'dentists':
        request$ = this.clientService.getDentistsPaged(this.page, this.size);
        break;
      case 'students':
        request$ = this.clientService.getStudentsPaged(this.page, this.size);
        break;
      case 'technicians':
        request$ = this.clientService.getTechniciansPaged(this.page, this.size);
        break;
      default:
        request$ = this.clientService.getAllPaged(this.page, this.size);
    }

    request$.subscribe({
      next: (data: Page<Client> | null) => {
        if (!data) {
          this.clients = [];
          this.totalElements = 0;
          this.totalPages = 0;
        } else {
          this.clients = data.content ?? [];
          this.totalElements = data.totalElements ?? 0;
          this.totalPages = data.totalPages ?? 0;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading clients', err);
        this.error = 'Could not load clients';
        this.loading = false;
      }
    });
  }

  // Filter change
  onFilterChange(filter: ClientFilter): void {
    this.selectedFilter = filter;
    this.page = 0;
    this.loadClients();
  }

  // Navigation
  goToDetails(id: number): void {
    this.router.navigate(['/clients', id], {
      queryParams: { filter: this.selectedFilter, page: this.page }
    });
  }

  // Pagination
  nextPage(): void {
    if (this.page + 1 < this.totalPages) {
      this.page++;
      this.loadClients();
      this.updateUrlParams();
    }
  }

  prevPage(): void {
    if (this.page > 0) {
      this.page--;
      this.loadClients();
      this.updateUrlParams();
    }
  }

  goToPage(p: number): void {
    if (p >= 0 && p < this.totalPages) {
      this.page = p;
      this.loadClients();
      this.updateUrlParams();
    }
  }

  updateUrlParams(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { filter: this.selectedFilter, page: this.page },
      queryParamsHandling: 'merge'
    });
  }
}
