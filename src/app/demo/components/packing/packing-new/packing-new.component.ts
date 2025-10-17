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
  produits: Produit[] = [];
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

    this.produitService.getProduits().subscribe({
      next: (data) => (this.produits = data),
      error: (err) => (this.errorMessage = err.message)
    });

    // this.contactService.getContacts().subscribe({
    //   next: (data) => (this.contacts = data),
    //   error: (err) => (this.errorMessage = err.message),
    //   complete: () => (this.loading = false)
    // });
  }

  addLigne(): void {
    this.packing.lignes.push({
      produit_id: this.produits[0]?.id ?? 0,
      quantite_packed: 1,
      packing_id: 0
    });
  }

  removeLigne(index: number): void {
    this.packing.lignes.splice(index, 1);
  }

  onSubmit(): void {
    this.packingService.create(this.packing).subscribe({
      next: () => this.router.navigate(['/dashboard/packing']),
      error: (err) => (this.errorMessage = err.message)
    });
  }
}