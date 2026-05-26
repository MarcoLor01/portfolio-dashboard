import type { AggregatedPosition } from '../lib/portfolioEngine';

// ─── Macro targets (classe-level) ────────────────────────────────────────────
const MACRO_TARGETS: Record<string, number> = {
  Azionario: 0.7,
  Obbligazionario: 0.25,
  Gold: 0.05,
};
const MACRO_LABELS: Record<string, string> = {
  Azionario: 'Azionario',
  Obbligazionario: 'Obbligazionario',
  Gold: 'Oro',
};
const MACRO_COLORS: Record<string, string> = {
  Azionario: '#3b82f6',
  Obbligazionario: '#10b981',
  Gold: '#f59e0b',
};

// ─── Equity targets (ticker-level) ───────────────────────────────────────────
const EQUITY_TARGETS: Record<string, number> = {
  'S&P': 0.45,
  EXUS: 0.45,
  EIMI: 0.10,
};
const EQUITY_LABELS: Record<string, string> = {
  'S&P': 'S&P 500',
  EXUS: 'World ex USA',
  EIMI: 'Em. Markets',
};
const EQUITY_COLORS: Record<string, string> = {
  'S&P': '#3b82f6',
  EXUS: '#06b6d4',
  EIMI: '#f97316',
};

// ─── Single allocation row ────────────────────────────────────────────────────
function AllocationRow({
  label,
  color,
  currentPct,
  target,
}: {
  label: string;
  color: string;
  currentPct: number; // 0–1
  target: number;     // 0–1
}) {
  const drift = currentPct - target;
  const isOver = drift > 0.02;
  const isUnder = drift < -0.02;

  const driftClass = isOver
    ? 'bg-rose-950/50 text-rose-400 border border-rose-900/40'
    : isUnder
    ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-900/40'
    : 'bg-zinc-800 text-zinc-500 border border-zinc-700/40';

  const valueClass = isOver ? 'text-rose-400' : isUnder ? 'text-emerald-400' : 'text-zinc-300';

  return (
    <div className="space-y-1.5">
      {/* Label + drift badge */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
          <span className="text-sm font-medium text-zinc-200 truncate">{label}</span>
        </div>
        <span className={`text-[11px] font-semibold tabular-nums px-2 py-0.5 rounded-full flex-shrink-0 ${driftClass}`}>
          {drift >= 0 ? '+' : ''}
          {(drift * 100).toFixed(1)}%
        </span>
      </div>

      {/* Progress bar with target marker */}
      <div className="relative h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${Math.min(100, currentPct * 100)}%`,
            backgroundColor: color,
            opacity: 0.8,
          }}
        />
        {/* Target marker */}
        <div
          className="absolute inset-y-0 w-px bg-white/60"
          style={{ left: `${target * 100}%` }}
        />
      </div>

      {/* T / A labels */}
      <div className="flex justify-between text-[11px]">
        <span className="text-zinc-600">T: {(target * 100).toFixed(0)}%</span>
        <span className={`font-medium tabular-nums ${valueClass}`}>
          {(currentPct * 100).toFixed(1)}%
        </span>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
interface Props {
  positions: AggregatedPosition[]; // already excludes Monetario (passed from Dashboard)
}

export function RebalancingCalculator({ positions }: Props) {
  const totalValue = positions.reduce((s, p) => s + p.valoreAttuale, 0);

  const valueByClasse = positions.reduce<Record<string, number>>((acc, p) => {
    acc[p.classe] = (acc[p.classe] ?? 0) + p.valoreAttuale;
    return acc;
  }, {});

  const equityPositions = positions.filter(p => p.classe === 'Azionario');
  const totalEquity = equityPositions.reduce((s, p) => s + p.valoreAttuale, 0);
  const valueByTicker = equityPositions.reduce<Record<string, number>>((acc, p) => {
    acc[p.ticker] = (acc[p.ticker] ?? 0) + p.valoreAttuale;
    return acc;
  }, {});

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-6">
        Ribilanciamento
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* ── Panel 1: Macro allocazione ── */}
        <div>
          <p className="text-[11px] font-medium text-zinc-600 uppercase tracking-widest mb-4">
            Macro Allocazione
          </p>
          <div className="space-y-5">
            {Object.entries(MACRO_TARGETS).map(([cls, target]) => {
              const current = valueByClasse[cls] ?? 0;
              const currentPct = totalValue > 0 ? current / totalValue : 0;
              return (
                <AllocationRow
                  key={cls}
                  label={MACRO_LABELS[cls]}
                  color={MACRO_COLORS[cls]}
                  currentPct={currentPct}
                  target={target}
                />
              );
            })}
          </div>
        </div>

        {/* ── Panel 2: Azionario detail ── */}
        <div>
          <p className="text-[11px] font-medium text-zinc-600 uppercase tracking-widest mb-4">
            Azionario — Dettaglio
          </p>
          <div className="space-y-5">
            {Object.entries(EQUITY_TARGETS).map(([ticker, target]) => {
              const current = valueByTicker[ticker] ?? 0;
              const currentPct = totalEquity > 0 ? current / totalEquity : 0;
              return (
                <AllocationRow
                  key={ticker}
                  label={EQUITY_LABELS[ticker]}
                  color={EQUITY_COLORS[ticker]}
                  currentPct={currentPct}
                  target={target}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
