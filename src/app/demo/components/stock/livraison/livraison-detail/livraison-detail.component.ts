import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';

import { CommandeService } from 'src/app/demo/service/ventes/commande/commande.service';
import { ProduitService } from 'src/app/demo/service/produit/produit.service';
import { LivraisonService } from 'src/app/demo/service/stock/livraison/livraison.service';
 
import { Produit } from 'src/app/demo/models/produit.model';
 import { Commande } from 'src/app/demo/models/commande.model';
import { Livraison } from 'src/app/demo/models/livraison.model';
import { User } from 'src/app/demo/models/User';
import { UserService } from 'src/app/demo/service/users/user.service';

interface UILigne {
  id?: number;                    // id de commande_ligne pour le payload multi-lignes
  produit: Produit | null;
  prix_vente: number;             // API string -> number
  quantite_commandee: number;     // API
  quantite_restante: number;      // API (qté livrable max)
  quantite_livree: number;        // saisie
}

@Component({
  selector: 'app-livraison-detail',
  templateUrl: './livraison-detail.component.html',
  styleUrl: './livraison-detail.component.scss',
})
export class LivraisonDetailComponent implements OnInit {
  // ---- Mode édition / lecture
  editMode = false;

  // ---- Données écran
  lignes: UILigne[] = [];
  totalCommande = 0;
  commandeNumero: string = this.activatedRoute.snapshot.params['id'];

  selectedLivreur: User | null = null;
  selectedClient: User | null = null;

  produits: Produit[] = [];
  users: User[] = [];

  commande?: Commande;
  livraison: Livraison = new Livraison();

