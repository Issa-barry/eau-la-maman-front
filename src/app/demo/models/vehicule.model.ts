import { VehiculeTypeEnum } from "../enums/vehicule-type.enum";

 
export class Vehicule {
  id?: number;
  type: VehiculeTypeEnum | null;
  immatriculation: string;
  nom_proprietaire: string | null;
  prenom_proprietaire: string | null;
  phone_proprietaire: string | null;
  created_at?: string;
  updated_at?: string;

  constructor() {
    this.type = null;
    this.immatriculation = '';
    this.nom_proprietaire = null;
    this.prenom_proprietaire = null;
    this.phone_proprietaire = null;
  }
}
