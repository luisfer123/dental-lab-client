import {
  Component,
  signal,
  computed,
  inject,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { WorkService } from '../../services/work.service';
import { ClientService } from 'src/app/features/clients/services/client.service';
import { ClientSummary } from 'src/app/features/clients/models/client-summary';

import { CrownFormComponent } from './extension-forms/crown-form/crown-form.component';
import { BridgeFormComponent } from './extension-forms/bridge-form/bridge-form.component';

import { Page } from 'src/app/shared/models/page.model';
import { CreateWorkRequest } from '../../models/create-work-request';
import { WorkOrderService } from '../../../orders/services/work-order.service';
import { WorkCreatedSuccessComponent } from './work-created-success/work-created-success.component';

type WorkFamily = 'FIXED_PROSTHESIS';
type WorkType = 'CROWN' | 'BRIDGE';

type WorkNewMode = 'STANDARD' | 'ADD_TO_ORDER';

@Component({
  selector: 'app-work-new',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CrownFormComponent,
    BridgeFormComponent,
    WorkCreatedSuccessComponent
  ],
  templateUrl: './work-new.component.html',
  styleUrls: ['./work-new.component.scss']
})
export class WorkNewComponent implements OnInit {

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private workService = inject(WorkService);
  private clientService = inject(ClientService);
  private workOrderService = inject(WorkOrderService);

  /* ============================================================
     Modo: wizard normal vs agregar a orden existente
  ============================================================ */
  mode = signal<WorkNewMode>('STANDARD');
  orderId = signal<number | null>(null);
  creationSuccess = signal(false);

  /* ============================================================
     Wizard
  ============================================================ */
  step = signal<0 | 1 | 2>(0);

  /* ============================================================
     Client search state (Step 0)
  ============================================================ */

  searchTerm = signal('');
  searchPage = signal(0);
  searchSize = signal(10);

  searchLoading = signal(false);

  // NEW: store entire page object
  clientPage = signal<Page<ClientSummary> | null>(null);

  selectedClient = signal<ClientSummary | null>(null);

  /* ============================================================
     UI and form state
  ============================================================ */

  loading = signal(false);
  error = signal<string | null>(null);

  selectedFamily = signal<WorkFamily | null>(null);
  selectedType = signal<WorkType | null>(null);

  selectorForm = this.fb.group({
    workFamily: this.fb.control<WorkFamily>('FIXED_PROSTHESIS', Validators.required),
    type: this.fb.control<WorkType | ''>('', Validators.required),
  });

  baseForm = this.fb.group({
    clientId: this.fb.control<number | null>(null, Validators.required),
    workFamily: this.fb.control<WorkFamily>('FIXED_PROSTHESIS', Validators.required),
    type: this.fb.control<WorkType | ''>('', Validators.required),
    description: this.fb.control<string | null>(null),
    shade: this.fb.control<string | null>(null),
    notes: this.fb.control<string | null>(null)
  });

  /* ============================================================
     Lifecycle: leer query params (clientId, orderId)
  ============================================================ */
  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const clientIdParam = params.get('clientId');
      const orderIdParam = params.get('orderId');

