import { TypeProduitEnum } from "../enums/typeProduit.enum";

export class Produit {
    id?: number;
    code?: string;
    nom: string;
    type: TypeProduitEnum = TypeProduitEnum.Vente;
    prix_usine: number;
    prix_vente: number;
    prix_achat?: number;
    quantite_stock: number;
    cout?: number;
    image?: string;
    categorie: string;

    created_at?: string;
    updated_at?: string;
    statut?: string;
    imagePreview?: string;


    constructor() {
        this.nom = "";
        this.categorie = "";
        this.prix_usine = 0;
        this.prix_vente = 0;
        this.prix_achat = 0;
        this.cout = 0;
        this.quantite_stock = 0;
        this.image = "defaut1.png";
    }
}  