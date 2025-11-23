import {
  Component,
  signal,
  computed,
  effect,
  inject,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { WorkService } from '../../services/work.service';

// Subformularios
import { BridgeFormComponent } from './extension-forms/bridge-form/bridge-form.component';
import { CrownFormComponent } from './extension-forms/crown-form/crown-form.component';

type WorkFamily = 'FIXED_PROSTHESIS';
type WorkType = 'CROWN' | 'BRIDGE';

@Component({
  selector: 'app-work-new',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CrownFormComponent,
    BridgeFormComponent,
  ],
  templateUrl: './work-new.component.html',
  styleUrls: ['./work-new.component.scss']
})
export class WorkNewComponent implements OnInit {

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private workService = inject(WorkService);

  /* ============================================================
     Wizard: 1 = family/type | 2 = full form
  ============================================================ */
  step = signal<1 | 2>(1);

  /* ============================================================
     UI state
  ============================================================ */
  loading = signal(false);
  error = signal<string | null>(null);

  selectedFamily = signal<WorkFamily | null>(null);
  selectedType = signal<WorkType | null>(null);

  /* ============================================================
     STEP 1: Simple selector form
  ============================================================ */
  selectorForm = this.fb.group({
    workFamily: this.fb.control<WorkFamily>('FIXED_PROSTHESIS', Validators.required),
    type: this.fb.control<WorkType | ''>('', Validators.required),
  });

  /* ============================================================
     STEP 2: Main form
  ============================================================ */
  baseForm = this.fb.group({
    clientId: this.fb.control<number | null>(null, Validators.required),
    workFamily: this.fb.control<WorkFamily>('FIXED_PROSTHESIS', Validators.required),
    type: this.fb.control<WorkType | ''>('', Validators.required),
    description: this.fb.control<string | null>(null),
    shade: this.fb.control<string | null>(null),
    notes: this.fb.control<string | null>(null)
  });

  /* ============================================================
     Computed
  ============================================================ */
  showCrown = computed(() => this.selectedType() === 'CROWN');
  showBridge = computed(() => this.selectedType() === 'BRIDGE');

  extensionData: any = null;

  ngOnInit(): void {
    const clientParam = this.route.snapshot.queryParamMap.get('clientId');
    if (clientParam && clientParam !== 'null') {
      const parsed = Number(clientParam);
      if (!isNaN(parsed)) {
        this.baseForm.patchValue({ clientId: parsed });
      }
    }
  }

  /* ============================================================
     STEP 1 → STEP 2
  ============================================================ */
  proceedToDetails() {
    if (this.selectorForm.invalid) {
      this.selectorForm.markAllAsTouched();
      this.error.set('Please choose family and type.');
      return;
    }

    this.error.set(null);

    const { workFamily, type } = this.selectorForm.value;

    this.selectedFamily.set(workFamily as WorkFamily);
    this.selectedType.set(type as WorkType);

    // Fill base form
    this.baseForm.patchValue({ workFamily, type });

    // Disable controls
    this.baseForm.get('workFamily')?.disable();
    this.baseForm.get('type')?.disable();

    this.step.set(2);
  }

  /* ============================================================
     Receive subform data
  ============================================================ */
  onExtensionChange(data: any) {
    this.extensionData = data;
  }

  /* ============================================================
     Submit
  ============================================================ */
  submit() {
    if (this.baseForm.invalid || !this.selectedType()) {
      this.baseForm.markAllAsTouched();
      this.error.set('Please fill all required fields.');
      return;
    }

    if (!this.extensionData) {
      this.error.set('Extension data is required.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const payload = {
      base: this.baseForm.getRawValue(), // important: include disabled values
      extension: {
        type: this.selectedType(),
        ...this.extensionData
      }
    };

    console.log('Submitting payload:', payload);

    // TODO: backend integration
    // this.workService.create(payload).subscribe(...)
  }

  cancel() {
    this.router.navigate(['/works'], { queryParamsHandling: 'preserve' });
  }
}
