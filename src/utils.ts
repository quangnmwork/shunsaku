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

export function makeInitHistory(catalogH: number): HistoryEntry[] {
  const INIT_ODO = 1000;
  const UP = 172;

  const actuals: { id: number; date: string; odo: number; fuel: number }[] = [
    { id: 1, date: '2025/01/08 09:00', odo: 1130, fuel: 2.5 },
    { id: 3, date: '2025/02/10 11:00', odo: 1600, fuel: 1.8 },
    { id: 4, date: '2025/02/15 16:00', odo: 1800, fuel: 3.8 },
    { id: 5, date: '2025/02/28 10:00', odo: 1920, fuel: 2.3 },
    { id: 6, date: '2025/03/04 09:00', odo: 2100, fuel: 3.5 },
  ];

  const entries: HistoryEntry[] = [];
  let prevOdo = INIT_ODO;

  // Entry 1
  const e1 = actuals[0];
  entries.push({
    id: e1.id, date: e1.date, odo: e1.odo,
    fuel: e1.fuel, amount: Math.round(e1.fuel * UP), unitPrice: UP,
    kmpl: parseFloat(((e1.odo - prevOdo) / e1.fuel).toFixed(1)),
    flagged: false, isEstimated: false,
  });
  prevOdo = e1.odo;

  // Entry 2: estimated (forgot 1/13), ref = catalogH
  const odo2 = 1500;
  const delta2 = odo2 - prevOdo; // 370
  const fuel2 = parseFloat((delta2 / catalogH).toFixed(2));
  entries.push({
    id: 2, date: '2025/01/25 14:30', odo: odo2,
    fuel: fuel2, amount: Math.round(fuel2 * UP), unitPrice: UP,
    kmpl: parseFloat(catalogH.toFixed(1)),
    flagged: false, isEstimated: true,
  });
  prevOdo = odo2;

  // Entries 3-6: actual recordings
  for (let i = 1; i < actuals.length; i++) {
    const a = actuals[i];
    const delta = a.odo - prevOdo;
    entries.push({
      id: a.id, date: a.date, odo: a.odo,
      fuel: a.fuel, amount: Math.round(a.fuel * UP), unitPrice: UP,
      kmpl: parseFloat((delta / a.fuel).toFixed(1)),
      flagged: false, isEstimated: false,
    });
    prevOdo = a.odo;
  }

  // Entry 7: estimated (forgot 3/7), ref = avg(H) at this point
  const totalFuel = entries.reduce((s, e) => s + e.fuel, 0);
  const avgH = (entries[entries.length - 1].odo - INIT_ODO) / totalFuel;
  const odo7 = 2400;
  const delta7 = odo7 - prevOdo; // 300
  const fuel7 = parseFloat((delta7 / avgH).toFixed(2));
  entries.push({
    id: 7, date: '2025/03/12 15:00', odo: odo7,
    fuel: fuel7, amount: Math.round(fuel7 * UP), unitPrice: UP,
    kmpl: parseFloat(avgH.toFixed(1)),
    flagged: false, isEstimated: true,
  });

  return entries;
}
