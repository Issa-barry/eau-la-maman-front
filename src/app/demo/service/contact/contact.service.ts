import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from 'src/environements/environment.dev';
import { Contact } from '../../models/contact';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T | null;
}

export interface Paginated<T> {
  data: T[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

const httpOption = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
  }),
};

@Injectable({ providedIn: 'root' })
export class ContactService {
  private apiUrl = `${environment.apiUrl}/contacts`;

  constructor(private http: HttpClient) {}

  /** Normalisation d’erreurs (même logique que tes autres services) */
  private handleError(error: HttpErrorResponse) {
    console.error('Erreur API:', error);
    let msg = 'Une erreur inconnue est survenue';

    if (error.error instanceof ErrorEvent) {
      msg = `Erreur client : ${error.error.message}`;
    } else if (error.status === 422) {
      const e = error.error || {};
      if (e?.errors && typeof e.errors === 'object') {
        msg = Object.keys(e.errors).map(k => (e.errors[k] as string[]).join(' ')).join(' ');
      } else {
        msg = e?.message || 'Données invalides.';
      }
    } else if (error.status === 0) {
      msg = 'Impossible de se connecter au serveur';
    } else {
      msg = error.error?.message || `Erreur serveur ${error.status}: ${error.message}`;
    }

    return throwError(() => new Error(msg));
  }

  /** 🔧 Normalise *tous* les formats de pagination possibles (nu OU encapsulé) */
  private toPaginated<T>(raw: any): Paginated<T> {
    // cas 1: encapsulé: { success, data: { data: T[], current_page, ... } }
    if (raw?.data?.data && Array.isArray(raw.data.data)) {
      const p = raw.data;
      return {
        data: p.data as T[],
        current_page: Number(p.current_page ?? 1),
        per_page: Number(p.per_page ?? p.data?.length ?? 10),
        total: Number(p.total ?? p.data?.length ?? 0),
        last_page: Number(p.last_page ?? 1),
      };
    }
    // cas 2: paginator nu (Laravel): { data: T[], current_page, ... }
    if (raw?.data && Array.isArray(raw.data) && raw.current_page !== undefined) {
      return {
        data: raw.data as T[],
        current_page: Number(raw.current_page ?? 1),
        per_page: Number(raw.per_page ?? raw.data?.length ?? 10),
        total: Number(raw.total ?? raw.data?.length ?? 0),
        last_page: Number(raw.last_page ?? 1),
      };
    }
    // cas 3: liste simple
    if (Array.isArray(raw?.data)) {
      return { data: raw.data as T[], current_page: 1, per_page: raw.data.length, total: raw.data.length, last_page: 1 };
    }
    if (Array.isArray(raw)) {
      return { data: raw as T[], current_page: 1, per_page: raw.length, total: raw.length, last_page: 1 };
    }
    // fallback
    return { data: [], current_page: 1, per_page: 10, total: 0, last_page: 1 };
  }

  /**
   * GET /contacts/all (paginé)
   * Supporte page/per_page + recherche simple (optionnel)
   */
  getAll(opts?: { page?: number; per_page?: number; search?: string }): Observable<Paginated<Contact>> {
    let params = new HttpParams();
    if (opts?.page)     params = params.set('page', String(opts.page));
    if (opts?.per_page) params = params.set('per_page', String(opts.per_page));
    if (opts?.search)   params = params.set('search', opts.search);

    return this.http
      .get<any>(`${this.apiUrl}/all`, { params })
      .pipe(map(res => this.toPaginated<Contact>(res)), catchError(this.handleError));
  }

  /** GET /contacts/getById/:id */
  getContactById(id: number): Observable<Contact> {
    return this.http
      .get<ApiResponse<Contact> | any>(`${this.apiUrl}/getById/${id}`)
      .pipe(
        map(res => (res?.data ?? res) as Contact),
        catchError(this.handleError)
      );
  }

 

  /** POST /contacts/create */
  create(contact: Partial<Contact>): Observable<Contact> {
    return this.http
      .post<ApiResponse<Contact>>(`${this.apiUrl}/create`, contact, httpOption)
      .pipe(map(res => (res.data as Contact)), catchError(this.handleError));
  }

  /** PUT /contacts/updateById/:id */
  updateContact(id: number, contact: Contact): Observable<Contact> {
    return this.http
      .put<ApiResponse<Contact>>(`${this.apiUrl}/updateById/${id}`, contact, httpOption)
      .pipe(map(res => (res.data as Contact)), catchError(this.handleError));
  }

  /** PATCH /contacts/:id/statutUpdate */
  updateStatut(id: number, statut: 'active' | 'attente' | 'bloque' | 'archive'): Observable<Contact> {
    return this.http
      .patch<ApiResponse<Contact>>(`${this.apiUrl}/${id}/statutUpdate`, { statut }, httpOption)
      .pipe(map(res => (res.data as Contact)), catchError(this.handleError));
  }

  /** DELETE /contacts/delateById/:id (⚠️ orthographe côté back ?) */
  deleteContact(id: number): Observable<void> {
    return this.http
      .delete<ApiResponse<null>>(`${this.apiUrl}/delateById/${id}`, httpOption)
      .pipe(map(() => void 0), catchError(this.handleError));
  }

  /** Recherche simple par nom/téléphone/référence (si ton back l’accepte) */
  search(term: string, page = 1, per_page = 10): Observable<Paginated<Contact>> {
    let params = new HttpParams().set('search', term).set('page', page).set('per_page', per_page);
    return this.http
      .get<any>(`${this.apiUrl}/all`, { params })
      .pipe(map(res => this.toPaginated<Contact>(res)), catchError(this.handleError));
  }
}
