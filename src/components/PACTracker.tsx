import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { PortfolioItem } from '../types/portfolio';
import { computePACTimeline } from '../lib/portfolioEngine';
import { formatEUR, plColor } from '../lib/utils';

interface TooltipPayload {
  dataKey: string;
  value: number;
}

function PACTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const capital = payload.find(p => p.dataKey === 'capitalInvestito')?.value ?? 0;
  const valore = payload.find(p => p.dataKey === 'valorePortafoglio')?.value ?? 0;
  const diff = valore - capital;
  const pct = capital > 0 ? (diff / capital) * 100 : 0;
  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-xs shadow-xl space-y-1">
      <p className="text-zinc-400 font-medium mb-2">{label}</p>
      <div className="flex justify-between gap-6">
        <span className="text-zinc-400">Capitale</span>
        <span className="text-blue-400 font-medium tabular-nums">{formatEUR(capital)}</span>
      </div>
      <div className="flex justify-between gap-6">
        <span className="text-zinc-400">Valore</span>
        <span className="text-emerald-400 font-medium tabular-nums">{formatEUR(valore)}</span>
      </div>
      <div className="flex justify-between gap-6 pt-1.5 mt-0.5 border-t border-zinc-700">
        <span className="text-zinc-400">P/L</span>
        <span className={`font-medium tabular-nums ${plColor(diff)}`}>
          {diff >= 0 ? '+' : ''}
          {formatEUR(diff)}{' '}
          <span className="opacity-75">
            ({diff >= 0 ? '+' : ''}
            {pct.toFixed(1)}%)
          </span>
        </span>
      </div>
    </div>
  );
}

function formatYAxis(v: number): string {
  if (v >= 10000) return `€${(v / 1000).toFixed(0)}k`;
  if (v >= 1000) return `€${(v / 1000).toFixed(1)}k`;
  return `€${v.toFixed(0)}`;
}

interface Props {
  items: PortfolioItem[];
}

export function PACTracker({ items }: Props) {
  const data = computePACTimeline(items);

  if (data.length === 0) return null;

  const last = data[data.length - 1];
  const diff = last.valorePortafoglio - last.capitalInvestito;
  const pct = last.capitalInvestito > 0 ? (diff / last.capitalInvestito) * 100 : 0;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      {/* Header */}
      <div className="mb-5">
        <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-widest">PAC Tracker</h3>
      </div>

      {/* Mini KPI row */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-zinc-800/60 rounded-lg p-3">
          <p className="text-xs text-zinc-500 mb-1">Capitale investito</p>
          <p className="text-sm font-semibold text-blue-400 tabular-nums">{formatEUR(last.capitalInvestito)}</p>
        </div>
        <div className="bg-zinc-800/60 rounded-lg p-3">
          <p className="text-xs text-zinc-500 mb-1">Valore attuale</p>
          <p className="text-sm font-semibold text-emerald-400 tabular-nums">{formatEUR(last.valorePortafoglio)}</p>
        </div>
        <div className="bg-zinc-800/60 rounded-lg p-3">
          <p className="text-xs text-zinc-500 mb-1">Guadagno netto</p>
          <p className={`text-sm font-semibold tabular-nums ${plColor(diff)}`}>
            {diff >= 0 ? '+' : ''}
            {formatEUR(diff)}
            <span className="text-xs font-normal ml-1 opacity-75">
              ({diff >= 0 ? '+' : ''}
              {pct.toFixed(1)}%)
            </span>
          </p>
        </div>
      </div>

      {/* Area chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradCapital" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradValore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />

            <XAxis
              dataKey="label"
              tick={{ fill: '#71717a', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tickFormatter={formatYAxis}
              tick={{ fill: '#71717a', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={48}
            />

            <Tooltip content={<PACTooltip />} />

            {/* Capital area drawn first (below) */}
            <Area
              type="monotone"
              dataKey="capitalInvestito"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#gradCapital)"
              dot={false}
              activeDot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }}
            />
            {/* Value area drawn on top */}
            <Area
              type="monotone"
              dataKey="valorePortafoglio"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#gradValore)"
              dot={false}
              activeDot={{ r: 4, fill: '#10b981', strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-px bg-blue-500" style={{ height: '2px' }} />
            <span className="text-xs text-zinc-500">Capitale investito</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-3 bg-emerald-500" style={{ height: '2px' }} />
            <span className="text-xs text-zinc-500">Valore portafoglio</span>
          </div>
        </div>
        <p className="text-xs text-zinc-700">ai prezzi correnti</p>
      </div>
    </div>
  );
}
