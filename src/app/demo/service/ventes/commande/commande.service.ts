import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environements/environment.dev';

import { Commande } from 'src/app/demo/models/commande.model';
import { CreateCommandeDto } from 'src/app/demo/models/commande-create.dto';
import { UpdateCommandeDto } from 'src/app/demo/models/commande-update.dto';
import { CommandeStatsQueryType, CommandeStatsType } from 'src/app/demo/components/types/CommandeStats.type';
 
/** ---- Types communs ---- */
type ApiValidation = { [field: string]: string[] };

export interface ApiErrorShape {
  status: number;
  message: string;
  errors: ApiValidation | null;
  raw: HttpErrorResponse;
}

type ApiSuccess<T> = { success: boolean; data: T };

export interface PageMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

type ApiListSuccess<T> = {
  success: boolean;
  data: {
    data: T[];
    meta: PageMeta;
  };
};

export type CommandeListParams = {
  page?: number;
  per_page?: number;
  search?: string;
  statut?: 'brouillon' | 'livraison_en_cours' | 'livré' | 'cloturé' | 'annulé';
  periode?: 'aujourdhui' | 'cette_semaine' | 'ce_mois' | 'cette_annee';
  livreur_id?: number;
  date_from?: string; // YYYY-MM-DD
  date_to?: string;   // YYYY-MM-DD
  total_min?: number;
  total_max?: number;
  qte_min?: number;
  qte_max?: number;
  sort?: string; // ex: "created_at,-montant_total"
};

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
  }),
};

@Injectable({ providedIn: 'root' })
export class CommandeService {
  private apiUrl = `${environment.apiUrl}/commandes`;
    private apiDashboardUrl = `${environment.apiUrl}/dashboards`;


  constructor(private http: HttpClient) {}

  /** Normalise les erreurs backend -> front */
  private handleError = (error: HttpErrorResponse) => {
    const backend = error?.error as any;
    const apiErr: ApiErrorShape = {
      status: error?.status ?? 0,
      message:
        backend?.message ??
        error?.statusText ??
        (error.error instanceof ErrorEvent
          ? `Erreur client : ${error.error.message}`
          : 'Une erreur inconnue est survenue'),
      errors:
        (backend?.data as ApiValidation) ??
        (backend?.errors as ApiValidation) ??
        null,
      raw: error,
    };
    return throwError(() => apiErr);
  };

  /** Liste paginée + filtres (y compris `periode`) */
  list(
    params: CommandeListParams = {}
  ): Observable<{ items: Commande[]; meta: PageMeta }> {
    return this.http
      .get<ApiListSuccess<Commande>>(this.apiUrl, { params: params as any })
      .pipe(
        map((res) => ({
          items: res.data.data,
          meta: res.data.meta,
        })),
        catchError(this.handleError)
      );
  }

  getCommandeByNumero(numero: string): Observable<Commande> {
    return this.http
      .get<ApiSuccess<Commande>>(`${this.apiUrl}/showByNumero/${numero}`)
      .pipe(map((res) => res.data), catchError(this.handleError));
  }

    createCommandeImedia(dto: CreateCommandeDto): Observable<Commande> {
    return this.http
      .post<ApiSuccess<Commande>>(`${this.apiUrl}/imedia/create`, dto, httpOptions)
      .pipe(map((res) => res.data), catchError(this.handleError));
  }

  createCommande(dto: CreateCommandeDto): Observable<Commande> {
    return this.http
      .post<ApiSuccess<Commande>>(`${this.apiUrl}/create`, dto, httpOptions)
      .pipe(map((res) => res.data), catchError(this.handleError));
  }

  updateCommande(numero: string, dto: UpdateCommandeDto): Observable<Commande> {
    return this.http
      .put<ApiSuccess<Commande>>(
        `${this.apiUrl}/updateByNumero/${numero}`,
        dto,
        httpOptions
      )
      .pipe(map((res) => res.data), catchError(this.handleError));
  }

  deleteCommande(numero: string): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/deleteByNumero/${numero}`, httpOptions)
      .pipe(catchError(this.handleError));
  }

  validerCommande(numero: string): Observable<Commande> {
    return this.http
      .patch<{ success: boolean; commande: Commande }>(
        `${this.apiUrl}/validation/${numero}`,
        {},
        httpOptions
      )
      .pipe(map((res) => res.commande), catchError(this.handleError));
  }


   /** GET /dashboards/statistiques/commandes */
  getStats(q: CommandeStatsQueryType): Observable<CommandeStatsType> {
    let params = new HttpParams();
    if (q.periode)   params = params.set('periode', q.periode);
    if (q.date_from) params = params.set('date_from', q.date_from);
    if (q.date_to)   params = params.set('date_to', q.date_to);

    return this.http
      .get<ApiSuccess<CommandeStatsType>>(
        `${this.apiDashboardUrl}/statistiques/commandes`,
        { params }
      )
      .pipe(
        map(res => res.data),
        catchError(this.handleError) 
      );
  }
}
