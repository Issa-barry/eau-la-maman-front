import { ContactEnum } from "../enums/contact.enum";

// src/app/demo/models/contact.model.ts
export class Contact {
  id?: number;
  reference?: string;

  // === Champs alignés backend ===
  nom: string | null;
  prenom: string | null;
  phone: string;
  ville: string | null;
  quartier: string | null;
  type: ContactEnum;           // 'client_specifique' | 'livreur' | 'proprietaire' | 'packing'
  vehicule_id?: number | null;          // stocké uniquement si livreur

  // lecture seule éventuelle
  created_at?: string;
  updated_at?: string;

  constructor() {
    this.nom = null;
    this.prenom = null;
    this.phone = '';
    this.ville = null;
    this.quartier = null;
    this.type = ContactEnum.ClientSpecifique;
    this.vehicule_id = null;
  }
} 