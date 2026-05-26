import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { fetchPortfolioData } from '../lib/api';
import { aggregatePortfolio, type AggregatedPosition } from '../lib/portfolioEngine';
import type { PortfolioItem } from '../types/portfolio';
import { KPICards } from './KPICards';
import { AllocationCharts } from './AllocationCharts';
import { PortfolioTreemap } from './PortfolioTreemap';
import { PACTracker } from './PACTracker';
import { RebalancingCalculator } from './RebalancingCalculator';
import { HoldingsTable } from './HoldingsTable';

export function Dashboard() {
  const [positions, setPositions] = useState<AggregatedPosition[]>([]);
  const [rawItems, setRawItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [includiLiquidita, setIncludiLiquidita] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await fetchPortfolioData();
      setRawItems(items);
      setPositions(aggregatePortfolio(items));
      setUpdatedAt(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Errore sconosciuto');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-zinc-500 text-sm">Caricamento portafoglio…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="bg-zinc-900 border border-rose-900/50 rounded-xl p-6 max-w-sm w-full text-center space-y-4">
          <p className="text-rose-400 font-medium">Errore nel caricamento</p>
          <p className="text-zinc-500 text-sm">{error}</p>
          <button
            onClick={load}
            className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Riprova
          </button>
        </div>
      </div>
    );
  }

  const nonMonetary = positions.filter(p => p.classe !== 'Monetario');
  const filtered = includiLiquidita ? positions : nonMonetary;
  const pacItems = includiLiquidita ? rawItems : rawItems.filter(i => i.classe !== 'Monetario');

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">Portfolio Viewer</h1>
            {updatedAt && (
              <p className="text-xs text-zinc-600 mt-1">
                Aggiornato alle {updatedAt.toLocaleTimeString('it-IT')}
              </p>
            )}
          </div>
          <button
            onClick={load}
            className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-200 text-sm transition-colors"
          >
            <RefreshCw size={13} />
            Aggiorna
          </button>
        </div>

        {/* KPI + toggle */}
        <KPICards
          positions={positions}
          includiLiquidita={includiLiquidita}
          onToggle={() => setIncludiLiquidita(v => !v)}
        />

        {/* Charts */}
        <AllocationCharts positions={nonMonetary} />

        {/* Treemap */}
        <PortfolioTreemap positions={filtered} />

        {/* PAC Tracker */}
        <PACTracker items={pacItems} />

        {/* Holdings */}
        <HoldingsTable positions={positions} />

        {/* Rebalancing — full width, 2-panel */}
        <RebalancingCalculator positions={nonMonetary} />
      </div>
    </div>
  );
}
