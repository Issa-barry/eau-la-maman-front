import { VehiculeTypeEnum } from "../enums/vehicule-type.enum";

 
export class Vehicule {
  id?: number;
  type: VehiculeTypeEnum | null;
  immatriculation: string;
  nom: string | null;
  nom_proprietaire: string | null;
  prenom_proprietaire: string | null;
  phone_proprietaire: string | null;
  nom_livreur: string | null;
  prenom_livreur: string | null;
  phone_livreur: string | null;
  statut: string | null;
  created_at?: string;
  updated_at?: string;

  constructor() {
    this.type = null;
    this.statut = '';
    this.immatriculation = '';
    this.nom = null;
    this.nom_proprietaire = null;
    this.prenom_proprietaire = null;
    this.phone_proprietaire = null;
    this.nom_livreur = null;
    this.prenom_livreur = null;
    this.phone_livreur = null;
  }
}
