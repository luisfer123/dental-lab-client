// src/app/features/works/work-detail/work-detail.component.ts

import {
  Component,
  signal,
  effect,
  inject,
  DestroyRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { WorkService } from '../services/work.service';
import { FullWork } from '../models/full-work.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-work-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './work-detail.component.html',
  styleUrls: ['./work-detail.component.scss']
})
export class WorkDetailComponent {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private workService = inject(WorkService);
  private destroyRef = inject(DestroyRef);

  work = signal<FullWork | undefined>(undefined);
  loading = signal(true);
  error = signal<string | undefined>(undefined);

  constructor() {

    // Efecto reactivo: carga el trabajo cuando cambia el ID
    effect((onCleanup) => {
      const id = Number(this.route.snapshot.paramMap.get('id'));

      if (!id) {
        this.error.set('Invalid work ID.');
        this.loading.set(false);
        return;
      }

      this.loading.set(true);

      const sub = this.workService.getFullById(id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (data) => {
            console.log('Loaded work detail:', data);
            this.work.set(data);
            this.loading.set(false);
          },
          error: () => {
            this.error.set('Could not load work details.');
            this.loading.set(false);
          }
        });

      onCleanup(() => sub.unsubscribe());

    }, { allowSignalWrites: true });

  }

  goBack() {
    this.router.navigate(['/works']);
  }
}
