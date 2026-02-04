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

import { WorkService } from '../../services/work.service';
import { FullWork } from '../../models/full-work.model';
import { WorkPricingApi, PriceResolution } from 'src/app/features/pricing/api/work-pricing.api';
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
  private pricingApi = inject(WorkPricingApi);
  private destroyRef = inject(DestroyRef);

  work = signal<FullWork | undefined>(undefined);
  loading = signal(true);
  error = signal<string | undefined>(undefined);

  // 👇 PRICING
  priceExists = signal<boolean | null>(null); // null = checking
  priceResolution = signal<PriceResolution | undefined>(undefined);

  constructor() {

    effect(() => {
      const id = Number(this.route.snapshot.paramMap.get('id'));

      if (!id) {
        this.error.set('Invalid work ID.');
        this.loading.set(false);
        return;
      }

      this.loading.set(true);
      this.error.set(undefined);

      this.workService.getFullById(id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (data) => {
            console.log('Loaded work detail:', data);
            this.work.set(data);
            this.loading.set(false);

            // ✅ AQUÍ está la clave
            this.checkPricing(data.base.id);
          },
          error: () => {
            this.error.set('Could not load work details.');
            this.loading.set(false);
          }
        });
    }, { allowSignalWrites: true });

  }

  // ===============================
  // Pricing logic
  // ===============================
  private checkPricing(workId: number) {
    this.priceExists.set(null);
    this.priceResolution.set(undefined);

    this.pricingApi.workPriceExists(workId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp) => {
          this.priceExists.set(resp.exists);
          console.log('Price exists:', resp.exists);
          if (resp.exists) {
            this.loadFinalPrice(workId);
          }
        },
        error: () => {
          this.priceExists.set(false);
        }
      });
  }

  private loadFinalPrice(workId: number) {
    this.pricingApi.getFinalPrice(workId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resolution) => {
          this.priceResolution.set(resolution);
        },
        error: () => {
          this.priceResolution.set(undefined);
        }
      });
  }

  goBack() {
    this.router.navigate(['/works']);
  }

  goToPricing() {
    const w = this.work();
    if (w?.base?.id) {
      this.router.navigate(['/works', w.base.id, 'pricing']);
    }
  }
}