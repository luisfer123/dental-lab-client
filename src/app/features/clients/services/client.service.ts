import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Client } from '../models/client.model';
import { ClientFull } from '../models/client-full.model';
import { environment } from 'src/environments/environment';
import { PageModel } from '../../../shared/models/page.model';

@Injectable({ providedIn: 'root' })
export class ClientService {
  private apiUrl = `${environment.apiBaseUrl}/api/clients`;
  private profilesUrl = `${environment.apiBaseUrl}/api/client-profiles`;

  constructor(private http: HttpClient) {}

  // ---------------------------
  // Existing methods
  // ---------------------------
  getAllPaged(page = 0, size = 10, sort = 'displayName,asc'): Observable<PageModel<Client>> {
    return this.http.get<PageModel<Client>>(`${this.apiUrl}?page=${page}&size=${size}&sort=${sort}`);
  }

  getById(id: number): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/${id}`);
  }

  getFullById(id: number): Observable<ClientFull> {
    return this.http.get<ClientFull>(`${this.apiUrl}/${id}/full`);
  }

  create(client: Client): Observable<Client> {
    return this.http.post<Client>(this.apiUrl, client);
  }

  update(id: number, client: Client): Observable<Client> {
    return this.http.put<Client>(`${this.apiUrl}/${id}`, client);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // ---------------------------
  // NEW: Profile-based paginated endpoints
  // ---------------------------

  getDentistsPaged(page = 0, size = 10, sort = 'displayName,asc'): Observable<PageModel<Client>> {
    return this.http.get<PageModel<Client>>(
      `${this.profilesUrl}/dentists?page=${page}&size=${size}&sort=${sort}`
    );
  }

  getStudentsPaged(page = 0, size = 10, sort = 'displayName,asc'): Observable<PageModel<Client>> {
    return this.http.get<PageModel<Client>>(
      `${this.profilesUrl}/students?page=${page}&size=${size}&sort=${sort}`
    );
  }

  getTechniciansPaged(page = 0, size = 10, sort = 'displayName,asc'): Observable<PageModel<Client>> {
    return this.http.get<PageModel<Client>>(
      `${this.profilesUrl}/technicians?page=${page}&size=${size}&sort=${sort}`
    );
  }
}
