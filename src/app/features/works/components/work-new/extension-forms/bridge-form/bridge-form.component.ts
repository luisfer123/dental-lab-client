import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-bridge-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './bridge-form.component.html'
})
export class BridgeFormComponent {

  private fb = inject(FormBuilder);

  @Output() extensionChange = new EventEmitter<any>();

  bridgeForm = this.fb.group({
    // Ejemplos de campos típicos para un puente:
    spanCount: [1, [Validators.required, Validators.min(1)]],
    connectorType: ['STANDARD', Validators.required],
    ponticDesign: ['OVATE', Validators.required],
    retainerMaterialId: [null],
    ponticMaterialId: [null],
    teethInvolved: [''], // ej. "11-12-13"
  });

  constructor() {
    this.bridgeForm.valueChanges.subscribe(val => {
      this.extensionChange.emit(val);
    });
  }
}
