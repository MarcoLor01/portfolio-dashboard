import type { AggregatedPosition } from '../lib/portfolioEngine';
import { formatEUR, formatNum, formatPct, plColor } from '../lib/utils';

interface Props {
  positions: AggregatedPosition[];
}

function MonetaryBadge() {
  return (
    <span className="inline-flex items-center text-[10px] bg-indigo-900/50 text-indigo-300 border border-indigo-700/40 px-1.5 py-0.5 rounded font-medium">
      Cash
    </span>
  );
}

export function HoldingsTable({ positions }: Props) {
  const regular = positions.filter(p => p.classe !== 'Monetario');
  const monetary = positions.filter(p => p.classe === 'Monetario');
  const rows = [...regular, ...monetary];

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-zinc-800">
        <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-widest">Posizioni</h3>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-zinc-600 text-xs uppercase tracking-wide bg-zinc-950/40 border-b border-zinc-800">
              <th className="text-left px-5 py-3">Ticker</th>
              <th className="text-left px-3 py-3">Classe</th>
              <th className="text-right px-3 py-3">Qty</th>
              <th className="text-right px-3 py-3">P. Medio</th>
              <th className="text-right px-3 py-3">P. Attuale</th>
              <th className="text-right px-3 py-3">Valore</th>
              <th className="text-right px-5 py-3">P/L</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {rows.map(p => {
              const isMonetary = p.classe === 'Monetario';
              return (
                <tr
                  key={p.ticker}
                  className={
                    isMonetary
                      ? 'bg-indigo-950/20'
                      : 'hover:bg-zinc-800/30 transition-colors'
                  }
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      {isMonetary && <MonetaryBadge />}
                      <span
                        className={`font-medium ${
                          isMonetary ? 'text-indigo-300' : 'text-zinc-100'
                        }`}
                      >
                        {p.ticker}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-zinc-400">{p.classe}</td>
                  <td className="px-3 py-3 text-right text-zinc-300 tabular-nums">
                    {formatNum(p.quantitaTotale)}
                  </td>
                  <td className="px-3 py-3 text-right text-zinc-300 tabular-nums">
                    {formatEUR(p.prezzoMedioCarico)}
                  </td>
                  <td className="px-3 py-3 text-right text-zinc-300 tabular-nums">
                    {formatEUR(p.prezzoAttuale)}
                  </td>
                  <td className="px-3 py-3 text-right text-zinc-100 font-medium tabular-nums">
                    {formatEUR(p.valoreAttuale)}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className={`tabular-nums ${plColor(p.plAssoluto)}`}>
                      <div className="font-medium">{formatEUR(p.plAssoluto)}</div>
                      <div className="text-xs">{formatPct(p.plPercentuale)}</div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden divide-y divide-zinc-800/50">
        {rows.map(p => {
          const isMonetary = p.classe === 'Monetario';
          return (
            <div
              key={p.ticker}
              className={`p-4 space-y-3 ${isMonetary ? 'bg-indigo-950/20' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {isMonetary && <MonetaryBadge />}
                  <span
                    className={`font-semibold text-base ${
                      isMonetary ? 'text-indigo-300' : 'text-zinc-100'
                    }`}
                  >
                    {p.ticker}
                  </span>
                  <span className="text-xs text-zinc-600">{p.classe}</span>
                </div>
                <span className="font-semibold text-zinc-100 tabular-nums">
                  {formatEUR(p.valoreAttuale)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div>
                  <p className="text-zinc-600 text-xs">Quantità</p>
                  <p className="text-zinc-300 tabular-nums">{formatNum(p.quantitaTotale)}</p>
                </div>
                <div>
                  <p className="text-zinc-600 text-xs">P. Medio</p>
                  <p className="text-zinc-300 tabular-nums">{formatEUR(p.prezzoMedioCarico)}</p>
                </div>
                <div>
                  <p className="text-zinc-600 text-xs">P. Attuale</p>
                  <p className="text-zinc-300 tabular-nums">{formatEUR(p.prezzoAttuale)}</p>
                </div>
                <div>
                  <p className="text-zinc-600 text-xs">P/L</p>
                  <p className={`font-medium tabular-nums ${plColor(p.plAssoluto)}`}>
                    {formatEUR(p.plAssoluto)}{' '}
                    <span className="text-xs">({formatPct(p.plPercentuale)})</span>
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