      if (orderIdParam) {
        const orderId = Number(orderIdParam);
        this.orderId.set(orderId);
        this.mode.set('ADD_TO_ORDER');

        if (clientIdParam) {
          const clientId = Number(clientIdParam);
          this.clientService.getById(clientId).subscribe({
            next: c => {
              this.selectedClient.set(c);
              this.baseForm.patchValue({ clientId: c.id });
              this.step.set(1); // saltamos búsqueda de cliente
            },
            error: () => this.error.set('No se pudo cargar el cliente para la orden.')
          });
        } else {
          // Fallback: si solo llega orderId, cargamos cliente desde la orden
          this.loadClientFromOrder(orderId);
        }
      }
    });
  }

  private loadClientFromOrder(orderId: number) {
    this.workOrderService.getOrder(orderId).subscribe({
      next: order => {
        const clientId = order.clientId;
        this.clientService.getById(clientId).subscribe({
          next: c => {
            this.selectedClient.set(c);
            this.baseForm.patchValue({ clientId: c.id });
            this.step.set(1);
          },
          error: () => this.error.set('No se pudo cargar el cliente para la orden.')
        });
      },
      error: () => this.error.set('No se pudo cargar la orden.')
    });
  }

  /* ============================================================
     Search clients
  ============================================================ */

  searchClients(term: string, page = 0) {
    const oldTerm = this.searchTerm();

    this.searchTerm.set(term);

    // Si el usuario cambió el término, reiniciar a página 0
    if (term !== oldTerm) {
      page = 0;
      this.searchPage.set(0);
    } else {
      this.searchPage.set(page);
    }

    if (!term || term.length < 2) {
      this.clientPage.set(null);
      return;
    }

    this.searchLoading.set(true);

    this.clientService.search(term, page, this.searchSize()).subscribe({
      next: (data) => {
        this.clientPage.set(data);
        this.searchLoading.set(false);
      },
      error: () => {
        this.clientPage.set(null);
        this.searchLoading.set(false);
      }
    });
  }

  selectClient(c: ClientSummary) {
    this.selectedClient.set(c);

    this.baseForm.patchValue({
      clientId: c.id
    });

    // Oculta resultados después de seleccionar
    this.clientPage.set(null);
  }

  goToStep1() {
    if (!this.selectedClient()) {
      this.error.set('Please select a client.');
      return;
    }
    this.error.set(null);
    this.step.set(1);
  }

  /* ============================================================
     Computed
  ============================================================ */

  showCrown = computed(() => this.selectedType() === 'CROWN');
  showBridge = computed(() => this.selectedType() === 'BRIDGE');

  /* ============================================================
     Step 1 → Step 2
  ============================================================ */

  proceedToDetails() {
    if (this.selectorForm.invalid) {
      this.selectorForm.markAllAsTouched();
      this.error.set('Please choose family and type.');
      return;
    }

    const { workFamily, type } = this.selectorForm.value;

    this.selectedFamily.set(workFamily as WorkFamily);
    this.selectedType.set(type as WorkType);

    this.baseForm.patchValue({ workFamily, type });

    this.baseForm.get('workFamily')?.disable();
    this.baseForm.get('type')?.disable();

    this.step.set(2);
  }

  /* ============================================================
     Step 2 — extension data
  ============================================================ */

  extensionData: any = null;

  onExtensionChange(data: any) {
    this.extensionData = data;
  }

  /* ============================================================
     Submit
  ============================================================ */

  submit() {
    if (this.baseForm.invalid || !this.selectedType()) {
      this.error.set('Please fill all required fields.');
      this.baseForm.markAllAsTouched();
      return;
    }

    if (!this.extensionData) {
      this.error.set('Extension data is required.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const raw = this.baseForm.getRawValue();

    const payload: CreateWorkRequest = {
      base: {
        clientId: raw.clientId!,
        workFamily: raw.workFamily!,
        type: raw.type!,
        description: raw.description,
        shade: raw.shade,
        notes: raw.notes,
        // opcional: si quieres mandar orderId en el payload base
        // orderId: this.orderId() ?? undefined
      },
      extension: {
        type: this.selectedType()!,
        ...this.extensionData
      }
    };

    this.workService.create(payload).subscribe({
      next: created => {
        this.loading.set(false);

        if (this.mode() === 'ADD_TO_ORDER' && this.orderId()) {
          // No navegamos fuera: mostramos la pantalla de éxito
          this.creationSuccess.set(true);
        } else {
          // Comportamiento anterior para modo estándar
          this.router.navigate(['/works', created.base.id]);
        }
      },
      error: err => {
        console.error(err);
        this.error.set('Could not create work.');
        this.loading.set(false);
      }
    });
  }

  cancel() {
    this.router.navigate(['/works'], { queryParamsHandling: 'preserve' });
  }

  goToSearchPage(page: number) {
    // Validación de límites
    if (page < 0) return;
    if (this.clientPage() && page >= this.clientPage()!.totalPages) return;

    this.searchPage.set(page);
    this.searchClients(this.searchTerm(), page);
  }

  prevSearchPage() {
    this.goToSearchPage(this.searchPage() - 1);
  }

  nextSearchPage() {
    this.goToSearchPage(this.searchPage() + 1);
  }

  goBackToStep0() {
    this.step.set(0);
  }

  goBackToStep1() {
    this.step.set(1);
  }

  /* ============================================================
     Post-submit actions (success component outputs)
  ============================================================ */

  onAddAnotherWork() {
    const clientId = this.baseForm.getRawValue().clientId;
    const orderId = this.orderId();

    if (clientId && orderId) {
      this.router.navigate(['/works', 'new'], {
        queryParams: { clientId, orderId }
      });
    }
  }

  onGoToOrder() {
    const orderId = this.orderId();
    if (orderId) {
      this.router.navigate(['/orders', orderId]);
    }
  }

}
