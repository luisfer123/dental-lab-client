import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  DestroyRef,
  effect,
  signal,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { ClientService } from '../../services/client.service';
import { ClientFull } from '../../models/client-full.model';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

declare const bootstrap: any;

@Component({
  selector: 'app-client-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './client-detail.component.html',
  styleUrls: ['./client-detail.component.scss']
})
export class ClientDetailComponent implements AfterViewInit {

  /* ==========================================================
     INJECTIONS
  ========================================================== */
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private clientService = inject(ClientService);
  private destroyRef = inject(DestroyRef);

  /* ==========================================================
     SIGNAL STATE
  ========================================================== */
  client = signal<ClientFull | undefined>(undefined);
  loading = signal(true);
  error = signal<string | undefined>(undefined);
  deleting = signal(false);

  // Query params (regresar a lista correctamente)
  filterFromList = signal<string>('all');
  filterFromPageList = signal<number>(0);

  /* ==========================================================
     MODAL
  ========================================================== */
  @ViewChild('confirmModal') confirmModalRef!: ElementRef;
  private confirmModal?: any;

  constructor() {

    /* ==========================================================
       EFFECT: carga el cliente cuando cambia el ID en la URL
    ========================================================== */
    effect((onCleanup) => {
      const id = Number(this.route.snapshot.paramMap.get('id'));

      // ID inválido
      if (!id) {
        this.error.set('Invalid client ID.');
        this.loading.set(false);
        return;
      }

      // Obtener query params desde URL
      this.parseQueryParams(this.route.snapshot.queryParamMap);

      // Iniciar carga
      this.loading.set(true);
      this.error.set(undefined);

      const sub = this.clientService
        .getFullById(id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (data) => {
            if (!data) {
              this.error.set('Client not found.');
            } else {
              this.client.set(data);
              this.error.set(undefined);
            }
            this.loading.set(false);
          },
          error: (err) => {
            console.error('Error loading client', err);
            this.error.set('Could not load client information.');
            this.loading.set(false);
          }
        });

      // Cleanup para evitar memory leaks
      onCleanup(() => sub.unsubscribe());

    }, { allowSignalWrites: true });
  }

   /* ==========================================================
      PARSE QUERYPARAMS
    ========================================================== */
    private parseQueryParams(params: any): void {
      this.filterFromList.set(params.get('filter') || 'all');
      this.filterFromPageList.set(Number(params.get('page')) || 0);
    }

  /* ==========================================================
     MODAL INIT
  ========================================================== */
  ngAfterViewInit(): void {
    if (!this.confirmModalRef) return;

    try {
      this.confirmModal = new bootstrap.Modal(
        this.confirmModalRef.nativeElement
      );
    } catch (e) {
      console.warn('Bootstrap modal initialization failed:', e);
    }
  }

  /* ==========================================================
     NAVIGATION
  ========================================================== */
  goBack(): void {
    this.router.navigate(['/clients'], {
      queryParams: {
        filter: this.filterFromList(),
        page: this.filterFromPageList()
      }
    });
  }

  /* ==========================================================
     MODAL HANDLERS
  ========================================================== */
  openConfirmModal(): void {
    this.confirmModal?.show();
  }

  closeConfirmModal(): void {
    this.confirmModal?.hide();
  }

  /* ==========================================================
     DELETE CLIENT
  ========================================================== */
  deleteClient(): void {
    const client = this.client();
    if (!client || this.deleting()) return;

    this.deleting.set(true);

    this.clientService
      .delete(client.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.deleting.set(false);
          this.closeConfirmModal();
          alert('Cliente eliminado correctamente.');
          this.goBack();
        },
        error: (err) => {
          console.error('Error deleting client', err);
          alert('No se pudo eliminar el cliente. Intenta nuevamente.');
          this.deleting.set(false);
        }
      });
  }

  /* ==========================================================
     TYPE GUARDS
  ========================================================== */
  isDentist(profile: any): profile is { type: 'DENTIST'; clinicName?: string } {
    return profile.type === 'DENTIST';
  }

  isStudent(profile: any): profile is {
    type: 'STUDENT';
    universityName?: string;
    semester?: string;
  } {
    return profile.type === 'STUDENT';
  }

  isTechnician(profile: any): profile is {
    type: 'TECHNICIAN';
    labName?: string;
    specialization?: string;
  } {
    return profile.type === 'TECHNICIAN';
  }
}
