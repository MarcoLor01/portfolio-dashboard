import { Treemap, Tooltip, ResponsiveContainer } from 'recharts';
import type { AggregatedPosition } from '../lib/portfolioEngine';
import { formatEUR } from '../lib/utils';

function getPLColor(pct: number): string {
  if (pct >= 15) return '#065f46';
  if (pct >= 10) return '#059669';
  if (pct >= 5)  return '#10b981';
  if (pct >= 2)  return '#34d399';
  if (pct >= 0)  return '#6ee7b7';
  if (pct >= -2) return '#fca5a5';
  if (pct >= -5) return '#f87171';
  if (pct >= -10) return '#ef4444';
  return '#dc2626';
}

// recharts passes cell data as props via cloneElement — typed loosely intentionally
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TreemapCell({ x, y, width, height, name, plPercentuale, depth }: any) {
  if (depth !== 1 || !name || width <= 2 || height <= 2) return <g />;

  const fill = getPLColor(plPercentuale ?? 0);
  const cx = x + width / 2;
  const cy = y + height / 2;
  const showName = width > 55 && height > 40;
  const showPct = width > 55 && height > 58;
  const fontSize = Math.min(13, Math.max(9, width / 6));
  const pct: number = plPercentuale ?? 0;

  return (
    <g>
      <rect x={x + 1} y={y + 1} width={width - 2} height={height - 2} fill={fill} rx={3} />
      {showName && (
        <text
          x={cx}
          y={cy + (showPct ? -8 : 0)}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="white"
          fillOpacity={0.95}
          fontSize={fontSize}
          fontWeight={600}
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          {name}
        </text>
      )}
      {showPct && (
        <text
          x={cx}
          y={cy + 10}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="white"
          fillOpacity={0.75}
          fontSize={Math.max(9, fontSize - 2)}
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          {pct >= 0 ? '+' : ''}
          {pct.toFixed(1)}%
        </text>
      )}
    </g>
  );
}

interface TooltipData {
  name: string;
  plPercentuale: number;
  valoreAttuale: number;
  plAssoluto: number;
  peso: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TreemapTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d: TooltipData = payload[0]?.payload;
  if (!d?.name) return null;
  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-xs shadow-xl space-y-1.5">
      <p className="text-zinc-100 font-semibold mb-1">{d.name}</p>
      <div className="flex justify-between gap-6">
        <span className="text-zinc-400">Valore attuale</span>
        <span className="text-zinc-100 tabular-nums">{formatEUR(d.valoreAttuale)}</span>
      </div>
      <div className="flex justify-between gap-6">
        <span className="text-zinc-400">Peso portafoglio</span>
        <span className="text-zinc-100 tabular-nums">{d.peso.toFixed(1)}%</span>
      </div>
      <div className="flex justify-between gap-6">
        <span className="text-zinc-400">P/L assoluto</span>
        <span className={`tabular-nums ${d.plAssoluto >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
          {d.plAssoluto >= 0 ? '+' : ''}
          {formatEUR(d.plAssoluto)}
        </span>
      </div>
      <div className="flex justify-between gap-6 border-t border-zinc-700 pt-1.5">
        <span className="text-zinc-400">Performance</span>
        <span className={`font-semibold tabular-nums ${d.plPercentuale >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
          {d.plPercentuale >= 0 ? '+' : ''}
          {d.plPercentuale.toFixed(2)}%
        </span>
      </div>
    </div>
  );
}

const LEGEND_COLORS = ['#dc2626', '#ef4444', '#f87171', '#fca5a5', '#6ee7b7', '#34d399', '#10b981', '#059669', '#065f46'];

interface Props {
  positions: AggregatedPosition[];
}

export function PortfolioTreemap({ positions }: Props) {
  if (positions.length === 0) return null;

  const total = positions.reduce((s, p) => s + p.valoreAttuale, 0);

  const data = positions.map(p => ({
    name: p.ticker,
    size: p.valoreAttuale,
    plPercentuale: p.plPercentuale,
    valoreAttuale: p.valoreAttuale,
    plAssoluto: p.plAssoluto,
    peso: total > 0 ? (p.valoreAttuale / total) * 100 : 0,
  }));

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-5">
        Mappa del Portafoglio
      </h3>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <Treemap data={data} dataKey="size" aspectRatio={4 / 3} content={<TreemapCell />}>
            <Tooltip content={<TreemapTooltip />} />
          </Treemap>
        </ResponsiveContainer>
      </div>

      {/* Performance color legend */}
      <div className="mt-4 flex items-center gap-3">
        <span className="text-xs text-zinc-600 flex-shrink-0">Perf.</span>
        <div className="flex items-center gap-px flex-1 max-w-36">
          {LEGEND_COLORS.map((color, i) => (
            <span
              key={i}
              className="inline-block h-2.5 flex-1 rounded-sm"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs text-zinc-600 w-14">
          <span>−</span>
          <span>0</span>
          <span>+</span>
        </div>
      </div>
    </div>
  );
}
