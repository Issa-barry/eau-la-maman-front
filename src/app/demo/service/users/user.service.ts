import {
    HttpClient,
    HttpHeaders,
    HttpErrorResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environements/environment.dev';
import { catchError, map, Observable, throwError } from 'rxjs';
import { User } from '../../models/User';
  
const httpOption = {
    headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,DELETE,PUT',
    }),
};

@Injectable({
    providedIn: 'root',
})
export class UserService {
    private apiUrl = `${environment.apiUrl}/users`;

    constructor(private http: HttpClient) {}

    private log(log: string) {
        console.info(log);
    }

    /**
     * Nouvelle gestion des erreurs améliorée
     */
    private handleError(error: HttpErrorResponse) {
        console.error('Erreur API:', error);

        let errorMessage = 'Une erreur inconnue est survenue';

        if (error.error instanceof ErrorEvent) {
            // 👉 Erreur côté client (ex: problème réseau)
            errorMessage = `Erreur client : ${error.error.message}`;
        } else {
            // 👉 Erreur côté serveur
            if (error.status === 422) {
                if (error.error && error.error.errors) {
                    // 🔍 Vérifie si `errors` est un objet et récupère tous les messages
                    if (typeof error.error.errors === 'object') {
                        errorMessage = Object.keys(error.error.errors)
                            .map((key) => error.error.errors[key].join(' '))
                            .join(' ');
                    } else {
                        errorMessage = JSON.stringify(error.error.errors); 
                    }
                } else if (error.error.message) {
                    errorMessage = error.error.message; //  Si l'API renvoie juste un message
                }
            } else if (error.status === 0) {
                errorMessage = 'Impossible de se connecter au serveur';
            } else {
                errorMessage = `Erreur serveur ${error.status}: ${error.message}`;
            }
        }

        return throwError(() => new Error(errorMessage));
    }

    getUser(): Observable<User[]> {
        return this.http
            .get<{ success: boolean; data: User[] }>(`${this.apiUrl}/all`)
            .pipe(
                map((response) => response.data),
                catchError(this.handleError)
            );
    }

    getUserById(id: number): Observable<User> {
        return this.http
            .get<{ success: boolean; data: User }>(
                `${this.apiUrl}/getById/${id}`
            )
            .pipe(
                map((response) => response.data),
                catchError(this.handleError)
            );
    }

    createUser(users: User): Observable<User> {
        return this.http.post<User>(
            `${this.apiUrl}/create`,
            users,
            httpOption
        );
    }

     createClient(users: any): Observable<User> {
    return this.http
        .post<{ success: boolean; data: User }>(
            `${environment.apiUrl}/clients/create`,
            users,
            httpOption
        )
        .pipe( 
            map((res) => res.data),
            catchError(this.handleError)
        );
}

     createEmploye(users: any): Observable<User> {
    return this.http
        .post<{ success: boolean; data: User }>(
            `${environment.apiUrl}/users/employes/create`,
            users,
            httpOption
        )
        .pipe( 
            map((res) => res.data),
            catchError(this.handleError)
        );
}

    updateClient(id: number, users: User): Observable<User> {
        return this.http
            .put<User>(
                `${this.apiUrl}/clients/updateById/${id}`,
                users,
                httpOption
            )
            .pipe(catchError(this.handleError));
    }
  
    updateUser(id: number, users: User): Observable<User> {
        return this.http
            .put<User>(
                `${this.apiUrl}/updateById/${id}`,
                users,
                httpOption
            )
            .pipe(catchError(this.handleError));
    }

   


    deleteUser(id: number): Observable<void> {
        return this.http
            .delete<void>(`${this.apiUrl}/delateById/${id}`, httpOption)
            .pipe(catchError(this.handleError));
    }

    affecterAgenceById(userId: number, agenceId: number): Observable<User> {
        return this.http
            .post<{ success: boolean; data: User }>(
                `${this.apiUrl}/affecter-agence/${userId}`,
                { agence_id: agenceId }, // Données envoyées à l'API
                httpOption
            )
            .pipe(
                map((response) => {
                    if (!response.success) {
                        throw new Error("Échec de l'affectation de l'agence");
                    }
                    return response.data;
                }),
                catchError(this.handleError)
            );
    } 

    affecterAgenceByReference(userId: number, reference: string): Observable<User> {
      return this.http.post<User>(`${this.apiUrl}/affecterByReference/${userId}`, { reference }, httpOption)
          .pipe(
              catchError(this.handleError)
          );
  } 
  
    desaffecterAgence(usersId: number): Observable<User> {
        return this.http
            .delete<{ success: boolean; data: User }>(
                `${this.apiUrl}/desaffecter-agence/${usersId}`
            )
            .pipe(
                map((response) => response.data),
                catchError(this.handleError)
            );
    }

      updateStatut(id: number, statut: 'active' | 'attente' | 'bloque' | 'archive'): Observable<User> {
      return this.http
        .patch<{ success: boolean; data: User }>(
          `${this.apiUrl}/${id}/statutUpdate`,
          { statut },
          httpOption
        )
        .pipe(
          map((res) => res.data),
          catchError(this.handleError)
        );
    }
}
