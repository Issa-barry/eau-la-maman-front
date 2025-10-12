import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from 'src/environements/environment.dev';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const isApiRequest = req.url.startsWith(environment.apiUrl);
    
    // Si c'est une requête vers l'API
    if (isApiRequest) {
      const token = localStorage.getItem('auth_token');
      
      // Clone la requête et ajoute le token si disponible
      let clonedReq = req.clone({
        setHeaders: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      });

      // Ajoute le Bearer token si présent
      if (token) {
        clonedReq = clonedReq.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
      }

      return next.handle(clonedReq).pipe(
        catchError((error: HttpErrorResponse) => {
          // Gestion des erreurs d'authentification
          if (error.status === 401) {
            // Token invalide ou expiré
            this.handleUnauthorized();
          } else if (error.status === 403) {
            // Accès refusé (email non vérifié, permissions insuffisantes, etc.)
            console.warn('Accès refusé:', error.error?.message);
          } else if (error.status === 419) {
            // Token CSRF expiré (ne devrait pas arriver en stateless)
            console.warn('Token CSRF expiré');
          }
          
          return throwError(() => error);
        })
      );
    }

    // Pour les requêtes non-API, passe directement
    return next.handle(req);
  }

  /**
   * Gère les erreurs 401 (Unauthorized)
   */
  private handleUnauthorized(): void {
    // Nettoie les données d'authentification
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
    localStorage.removeItem('user_id');
    localStorage.removeItem('token_expires_at');
    
    // Redirige vers la page de login
    const currentUrl = this.router.url;
    this.router.navigate(['/auth/login'], {
      queryParams: { 
        redirect: currentUrl,
        expired: 'true' 
      }
    });
  }
}