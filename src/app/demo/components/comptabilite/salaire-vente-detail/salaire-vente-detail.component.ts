import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';

interface Vehicule {
  id: number;
  nom: string;
  immatriculation: string;
  type: string;
}

interface Livreur {
  id: number;
  nom: string;
  telephone: string;
  tauxPart: number;
}

interface Proprietaire {
  id: number;
  nom: string;
  raisonSociale: string;
  contact: string;
  tauxPart: number;
}

interface Charge {
  id?: number;
  type: string;
  montant: number;
  date: Date;
  commentaire: string;
}

interface PaiementSalaire {
  vehicule: Vehicule | null;
  livreur: Livreur | null;
  proprietaire: Proprietaire | null;
  periode: Date[];
  statut: 'brouillon' | 'en_attente' | 'paye';
  totalEncaisse: number;
  charges: Charge[];
  totalCharges: number;
  netARepartir: number;
  montantLivreur: number;
  montantProprietaire: number;
}

@Component({
  selector: 'app-salaire-vente-detail',
  templateUrl: './salaire-vente-detail.component.html',
  styleUrls: ['./salaire-vente-detail.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class SalaireVenteDetailComponent implements OnInit {
  
  // Formulaires
  chargeForm!: FormGroup;
  
  // Données
  vehiculeId: string | null = null;
  selectedVehicule: Vehicule | null = null;
  periode: Date[] = [];
  
  // Gestion des charges - Dialog
  chargeDialog: boolean = false;
  deleteChargeDialog: boolean = false;
  chargeSubmitted: boolean = false;
  editingCharge: Charge | null = null;
  
  // Types de charges
  typesCharges = [
    { label: 'Carburant', value: 'carburant', icon: 'pi pi-bolt' },
    { label: 'Réparation', value: 'reparation', icon: 'pi pi-wrench' },
    { label: 'Entretien', value: 'entretien', icon: 'pi pi-cog' },
    { label: 'Assurance', value: 'assurance', icon: 'pi pi-shield' },
    { label: 'Autre', value: 'autre', icon: 'pi pi-ellipsis-h' }
  ];

  // Statuts
  statuts = [
    { label: 'Brouillon', value: 'brouillon', severity: 'secondary' },
    { label: 'En attente', value: 'en_attente', severity: 'warning' },
    { label: 'Payé', value: 'paye', severity: 'success' }
  ];

  // Données du paiement
  paiement: PaiementSalaire = {
    vehicule: null,
    livreur: null,
    proprietaire: null,
    periode: [],
    statut: 'brouillon',
    totalEncaisse: 0,
    charges: [],
    totalCharges: 0,
    netARepartir: 0,
    montantLivreur: 0,
    montantProprietaire: 0
  };

  // UI States
  loading = false;
  isEditable = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.setPeriodeDefaut();
    this.loadVehiculeFromRoute();
  }

  initForm(): void {
    this.chargeForm = this.fb.group({
      type: ['', Validators.required],
      montant: [0, [Validators.required, Validators.min(1)]],
      date: [new Date(), Validators.required],
      commentaire: ['', Validators.maxLength(200)]
    });
  }

  setPeriodeDefaut(): void {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    this.periode = [firstDay, today];
    this.paiement.periode = this.periode;
  }

  /**
   * Charger le véhicule depuis l'URL
   */
  loadVehiculeFromRoute(): void {
    this.route.paramMap.subscribe(params => {
      this.vehiculeId = params.get('id');
      
      if (this.vehiculeId) {
        this.loading = true;
        
        setTimeout(() => {
          this.loadVehiculeById(this.vehiculeId!);
          this.loading = false;
        }, 800);
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Aucun véhicule spécifié dans l\'URL',
          life: 4000
        });
        
        setTimeout(() => {
          this.router.navigate(['/comptabilite/salaires']);
        }, 2000);
      }
    });
  }

  /**
   * Charger les données du véhicule par ID
   */
  loadVehiculeById(matricule: string): void {
    const vehiculesSimulation: Vehicule[] = [
      { id: 1, nom: 'Camion Mercedes', immatriculation: 'CKY-4567-A', type: 'Camion 10T' },
      { id: 2, nom: 'Camion Isuzu', immatriculation: 'CKY-8901-B', type: 'Camion 15T' },
      { id: 3, nom: 'Fourgon Toyota', immatriculation: 'CKY-2345-C', type: 'Fourgon 5T' },
      { id: 4, nom: 'Camion Mitsubishi', immatriculation: 'CKY-5678-D', type: 'Camion 12T' },
      { id: 5, nom: 'Camion Hino', immatriculation: 'CKY-9012-E', type: 'Camion 8T' }
    ];

    const vehicule = vehiculesSimulation.find(v => v.immatriculation === matricule);

    if (vehicule) {
      this.selectedVehicule = vehicule;
      this.loadDataForVehicule(vehicule.id);
      
      this.messageService.add({
        severity: 'success',
        summary: 'Véhicule chargé',
        detail: `${vehicule.nom} - ${vehicule.immatriculation}`,
        life: 3000
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Véhicule introuvable',
        detail: `Aucun véhicule trouvé avec le matricule ${matricule}`,
        life: 4000
      });
      
      setTimeout(() => {
        this.router.navigate(['/comptabilite/salaires']);
      }, 2000);
    }
  }

  /**
   * Charger les données associées au véhicule
   */
  loadDataForVehicule(vehiculeId: number): void {
    this.paiement.vehicule = this.selectedVehicule;
    
    const livreurs = [
      { id: 1, nom: 'Mamadou Diallo', telephone: '+224 620 00 00 00', tauxPart: 40 },
      { id: 2, nom: 'Ibrahima Sow', telephone: '+224 621 11 11 11', tauxPart: 35 },
      { id: 3, nom: 'Abdoulaye Bah', telephone: '+224 622 22 22 22', tauxPart: 45 }
    ];
    this.paiement.livreur = livreurs[vehiculeId % livreurs.length];

    const proprietaires = [
      { 
        id: 1, 
        nom: 'Société TRANS-GUINÉE', 
        raisonSociale: 'TRANS-GUINÉE SARL', 
        contact: '+224 622 11 11 11', 
        tauxPart: 60 
      },
      { 
        id: 2, 
        nom: 'LOGISTIQUE EXPRESS', 
        raisonSociale: 'LOGISTIQUE EXPRESS SARL', 
        contact: '+224 623 33 33 33', 
        tauxPart: 65 
      }
    ];
    this.paiement.proprietaire = proprietaires[vehiculeId % proprietaires.length];

    this.paiement.totalEncaisse = 20000000 + (vehiculeId * 5000000);

    this.paiement.charges = [
      {
        id: 1,
        type: 'carburant',
        montant: 2500000,
        date: new Date(2025, 0, 5),
        commentaire: 'Carburant semaine 1'
      },
      {
        id: 2,
        type: 'reparation',
        montant: 1200000,
        date: new Date(2025, 0, 8),
        commentaire: 'Changement pneus'
      }
    ];

    this.calculerMontants();
  }

  onPeriodeChange(): void {
    if (this.periode && this.periode.length === 2 && this.selectedVehicule) {
      this.paiement.periode = this.periode;
      this.loading = true;
      
      setTimeout(() => {
        this.loadDataForVehicule(this.selectedVehicule!.id);
        this.loading = false;
        
        this.messageService.add({
          severity: 'info',
          summary: 'Période mise à jour',
          detail: 'Les données ont été rechargées pour la nouvelle période',
          life: 3000
        });
      }, 500);
    }
  }

  // ===== GESTION DES CHARGES =====

  /**
   * Ouvrir le dialog pour ajouter une nouvelle charge
   */
  openNewCharge(): void {
    this.editingCharge = null;
    this.chargeSubmitted = false;
    this.chargeForm.reset({
      type: '',
      montant: 0,
      date: new Date(),
      commentaire: ''
    });
    this.chargeDialog = true;
  }

  /**
   * Ouvrir le dialog pour modifier une charge existante
   */
  editCharge(charge: Charge): void {
    this.editingCharge = { ...charge };
    this.chargeForm.patchValue({
      type: charge.type,
      montant: charge.montant,
      date: new Date(charge.date),
      commentaire: charge.commentaire
    });
    this.chargeSubmitted = false;
    this.chargeDialog = true;
  }

  /**
   * Fermer le dialog
   */
  hideChargeDialog(): void {
    this.chargeDialog = false;
    this.chargeSubmitted = false;
    this.editingCharge = null;
  }

  /**
   * Sauvegarder la charge (ajout ou modification)
   */
  saveCharge(): void {
    this.chargeSubmitted = true;

    if (this.chargeForm.valid) {
      if (this.editingCharge && this.editingCharge.id) {
        // Modification
        const index = this.paiement.charges.findIndex(c => c.id === this.editingCharge!.id);
        if (index !== -1) {
          this.paiement.charges[index] = {
            ...this.editingCharge,
            ...this.chargeForm.value
          };
          
          this.messageService.add({
            severity: 'success',
            summary: 'Charge modifiée',
            detail: 'La charge a été modifiée avec succès',
            life: 3000
          });
        }
      } else {
        // Ajout
        const nouvelleCharge: Charge = {
          id: Date.now(),
          ...this.chargeForm.value
        };
        
        this.paiement.charges.push(nouvelleCharge);
        
        this.messageService.add({
          severity: 'success',
          summary: 'Charge ajoutée',
          detail: 'La charge a été ajoutée avec succès',
          life: 3000
        });
      }

      this.paiement.charges = [...this.paiement.charges];
      this.calculerMontants();
      this.hideChargeDialog();
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Formulaire invalide',
        detail: 'Veuillez remplir tous les champs obligatoires',
        life: 3000
      });
    }
  }

  /**
   * Demander confirmation avant suppression
   */
  deleteCharge(charge: Charge): void {
    this.editingCharge = { ...charge };
    this.deleteChargeDialog = true;
  }

  /**
   * Confirmer la suppression
   */
  confirmDeleteCharge(): void {
    this.deleteChargeDialog = false;
    this.paiement.charges = this.paiement.charges.filter(c => c.id !== this.editingCharge!.id);
    this.calculerMontants();
    
    this.messageService.add({
      severity: 'success',
      summary: 'Charge supprimée',
      detail: 'La charge a été supprimée avec succès',
      life: 3000
    });
    
    this.editingCharge = null;
  }

  calculerMontants(): void {
    this.paiement.totalCharges = this.paiement.charges.reduce(
      (sum, charge) => sum + charge.montant, 
      0
    );

    this.paiement.netARepartir = this.paiement.totalEncaisse - this.paiement.totalCharges;

    if (this.paiement.livreur && this.paiement.proprietaire) {
      this.paiement.montantLivreur = 
        (this.paiement.netARepartir * this.paiement.livreur.tauxPart) / 100;
      
      this.paiement.montantProprietaire = 
        (this.paiement.netARepartir * this.paiement.proprietaire.tauxPart) / 100;
    }
  }

  enregistrerBrouillon(): void {
    if (!this.selectedVehicule) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Véhicule requis',
        detail: 'Aucun véhicule sélectionné',
        life: 3000
      });
      return;
    }

    this.loading = true;
    
    setTimeout(() => {
      this.paiement.statut = 'brouillon';
      this.loading = false;
      
      this.messageService.add({
        severity: 'info',
        summary: 'Brouillon enregistré',
        detail: 'Le paiement a été enregistré en brouillon',
        life: 3000
      });
    }, 1000);
  }

  validerPaiement(): void {
    if (!this.selectedVehicule) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Véhicule requis',
        detail: 'Aucun véhicule sélectionné',
        life: 3000
      });
      return;
    }

    if (this.paiement.charges.length === 0) {
      this.confirmationService.confirm({
        message: 'Aucune charge n\'a été ajoutée. Voulez-vous continuer ?',
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Oui, continuer',
        rejectLabel: 'Annuler',
        accept: () => {
          this.procederValidationPaiement();
        }
      });
    } else {
      this.procederValidationPaiement();
    }
  }

  procederValidationPaiement(): void {
    this.confirmationService.confirm({
      message: `Confirmer le paiement de ${this.formatCurrency(this.paiement.montantLivreur)} au livreur et ${this.formatCurrency(this.paiement.montantProprietaire)} au propriétaire ?`,
      header: 'Validation du paiement',
      icon: 'pi pi-check-circle',
      acceptLabel: 'Oui, valider',
      rejectLabel: 'Annuler',
      acceptButtonStyleClass: 'p-button-success',
      accept: () => {
        this.loading = true;
        
        setTimeout(() => {
          this.paiement.statut = 'paye';
          this.isEditable = false;
          this.loading = false;
          
          this.messageService.add({
            severity: 'success',
            summary: 'Paiement validé',
            detail: 'Le paiement a été validé avec succès',
            life: 3000
          });
        }, 1500);
      }
    });
  }

  retourListe(): void {
    this.router.navigate(['/dashboard/comptabilite']);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-GN', {
      style: 'currency',
      currency: 'GNF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  getTypeChargeLabel(type: string): string {
    const found = this.typesCharges.find(t => t.value === type);
    return found ? found.label : type;
  }

  getTypeChargeIcon(type: string): string {
    const found = this.typesCharges.find(t => t.value === type);
    return found ? found.icon : 'pi pi-circle';
  }

  getStatutSeverity(): string {
    const found = this.statuts.find(s => s.value === this.paiement.statut);
    return found ? found.severity : 'secondary';
  }

  getStatutLabel(): string {
    const found = this.statuts.find(s => s.value === this.paiement.statut);
    return found ? found.label : this.paiement.statut;
  }
}