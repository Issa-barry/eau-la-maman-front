import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PackingService } from 'src/app/demo/service/packing/packing.service';
import { Packing } from 'src/app/demo/models/packing.model';
import { ContactService } from 'src/app/demo/service/contact/contact.service';
import { Contact } from 'src/app/demo/models/contact';
import { ProduitService } from 'src/app/demo/service/produit/produit.service';
import { Produit } from 'src/app/demo/models/produit.model';
import { PackingLigne } from 'src/app/demo/models/packing-ligne.model';

@Component({
  selector: 'app-packing-edit',
  templateUrl: './packing-edit.component.html',
  styleUrls: ['./packing-edit.component.scss']
})
export class PackingEditComponent implements OnInit {
  packing: Packing = new Packing();
  statuts = [
    { label: 'En cours', value: 'en_cours' },
    { label: 'Terminé', value: 'termine' },
    { label: 'Annulé', value: 'annule' },
  ];
  contacts: Contact[] = [];
  produits: Produit[] = [];
  loading = true;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private packingService: PackingService,
    private contactService: ContactService,
    private produitService: ProduitService
  ) {}

  ngOnInit(): void {
    this.produitService.getProduits().subscribe({
      next: (data) => (this.produits = data),
      error: (err) => (this.errorMessage = err.message),
    });

    // this.contactService.getContacts().subscribe({
    //   next: (data) => {
    //     this.contacts = data;
    //   },
    //   error: (err) => {
    //     this.errorMessage = err.message;
    //     this.loading = false;
    //     console.log(err);
        
    //   } 
    // });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.packingService.getById(+id).subscribe({
        next: (data) => {
          this.packing = data;
          // if (!this.packing.user_id && this.packing.user?.id !== undefined) {
          //   this.packing.user_id = this.packing.user.id;
          // }
          this.loading = false;
        },
        error: (err) => {
          this.errorMessage = err.message;
          this.loading = false;
        }
      });
    }
  }

  addLigne(): void {
    // this.packing.lignes.push({
    //   produit_id: this.produits[0]?.id ?? 0,
    //   quantite_packed: 1,
    //   packing_id: this.packing.id!
    // });
  }

  removeLigne(index: number): void {
    // this.packing.lignes.splice(index, 1);
  }

  onSubmit(): void {
    if (!this.packing.id) return;

    this.packingService.update(this.packing.id, this.packing).subscribe({
      next: () => this.router.navigate(['/dashboard/packing']),
      error: (err) => (this.errorMessage = err.message)
    });
  }
}