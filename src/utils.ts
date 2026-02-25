import { ANOMALY_THRESHOLD } from './constants';
import type { HistoryEntry } from './types';

export function nowStr(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}/${p(d.getMonth() + 1)}/${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export function groupByMonth(data: HistoryEntry[]): [string, HistoryEntry[]][] {
  const map: Record<string, HistoryEntry[]> = {};
  data.forEach((d) => {
    const k = d.date.slice(0, 7);
    if (!map[k]) map[k] = [];
    map[k].push(d);
  });
  return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]));
}

export function calcAvgH(history: HistoryEntry[], initOdo: number): number | null {
  const totalL = history.reduce((s, h) => s + (h.fuel || 0), 0);
  if (!totalL || history.length === 0) return null;
  const latestOdo = history[history.length - 1].odo;
  return parseFloat(((latestOdo - initOdo) / totalL).toFixed(1));
}

export function isAnomalous(kmpl: number, catalogH: number): boolean {
  return Math.abs(kmpl - catalogH) / catalogH > ANOMALY_THRESHOLD;
}

export type DemoScenario = 'simple' | 'neutral' | 'good' | 'declining';

export const DEMO_SCENARIOS: { id: DemoScenario; label: string; desc: string }[] = [
  { id: 'simple', label: '基本（4件）', desc: '記録忘れ1回、データ少' },
  { id: 'neutral', label: '収集中（6件）', desc: 'まだデータ不足、最終値=カタログ値' },
  { id: 'good', label: '燃費良好（7件）', desc: 'avg(H) > カタログ値 🎉' },
  { id: 'declining', label: '燃費低下（6件）', desc: 'avg(H) < カタログ値 ⚠️' },
];

function buildEntries(
  initOdo: number,
  catalogH: number,
  raw: { id: number; date: string; odo: number; fuel?: number; estimated?: boolean }[],
): HistoryEntry[] {
  const UP = 172;
  const entries: HistoryEntry[] = [];
  let prevOdo = initOdo;

  for (const r of raw) {
    const delta = r.odo - prevOdo;
    if (r.estimated) {
      const fuel = parseFloat((delta / catalogH).toFixed(2));
      entries.push({
        id: r.id, date: r.date, odo: r.odo,
        fuel, amount: Math.round(fuel * UP), unitPrice: UP,
        kmpl: catalogH,
        flagged: false, isEstimated: true,
      });
    } else {
      const fuel = r.fuel!;
      entries.push({
        id: r.id, date: r.date, odo: r.odo,
        fuel, amount: Math.round(fuel * UP), unitPrice: UP,
        kmpl: parseFloat((delta / fuel).toFixed(2)),
        flagged: false, isEstimated: false,
      });
    }
    prevOdo = r.odo;
  }
  return entries;
}

export function makeDemoData(scenario: DemoScenario, catalogH: number): { initOdo: number; history: HistoryEntry[] } {
  if (scenario === 'simple') {
    return {
      initOdo: 1000,
      history: buildEntries(1000, catalogH, [
        { id: 1, date: '2025/01/08 09:00', odo: 1130, fuel: 2.5 },
        { id: 2, date: '2025/01/25 14:30', odo: 1500, estimated: true },
        { id: 3, date: '2025/02/10 11:00', odo: 1600, fuel: 1.8 },
        { id: 4, date: '2025/02/15 16:00', odo: 1800, fuel: 3.8 },
      ]),
    };
  }

  if (scenario === 'neutral') {
    return {
      initOdo: 1000,
      history: buildEntries(1000, catalogH, [
        { id: 1, date: '2025/01/08 09:00', odo: 1130, fuel: 2.5 },
        { id: 2, date: '2025/01/25 14:30', odo: 1500, estimated: true },
        { id: 3, date: '2025/02/10 11:00', odo: 1600, fuel: 1.8 },
        { id: 4, date: '2025/02/15 16:00', odo: 1800, fuel: 3.8 },
        { id: 5, date: '2025/02/28 10:00', odo: 1920, fuel: 2.3 },
        { id: 6, date: '2025/03/04 09:00', odo: 2100, estimated: true },
      ]),
    };
  }

  if (scenario === 'good') {
    const initOdo = 1000;
    const UP = 172;
    const entries: HistoryEntry[] = [];
    const raw = [
      { id: 1, date: '2025/01/08 09:00', odo: 1130, fuel: 2.5 },
      { id: 2, date: '2025/01/25 14:30', odo: 1500, estimated: true },
      { id: 3, date: '2025/02/10 11:00', odo: 1600, fuel: 1.8 },
      { id: 4, date: '2025/02/15 16:00', odo: 1800, fuel: 3.8 },
      { id: 5, date: '2025/02/28 10:00', odo: 1920, fuel: 2.3 },
      { id: 6, date: '2025/03/04 09:00', odo: 2100, fuel: 3.5 },
      { id: 7, date: '2025/03/12 15:00', odo: 2400, estimated: true },
    ];
    let prevOdo = initOdo;
    for (const r of raw) {
      const delta = r.odo - prevOdo;
      if (r.estimated) {
        const fuel = parseFloat((delta / catalogH).toFixed(2));
        entries.push({
          id: r.id, date: r.date, odo: r.odo,
          fuel, amount: Math.round(fuel * UP), unitPrice: UP,
          kmpl: catalogH,
          flagged: false, isEstimated: true,
        });
      } else {
        entries.push({
          id: r.id, date: r.date, odo: r.odo,
          fuel: r.fuel!, amount: Math.round(r.fuel! * UP), unitPrice: UP,
          kmpl: parseFloat((delta / r.fuel!).toFixed(2)),
          flagged: false, isEstimated: false,
        });
      }
      prevOdo = r.odo;
    }
    return { initOdo, history: entries };
  }

  // declining: avg(H) consistently below catalog
  return {
    initOdo: 5000,
    history: buildEntries(5000, catalogH, [
      { id: 1, date: '2025/04/05 10:00', odo: 5200, fuel: 5.0 },
      { id: 2, date: '2025/04/18 14:00', odo: 5400, fuel: 5.7 },
      { id: 3, date: '2025/05/02 09:00', odo: 5700, estimated: true },
      { id: 4, date: '2025/05/15 11:00', odo: 5900, fuel: 6.5 },
      { id: 5, date: '2025/05/28 16:00', odo: 6100, fuel: 5.8 },
      { id: 6, date: '2025/06/10 10:00', odo: 6300, fuel: 6.2 },
    ]),
  };
}

export function makeInitHistory(catalogH: number): HistoryEntry[] {
  return makeDemoData('simple', catalogH).history;
}