  // ---- Etat / erreurs
  errorMessage = '';
  apiErrors: { [key: string]: string[] } = {};
  isSaving = false;
  submitted = false;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private messageService: MessageService,
    private commandeService: CommandeService,
    private produitService: ProduitService,
    private livraisonService: LivraisonService,
    private userService: UserService,
  ) {}

  ngOnInit(): void {
    this.loadProduits();
    this.loadUsers();
    this.loadCommande();
  }

  // ---- UI rules
  get canModify(): boolean {
    if (this.isCommandeLivree) return false;
    // modifiable s'il existe au moins une ligne encore livrable
    return this.lignes.some(l => (Number(l.quantite_restante) || 0) > 0);
  }

  get submitDisabled(): boolean {
    return this.isSaving || !this.editMode || this.isCommandeLivree;
  }

  // ---- Actions mode
  onEdit(): void {
    if (!this.canModify) return;
    this.editMode = true;
    this.submitted = false;
    this.apiErrors = {};
  }

  onCancelEdit(): void {
    this.editMode = false;
    this.submitted = false;
    this.apiErrors = {};
    this.loadCommande(); // rollback des changements locaux
  }

  // ------------------ Loaders ------------------
  loadUsers(): void {
    this.userService.getUser().subscribe({
      next: res => (this.users = res),
      error: err => {
        console.error('Erreur récupération users :', err);
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger les users.' });
      },
    });
  }

  loadProduits(): void {
    this.produitService.getProduits().subscribe({
      next: data => (this.produits = data),
      error: err => {
        console.error('Erreur chargement produits :', err);
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger les produits.' });
      },
    });
  }

  loadCommande(): void {
    this.commandeService.getCommandeByNumero(this.commandeNumero).subscribe({
      next: (commande: Commande | any) => {
        this.commande = commande;
        this.selectedLivreur = commande?.user ?? null;
        this.totalCommande = Number(commande?.montant_total ?? 0);

        this.lignes = (commande?.lignes ?? []).map((l: any): UILigne => ({
          id: l?.id,
          produit: l?.produit ?? null,
          prix_vente: Number(l?.prix_vente ?? l?.produit?.prix_vente ?? 0),
          quantite_commandee: Number(l?.quantite_commandee ?? 0),
          quantite_restante: Number(l?.quantite_restante ?? 0),
          quantite_livree: Number(l?.quantite_livree ?? 0),
        }));

        // on revient en lecture après reload
        this.editMode = false;
      },
      error: err => {
        console.error('Erreur chargement commande :', err);
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger la commande.' });
      },
    });
  }

  // ------------------ UI helpers ------------------
  onProduitChange(index: number): void {
    const p = this.lignes[index].produit;
    this.lignes[index].prix_vente = Number(p?.prix_vente) || 0;
  }

  // Clamp qté livrée par rapport à la qté livrable
  onQteLivreeChange(i: number, value: any): void {
    const max = Number(this.lignes[i].quantite_restante);
    let v = Number(value) || 0;
    if (v < 0) v = 0;
    if (Number.isFinite(max) && v > max) v = max;
    this.lignes[i].quantite_livree = v;
  }

  isQteLivreeInvalid(i: number): boolean {
    const v = Number(this.lignes[i]?.quantite_livree) || 0;
    return this.submitted && v <= 0;
  }

  getSousTotal(i: number): number {
    const l = this.lignes[i];
    return (Number(l?.quantite_livree) || 0) * (Number(l?.prix_vente) || 0);
  }

  getStatutSeverity(statut?: string): 'success' | 'info' | 'warning' | 'danger' {
    const s = (statut || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    if (s.includes('livre')) return 'success';
    if (s.includes('clotur')) return 'success';
    if (s.includes('annul')) return 'danger';
    if (s.includes('en_cours') || s.includes('livraison') || s.includes('attente')) return 'warning';
    return 'info';
  }

  get isCommandeLivree(): boolean {
    const s = (this.commande?.statut || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    return s.includes('livre') || s.includes('clotur');
  }

  private quantiteLivreeTotale(): number {
    return this.lignes.reduce((s, l) => s + (Number(l.quantite_livree) || 0), 0);
  }

  // ------------------ Submit ------------------
  onSubmit(): void {
    this.errorMessage = '';
    this.apiErrors = {};
    this.submitted = true;

    if (!this.editMode) return;
    if (this.isCommandeLivree) {
      this.messageService.add({ severity: 'warn', summary: 'Déjà livrée', detail: 'Cette commande est déjà livrée/clôturée.' });
      return;
    }

    const total = this.quantiteLivreeTotale();
    if (total <= 0) {
      this.messageService.add({ severity: 'warn', summary: 'Aucune quantité', detail: 'Veuillez saisir au moins une quantité livrée.' });
      return;
    }

    // Prépare payload multi-lignes si possible, sinon fallback sur total
    const lignesPayload = this.lignes
      .filter(l => (l.id ?? null) !== null && (Number(l.quantite_livree) || 0) > 0)
      .map(l => ({
        commande_ligne_id: l.id!,
        quantite_livree: Number(l.quantite_livree),
      }));

    const payload: any = {
      date_livraison: new Date().toISOString().slice(0, 10),
    };

    if (lignesPayload.length > 0) {
      payload.lignes = lignesPayload;
    } else {
      payload.quantite_livree = total;
    }

    this.isSaving = true;
    this.livraisonService.validerLivraison(this.commandeNumero, payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Livraison validée.' });
        // On recharge la page (lecture) avec l’état à jour
        this.loadCommande();
      },
      error: (err) => {
        this.isSaving = false;
        console.error('Erreur validation livraison', err);

        this.errorMessage =
          err?.message ||
          err?.error?.message ||
          err?.error?.error ||
          'Erreur lors de la validation.';

        this.apiErrors = err?.errors || {};
        this.messageService.add({ severity: 'error', summary: 'Validation échouée', detail: this.errorMessage });
      },
    });
  }

  onGoToListeCommande(): void {
    this.router.navigate(['/dashboard/ventes/commande']);
  }

  // ------------------ Helpers erreurs template ------------------
  getError(field: string, index?: number): string | null {
    const key = index !== undefined ? `lignes.${index}.${field}` : field;
    const msgs = this.apiErrors?.[key];
    return Array.isArray(msgs) && msgs.length ? msgs[0] : null;
  }

  hasError(field: string, index?: number): boolean {
    return !!this.getError(field, index);
  }

  // ------------------ TrackBy ------------------
  trackByLigne(index: number, l: UILigne) {
    return l.id ?? l.produit?.id ?? index;
  }
}
