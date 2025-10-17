import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Civilite } from 'src/app/demo/enums/civilite.enum';
import { ContactEnum } from 'src/app/demo/enums/contact.enum';
import { VehiculeTypeEnum } from 'src/app/demo/enums/vehicule-type.enum';
import { Contact } from 'src/app/demo/models/contact';
import { Role } from 'src/app/demo/models/Role';
import { ContactService } from 'src/app/demo/service/contact/contact.service';
import { RoleService } from 'src/app/demo/service/role/role.service';

@Component({
  selector: 'app-contact-new',
  templateUrl: './contact-new.component.html',
  styleUrl: './contact-new.component.scss',
  providers: [MessageService, ConfirmationService],
})
export class ContactNewComponent  implements OnInit {
  countries: any[] = [];
  submitted = false;
  contact: Contact = new Contact();
  roles: Role[] = [];
  errors: { [key: string]: string } = {};
  isGuineeSelected = false;
  loading = false;

  constructor(
    private router: Router,
    private contactService: ContactService,
    private roleService: RoleService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.countries = [
      { name: 'GUINÉE-CONAKRY', code: 'GN', value: 'GUINEE-CONAKRY' },
      { name: 'France', code: 'FR', value: 'FRANCE' },
    ];
    this.getAllRoles();
  }

  getAllRoles(): void {
    this.roleService.getRoles().subscribe({
      next: (response) => (this.roles = response),
    });
  }

  civiliteOptions = Object.values(Civilite).map((civ) => ({ label: civ, value: civ }));
  clientOptions = [
    { label: 'Spécifique', value: ContactEnum.ClientSpecifique },
    { label: 'Packing', value: ContactEnum.Packing },
  ];
  vehiculeOptions = Object.values(VehiculeTypeEnum).map((vehicule) => ({ label: vehicule, value: vehicule }));

  /** Helpers d'erreur (front + back) */
  hasError(field: string): boolean {
    // back: si Laravel renvoie { field: "message" } ou { field: ["message"] }
    if (this.errors[field]) return true;

    // front: quand on a soumis au moins une fois
    if (!this.submitted) return false;

    // règles front minimales (ajuste selon ton métier)
    switch (field) {
      case 'type':
        return !this.contact.type;
      case 'phone':
        return !this.contact.phone;
      case 'nom':
        // si tu veux rendre nom/prenom obligatoires pour client_specifique :
        return this.contact.type === ContactEnum.ClientSpecifique && !this.contact.nom;
      case 'prenom':
        return this.contact.type === ContactEnum.ClientSpecifique && !this.contact.prenom;
      default:
        return false;
    }
  }

  getError(field: string, fallback?: string): string {
    const v = this.errors[field];
    if (Array.isArray(v)) return v[0] ?? fallback ?? '';
    if (typeof v === 'string') return v || (fallback ?? '');
    return fallback ?? '';
  }

  saveClient() {
    this.submitted = true;
    this.errors = {};

    // Validation front minimaliste : peuple errors plutôt que toast
    if (!this.contact.type) this.errors['type'] = 'Le type est requis.';
    if (!this.contact.phone) this.errors['phone'] = 'Le téléphone est requis.';
    if (this.contact.type === ContactEnum.ClientSpecifique) {
      if (!this.contact.nom) this.errors['nom'] = 'Le nom est requis pour un client spécifique.';
      if (!this.contact.prenom) this.errors['prenom'] = 'Le prénom est requis pour un client spécifique.';
    }

    if (Object.keys(this.errors).length > 0) {
      // ne pas afficher de toast d'erreur ici : les erreurs sont sous les champs
      return;
    }

    const payload = {
      type: this.contact.type,
      phone: this.contact.phone,
      nom: this.contact.nom ?? null,
      prenom: this.contact.prenom ?? null,
      ville: this.contact.ville ?? null,
      quartier: this.contact.quartier ?? null,
    };

    this.loading = true;
    this.contactService.create(payload).subscribe({
      next: () => {
        this.loading = false;

        // Succès : tu peux garder un toast de succès si tu veux
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Contact créé avec succès',
          life: 3000,
        });

        this.contact = new Contact();
        this.submitted = false;
        this.errors = {};
        // this.router.navigate(['/dashboard/contact']);
      },
      error: (err) => {
        this.loading = false;

        // Mappe proprement les erreurs Laravel (422)
        if (err?.status === 422 && err?.error?.errors) {
          const srvErrors = err.error.errors as Record<string, string | string[]>;
          this.errors = Object.fromEntries(
            Object.entries(srvErrors).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])
          );
          return;
        }

        // Erreurs non-422 : toast global (optionnel)
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Création du contact échouée.',
          life: 5000,
        });
      },
    });
  }
}
