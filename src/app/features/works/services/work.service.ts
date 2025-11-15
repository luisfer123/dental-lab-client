import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Work } from '../models/work.model';
import { FullWork } from '../models/full-work.model';

@Injectable({ providedIn: 'root' })
export class WorkService {
  private baseUrl = `${environment.apiBaseUrl}/api/works`;

  constructor(private http: HttpClient) {}

  /* ==========================================================
     GET ALL (base WorkModel)
     Supports pagination, sorting, and filters by family/type/client
     Example: /api/works?page=0&size=10&sort=createdAt,desc&family=FIXED_PROSTHESIS&clientId=1
  ========================================================== */
  getAll(
    page = 0,
    size = 10,
    sort = 'createdAt,desc',
    family?: string,
    type?: string,
    status?: string,
    clientId?: number
  ): Observable<Work[]> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', sort);

    if (family) params = params.set('family', family);
    if (type) params = params.set('type', type);
    if (status) params = params.set('status', status);
    if (clientId !== undefined && clientId !== null)
      params = params.set('clientId', clientId.toString());

    return this.http.get<any>(this.baseUrl, { params }).pipe(
      map((resp) => {
        if (!resp) return [];

        // ✅ Case 1: Spring Data "Page" (what your backend returns)
        if (resp.content) {
          return resp.content;
        }

        // ✅ Case 2: Spring HATEOAS "_embedded"
        if (resp._embedded) {
          const embedded = resp._embedded;
          const key = Object.keys(embedded)[0];
          return embedded[key] ?? [];
        }

        // ✅ Case 3: Plain array fallback
        if (Array.isArray(resp)) return resp;

        return [];
      })
    );
  }

  /* ==========================================================
     GET ALL FULL (FullWorkModel with extensions)
     Example: /api/works/full?family=FIXED_PROSTHESIS&clientId=1
  ========================================================== */
  getAllFull(
    family?: string,
    type?: string,
    clientId?: number
  ): Observable<FullWork[]> {
    let params = new HttpParams();
    if (family) params = params.set('family', family);
    if (type) params = params.set('type', type);
    if (clientId !== undefined && clientId !== null)
      params = params.set('clientId', clientId.toString());

    return this.http.get<any>(`${this.baseUrl}/full`, { params }).pipe(
      map((resp) => {
        if (resp?._embedded) {
          return resp._embedded.fullWorkModelList ?? [];
        } else if (Array.isArray(resp)) {
          return resp;
        }
        return [];
      })
    );
  }

  /* ==========================================================
     GET BY ID (FullWorkModel)
  ========================================================== */
  getById(id: number): Observable<FullWork> {
    return this.http.get<FullWork>(`${this.baseUrl}/${id}`);
  }

  /* ==========================================================
     CREATE BASE WORK
  ========================================================== */
  create(work: Partial<Work>): Observable<Work> {
    return this.http.post<Work>(this.baseUrl, work);
  }

  /* ==========================================================
     UPDATE BASE WORK
  ========================================================== */
  update(id: number, work: Partial<Work>): Observable<Work> {
    return this.http.put<Work>(`${this.baseUrl}/${id}`, work);
  }

  /* ==========================================================
     DELETE
  ========================================================== */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
