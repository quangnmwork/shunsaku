import { colors } from '../constants';
import type { HistoryEntry } from '../types';

interface LineChartProps {
  data: HistoryEntry[];
  valueKey: keyof HistoryEntry;
  color?: string;
  catalogH?: number;
  initOdo?: number;
}

export function LineChart({ data, valueKey, color = colors.red, catalogH, initOdo }: LineChartProps) {
  const valid = data.filter((d) => d[valueKey] != null);
  if (valid.length < 1) {
    return (
      <div style={{ textAlign: 'center', color: colors.gray, fontSize: 13, padding: '20px 0' }}>
        2回以上記録するとグラフが表示されます
      </div>
    );
  }

  const showValueLabels = valueKey === 'kmpl';
  const w = 311;
  const h = showValueLabels ? 150 : 130;
  const pL = 32;
  const pB = 22;
  const pT = showValueLabels ? 24 : 14;
  const pR = 10;
  const iW = w - pL - pR;
  const iH = h - pT - pB;
  const baseline = pT + iH;

  const allVals = [...data.map((d) => d[valueKey] as number).filter(Boolean)];
  if (catalogH) allVals.push(catalogH);

  const avgH = (() => {
    const totalOdo = data[data.length - 1]?.odo;
    const firstOdo = initOdo ?? data[0]?.odo;
    const totalL = data.reduce((s, d) => s + (d.fuel || 0), 0);
    if (!totalL || !totalOdo || !firstOdo) return null;
    return parseFloat(((totalOdo - firstOdo) / totalL).toFixed(1));
  })();
  if (avgH != null) allVals.push(avgH);

  const minV = Math.min(...allVals) * 0.88;
  const maxV = Math.max(...allVals) * 1.08;

  const xS = (i: number) => pL + (i / (data.length - 1 || 1)) * iW;
  const yS = (v: number) => pT + iH - ((v - minV) / (maxV - minV)) * iH;

  const iVals = data.map((d, i) => {
    if (d[valueKey] != null) return d[valueKey] as number;
    let pi = i - 1;
    while (pi >= 0 && data[pi][valueKey] == null) pi--;
    let ni = i + 1;
    while (ni < data.length && data[ni][valueKey] == null) ni++;
    if (pi < 0 || ni >= data.length) return null;
    return (
      (data[pi][valueKey] as number) +
      ((data[ni][valueKey] as number) - (data[pi][valueKey] as number)) *
        ((i - pi) / (ni - pi))
    );
  });

  const missingRanges: [number, number][] = [];
  let inGap = false;
  let gapStart = -1;
  data.forEach((d, i) => {
    if (d[valueKey] == null && !inGap) { inGap = true; gapStart = i - 1; }
    if (d[valueKey] != null && inGap) { inGap = false; missingRanges.push([gapStart, i]); }
  });

  const segments: number[][] = [];
  let cur: number[] = [];
  data.forEach((d, i) => {
    if (d[valueKey] != null) cur.push(i);
    else {
      if (cur.length >= 2) segments.push([...cur]);
      cur = [];
    }
  });
  if (cur.length >= 1) segments.push(cur);

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`}>
      {[minV, (minV + maxV) / 2, maxV].map((v, i) => (
        <g key={i}>
          <line x1={pL} x2={w - pR} y1={yS(v)} y2={yS(v)} stroke="#EEE" strokeWidth={1} />
          <text x={pL - 4} y={yS(v) + 4} fontSize={8} fill={colors.gray} textAnchor="end">
            {Math.round(v)}
          </text>
        </g>
      ))}

      {avgH != null && (
        <g>
          <line x1={pL} x2={w - pR} y1={yS(avgH)} y2={yS(avgH)} stroke="#2E7D32" strokeWidth={1.5} strokeDasharray="4,2" />
          <text x={pL - 4} y={yS(avgH) + 4} fontSize={8} fill="#2E7D32" textAnchor="end" fontWeight="700">{avgH}</text>
        </g>
      )}

      {catalogH != null && (
        <g>
          <line x1={pL} x2={w - pR} y1={yS(catalogH)} y2={yS(catalogH)} stroke={colors.blue} strokeWidth={1.5} strokeDasharray="6,3" />
          <text x={pL - 4} y={yS(catalogH) + 4} fontSize={8} fill={colors.blue} textAnchor="end" fontWeight="700">{catalogH}</text>
        </g>
      )}

      {missingRanges.map(([from, to], ri) => {
        const pts: string[] = [];
        for (let i = from; i <= to; i++) {
          if (iVals[i] != null) pts.push(`${xS(i)},${yS(iVals[i]!)}`);
        }
        if (pts.length < 2) return null;
        const area = `${xS(from)},${baseline} ${pts.join(' ')} ${xS(to)},${baseline}`;
        return (
          <g key={`gap-${ri}`}>
            <polygon points={area} fill="#BDBDBD" fillOpacity={0.2} />
            <polyline points={pts.join(' ')} fill="none" stroke="#BDBDBD" strokeWidth={1.5} strokeDasharray="4,3" />
          </g>
        );
      })}

      {segments.map((idxs, si) => {
        const pts = idxs.map((i) => `${xS(i)},${yS(data[i][valueKey] as number)}`).join(' ');
        const area = `${xS(idxs[0])},${baseline} ${pts} ${xS(idxs[idxs.length - 1])},${baseline}`;
        return (
          <g key={`seg-${si}`}>
            <polygon points={area} fill={color} fillOpacity={0.1} />
            <polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />
          </g>
        );
      })}

      {data.map((d, i) => {
        const val = d[valueKey] as number | null;
        if (val == null) {
          return (
            <g key={i}>
              <text x={xS(i)} y={h - 13} fontSize={8} fill={colors.warn} textAnchor="middle">⚠</text>
              <text x={xS(i)} y={h - 4} fontSize={7} fill={colors.warn} textAnchor="middle">{d.date.slice(5, 10)}</text>
            </g>
          );
        }
        return (
          <g key={i}>
            {showValueLabels && (
              <text
                x={xS(i)}
                y={yS(val) - 10}
                fontSize={7}
                fill={d.isEstimated ? colors.blue : colors.dark}
                textAnchor="middle"
                fontWeight="700"
              >
                {typeof val === 'number' ? val.toFixed(val % 1 === 0 ? 0 : 2) : val}
              </text>
            )}
            {d.isEstimated && (
              <circle cx={xS(i)} cy={yS(val)} r={8} fill={colors.blue} fillOpacity={0.15} />
            )}
            <circle cx={xS(i)} cy={yS(val)} r={4} fill={d.isEstimated ? colors.blue : color} stroke={colors.white} strokeWidth={1.5} />
            <text x={xS(i)} y={h - 4} fontSize={7} fill={colors.gray} textAnchor="middle">{d.date.slice(5, 10)}</text>
          </g>
        );
      })}
    </svg>
  );
}
