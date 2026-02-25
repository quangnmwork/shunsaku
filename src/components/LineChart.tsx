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

  const isKmpl = valueKey === 'kmpl';
  const w = 343;
  const h = isKmpl ? 160 : 130;
  const pL = 34;
  const pB = 22;
  const pT = isKmpl ? 28 : 14;
  const pR = 12;
  const iW = w - pL - pR;
  const iH = h - pT - pB;
  const baseline = pT + iH;

  const allVals = [...data.map((d) => d[valueKey] as number).filter(Boolean)];
  if (catalogH) allVals.push(catalogH);

  const avgH = (() => {
    if (data.length < 5) return null;
    const totalOdo = data[data.length - 1]?.odo;
    const firstOdo = initOdo ?? data[0]?.odo;
    const totalL = data.reduce((s, d) => s + (d.fuel || 0), 0);
    if (!totalL || !totalOdo || !firstOdo) return null;
    return parseFloat(((totalOdo - firstOdo) / totalL).toFixed(1));
  })();
  if (avgH != null) allVals.push(avgH);

  const minV = Math.min(...allVals) * 0.92;
  const maxV = Math.max(...allVals) * 1.06;

  const xS = (i: number) => pL + (i / (data.length - 1 || 1)) * iW;
  const yS = (v: number) => pT + iH - ((v - minV) / (maxV - minV)) * iH;

  // Build continuous line + area
  const validPts = data
    .map((d, i) => ({ i, val: d[valueKey] as number | null }))
    .filter((p) => p.val != null) as { i: number; val: number }[];

  const linePts = validPts.map((p) => `${xS(p.i)},${yS(p.val)}`).join(' ');
  const areaPts = validPts.length >= 2
    ? `${xS(validPts[0].i)},${baseline} ${linePts} ${xS(validPts[validPts.length - 1].i)},${baseline}`
    : '';

  // Value labels with anti-overlap
  const labelPositions: { x: number; y: number; text: string; fill: string }[] = [];
  if (isKmpl) {
    data.forEach((d, i) => {
      const val = d[valueKey] as number | null;
      if (val == null || d.isEstimated) return;
      const cx = xS(i);
      const baseY = yS(val) - 12;
      let finalY = baseY;
      for (const prev of labelPositions) {
        if (Math.abs(cx - prev.x) < 30 && Math.abs(finalY - prev.y) < 10) {
          finalY = prev.y - 10;
        }
      }
      labelPositions.push({ x: cx, y: finalY, text: val % 1 === 0 ? String(val) : val.toFixed(2), fill: colors.dark });
    });
  }

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`}>
      {/* Grid */}
      {[minV, (minV + maxV) / 2, maxV].map((v, i) => (
        <g key={i}>
          <line x1={pL} x2={w - pR} y1={yS(v)} y2={yS(v)} stroke="#EEE" strokeWidth={1} />
          <text x={pL - 4} y={yS(v) + 4} fontSize={8} fill={colors.gray} textAnchor="end">
            {Math.round(v)}
          </text>
        </g>
      ))}

      {/* avg(H) green solid */}
      {avgH != null && (
        <line x1={pL} x2={w - pR} y1={yS(avgH)} y2={yS(avgH)} stroke={colors.green} strokeWidth={0.8} />
      )}

      {/* Catalog blue solid */}
      {catalogH != null && (
        <line x1={pL} x2={w - pR} y1={yS(catalogH)} y2={yS(catalogH)} stroke={colors.blue} strokeWidth={0.8} />
      )}

      {/* Area fill */}
      {areaPts && <polygon points={areaPts} fill={color} fillOpacity={0.08} />}

      {/* Line */}
      {validPts.length >= 2 && (
        <polyline points={linePts} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
      )}

      {/* Value labels (actual only) */}
      {labelPositions.map((lp, i) => (
        <text key={`label-${i}`} x={lp.x} y={lp.y} fontSize={8} fill={lp.fill} textAnchor="middle" fontWeight="700">
          {lp.text}
        </text>
      ))}

      {/* Data points */}
      {data.map((d, i) => {
        const val = d[valueKey] as number | null;
        if (val == null) return null;
        const cx = xS(i);
        const cy = yS(val);
        const isEst = d.isEstimated;

        return (
          <g key={i}>
            {isEst && (
              <circle cx={cx} cy={cy} r={8} fill={colors.gray} fillOpacity={0.15} />
            )}
            <circle cx={cx} cy={cy} r={4} fill={isEst ? colors.gray : color} stroke={colors.white} strokeWidth={1.5} />
            {isEst && isKmpl && (
              <text x={cx} y={cy - 12} fontSize={7} fill={colors.gray} textAnchor="middle" fontWeight="700">
                {val % 1 === 0 ? val : val.toFixed(2)}
              </text>
            )}
            <text x={cx} y={h - 4} fontSize={7} fill={colors.gray} textAnchor="middle">
              {d.date.slice(5, 10)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
