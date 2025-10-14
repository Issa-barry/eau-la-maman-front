import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Civilite } from 'src/app/demo/enums/civilite.enum';
import { ContactEnum } from 'src/app/demo/enums/contact.enum';
import { VehiculeEnum } from 'src/app/demo/enums/vehicule.enum';
 import { Role } from 'src/app/demo/models/Role';
import { User } from 'src/app/demo/models/User';
 import { RoleService } from 'src/app/demo/service/role/role.service';
import { UserService } from 'src/app/demo/service/users/user.service';

@Component({
  selector: 'app-contact-new-client',
  templateUrl: './contact-new-client.component.html',
  styleUrl: './contact-new-client.component.scss',
  providers: [MessageService, ConfirmationService],
})
export class ContactNewClientComponent implements OnInit {
    countries: any[] = [];
    submitted: boolean = false;
    user: User = new User();
    roles: Role[] = [];
    errors: { [key: string]: string } = {};
    isGuineeSelected: boolean = false;
    loading = false; 
   
    constructor(
        private router: Router,
        private userService: UserService,
        private roleService: RoleService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {
        this.countries = [
            { name: 'GUINEE-CONAKRY', code: 'GN', value: 'GUINEE-CONAKRY' },
            { name: 'France', code: 'FR', value: 'FRANCE' },
        ];
        this.getAllRoles();
    }

    /**************************
     * ROLE
     **************************/
    getAllRoles(): void {

        this.roleService.getRoles().subscribe({
            next: (response) => {
                this.roles = response;
            },
        });
    }

    //Civilité :  Convertir l'énumération en tableau d'options
    civiliteOptions = Object.values(Civilite).map((civ) => ({
        label: civ,
        value: civ,
    }));

     clientOptions = [
        { label: 'Spécifique', value: ContactEnum.ClientSpecifique },
        { label: 'Livreur',   value: ContactEnum.Livreur },
        ];

        vehiculeOptions = Object.values(VehiculeEnum).map((vehicule) => ({
        label: vehicule,
        value: vehicule,
    }));

    onTypeClientChange(val: ContactEnum) {
//   if (val !== ContactEnum.Vehicule) {
//     this.user.type_vehicule = null;
//   }
}

    // iba


    saveClient() {
        this.submitted = true;
        this.errors = {};

        if (
            !this.user.nom_complet ||
            !this.user.phone  
         ) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Attention',
                detail: 'Veuillez remplir tous les champs obligatoires.',
                life: 3000,
            });
            return; 
        } 

        const clientPayload = {
        nom_complet: this.user.nom_complet,
        phone: this.user.phone
    };

         console.log(this.user)
         
        this.userService.createClient(clientPayload).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: 'User créé avec succès',
                    life: 3000,
                });

                this.user = new User();
                this.submitted = false;
                this.errors = {};
                 
                // this.router.navigate(['/dashboard/user']);
            },
            error: (err) => {
                console.error('Erreur lors de la création du user:', err);

                if (err.error && err.error.errors) {
                    this.errors = err.error.errors;
                }
 
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Création du user échouée. Vérifiez les champs.',
                    life: 5000,
                });
            },
        }); 
    }

    
}