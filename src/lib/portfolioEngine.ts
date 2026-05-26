import type { PortfolioItem } from '../types/portfolio';

export interface AggregatedPosition {
  ticker: string;
  isin: string;
  tipo: string;
  classe: string;
  area: string;
  emittente: string;
  broker: string;
  quantitaTotale: number;
  prezzoMedioCarico: number;
  prezzoAttuale: number;
  valoreAttuale: number;
  costoBasis: number;
  plAssoluto: number;
  plPercentuale: number;
}

interface Accumulator {
  ticker: string;
  isin: string;
  tipo: string;
  classe: string;
  area: string;
  emittente: string;
  broker: string;
  quantitaTotale: number;
  costoBasis: number;
  prezzoAttuale: number;
  lastDate: Date;
}

function parseItalianDate(s: string): Date {
  const [d, m, y] = s.split('/');
  return new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
}

export function aggregatePortfolio(items: PortfolioItem[]): AggregatedPosition[] {
  const map = new Map<string, Accumulator>();

  for (const item of items) {
    if (!map.has(item.ticker)) {
      map.set(item.ticker, {
        ticker: item.ticker,
        isin: item.isin,
        tipo: item.tipo,
        classe: item.classe,
        area: item.area,
        emittente: item.emittente,
        broker: item.broker,
        quantitaTotale: 0,
        costoBasis: 0,
        prezzoAttuale: item.prezzoAttuale,
        lastDate: parseItalianDate(item.dataAcquisto),
      });
    }

    const acc = map.get(item.ticker)!;

    // Keep the most recent prezzoAttuale
    const itemDate = parseItalianDate(item.dataAcquisto);
    if (itemDate >= acc.lastDate && item.prezzoAttuale > 0) {
      acc.prezzoAttuale = item.prezzoAttuale;
      acc.lastDate = itemDate;
    }

    if (item.operazione === 'Acquisto') {
      acc.costoBasis += item.quantita * item.prezzoAcquisto;
      acc.quantitaTotale += item.quantita;
    } else {
      // Weighted-average method: remove proportional cost on sale
      if (acc.quantitaTotale > 0) {
        acc.costoBasis -= (acc.costoBasis / acc.quantitaTotale) * item.quantita;
      }
      acc.quantitaTotale -= item.quantita;
    }
  }

  const result: AggregatedPosition[] = [];

  for (const acc of map.values()) {
    if (acc.quantitaTotale < 0.001) continue;

    const valoreAttuale = acc.quantitaTotale * acc.prezzoAttuale;
    const plAssoluto = valoreAttuale - acc.costoBasis;
    const plPercentuale = acc.costoBasis > 0 ? (plAssoluto / acc.costoBasis) * 100 : 0;

    result.push({
      ticker: acc.ticker,
      isin: acc.isin,
      tipo: acc.tipo,
      classe: acc.classe,
      area: acc.area,
      emittente: acc.emittente,
      broker: acc.broker,
      quantitaTotale: acc.quantitaTotale,
      prezzoMedioCarico: acc.costoBasis / acc.quantitaTotale,
      prezzoAttuale: acc.prezzoAttuale,
      valoreAttuale,
      costoBasis: acc.costoBasis,
      plAssoluto,
      plPercentuale,
    });
  }

  return result.sort((a, b) => b.valoreAttuale - a.valoreAttuale);
}

// ─── PAC Timeline ─────────────────────────────────────────────────────────────

const MONTHS_IT = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];

export interface PACDataPoint {
  label: string;
  sortKey: string;
  capitalInvestito: number;
  valorePortafoglio: number;
}

export function computePACTimeline(items: PortfolioItem[]): PACDataPoint[] {
  if (items.length === 0) return [];

  // Current price per ticker from the most recent transaction with a valid price
  const currentPrices = new Map<string, number>();
  const latestDates = new Map<string, number>();
  for (const item of items) {
    const t = parseItalianDate(item.dataAcquisto).getTime();
    if ((latestDates.get(item.ticker) ?? 0) <= t && item.prezzoAttuale > 0) {
      currentPrices.set(item.ticker, item.prezzoAttuale);
      latestDates.set(item.ticker, t);
    }
  }

  // Sort chronologically then group by "YYYY-MM"
  const sorted = [...items].sort(
    (a, b) => parseItalianDate(a.dataAcquisto).getTime() - parseItalianDate(b.dataAcquisto).getTime(),
  );
  const monthMap = new Map<string, PortfolioItem[]>();
  for (const item of sorted) {
    const d = parseItalianDate(item.dataAcquisto);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!monthMap.has(key)) monthMap.set(key, []);
    monthMap.get(key)!.push(item);
  }

  // Per-ticker state — same weighted-average logic as aggregatePortfolio for consistency
  const tickerState = new Map<string, { costoBasis: number; quantitaTotale: number }>();
  const result: PACDataPoint[] = [];

  for (const sortKey of [...monthMap.keys()].sort()) {
    for (const item of monthMap.get(sortKey)!) {
      const s = tickerState.get(item.ticker) ?? { costoBasis: 0, quantitaTotale: 0 };
      if (item.operazione === 'Acquisto') {
        s.costoBasis += item.quantita * item.prezzoAcquisto;
        s.quantitaTotale += item.quantita;
      } else {
        if (s.quantitaTotale > 0) {
          s.costoBasis -= (s.costoBasis / s.quantitaTotale) * item.quantita;
        }
        s.quantitaTotale -= item.quantita;
      }
      tickerState.set(item.ticker, s);
    }

    let capitalInvestito = 0;
    let valorePortafoglio = 0;
    for (const [ticker, s] of tickerState) {
      if (s.costoBasis > 0) capitalInvestito += s.costoBasis;
      if (s.quantitaTotale > 0) valorePortafoglio += s.quantitaTotale * (currentPrices.get(ticker) ?? 0);
    }

    const [y, m] = sortKey.split('-');
    result.push({
      label: `${MONTHS_IT[parseInt(m) - 1]} ${y.slice(2)}`,
      sortKey,
      capitalInvestito,
      valorePortafoglio,
    });
  }

  return result;
}
