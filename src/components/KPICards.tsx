import type { AggregatedPosition } from '../lib/portfolioEngine';
import { formatEUR, formatPct, plColor } from '../lib/utils';

interface Props {
  positions: AggregatedPosition[];
  includiLiquidita: boolean;
  onToggle: () => void;
}

export function KPICards({ positions, includiLiquidita, onToggle }: Props) {
  const filtered = includiLiquidita
    ? positions
    : positions.filter(p => p.classe !== 'Monetario');

  const totalValue = filtered.reduce((s, p) => s + p.valoreAttuale, 0);
  const totalCost = filtered.reduce((s, p) => s + p.costoBasis, 0);
  const totalPL = totalValue - totalCost;
  const totalPLPct = totalCost > 0 ? (totalPL / totalCost) * 100 : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={includiLiquidita}
          onClick={onToggle}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
            includiLiquidita ? 'bg-blue-500' : 'bg-zinc-700'
          }`}
        >
          <span
            aria-hidden="true"
            className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform duration-200 ease-in-out ${
              includiLiquidita ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
        <span className="text-sm text-zinc-400 select-none">Includi Liquidità (XEON)</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Valore Portafoglio</p>
          <p className="text-2xl font-semibold text-zinc-100 tabular-nums">{formatEUR(totalValue)}</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Capitale Investito</p>
          <p className="text-2xl font-semibold text-zinc-100 tabular-nums">{formatEUR(totalCost)}</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Profit / Loss</p>
          <p className={`text-2xl font-semibold tabular-nums ${plColor(totalPL)}`}>
            {formatEUR(totalPL)}
          </p>
          <p className={`text-sm mt-1 tabular-nums ${plColor(totalPL)}`}>
            {formatPct(totalPLPct)}
          </p>
        </div>
      </div>
    </div>
  );
}
