import { colors } from '../constants';
import type { HistoryEntry } from '../types';

interface MonthBarChartProps {
  months: [string, HistoryEntry[]][];
  valueKey: keyof HistoryEntry;
  color?: string;
}

export function MonthBarChart({ months, valueKey, color = colors.red }: MonthBarChartProps) {
  if (months.length < 1) return null;

  const isAverage = valueKey === 'kmpl';
  const vals = months.map(([, recs]) => {
    const filtered = recs.filter((r) => !r.flagged || valueKey === 'amount');
    const sum = filtered.reduce((s, r) => s + ((r[valueKey] as number) || 0), 0);
    return isAverage && filtered.length > 0 ? sum / filtered.length : sum;
  });
  const maxV = Math.max(...vals) || 1;
  const w = 311;
  const h = 80;
  const pL = 36;
  const pT = 10;
  const pR = 10;
  const iW = w - pL - pR;
  const iH = h - pT - 20;
  const barW = Math.min(32, iW / months.length - 8);

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`}>
      {[0, maxV / 2, maxV].map((v, i) => (
        <g key={i}>
          <line x1={pL} x2={w - pR} y1={pT + iH - (v / maxV) * iH} y2={pT + iH - (v / maxV) * iH} stroke="#EEE" strokeWidth={1} />
          <text x={pL - 4} y={pT + iH - (v / maxV) * iH + 4} fontSize={8} fill={colors.gray} textAnchor="end">{Math.round(v)}</text>
        </g>
      ))}
      {months.map(([key], i) => {
        const val = vals[i];
        const bx = pL + (i / Math.max(months.length - 0.5, 1)) * iW + (iW / months.length - barW) / 2;
        const bh = (val / maxV) * iH;
        return (
          <g key={key}>
            <rect x={bx} y={pT + iH - bh} width={barW} height={bh} rx={3} fill={color} fillOpacity={0.85} />
            <text x={bx + barW / 2} y={pT + iH - bh - 4} fontSize={7} fill={colors.dark} textAnchor="middle" fontWeight="600">
              {isAverage ? val.toFixed(1) : Math.round(val).toLocaleString()}
            </text>
            <text x={bx + barW / 2} y={h - 4} fontSize={8} fill={colors.gray} textAnchor="middle">{key.slice(5)}月</text>
          </g>
        );
      })}
    </svg>
  );
}
