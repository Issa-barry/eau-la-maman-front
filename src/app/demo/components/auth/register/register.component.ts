import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { User } from 'src/app/demo/models/User';
 import { AuthService } from 'src/app/demo/service/auth/auth.service';
import { LayoutService } from 'src/app/layout/service/app.layout.service';

@Component({
    templateUrl: './register.component.html',
    providers: [MessageService, ConfirmationService]
})
export class RegisterComponent {
    confirmed: boolean = false;
    user: User = new User();
    errorMessage: string = '';
    successMessage: string = '';

    nom: string = '';
    prenom: string = ''; 
    email: string = '';
    phone: string = '';
    password: string = ''; 
    password_confirmation: string = ''; 
    role : string = "client";
    date_naissance:string ="2024-01-01";
    

    constructor(
        public router: Router,
        private authService: AuthService,
        private layoutService: LayoutService,
        private messageService: MessageService, 
        private confirmationService: ConfirmationService) {}

    get dark(): boolean {
        return this.layoutService.config().colorScheme !== 'light';
    }

    onRegister(){
        this.user.password_confirmation = this.user.password;
        console.log(this.user);
        
        this.authService.register(this.user).subscribe({
            next: (response) => {
                this.successMessage = 'Inscription réussie ! Vous avez reçu un mail de validation.';
                this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Inscription réussie ! Vous avez reçu un mail de validation.', life: 4000 });
                this.router.navigate(['/auth/login']);
            
                setTimeout(() => {
                    this.router.navigate(['/auth/login']);
                }, 4000);
            },
            error: (err) => {
                this.errorMessage = err.error?.message || 'Une erreur est survenue.';
                console.error(err);
            }
        });

    }
}
 