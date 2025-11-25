import {
  Component,
  signal,
  computed,
  inject,
  OnInit,
  effect
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
import { WorkOrderService } from '../../services/work-order.service';

type WorkFamily = 'FIXED_PROSTHESIS';
type WorkType = 'CROWN' | 'BRIDGE';

@Component({
  selector: 'app-work-new',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CrownFormComponent,
    BridgeFormComponent
  ],
  templateUrl: './work-new.component.html',
  styleUrls: ['./work-new.component.scss']
})
export class WorkNewComponent {

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private workService = inject(WorkService);
  private clientService = inject(ClientService);
  private workOrderService = inject(WorkOrderService);

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
     Query params for deciding pre-selected client/order and
     initial form state.

  ============================================================ */

  clientIdParam = signal<number | null>(null);
  orderIdParam = signal<number | null>(null);

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

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      const clientId = Number(params.get('clientId'));
      const orderId = Number(params.get('orderId'));

      this.clientIdParam.set(isNaN(clientId) ? null : clientId);
      this.orderIdParam.set(isNaN(orderId) ? null : orderId);

      // --- ESCENARIO A ---
      if (clientId && orderId) {
        this.loadClientAndSkip(clientId);
        return;
      }

      // --- ESCENARIO B ---
      if (clientId && !orderId) {
        this.createOrderForClient(clientId);
        return;
      }

      // --- ESCENARIO C ---
      if (!clientId && orderId) {
        this.loadClientFromOrder(orderId);
        return;
      }

      // --- ESCENARIO D ---
      // No llega nada, flujo normal (Step 0)
    });
  }

  private loadClientAndSkip(clientId: number) {
    this.clientService.getById(clientId).subscribe({
      next: c => {
        this.selectedClient.set(c);
        this.baseForm.patchValue({ clientId: c.id });
        this.step.set(1); // Skip Step 0
      },
      error: () => this.error.set('No se pudo cargar el cliente.')
    });
  }

  private createOrderForClient(clientId: number) {
    this.clientService.getById(clientId).subscribe({
      next: c => {
        this.selectedClient.set(c);
        this.baseForm.patchValue({ clientId: c.id });

        // Crear orden
        this.workOrderService.createOrderForClient(clientId).subscribe({
          next: order => {
            this.orderIdParam.set(order.id);
            this.step.set(1);
          },
          error: () => this.error.set('No se pudo crear la orden para el cliente.')
        });
      },
      error: () => this.error.set('Cliente no encontrado.')
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
          }
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

    const payload: CreateWorkRequest = {
      base: {
        clientId: this.baseForm.getRawValue().clientId!,
        workFamily: this.baseForm.getRawValue().workFamily!,
        type: this.baseForm.getRawValue().type!,
        description: this.baseForm.getRawValue().description,
        shade: this.baseForm.getRawValue().shade,
        notes: this.baseForm.getRawValue().notes,
      },
      extension: {
        type: this.selectedType()!,
        ...this.extensionData
      }
    };

    this.workService.create(payload).subscribe({
      next: created => {
        this.loading.set(false);
        this.router.navigate(['/works', created.base.id]);
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

}

/* ============================================================

 ESCENARIO A — Llega clientId y orderId

  Caso típico cuando el usuario viene de “Agregar trabajo a esta orden”
  Comportamiento:

  1. Saltar completamente el Step 0 (buscador).
  2. Cargar el cliente por clientId.
  3. Cargar la orden por orderId (solo para validar que coincide con el cliente).
  4. Rellenar clientId en baseForm.
  5. Ir directo a Step 1.

ESCENARIO B — Llega solo clientId

  El usuario viene de “Agregar nuevo trabajo para este cliente”, pero sin orden.
  Comportamiento:

  1. Saltar Step 0.
  2. Cargar cliente por clientId.
  3. Llamar a backend: crear una nueva orden para ese cliente.
  4. Guardar el orderId generado.
  5. Rellenar baseForm.
  6. Ir a Step 1.

ESCENARIO C — Llega solo orderId

  El usuario viene desde la lista de órdenes → “Agregar trabajo a esta orden”.
  Comportamiento:

  1. Cargar orden.
  2. Obtener clientId desde la orden.
  3. Cargar cliente.
  4. Saltar Step 0.
  5. Rellenar clientId en baseForm.
  6. Ir a Step 1.

  ESCENARIO D — No llega nada (nuevo trabajo desde cero)

    Flujo original

    1. Se muestra Step 0 → buscador de cliente.
    2. continua todo el flujo normal.

=========================================================== */