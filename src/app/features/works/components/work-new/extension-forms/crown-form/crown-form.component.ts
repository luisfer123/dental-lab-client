import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-crown-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './crown-form.component.html'
})
export class CrownFormComponent {

  private fb = inject(FormBuilder);

  // Emitir valores al componente padre
  @Output() extensionChange = new EventEmitter<any>();

  crownForm = this.fb.group({
    toothNumber: [''],
    constitution: ['MONOLITHIC', Validators.required],
    buildingTechnique: ['DIGITAL', Validators.required],
    coreMaterialId: [null],
    veneeringMaterialId: [null]
  });

  constructor() {
    // Emitir cambios continuamente al padre
    this.crownForm.valueChanges.subscribe(val => {
      this.extensionChange.emit(val);
    });
  }
}
