import { Civilite } from "../enums/civilite.enum";
import { ContactEnum } from "../enums/contact.enum";
 import { VehiculeEnum } from "../enums/vehicule.enum";
import { Adresse } from "./adresse";
import { Role } from "./Role";

  
 export class User {
    id?: number;
    reference?:string;
    civilite?:Civilite;
    nom_complet: string;
    phone: string;
    email:string;
    date_naissance?:string;
    password:string;
    password_confirmation:string;
    role_id?:number;
    roles?: Role;
    agence_id?:number;
    statut: string;
    role?: any;
    role_name:string;
    
    adresse: Adresse; 
    
      /** Nouveaux champs alignés backend */
  type_client?: ContactEnum;                 // 'specifique' | 'vehicule'
  type_vehicule?: VehiculeEnum | null; 

    constructor()
    {
        this.role ="";
        this.role_name ="";
        this.nom_complet = "";
        this.civilite=Civilite.Autre;
        this.date_naissance="1999-01-01";
        this.password="";
        this.password_confirmation="";
        this.phone = "";
        this.email = "";
        this.statut="attente";
        this.adresse = new Adresse();
        this.roles= new Role();
        this.type_client = ContactEnum.ClientSpecifique;
        this.type_vehicule = null;
    }

    
  

  /** Helpers pratiques pour l’UI */
  // get isVehicule(): boolean {
  //   return this.type_client === ContactEnum.Vehicule;
  // }

//   setVehicule(type?: VehiculeEnum | null) {
//     this.type_client = type ? TypeClientEnum.Vehicule : TypeClientEnum.Specifique;
//     this.type_vehicule = type ?? null;
//   }
}  