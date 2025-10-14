import { Component } from '@angular/core';
import { MessageService } from 'primeng/api';
import { PasswordService } from 'src/app/demo/service/auth/password/password.service';
import { LayoutService } from 'src/app/layout/service/app.layout.service';

@Component({
    templateUrl: './forgotpassword.component.html',
    providers: [MessageService],
})
export class ForgotPasswordComponent {
    email = '';
    errorMessage = '';
    emailValid = true;
    loading = false;
    successMessage: string = ''; 
 
    constructor(
        private passwordService: PasswordService,
        private layoutService: LayoutService,
        private messageService: MessageService,
    ) {}

    get dark(): boolean {
        return this.layoutService.config().colorScheme !== 'light';
    }

    
    validateEmail(email: string): boolean {
        const emailPattern =
            /^[a-zA-Z0-9][a-zA-Z0-9._%+-]*(?<!\.)@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailPattern.test(email);
    }

    sendLink() {
        this.errorMessage = '';
        this.successMessage = '';
        this.loading = true;
 
        this.passwordService.sendResetPasswordLink(this.email).subscribe({
            next: (response) => {
               
                   this.successMessage = response.message
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Succès',
                        detail: response.message  ,
                        life: 7000,
                    });
                    this.loading = false
            },
            error: (err) => {
                 this.loading = false;
                console.log(err);
                this.errorMessage =err.error.data.email || "Erreur lors de l'envoi du lien.";
                   
            },
        });
    }

}
