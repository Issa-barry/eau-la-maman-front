// src/app/demo/models/contact.dto.ts

import { ContactEnum } from "../enums/contact.enum";

 
// ➜ pour POST /contacts/create
export interface CreateContactDto {
  type: ContactEnum;
  phone: string;
  nom?: string | null;
  prenom?: string | null;
  ville?: string | null;
  quartier?: string | null;

  // optionnel pour livreur (un des deux suffit)
  vehicule_id?: number | null;
  vehicule_immatriculation?: string;  // utilisé pour résoudre l’ID côté back
}

// ➜ pour PUT /contacts/updateById/{id}
export interface UpdateContactDto extends Partial<CreateContactDto> {}
