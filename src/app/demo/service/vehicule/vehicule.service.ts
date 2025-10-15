import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from 'src/environements/environment.dev';
import { VehiculeTypeEnum } from '../../enums/vehicule-type.enum';
import { Vehicule } from '../../models/vehicule.model';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
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
    //  Ne pas mettre d’en-têtes Access-Control-* côté front
  }),
};

@Injectable({
  providedIn: 'root'
})
export class VehiculeService {
  private apiUrl = `${environment.apiUrl}/vehicules`;

  constructor(private http: HttpClient) {}

  /** Gestion d’erreurs identique à UserService */
  private handleError(error: HttpErrorResponse) {
    console.error('Erreur API:', error);
    let errorMessage = 'Une erreur inconnue est survenue';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erreur client : ${error.error.message}`;
    } else {
      if (error.status === 422) {
        if (error.error && error.error.errors) {
          if (typeof error.error.errors === 'object') {
            errorMessage = Object.keys(error.error.errors)
              .map((k) => (error.error.errors as any)[k].join(' '))
              .join(' ');
          } else {
            errorMessage = JSON.stringify(error.error.errors);
          }
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }
      } else if (error.status === 0) {
        errorMessage = 'Impossible de se connecter au serveur';
      } else {
        errorMessage = `Erreur serveur ${error.status}: ${error.message}`;
      }
    }
    return throwError(() => new Error(errorMessage));
  }

  /**
   * GET /vehicules/all
   * Filtres supportés: type, owner_contact_id, livreur_contact_id, per_page
   * Retourne la pagination Laravel encapsulée dans data
   */
 // ajoute page? dans les options
getAll(opts?: {
  type?: VehiculeTypeEnum;
  owner_contact_id?: number;
  livreur_contact_id?: number;
  per_page?: number;
  page?: number;              // <-- AJOUT
}): Observable<Paginated<Vehicule>> {
  let params = new HttpParams();
  if (opts?.type)               params = params.set('type', String(opts.type));
  if (opts?.owner_contact_id)   params = params.set('owner_contact_id', String(opts.owner_contact_id));
  if (opts?.livreur_contact_id) params = params.set('livreur_contact_id', String(opts.livreur_contact_id));
  if (opts?.per_page)           params = params.set('per_page', String(opts.per_page));
  if (opts?.page)               params = params.set('page', String(opts.page)); // <-- AJOUT

  return this.http
    .get<ApiResponse<Paginated<Vehicule>>>(`${this.apiUrl}/all`, { params })
    .pipe(map(res => res.data as Paginated<Vehicule>), catchError(this.handleError));
}


  /** GET /vehicules/getById/:id */
  getById(id: number): Observable<Vehicule> {
    return this.http
      .get<ApiResponse<Vehicule>>(`${this.apiUrl}/getById/${id}`)
      .pipe(map((res) => res.data as Vehicule), catchError(this.handleError));
  }

  /** POST /vehicules/create */
  create(payload: Vehicule): Observable<Vehicule> {
    return this.http
      .post<ApiResponse<Vehicule>>(`${this.apiUrl}/create`, payload, httpOption)
      .pipe(map((res) => res.data as Vehicule), catchError(this.handleError));
  }

  /** PUT|PATCH /vehicules/:id */
  update(id: number, payload: Partial<Vehicule>): Observable<Vehicule> {
    // ton route file accepte PUT ou PATCH sur "/vehicules/{vehicule}"
    return this.http
      .patch<ApiResponse<Vehicule>>(`${this.apiUrl}/${id}`, payload, httpOption)
      .pipe(map((res) => res.data as Vehicule), catchError(this.handleError));
  }

  /** DELETE /vehicules/:id */
  delete(id: number): Observable<void> {
    return this.http
      .delete<ApiResponse<null>>(`${this.apiUrl}/${id}`, httpOption)
      .pipe(map(() => void 0), catchError(this.handleError));
  }
}