import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';

import { Commande } from 'src/app/demo/models/commande.model';
import {
  CommandeService,
  PageMeta,
} from 'src/app/demo/service/ventes/commande/commande.service';

@Component({
  selector: 'app-commande-liste',
  templateUrl: './commande-liste.component.html',
  styleUrls: ['./commande-liste.component.scss'],
  providers: [MessageService, ConfirmationService],
})


export class CommandeListeComponent implements OnInit {
  // Données table
  commandes: Commande[] = [];
  // commande-liste.component.ts (extrait)
meta: { total: number; per_page: number; current_page: number; last_page: number } = {
  total: 0,
  per_page: 10,
  current_page: 1,
  last_page: 1,
};

  // UI state
  loading = false;
  skeletonRows = Array.from({ length: 5 }, () => ({}));
  rowsPerPageOptions = [5, 10, 20];

  // Pagination & filtres
  page = 1;
  perPage = 10;
  searchTerm = '';
   selectedPeriode: 'aujourdhui' | 'cette_semaine' | 'ce_mois' | 'cette_annee' | null = null;


  periodeOptions = [
    { label: "Aujourd'hui", value: 'aujourdhui' },
    { label: 'Cette semaine', value: 'cette_semaine' },
    { label: 'Ce mois-ci', value: 'ce_mois' },
    { label: 'Cette année', value: 'cette_annee' },
  ];

  // Détail commande (dialog)
  selectedCommande: Commande | null = null;
  commandeDetailDialog = false;

  /** Getter sûr pour le p-table de la modale */
  get selectedLignes(): any[] {
    return this.selectedCommande?.lignes ?? [];
  }

  constructor(
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private commandeService: CommandeService
  ) {}

  ngOnInit(): void {
    this.loadCommandes();
  }

  /** Charge la liste depuis l'API (paginée + filtres) */
 loadCommandes(): void {
  this.loading = true;

  const params: any = {
    page: this.page,
    per_page: this.perPage,
  };
  if (this.searchTerm && this.searchTerm.trim() !== '') params.search = this.searchTerm.trim();
  if (this.selectedPeriode) params.periode = this.selectedPeriode;

  this.commandeService.list(params).subscribe({
    next: (res) => {
      this.commandes = res.items ?? [];
      this.meta = res.meta ?? this.meta; // garde une meta valide
      this.loading = false;
      console.log(this.commandes);
    },
    error: (err) => {
      console.error('Erreur lors du chargement des commandes :', err);
      this.commandes = [];
      this.loading = false;
    },
  });
}

 
  // ----------- UI actions -----------
  statusKey(raw?: string): string {
  if (!raw) return '';
  return raw
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '') // enlève accents
    .replace(/\s+/g, '_');          // espaces -> underscore
}

getStatusLabel(raw?: string): string {
  const k = this.statusKey(raw);
  const map: Record<string, string> = {
    brouillon: 'Brouillon',
    livraison_en_cours: 'Livraison en cours',
    livre: 'Livré',
    paye: 'Payé',
    annule: 'Annulé',
    a_facturer: 'À facturer',
    facturation_en_cours: 'Facturation en cours',
    cloture: 'Clôturé',
  };
  return map[k] ?? (raw || 'Inconnu');
}


  /** Recherche globale (serveur) */
  // onGlobalFilter(event: Event): void {
  //   const value = (event.target as HTMLInputElement).value ?? '';
  //   this.searchTerm = value.trim();
  //   this.page = 1;
  //   this.loadCommandes();
  // }

 onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }


  /** Changement de période via dropdown */
  onPeriodeChange(): void {
    this.page = 1;
    this.loadCommandes();
  }

  /** Pagination PrimeNG (0-based) */
  // import { TablePageEvent } from 'primeng/table'; // optionnel si tu veux typer
  onPageChange(e: any /* TablePageEvent */): void {
    this.perPage = e.rows ?? this.perPage;

    if (typeof e.page === 'number') {
      this.page = e.page + 1; // 0-based -> 1-based pour l'API
    } else {
      const first = e.first ?? 0;
      const rows = e.rows ?? this.perPage;
      const pageIndex = Math.floor(first / rows); // 0-based
      this.page = pageIndex + 1; // 1-based
    }

    this.loadCommandes();
  }

  // Navigation
  onGoToNewCommande(): void {
    this.router.navigate(['/dashboard/ventes/commande/commande-new']);
  }

  onGoToDetailCommande(commande: Commande): void {
    this.router.navigate(['/dashboard/ventes/commande/commande-detail', commande.numero]);
  }

  onGoToLivraisonDetail(commande: Commande): void {
    this.router.navigate(['/dashboard/stock/livraison/livraison-detail', commande.numero]);
  }

  onGoToLivraisonNew(commande: Commande): void {
    this.router.navigate(['/dashboard/stock/livraison/livraison-new', commande.numero]);
  }

  // Dialog détail
  viewCommande(commande: Commande): void {
    this.selectedCommande = { ...commande, lignes: commande.lignes || [] };
    this.commandeDetailDialog = true;
  }

  hideDialog(): void {
    this.commandeDetailDialog = false;
  }

  // Validation
  validerCommande(commande: Commande): void {
    this.confirmationService.confirm({
      message: 'Valider cette commande ?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.commandeService.validerCommande(commande.numero).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Commande validée avec succès.',
            });
            this.loadCommandes();
            this.commandeDetailDialog = false;
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: err?.message || 'Échec de la validation.',
            });
          },
        });
      },
    });
  }


  // validation commande 
  
}
