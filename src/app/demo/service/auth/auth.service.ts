import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from 'src/environements/environment.dev';
import { Router } from '@angular/router';
import { Contact } from '../../models/contact';
import { TokenService } from '../token/token.service';

export interface ApiResponse<T = any> { 
  success: boolean; 
  message: string; 
  data?: T | null; 
}

export interface LoginResponse {
  user: Contact;
  access_token: string;
  token_type: string;
  expires_in: number;
  expires_at: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiUrl;

  private currentUserSubject = new BehaviorSubject<Contact | null>(
    JSON.parse(localStorage.getItem('current_user') || 'null')
  );
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient, 
    private router: Router,
    private tokenService: TokenService
  ) {
    // Vérifie si le token est encore valide au démarrage
    this.checkTokenValidity();
  }

  public get currentUserValue(): Contact | null {
    return this.currentUserSubject.value;
  }

  /**
   * Vérifie la validité du token au démarrage
   */
  private checkTokenValidity(): void {
    if (this.tokenService.isTokenExpired()) {
      this.clearAuthData();
    }
  }

  /**
   * Stocke les données d'authentification
   */
  private setAuthData(token: string, user: Contact, expiresIn: number): void {
    // Utilise TokenService pour gérer le token
    this.tokenService.storeToken(token, expiresIn);
    
    // Stocke l'utilisateur
    this.currentUserSubject.next(user);
    localStorage.setItem('current_user', JSON.stringify(user));
    localStorage.setItem('user_id', String(user.id));
  }

  /**
   * Nettoie toutes les données d'authentification
   */
  private clearAuthData(): void {
    this.tokenService.clearToken();
    this.currentUserSubject.next(null);
  }

  /**
   * Gestion des erreurs HTTP
   */
  private handleError = (error: HttpErrorResponse) => {
    console.error('HTTP Error:', error);
    
    let msg = 'Une erreur inconnue est survenue';
    
    if (error.status === 422) {
      const e = error.error;
      if (e?.data && typeof e.data === 'object') {
        msg = Object.values(e.data).flat().join(' ');
      } else if (e?.errors) {
        msg = Object.values(e.errors).flat().join(' ');
      } else if (e?.message) {
        msg = e.message;
      }
    } else if (error.status === 401) {
      msg = 'Identifiants incorrects';
      this.clearAuthData();
    } else if (error.status === 403) {
      msg = error.error?.message || 'Accès refusé';
    } else if (error.status === 419) {
      msg = 'Session expirée';
    } else if (error.status === 0) {
      msg = 'Serveur injoignable';
    } else if (error.error?.message) {
      msg = error.error.message;
    }
    
    return throwError(() => error);
  }

  /**
   * LOGIN STATELESS
   * Envoie credentials et reçoit un token Bearer
   */
  login(credentials: { email: string; password: string }): Observable<LoginResponse> {
    return this.http
      .post<ApiResponse<LoginResponse>>(`${this.apiUrl}/login-stateless`, credentials)
      .pipe(
        map(response => {
          if (!response.data) {
            throw new Error('Réponse invalide du serveur');
          }
          return response.data;
        }),
        tap(data => {
          this.setAuthData(data.access_token, data.user, data.expires_in);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * LOGOUT
   * Révoque le token côté serveur et nettoie les données locales
   */
  logout(): Observable<any> {
    return this.http
      .post<ApiResponse>(`${this.apiUrl}/logout`, {})
      .pipe(
        tap(() => {
          this.clearAuthData();
          this.router.navigate(['/auth/login']);
        }),
        catchError(error => {
          // Même en cas d'erreur serveur, nettoie localement
          this.clearAuthData();
          this.router.navigate(['/auth/login']);
          return throwError(() => error);
        })
      );
  }

  /**
   * Récupère les informations de l'utilisateur connecté
   */
  getMe(): Observable<Contact> {
    return this.http
      .get<ApiResponse<Contact>>(`${this.apiUrl}/users/me`)
      .pipe(
        map(response => {
          if (!response.data) {
            throw new Error('Utilisateur non trouvé');
          }
          return response.data;
        }),
        tap(user => {
          this.currentUserSubject.next(user);
          localStorage.setItem('current_user', JSON.stringify(user));
        }),
        catchError(this.handleError)
      );
  }

  /**
   * INSCRIPTION (Register)
   */
  register(payload: Contact): Observable<LoginResponse> {
    return this.http
      .post<ApiResponse<LoginResponse>>(`${this.apiUrl}/users/clients/create`, payload)
      .pipe(
        map(response => {
          if (!response.data) {
            throw new Error('Erreur lors de la création du compte');
          }
          return response.data;
        }),
        tap(data => {
          // Si l'API retourne un token après inscription
          if (data.access_token) {
            this.setAuthData(data.access_token, data.user, data.expires_in);
          } else {
            // Sinon, juste stocker l'utilisateur
            this.currentUserSubject.next(data.user);
            localStorage.setItem('current_user', JSON.stringify(data.user));
          }
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Vérifie si l'utilisateur est authentifié
   */
  isAuthenticated(): boolean {
    const hasToken = this.tokenService.hasToken();
    const hasUser = !!this.currentUserValue;
    
    if (!hasToken || !hasUser) {
      return false;
    }
    
    // Vérifie l'expiration via TokenService
    if (this.tokenService.isTokenExpired()) {
      this.clearAuthData();
      return false;
    }
    
    return true;
  }

  /**
   * Récupère l'ID de l'utilisateur
   */
  getUserId(): number | null {
    const id = this.currentUserValue?.id ?? Number(localStorage.getItem('user_id'));
    return Number.isFinite(id) ? Number(id) : null;
  }

  /**
   * Récupère le token d'authentification
   */
  getToken(): string | null {
    return this.tokenService.getToken();
  }

  /**
   * Vérifie si le token est expiré
   */
  isTokenExpired(): boolean {
    return this.tokenService.isTokenExpired();
  }

  /**
   * Retourne le temps restant avant expiration (en secondes)
   */
  getTokenTimeRemaining(): number {
    return this.tokenService.getTokenTimeRemaining();
  }

  /**
   * Vérifie le token côté serveur
   */
  verifyToken(): Observable<boolean> {
    return this.tokenService.verifyToken();
  }

  /**
   * Retourne les informations complètes sur le token (debug)
   */
  getTokenInfo() {
    return this.tokenService.getTokenInfo();
  }
} 