import { PieChart, Pie, Tooltip, ResponsiveContainer } from 'recharts';
import type { AggregatedPosition } from '../lib/portfolioEngine';

const CLASSE_COLORS: Record<string, string> = {
  Azionario: '#3b82f6',
  Obbligazionario: '#10b981',
  Gold: '#f59e0b',
  Oro: '#f59e0b',
};

const AREA_COLORS: Record<string, string> = {
  USA: '#3b82f6',
  'World ex USA': '#06b6d4',
  'Emerging Markets': '#f97316',
  'No Area': '#6b7280',
};

interface TooltipEntry {
  name: string;
  value: number;
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: TooltipEntry[] }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm shadow-lg">
      <p className="text-zinc-100 font-medium">{payload[0].name}</p>
      <p className="text-zinc-300">{payload[0].value.toFixed(1)}%</p>
    </div>
  );
}

function DonutChart({
  data,
  colors,
  title,
  emptyLabel,
}: {
  data: { name: string; value: number }[];
  colors: Record<string, string>;
  title: string;
  emptyLabel: string;
}) {
  const sorted = [...data].sort((a, b) => b.value - a.value);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-4">{title}</h3>

      {data.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-zinc-600 text-sm">{emptyLabel}</div>
      ) : (
        <div className="flex items-center gap-4">
          {/* Donut */}
          <div className="flex-shrink-0 w-44 h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.map(entry => ({ ...entry, fill: colors[entry.name] ?? '#6b7280' }))}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={76}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                />
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Breakdown table */}
          <div className="flex-1 min-w-0 space-y-2">
            {sorted.map(entry => (
              <div key={entry.name} className="flex items-center gap-2">
                <span
                  className="flex-shrink-0 w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: colors[entry.name] ?? '#6b7280' }}
                />
                <span className="flex-1 text-sm text-zinc-400 truncate">{entry.name}</span>
                <span className="flex-shrink-0 text-sm font-medium text-zinc-200 tabular-nums">
                  {entry.value.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface Props {
  positions: AggregatedPosition[];
}

export function AllocationCharts({ positions }: Props) {
  const nonMonetary = positions.filter(p => p.classe !== 'Monetario');
  const totalNM = nonMonetary.reduce((s, p) => s + p.valoreAttuale, 0);

  const macroData = Object.entries(
    nonMonetary.reduce<Record<string, number>>((acc, p) => {
      acc[p.classe] = (acc[p.classe] ?? 0) + p.valoreAttuale;
      return acc;
    }, {}),
  ).map(([name, value]) => ({
    name,
    value: totalNM > 0 ? (value / totalNM) * 100 : 0,
  }));

  const equityPositions = positions.filter(p => p.classe === 'Azionario');
  const totalEq = equityPositions.reduce((s, p) => s + p.valoreAttuale, 0);

  const areaData = Object.entries(
    equityPositions.reduce<Record<string, number>>((acc, p) => {
      const area = p.area?.trim() || 'Altro';
      acc[area] = (acc[area] ?? 0) + p.valoreAttuale;
      return acc;
    }, {}),
  ).map(([name, value]) => ({
    name,
    value: totalEq > 0 ? (value / totalEq) * 100 : 0,
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <DonutChart
        data={macroData}
        colors={CLASSE_COLORS}
        title="Macro Allocazione"
        emptyLabel="Nessun dato"
      />
      <DonutChart
        data={areaData}
        colors={AREA_COLORS}
        title="Profondità Azionaria"
        emptyLabel="Nessuna posizione azionaria"
      />
    </div>
  );
}
