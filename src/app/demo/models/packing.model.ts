import { ShiftPackingEnum } from '../enums/packing-shift.enum';
import { Contact } from './contact';
import { Produit } from './produit.model';

export class Packing {
  id?: number;
  reference!: string;
  date!: string;
  shift!: ShiftPackingEnum;     // "jour" | "nuit"
  statut!: string;               // "brouillon" | "en_cours" | "validé" | "annulé"

  // ✅ Nouvelles relations directes
  contact_id!: number;
  produit_id!: number;
  quantite_packed!: number;

  contact: Contact = new Contact();
  produit?: Produit;

  constructor(init?: Partial<Packing>) {
    Object.assign(this, init);
  }
}
