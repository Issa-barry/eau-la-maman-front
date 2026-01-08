import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';

interface Packing {
  id: number;
  reference: string;
  employe: string;
  quantite: number;
  date: Date;
  statut: 'validé' | 'en_attente' | 'annulé';
}

interface EmployePaiement {
  employeNom: string;
  nombrePacks: number;
  tarifParPack: number;
  montantTotal: number;
}

interface DetailsPaiement {
  packingId: string;
  packing: Packing | null;
  periode: Date[];
  packingsListe: Packing[];
  paiementsParEmploye: EmployePaiement[];
  totalPacks: number;
  montantTotalGeneral: number;
  statut: 'brouillon' | 'validé';
}

@Component({
  selector: 'app-salaire-packing-detail',
  templateUrl: './salaire-packing-detail.component.html',
  styleUrls: ['./salaire-packing-detail.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class SalairePackingDetailComponent implements OnInit {

  // Configuration
  TARIF_PAR_ROULEAU = 500; // 500 GNF par rouleau

  // Données
  packingId: string | null = null;
  periode: Date[] = [];
  
  // Détails du paiement
  details: DetailsPaiement = {
    packingId: '',
    packing: null,
    periode: [],
    packingsListe: [],
    paiementsParEmploye: [],
    totalPacks: 0,
    montantTotalGeneral: 0,
    statut: 'brouillon'
  };

  // Statuts
  statuts = [
    { label: 'Brouillon', value: 'brouillon', severity: 'secondary' },
    { label: 'Validé', value: 'validé', severity: 'success' }
  ];

  // UI States
  loading = false;
  isEditable = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.setPeriodeDefaut();
    this.loadPackingFromRoute();
  }

  setPeriodeDefaut(): void {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    this.periode = [firstDay, today];
    this.details.periode = this.periode;
  }

  /**
   * Charger le packing depuis l'URL
   */
  loadPackingFromRoute(): void {
    this.route.paramMap.subscribe(params => {
      this.packingId = params.get('id');
      
      if (this.packingId) {
        this.loading = true;
        
        setTimeout(() => {
          this.loadPackingById(this.packingId!);
          this.loading = false;
        }, 800);
      } else {
        // Chargement de tous les packings pour la période
        this.loadPackingsForPeriode();
      }
    });
  }

  /**
   * Charger un packing spécifique par ID
   */
  loadPackingById(reference: string): void {
    // Simulation - À remplacer par votre service
    const packingsSimulation: Packing[] = [
      {
        id: 1,
        reference: 'PK-20251024-0007',
        employe: 'Ali SYLLA',
        quantite: 120,
        date: new Date(2025, 0, 24),
        statut: 'validé'
      },
      {
        id: 2,
        reference: 'PK-20251024-0006',
        employe: 'Ali SYLLA',
        quantite: 95,
        date: new Date(2025, 0, 24),
        statut: 'validé'
      },
      {
        id: 3,
        reference: 'PK-20251023-0005',
        employe: 'Mamadou DIALLO',
        quantite: 150,
        date: new Date(2025, 0, 23),
        statut: 'validé'
      }
    ];

    const packing = packingsSimulation.find(p => p.reference === reference);

    if (packing) {
      this.details.packing = packing;
      this.details.packingId = reference;
      this.loadPackingsForPeriode();
      
      this.messageService.add({
        severity: 'success',
        summary: 'Packing chargé',
        detail: `Référence: ${packing.reference}`,
        life: 3000
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Packing introuvable',
        detail: `Aucun packing trouvé avec la référence ${reference}`,
        life: 4000
      });
      
      setTimeout(() => {
        this.router.navigate(['/comptabilite/salaires-packing']);
      }, 2000);
    }
  }

  /**
   * Charger tous les packings pour la période sélectionnée
   */
  loadPackingsForPeriode(): void {
    // Simulation - À remplacer par votre service
    this.details.packingsListe = [
      {
        id: 1,
        reference: 'PK-20251024-0007',
        employe: 'Ali SYLLA',
        quantite: 120,
        date: new Date(2025, 0, 24),
        statut: 'validé'
      },
      {
        id: 2,
        reference: 'PK-20251024-0006',
        employe: 'Ali SYLLA',
        quantite: 95,
        date: new Date(2025, 0, 24),
        statut: 'validé'
      },
      {
        id: 3,
        reference: 'PK-20251023-0005',
        employe: 'Mamadou DIALLO',
        quantite: 150,
        date: new Date(2025, 0, 23),
        statut: 'validé'
      },
      {
        id: 4,
        reference: 'PK-20251023-0004',
        employe: 'Ibrahima SOW',
        quantite: 80,
        date: new Date(2025, 0, 23),
        statut: 'validé'
      },
      {
        id: 5,
        reference: 'PK-20251022-0003',
        employe: 'Mamadou DIALLO',
        quantite: 110,
        date: new Date(2025, 0, 22),
        statut: 'validé'
      },
      {
        id: 6,
        reference: 'PK-20251022-0002',
        employe: 'Ali SYLLA',
        quantite: 75,
        date: new Date(2025, 0, 22),
        statut: 'validé'
      }
    ];

    this.calculerPaiements();
  }

  /**
   * Recalculer lors du changement de période
   */
  onPeriodeChange(): void {
    if (this.periode && this.periode.length === 2) {
      this.details.periode = this.periode;
      this.loading = true;
      
      setTimeout(() => {
        this.loadPackingsForPeriode();
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

  /**
   * Calculer les paiements par employé
   */
  calculerPaiements(): void {
    // Regrouper par employé
    const paiementsMap = new Map<string, EmployePaiement>();

    this.details.packingsListe.forEach(packing => {
      if (packing.statut === 'validé') {
        const existing = paiementsMap.get(packing.employe);
        
        if (existing) {
          existing.nombrePacks += packing.quantite;
          existing.montantTotal = existing.nombrePacks * this.TARIF_PAR_ROULEAU;
        } else {
          paiementsMap.set(packing.employe, {
            employeNom: packing.employe,
            nombrePacks: packing.quantite,
            tarifParPack: this.TARIF_PAR_ROULEAU,
            montantTotal: packing.quantite * this.TARIF_PAR_ROULEAU
          });
        }
      }
    });

    // Convertir en tableau
    this.details.paiementsParEmploye = Array.from(paiementsMap.values());

    // Calculer les totaux
    this.details.totalPacks = this.details.paiementsParEmploye.reduce(
      (sum, p) => sum + p.nombrePacks, 
      0
    );

    this.details.montantTotalGeneral = this.details.paiementsParEmploye.reduce(
      (sum, p) => sum + p.montantTotal, 
      0
    );
  }

  /**
   * Enregistrer en brouillon
   */
  enregistrerBrouillon(): void {
    this.loading = true;
    
    setTimeout(() => {
      this.details.statut = 'brouillon';
      this.loading = false;
      
      this.messageService.add({
        severity: 'info',
        summary: 'Brouillon enregistré',
        detail: 'Le paiement a été enregistré en brouillon',
        life: 3000
      });
    }, 1000);
  }

  /**
   * Valider le paiement
   */
  validerPaiement(): void {
    if (this.details.paiementsParEmploye.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Aucun paiement',
        detail: 'Aucun employé à payer pour cette période',
        life: 3000
      });
      return;
    }

    this.confirmationService.confirm({
      message: `Confirmer le paiement de ${this.formatCurrency(this.details.montantTotalGeneral)} pour ${this.details.paiementsParEmploye.length} employé(s) ?`,
      header: 'Validation du paiement',
      icon: 'pi pi-check-circle',
      acceptLabel: 'Oui, valider',
      rejectLabel: 'Annuler',
      acceptButtonStyleClass: 'p-button-success',
      accept: () => {
        this.loading = true;
        
        setTimeout(() => {
          this.details.statut = 'validé';
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

  /**
   * Retour à la liste
   */
  retourListe(): void {
    this.router.navigate(['/comptabilite/salaires-packing']);
  }

  /**
   * Formater en devise
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-GN', {
      style: 'currency',
      currency: 'GNF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  /**
   * Obtenir la sévérité du statut
   */
  getStatutSeverity(): string {
    const found = this.statuts.find(s => s.value === this.details.statut);
    return found ? found.severity : 'secondary';
  }

  /**
   * Obtenir le label du statut
   */
  getStatutLabel(): string {
    const found = this.statuts.find(s => s.value === this.details.statut);
    return found ? found.label : this.details.statut;
  }

  /**
   * Obtenir la couleur de la ligne selon l'employé
   */
  getEmployeColor(index: number): string {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];
    return colors[index % colors.length];
  }
}