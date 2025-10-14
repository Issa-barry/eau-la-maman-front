import {
    HttpClient,
    HttpHeaders,
    HttpErrorResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environements/environment.dev';
import { catchError, map, Observable, throwError } from 'rxjs';
import { Contact } from '../../models/contact';

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
export class ContactService {
    private apiUrl = `${environment.apiUrl}/contacts`;

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

    getContacts(): Observable<Contact[]> {
        return this.http
            .get<{ success: boolean; data: Contact[] }>(`${this.apiUrl}/all`)
            .pipe(
                map((response) => response.data),
                catchError(this.handleError)
            );
    }

    getContactById(id: number): Observable<Contact> {
        return this.http
            .get<{ success: boolean; data: Contact }>(
                `${this.apiUrl}/getById/${id}`
            )
            .pipe(
                map((response) => response.data),
                catchError(this.handleError)
            );
    }

    createContact(contact: Contact): Observable<Contact> {
        return this.http.post<Contact>(
            `${this.apiUrl}/create`,
            contact,
            httpOption
        );
    }

     createClient(contact: any): Observable<Contact> {
    return this.http
        .post<{ success: boolean; data: Contact }>(
            `${this.apiUrl}/create`,
            contact,
            httpOption
        )
        .pipe( 
            map((res) => res.data),
            catchError(this.handleError)
        );
}

     createEmploye(contact: any): Observable<Contact> {
    return this.http
        .post<{ success: boolean; data: Contact }>(
            `${environment.apiUrl}/users/employes/create`,
            contact,
            httpOption
        )
        .pipe( 
            map((res) => res.data),
            catchError(this.handleError)
        );
}

    updateClient(id: number, contact: Contact): Observable<Contact> {
        return this.http
            .put<Contact>(
                `${this.apiUrl}/clients/updateById/${id}`,
                contact,
                httpOption
            )
            .pipe(catchError(this.handleError));
    }
  
    updateContact(id: number, contact: Contact): Observable<Contact> {
        return this.http
            .put<Contact>(
                `${this.apiUrl}/updateById/${id}`,
                contact,
                httpOption
            )
            .pipe(catchError(this.handleError));
    }

   


    deleteContact(id: number): Observable<void> {
        return this.http
            .delete<void>(`${this.apiUrl}/delateById/${id}`, httpOption)
            .pipe(catchError(this.handleError));
    }

    affecterAgenceById(userId: number, agenceId: number): Observable<Contact> {
        return this.http
            .post<{ success: boolean; data: Contact }>(
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

    affecterAgenceByReference(userId: number, reference: string): Observable<Contact> {
      return this.http.post<Contact>(`${this.apiUrl}/affecterByReference/${userId}`, { reference }, httpOption)
          .pipe(
              catchError(this.handleError)
          );
  } 
  
    desaffecterAgence(contactId: number): Observable<Contact> {
        return this.http
            .delete<{ success: boolean; data: Contact }>(
                `${this.apiUrl}/desaffecter-agence/${contactId}`
            )
            .pipe(
                map((response) => response.data),
                catchError(this.handleError)
            );
    }

      updateStatut(id: number, statut: 'active' | 'attente' | 'bloque' | 'archive'): Observable<Contact> {
      return this.http
        .patch<{ success: boolean; data: Contact }>(
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
