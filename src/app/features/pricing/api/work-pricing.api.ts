// src/app/core/api/work-pricing.api.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface PriceOverrideInfo {
  type: string;
  amount: number;
  reason?: string;
}

export interface PriceResolution {
  basePrice: number;
  totalOverrides: number;
  finalPrice: number;
  currency: string;
  workPriceId: number | null;
  priceGroup: string | null;
  overrides: PriceOverrideInfo[];
}

@Injectable({ providedIn: 'root' })
export class WorkPricingApi {

  private baseUrl = `${environment.apiBaseUrl}/api/works`;

  private http = inject(HttpClient);

  getFinalPrice(workId: number): Observable<PriceResolution> {
    return this.http.get<PriceResolution>(
      `${this.baseUrl}/${workId}/pricing/final`
    );
  }

  workPriceExists(workId: number): Observable<{exists: boolean}> {
    return this.http.get<{exists: boolean}>(
      `${this.baseUrl}/${workId}/pricing/exists`
    );
  }

}
