import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';

interface EmployePacking {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  totalRouleaux: number;
  montantTotal: number;
  statut: 'en_attente' | 'paye';
}

@Component({
  selector: 'app-salaire-packing-liste',
  templateUrl: './salaire-packing-liste.component.html',
  styleUrls: ['./salaire-packing-liste.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class SalairePackingListeComponent implements OnInit {

  TARIF_PAR_ROULEAU = 500;
  
  employes: EmployePacking[] = [];
  selectedEmployes: EmployePacking[] = [];
  periode: Date[] = [];
  loading = false;

  // Dialogs
  paymentDialog = false;
  deleteEmployeDialog = false;
  deleteEmployesDialog = false;
  selectedEmploye: EmployePacking = {} as EmployePacking;

  cols: any[] = [];
  statuts = [
    { label: 'En attente', value: 'en_attente' },
    { label: 'Payé', value: 'paye' }
  ];

  constructor(
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.setPeriodeDefaut();
    this.initColumns();
    this.loadEmployes();
  }

  setPeriodeDefaut(): void {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    this.periode = [firstDay, today];
  }

  initColumns(): void {
    this.cols = [
      { field: 'nom', header: 'Nom' },
      { field: 'prenom', header: 'Prénom' },
      { field: 'telephone', header: 'Téléphone' },
      { field: 'totalRouleaux', header: 'Rouleaux' },
      { field: 'montantTotal', header: 'Montant' },
      { field: 'statut', header: 'Statut' }
    ];
  }

  loadEmployes(): void {
    this.loading = true;

    setTimeout(() => {
      this.employes = [
        {
          id: 1,
          nom: 'SYLLA',
          prenom: 'Ali',
          telephone: '+224 620 00 00 00',
          totalRouleaux: 290,
          montantTotal: 145000,
          statut: 'en_attente'
        },
        {
          id: 2,
          nom: 'DIALLO',
          prenom: 'Mamadou',
          telephone: '+224 621 11 11 11',
          totalRouleaux: 260,
          montantTotal: 130000,
          statut: 'en_attente'
        },
        {
          id: 3,
          nom: 'SOW',
          prenom: 'Ibrahima',
          telephone: '+224 622 22 22 22',
          totalRouleaux: 80,
          montantTotal: 40000,
          statut: 'paye'
        },
        {
          id: 4,
          nom: 'BAH',
          prenom: 'Abdoulaye',
          telephone: '+224 623 33 33 33',
          totalRouleaux: 350,
          montantTotal: 175000,
          statut: 'en_attente'
        },
        {
          id: 5,
          nom: 'CAMARA',
          prenom: 'Fatoumata',
          telephone: '+224 624 44 44 44',
          totalRouleaux: 245,
          montantTotal: 122500,
          statut: 'paye'
        }
      ];

      this.loading = false;
    }, 800);
  }

  onPeriodeChange(): void {
    if (this.periode && this.periode.length === 2) {
      this.loadEmployes();
      this.messageService.add({
        severity: 'info',
        summary: 'Période mise à jour',
        detail: 'Les données ont été rechargées',
        life: 3000
      });
    }
  }

  openPayment(): void {
    if (this.selectedEmployes.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Aucune sélection',
        detail: 'Veuillez sélectionner au moins un employé',
        life: 3000
      });
      return;
    }
    this.paymentDialog = true;
  }

  payerSelection(): void {
    this.confirmationService.confirm({
      message: `Confirmer le paiement de ${this.selectedEmployes.length} employé(s) pour un total de ${this.formatCurrency(this.getTotalSelection())} ?`,
      header: 'Confirmation de paiement',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui, payer',
      rejectLabel: 'Annuler',
      acceptButtonStyleClass: 'p-button-success',
      accept: () => {
        this.selectedEmployes.forEach(emp => {
          const index = this.employes.findIndex(e => e.id === emp.id);
          if (index !== -1) {
            this.employes[index].statut = 'paye';
          }
        });

        this.messageService.add({
          severity: 'success',
          summary: 'Paiement effectué',
          detail: `${this.selectedEmployes.length} employé(s) payé(s)`,
          life: 3000
        });

        this.selectedEmployes = [];
        this.paymentDialog = false;
      }
    });
  }

  getTotalSelection(): number {
    return this.selectedEmployes.reduce((sum, emp) => sum + emp.montantTotal, 0);
  }

  voirDetails(employe: EmployePacking): void {
    this.router.navigate(['/comptabilite/salaire-packing-detail', employe.id]);
  }

  editEmploye(employe: EmployePacking): void {
    this.router.navigate(['/comptabilite/salaire-packing-detail', employe.id]);
  }

  deleteEmploye(employe: EmployePacking): void {
    this.selectedEmploye = { ...employe };
    this.deleteEmployeDialog = true;
  }

  confirmDelete(): void {
    this.deleteEmployeDialog = false;
    this.employes = this.employes.filter(val => val.id !== this.selectedEmploye.id);
    this.messageService.add({
      severity: 'success',
      summary: 'Supprimé',
      detail: 'Employé supprimé avec succès',
      life: 3000
    });
    this.selectedEmploye = {} as EmployePacking;
  }

  deleteSelectedEmployes(): void {
    this.deleteEmployesDialog = true;
  }

  confirmDeleteSelected(): void {
    this.deleteEmployesDialog = false;
    this.employes = this.employes.filter(val => !this.selectedEmployes.includes(val));
    this.messageService.add({
      severity: 'success',
      summary: 'Supprimés',
      detail: `${this.selectedEmployes.length} employé(s) supprimé(s)`,
      life: 3000
    });
    this.selectedEmployes = [];
  }

  onGlobalFilter(table: Table, event: Event): void {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  exportCSV(dt: Table): void {
    dt.exportCSV();
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-GN', {
      style: 'currency',
      currency: 'GNF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  getStatutSeverity(statut: string): string {
    return statut === 'paye' ? 'success' : 'warning';
  }
}