export interface PortfolioItem {
  dataAcquisto: string;
  isin: string;
  ticker: string;
  tipo: string;
  classe: string;
  area: string;
  emittente: string;
  broker: string;
  quantita: number;
  operazione: 'Acquisto' | 'Vendita';
  prezzoAcquisto: number;
  investimentoTotale: number;
  prezzoAttuale: number;
  valoreAttuale: number;
  performance: number;
}
