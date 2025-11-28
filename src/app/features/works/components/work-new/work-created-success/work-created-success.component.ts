import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-work-created-success',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './work-created-success.component.html'
})
export class WorkCreatedSuccessComponent {

  @Input() orderId!: number;
  @Input() clientName?: string;

  @Output() addAnother = new EventEmitter<void>();
  @Output() goToOrder = new EventEmitter<void>();

  onAddAnother() {
    this.addAnother.emit();
  }

  onGoToOrder() {
    this.goToOrder.emit();
  }
}
