import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Packing } from 'src/app/demo/models/packing.model';
import { Produit } from 'src/app/demo/models/produit.model';
import { Contact } from 'src/app/demo/models/contact';
import { PackingService } from 'src/app/demo/service/packing/packing.service';
import { ProduitService } from 'src/app/demo/service/produit/produit.service';
import { ContactService } from 'src/app/demo/service/contact/contact.service';

@Component({
  selector: 'app-packing-new',
  templateUrl: './packing-new.component.html',
  styleUrls: ['./packing-new.component.scss']
})
export class PackingNewComponent implements OnInit {
  packing: Packing = new Packing();
   contacts: Contact[] = [];
   contact: Contact = new Contact();
   selectedContacts: Contact[] = [];
    meta = { current_page: 1, per_page: 10, total: 0, last_page: 1 };
  produits: Produit[] = [];

  // ▼▼ Ajouts pour sécuriser la sélection du "Rouleau"
  private rouleau: Produit | null = null;
  rouleauNomAffiche = ''; // utilisé par le template
  // ▲▲

  statuts = [
    { label: 'En cours', value: 'en_cours' },
    { label: 'Terminé', value: 'termine' },
    { label: 'Annulé', value: 'annule' },
  ];
  errorMessage = '';
  loading = true;

  constructor(
    private router: Router,
    private packingService: PackingService,
    private produitService: ProduitService,
    private contactService: ContactService
  ) {}

  ngOnInit(): void {
    this.packing.lignes = [];
    this.loadProduit();
    this.getAllContacts();
  }

  
      getAllContacts(): void {
        this.loading = true;
        this.contactService.getPackers(1,100).subscribe({
            next: (p) => {
                this.contacts = p.data ?? [];
                this.meta = {
                    current_page: p.current_page,
                    per_page: p.per_page,
                    total: p.total,
                    last_page: p.last_page,
                };
                this.loading = false;
                console.log(this.contacts);

            },
            error: () => {
                this.contacts = [];
                this.loading = false;
            },
        });
    }

  loadProduit() : void {
 // Produits: auto-sélection du "Rouleau"
    this.produitService.getProduits().subscribe({
      next: (data) => {
        this.produits = data;
        this.rouleau =
          data.find(p => (p.nom ?? '').toLowerCase().includes('rouleau')) ?? data[0] ?? null;

        if (this.rouleau) {
          this.rouleauNomAffiche = this.rouleau.nom ?? 'Rouleau';
          const rid = this.getRouleauId(); // garanti number
          this.packing.lignes = [{
            produit_id: rid,
            quantite_packed: this.packing.lignes?.[0]?.quantite_packed ?? 1,
            packing_id: 0
          }];
        } else {
          this.errorMessage = 'Produit "Rouleau" introuvable.';
        }
      },
      error: (err) => (this.errorMessage = err.message),
      complete: () => (this.loading = false)
    });
 
  }


  /** Retourne l'id du rouleau ou jette une erreur (évite number|undefined) */
  private getRouleauId(): number {
    if (!this.rouleau?.id) {
      throw new Error('Produit "Rouleau" introuvable ou sans id.');
    }
    return this.rouleau.id;
  }

  // Si tu laisses ces actions dans ton UI:
  addLigne(): void {
    if (!this.rouleau) {
      this.errorMessage = 'Produit "Rouleau" introuvable.';
      return;
    }
    const rid = this.getRouleauId();

    if (this.packing.lignes.length === 0) {
      this.packing.lignes.push({ produit_id: rid, quantite_packed: 1, packing_id: 0 });
      return;
    }

    const l0 = this.packing.lignes[0];
    l0.produit_id = rid;
    l0.quantite_packed = (l0.quantite_packed ?? 0) + 1;
    this.packing.lignes = [l0];
  }

  removeLigne(_index: number): void {
    if (!this.rouleau) return;
    const rid = this.getRouleauId();

    const current = this.packing.lignes[0] ?? null;
    this.packing.lignes = [{
      produit_id: rid,
      quantite_packed: Math.max(1, current?.quantite_packed ?? 1),
      packing_id: 0
    }];
  }

  onSubmit(): void {
    if (!this.rouleau) {
      this.errorMessage = 'Produit "Rouleau" introuvable.';
      return;
    }
    const rid = this.getRouleauId();

    if (this.packing.lignes.length === 0) {
      this.packing.lignes = [{ produit_id: rid, quantite_packed: 1, packing_id: 0 }];
    } else {
      this.packing.lignes[0].produit_id = rid;
      this.packing.lignes[0].quantite_packed = this.packing.lignes[0].quantite_packed || 1;
      this.packing.lignes = [this.packing.lignes[0]];
    }

    this.packingService.create(this.packing).subscribe({
      next: () => this.router.navigate(['/dashboard/packing']),
      error: (err) => (this.errorMessage = err.message)
    });
  }
}
