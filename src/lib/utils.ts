export const formatEUR = (v: number) =>
  new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(v);

export const formatNum = (v: number, decimals = 2) =>
  new Intl.NumberFormat('it-IT', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(v);

export const formatPct = (v: number, showSign = true) =>
  `${showSign && v >= 0 ? '+' : ''}${v.toFixed(2)}%`;

export const plColor = (v: number) => (v >= 0 ? 'text-emerald-400' : 'text-rose-400');
