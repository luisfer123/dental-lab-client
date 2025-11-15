import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientService } from '../../services/client.service';
import { ClientFull } from '../../models/client-full.model';

declare const bootstrap: any; // ✅ usar instancia global

@Component({
  selector: 'app-client-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './client-detail.component.html',
  styleUrls: ['./client-detail.component.scss']
})
export class ClientDetailComponent implements OnInit, AfterViewInit {
  client?: ClientFull;
  loading = true;
  error?: string;
  deleting = false;
  filterFromList?: string; // ALL | DENTISTS | STUDENTS | TECHNICIANS
  filterFromPageList?: number; // Number of the list's page it came from

  @ViewChild('confirmModal') confirmModalRef!: ElementRef;
  private confirmModal?: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clientService: ClientService
  ) {}

  ngOnInit(): void {
    this.filterFromList = this.route.snapshot.queryParamMap.get('filter') || 'all';
    this.filterFromPageList = Number(this.route.snapshot.queryParamMap.get('page')) || 0;

    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadClient(id);
    } else {
      this.error = 'Invalid client ID.';
      this.loading = false;
    }
  }

  ngAfterViewInit(): void {
    if (this.confirmModalRef) {
      this.confirmModal = new bootstrap.Modal(this.confirmModalRef.nativeElement);
    }
  }

  loadClient(id: number): void {
    this.loading = true;
    this.clientService.getFullById(id).subscribe({
      next: (data) => {
        console.log('Client loaded:', data);
        this.client = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading client', err);
        this.error = 'Could not load client information.';
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/clients'], {
      queryParams: { filter: this.filterFromList, page: this.filterFromPageList }
    });
  }

  openConfirmModal(): void {
    this.confirmModal?.show();
  }

  closeConfirmModal(): void {
    this.confirmModal?.hide();
  }

  deleteClient(): void {
    if (!this.client) return;

    this.deleting = true;
    this.clientService.delete(this.client.id).subscribe({
      next: () => {
        this.deleting = false;
        this.closeConfirmModal();
        alert('Cliente eliminado correctamente.');
        this.router.navigate(['/clients'], {
          queryParams: { filter: this.filterFromList, page: this.filterFromPageList }
        });
      },
      error: (err) => {
        console.error('Error deleting client', err);
        alert('No se pudo eliminar el cliente. Intenta nuevamente.');
        this.deleting = false;
      }
    });
  }

  // Type guards
  isDentist(profile: any): profile is { type: 'DENTIST'; clinicName?: string } {
    return profile.type === 'DENTIST';
  }
  isStudent(profile: any): profile is { type: 'STUDENT'; universityName?: string; semester?: string } {
    return profile.type === 'STUDENT';
  }
  isTechnician(profile: any): profile is { type: 'TECHNICIAN'; labName?: string; specialization?: string } {
    return profile.type === 'TECHNICIAN';
  }
}
