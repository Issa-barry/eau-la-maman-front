import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
 import { VehiculeTypeEnum } from 'src/app/demo/enums/vehicule-type.enum';
import { VehiculeService } from 'src/app/demo/service/vehicule/vehicule.service';

type StatutVehicule = 'active' | 'attente' | 'bloque' | 'archive';

@Component({
  selector: 'app-vehicule-new',
  templateUrl: './vehicule-new.component.html',
  styleUrls: ['./vehicule-new.component.scss'],
  providers: [MessageService],
})
export class VehiculeNewComponent implements OnDestroy {
  loading = false;

   visible: boolean = false;
    closeTimeout: ReturnType<typeof setTimeout> | null = null;

  onReply(): void {
        this.messageService.clear('block7');
        this.visible = false;
    }
  // Dropdowns
  types = [
    { label: 'Camion', value: VehiculeTypeEnum.Camion },
    { label: 'Fourgonette', value: VehiculeTypeEnum.Fourgonette },
    { label: 'Tricycle', value: VehiculeTypeEnum.Tricycle },
  ];
  statuts = [
    { label: 'Active', value: 'active' as StatutVehicule },
    { label: 'En attente', value: 'attente' as StatutVehicule },
    { label: 'Bloqué', value: 'bloque' as StatutVehicule },
    { label: 'Archivé', value: 'archive' as StatutVehicule },
  ];

  // Reactive form
  form = this.fb.group({
    // Véhicule
    immatriculation: ['', [Validators.required, Validators.maxLength(60)]],
    type: [null as VehiculeTypeEnum | null, [Validators.required]],
    nom: [null as string | null, [Validators.maxLength(120)]],
    statut: ['active' as StatutVehicule, [Validators.required]],

    // Propriétaire
    nom_proprietaire: ['', [Validators.required, Validators.maxLength(120)]],
    prenom_proprietaire: ['', [Validators.required, Validators.maxLength(120)]],
    phone_proprietaire: ['', [Validators.required, Validators.maxLength(30)]],

    // Livreur
    nom_livreur: ['', [Validators.required, Validators.maxLength(120)]],
    prenom_livreur: ['', [Validators.required, Validators.maxLength(120)]],
    phone_livreur: ['', [Validators.required, Validators.maxLength(30)]],
  });

  apiErrors: Record<string, string> = {};

  constructor(
    private fb: FormBuilder,
    private vehiculeService: VehiculeService,
    private messageService: MessageService,
     private router: Router,
  ) {}

  
    ngOnDestroy(): void {
        if (this.closeTimeout) {
            clearTimeout(this.closeTimeout);
        }
    }

  submit() {
    this.apiErrors = {};
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;

    const payload = this.form.getRawValue();

      

    this.vehiculeService.create(payload as any).subscribe({
      next: (vehicule) => {
        this.loading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Créé',
          detail: `Véhicule ${vehicule.immatriculation} créé.`,
            life: 3000,
        });
        // Option: reset ou redirection
        // this.form.reset({
        //   type: null,
        //   statut: 'active',
        // });
          setTimeout(() => {
            this.router.navigate(['/dashboard/vehicule/vehicule-detail', vehicule.id]);
         }, 3100);
      },
      error: (err: Error) => {
        this.loading = false;
        // essaie d’extraire les erreurs champ par champ si possible
        try {
          const parsed = JSON.parse((err.message ?? '{}').toString());
          if (parsed && typeof parsed === 'object') this.apiErrors = parsed;
        } catch {}
        this.messageService.add({
          severity: 'error', 
          summary: 'Erreur',
          detail: err.message,
        });
      },
    });
  }

  hasError(ctrl: string, type: string) {
    const c = this.form.get(ctrl);
    return !!(c && c.touched && c.errors?.[type]);
  }
}
