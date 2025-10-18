import { Periode } from "./periode.type";

// encaissements/types/stats.ts
export type EncaissementStatsType = {
  range: { from: string | null; to: string | null };
  encaissements: {
    cash: number;          // espèces
    orange_money: number;
    depot_banque: number;
    total: number;
  }; 
};

export type EncaissementStatsQueryType = {
  periode?: Periode;       // importé depuis periode.ts
  date_from?: string;      // YYYY-MM-DD
  date_to?: string;        // YYYY-MM-DD
};
