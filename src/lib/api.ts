import Papa from 'papaparse';
import type { PortfolioItem } from '../types/portfolio';

// Italian locale: "13.418,96" → 13418.96
function parseItalianNumber(raw: string): number {
  const normalized = raw.replace(/\./g, '').replace(',', '.');
  const value = parseFloat(normalized);
  return isNaN(value) ? 0 : value;
}

// "1,19%" → 1.19
function parsePercentage(raw: string): number {
  return parseItalianNumber(raw.replace('%', '').trim());
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: Record<string, string>): PortfolioItem {
  return {
    dataAcquisto: row['Data Acquisto']?.trim() ?? '',
    isin: row['ISIN']?.trim() ?? '',
    ticker: row['Ticker']?.trim() ?? '',
    tipo: row['Tipo']?.trim() ?? '',
    classe: row['Classe']?.trim() ?? '',
    area: row['Area']?.trim() ?? '',
    emittente: row['Emittente']?.trim() ?? '',
    broker: row['Broker']?.trim() ?? '',
    quantita: parseItalianNumber(row['Quantità'] ?? '0'),
    operazione: row['Operazione']?.trim() === 'Vendita' ? 'Vendita' : 'Acquisto',
    prezzoAcquisto: parseItalianNumber(row['Prezzo di acq/vendita'] ?? '0'),
    investimentoTotale: parseItalianNumber(row['Investimento/Incasso Totale'] ?? '0'),
    prezzoAttuale: parseItalianNumber(row['Prezzo attuale'] ?? '0'),
    valoreAttuale: parseItalianNumber(row['Valore attuale'] ?? '0'),
    performance: parsePercentage(row['Performance'] ?? '0%'),
  };
}

export async function fetchPortfolioData(): Promise<PortfolioItem[]> {
  const url = import.meta.env.VITE_SHEET_URL as string;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Errore nel fetch del CSV: ${response.status} ${response.statusText}`);
  }
  const csvText = await response.text();

  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(csvText, {
      header: true,
      skipEmptyLines: true,
      complete(results) {
        const items = results.data
          .filter(row => row['Ticker']?.trim())
          .map(mapRow);
        resolve(items);
      },
      error(err: { message: string }) {
        reject(new Error(`Errore nel parsing CSV: ${err.message}`));
      },
    });
  });
}
