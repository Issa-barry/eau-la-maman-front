export interface UpdateCommandeDto {
  user_id: number;
  reduction: number;
  lignes: {
    produit_id: number;
    quantite: number;
    prix_vente: number;
  }[];
}
 