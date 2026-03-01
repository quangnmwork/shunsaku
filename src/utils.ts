import { ANOMALY_THRESHOLD } from './constants';
import type { HistoryEntry } from './types';

export function nowStr(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}/${p(d.getMonth() + 1)}/${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

// Parse date string "YYYY/MM/DD HH:mm" to Date object
export function parseDate(dateStr: string): Date {
  const [datePart, timePart] = dateStr.split(' ');
  const [year, month, day] = datePart.split('/').map(Number);
  const [hour, minute] = (timePart || '00:00').split(':').map(Number);
  return new Date(year, month - 1, day, hour, minute);
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

// 満タン法で燃費を計算
// 前回の満タンから今回の満タンまでの累積で計算
export function calculateFuelEfficiency(
  history: HistoryEntry[],
  initOdo: number
): HistoryEntry[] {
  const result: HistoryEntry[] = [];
  let lastFullTankOdo = initOdo;
  let accumulatedFuel = 0;

  for (let i = 0; i < history.length; i++) {
    const entry = history[i];
    
    if (entry.skipCalculation) {
      // 記録忘れ: 燃費計算しない、次の満タンの基準をリセット
      result.push({ ...entry, kmpl: null });
      lastFullTankOdo = entry.odo;
      accumulatedFuel = 0;
    } else if (!entry.isFullTank) {
      // 部分給油: 燃費計算せず、燃料を積み上げ
      accumulatedFuel += entry.fuel;
      result.push({ ...entry, kmpl: null });
    } else {
      // 満タン給油: 燃費を計算
      accumulatedFuel += entry.fuel;
      const deltaOdo = entry.odo - lastFullTankOdo;
      const kmpl = accumulatedFuel > 0 ? parseFloat((deltaOdo / accumulatedFuel).toFixed(2)) : null;
      result.push({ ...entry, kmpl });
      // リセット
      lastFullTankOdo = entry.odo;
      accumulatedFuel = 0;
    }
  }

  return result;
}

// 平均燃費（skipCalculationを除外）
export function calcAvgH(history: HistoryEntry[], _initOdo?: number): number | null {
  // Simple approach: average of all valid kmpl values
  const validKmpl = history.filter(h => h.kmpl != null).map(h => h.kmpl as number);
  if (validKmpl.length === 0) return null;
  
  const avg = validKmpl.reduce((a, b) => a + b, 0) / validKmpl.length;
  return parseFloat(avg.toFixed(1));
}

// 当月の平均燃費
export function calcMonthlyAvgH(history: HistoryEntry[]): number | null {
  const now = new Date();
  const thisMonth = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  const monthEntries = history.filter(
    h => h.date.startsWith(thisMonth) && !h.skipCalculation && h.kmpl != null
  );
  
  if (monthEntries.length === 0) return null;
  
  const totalKmpl = monthEntries.reduce((s, h) => s + (h.kmpl || 0), 0);
  return parseFloat((totalKmpl / monthEntries.length).toFixed(1));
}

export function isAnomalous(kmpl: number, catalogH: number): boolean {
  return Math.abs(kmpl - catalogH) / catalogH > ANOMALY_THRESHOLD;
}

export type DemoScenario = 'mantan' | 'partial' | 'missed' | 'mixed' | 'many_partial' | 'many_missed' | 'worst_case' | 'long_term' | 'demo_recalc';

export const DEMO_SCENARIOS: { id: DemoScenario; label: string; desc: string }[] = [
  { id: 'demo_recalc', label: '🔄 再計算デモ', desc: '部分・忘れ多め（削除テスト用）' },
  { id: 'mantan', label: '満タン給油のみ', desc: '毎回満タンで給油（理想的）' },
  { id: 'partial', label: '部分給油あり', desc: '途中で部分給油が2回' },
  { id: 'missed', label: '記録忘れあり', desc: '途中で記録忘れが1回' },
  { id: 'mixed', label: '複合ケース', desc: '部分給油2回 + 記録忘れ1回' },
  { id: 'many_partial', label: '部分給油多め', desc: '満タンより部分給油が多い' },
  { id: 'many_missed', label: '記録忘れ多め', desc: '記録忘れが複数回' },
  { id: 'worst_case', label: '最悪ケース', desc: '部分+記録忘れが連続' },
  { id: 'long_term', label: '6ヶ月データ', desc: '半年分のデータ（月別表示テスト用）' },
];

export function makeDemoData(scenario: DemoScenario, _catalogH?: number): { initOdo: number; history: HistoryEntry[] } {
  const UP = 150;
  
  const makeEntry = (
    id: number,
    date: string,
    odo: number,
    fuel: number,
    isFullTank: boolean,
    skipCalculation: boolean
  ): HistoryEntry => ({
    id,
    date,
    odo,
    fuel,
    amount: Math.round(fuel * UP),
    unitPrice: UP,
    kmpl: null, // Will be calculated
    flagged: false,
    isEstimated: false,
    isFullTank,
    skipCalculation,
  });

  let initOdo = 0;
  let rawHistory: HistoryEntry[] = [];

  if (scenario === 'demo_recalc') {
    // 再計算デモ用 - 部分・忘れが混在、削除で燃費が変わるケース
    initOdo = 1000;
    rawHistory = [
      // ① 満タン → 45 km/L
      makeEntry(1, '2026/02/01 10:00', 1135, 3, true, false),
      // ② 部分給油 → — (2L積み上げ)
      makeEntry(2, '2026/02/05 14:00', 1225, 2, false, false),
      // ③ 部分給油 → — (さらに1.5L積み上げ)
      makeEntry(3, '2026/02/08 10:00', 1300, 1.5, false, false),
      // ④ 満タン → (1300-1135)/(2+1.5+3) = 165/6.5 = 25.4 km/L
      makeEntry(4, '2026/02/12 11:00', 1430, 3, true, false),
      // ⑤ 記録忘れ → — (リセット)
      makeEntry(5, '2026/02/15 16:00', 1560, 3, true, true),
      // ⑥ 部分給油 → — (新しい基準から2L)
      makeEntry(6, '2026/02/18 10:00', 1650, 2, false, false),
      // ⑦ 満タン → (1650-1560)/(2+2.5) = 90/4.5 = 20 km/L
      makeEntry(7, '2026/02/22 14:00', 1780, 2.5, true, false),
      // ⑧ 満タン → 130/3 = 43.3 km/L
      makeEntry(8, '2026/02/26 10:00', 1910, 3, true, false),
    ];
  } else if (scenario === 'mantan') {
    // シンプル: 全部満タン（7件）
    initOdo = 0;
    rawHistory = [
      makeEntry(1, '2026/01/05 10:00', 120, 3, true, false),   // 120/3 = 40
      makeEntry(2, '2026/01/12 14:00', 250, 3, true, false),   // 130/3 = 43.33
      makeEntry(3, '2026/01/20 09:00', 390, 3, true, false),   // 140/3 = 46.67
      makeEntry(4, '2026/02/02 11:00', 530, 3, true, false),   // 140/3 = 46.67
      makeEntry(5, '2026/02/10 16:00', 660, 3, true, false),   // 130/3 = 43.33
      makeEntry(6, '2026/02/18 10:00', 810, 3.5, true, false), // 150/3.5 = 42.86
      makeEntry(7, '2026/02/26 14:00', 945, 3, true, false),   // 135/3 = 45
    ];
  } else if (scenario === 'partial') {
    // 部分給油あり（6件）
    initOdo = 0;
    rawHistory = [
      makeEntry(1, '2026/01/08 10:00', 120, 3, true, false),   // 120/3 = 40
      makeEntry(2, '2026/01/15 14:00', 240, 2, false, false),  // 部分 → —
      makeEntry(3, '2026/01/22 09:00', 390, 3.5, true, false), // (390-120)/(2+3.5) = 49.09
      makeEntry(4, '2026/02/05 11:00', 510, 2.5, false, false),// 部分 → —
      makeEntry(5, '2026/02/15 16:00', 630, 3, true, false),   // (630-390)/(2.5+3) = 43.64
      makeEntry(6, '2026/02/26 10:00', 780, 3.5, true, false), // 150/3.5 = 42.86
    ];
  } else if (scenario === 'missed') {
    // 記録忘れあり（6件）
    initOdo = 1000;
    rawHistory = [
      makeEntry(1, '2026/01/10 10:00', 1150, 3.5, true, false), // 150/3.5 = 42.86
      makeEntry(2, '2026/01/18 14:00', 1290, 3, true, false),   // 140/3 = 46.67
      makeEntry(3, '2026/01/28 10:00', 1450, 4, true, true),    // 記録忘れ → —
      makeEntry(4, '2026/02/08 10:00', 1600, 3.5, true, false), // (1600-1450)/3.5 = 42.86
      makeEntry(5, '2026/02/18 11:00', 1750, 3.5, true, false), // 150/3.5 = 42.86
      makeEntry(6, '2026/02/26 14:00', 1890, 3, true, false),   // 140/3 = 46.67
    ];
  } else if (scenario === 'mixed') {
    // 複合ケース（7件）
    initOdo = 0;
    rawHistory = [
      makeEntry(1, '2026/01/10 10:00', 135, 3, true, false),   // 135/3 = 45
      makeEntry(2, '2026/01/18 14:00', 270, 2.5, false, false),// 部分 → —
      makeEntry(3, '2026/01/25 10:00', 420, 3.5, true, false), // (420-135)/(2.5+3.5) = 47.5
      makeEntry(4, '2026/02/05 10:00', 580, 4, true, true),    // 記録忘れ → —
      makeEntry(5, '2026/02/12 14:00', 710, 2, false, false),  // 部分 → —
      makeEntry(6, '2026/02/20 10:00', 870, 4, true, false),   // (870-580)/(2+4) = 48.33
      makeEntry(7, '2026/02/26 16:00', 1005, 3, true, false),  // 135/3 = 45
    ];
  } else if (scenario === 'many_partial') {
    // 部分給油多め（7件）- 満タンより部分給油が多い
    initOdo = 0;
    rawHistory = [
      makeEntry(1, '2026/01/05 10:00', 100, 2, false, false),  // 部分 → —
      makeEntry(2, '2026/01/10 14:00', 200, 2, false, false),  // 部分 → —
      makeEntry(3, '2026/01/15 10:00', 300, 2, false, false),  // 部分 → —
      makeEntry(4, '2026/01/22 11:00', 450, 4, true, false),   // (450-0)/(2+2+2+4) = 45
      makeEntry(5, '2026/02/01 16:00', 550, 2, false, false),  // 部分 → —
      makeEntry(6, '2026/02/10 10:00', 650, 2, false, false),  // 部分 → —
      makeEntry(7, '2026/02/20 14:00', 810, 4, true, false),   // (810-450)/(2+2+4) = 45
    ];
  } else if (scenario === 'many_missed') {
    // 記録忘れ多め（8件）- 記録忘れが複数回
    initOdo = 500;
    rawHistory = [
      makeEntry(1, '2026/01/05 10:00', 640, 3, true, false),   // 140/3 = 46.67
      makeEntry(2, '2026/01/12 14:00', 780, 3, true, true),    // 記録忘れ → —（ここで計算リセット）
      makeEntry(3, '2026/01/20 10:00', 920, 3, true, false),   // (920-780)/3 = 46.67
      makeEntry(4, '2026/01/28 11:00', 1060, 3, true, false),  // 140/3 = 46.67
      makeEntry(5, '2026/02/05 16:00', 1200, 3, true, true),   // 記録忘れ → —（また計算リセット）
      makeEntry(6, '2026/02/12 10:00', 1340, 3, true, false),  // (1340-1200)/3 = 46.67
      makeEntry(7, '2026/02/20 14:00', 1490, 3.5, true, true), // 記録忘れ → —
      makeEntry(8, '2026/02/26 10:00', 1625, 3, true, false),  // (1625-1490)/3 = 45
    ];
      } else if (scenario === 'worst_case') {
    // 最悪ケース（8件）- 部分給油と記録忘れが連続
    initOdo = 0;
    rawHistory = [
      makeEntry(1, '2026/01/05 10:00', 90, 2, false, false),   // 部分 → —
      makeEntry(2, '2026/01/08 14:00', 180, 2, false, false),  // 部分 → —
      makeEntry(3, '2026/01/12 10:00', 315, 3, true, true),    // 記録忘れ → —（計算リセット）
      makeEntry(4, '2026/01/18 11:00', 450, 3, true, false),   // (450-315)/3 = 45
      makeEntry(5, '2026/01/25 16:00', 540, 2, false, false),  // 部分 → —
      makeEntry(6, '2026/02/02 10:00', 720, 4, true, true),    // 記録忘れ → —（計算リセット）
      makeEntry(7, '2026/02/10 14:00', 810, 2, false, false),  // 部分 → —
      makeEntry(8, '2026/02/20 10:00', 990, 4, true, false),   // (990-720)/(2+4) = 45
    ];
      } else {
    // long_term - 1年分のデータ (2025/03 - 2026/02) with 部分・忘れ
    initOdo = 0;
    rawHistory = [
      // 2025年3月
      makeEntry(1, '2025/03/05 10:00', 140, 3, true, false),   
      makeEntry(2, '2025/03/15 14:00', 280, 3.1, true, false),   
      makeEntry(3, '2025/03/25 10:00', 420, 3, true, false),   
      // 2025年4月 - 部分給油あり
      makeEntry(4, '2025/04/05 10:00', 520, 2, false, false),  // 部分
      makeEntry(5, '2025/04/15 14:00', 700, 4, true, false),   
      makeEntry(6, '2025/04/25 10:00', 850, 3.3, true, false),   
      // 2025年5月
      makeEntry(7, '2025/05/05 10:00', 1000, 3.2, true, false), 
      makeEntry(8, '2025/05/18 14:00', 1160, 3.5, true, false),  
      makeEntry(9, '2025/05/28 10:00', 1300, 3, true, false),
      // 2025年6月 - 記録忘れあり
      makeEntry(10, '2025/06/08 10:00', 1450, 3.2, true, true),  // 忘れ
      makeEntry(11, '2025/06/20 14:00', 1600, 3.3, true, false),
      // 2025年7月 - 部分給油あり
      makeEntry(12, '2025/07/05 10:00', 1700, 2, false, false),  // 部分
      makeEntry(13, '2025/07/18 14:00', 1920, 5, true, false),
      makeEntry(14, '2025/07/28 10:00', 2070, 3.2, true, false),
      // 2025年8月
      makeEntry(15, '2025/08/10 10:00', 2230, 3.5, true, false),
      makeEntry(16, '2025/08/22 14:00', 2380, 3.3, true, false),
      // 2025年9月 - 記録忘れあり
      makeEntry(17, '2025/09/05 10:00', 2530, 3.2, true, true),  // 忘れ
      makeEntry(18, '2025/09/18 14:00', 2690, 3.5, true, false),   
      makeEntry(19, '2025/09/28 10:00', 2830, 3, true, false),   
      // 2025年10月 - 部分給油あり
      makeEntry(20, '2025/10/08 10:00', 2930, 2, false, false),  // 部分
      makeEntry(21, '2025/10/20 14:00', 3130, 4.5, true, false),   
      // 2025年11月
      makeEntry(22, '2025/11/05 10:00', 3290, 3.5, true, false), 
      makeEntry(23, '2025/11/18 14:00', 3440, 3.2, true, false),  
      makeEntry(24, '2025/11/28 10:00', 3590, 3.3, true, false),
      // 2025年12月 - 部分 + 忘れ + 満タン
      makeEntry(25, '2025/12/05 10:00', 3690, 2, false, false),  // 部分
      makeEntry(26, '2025/12/12 14:00', 3850, 5, true, true),    // 忘れ (reset)
      makeEntry(27, '2025/12/20 10:00', 4000, 3.2, true, false), // 満タン → 燃費計算OK
      makeEntry(28, '2025/12/28 14:00', 4150, 3.3, true, false), // 満タン
      // 2026年1月 - 8 records (部分・忘れあり)
      makeEntry(29, '2026/01/02 10:00', 4300, 3.2, true, false),
      makeEntry(30, '2026/01/06 14:00', 4400, 2, false, false),  // 部分
      makeEntry(31, '2026/01/10 10:00', 4550, 3.5, true, false),
      makeEntry(32, '2026/01/14 11:00', 4700, 3.3, true, false),
      makeEntry(33, '2026/01/18 10:00', 4800, 2, false, false),  // 部分
      makeEntry(34, '2026/01/22 14:00', 5000, 4.5, true, false),
      makeEntry(35, '2026/01/26 10:00', 5150, 3.2, true, true),  // 忘れ
      makeEntry(36, '2026/01/30 11:00', 5300, 3.3, true, false),
      // 2026年2月 - 7 records (部分・忘れあり)
      makeEntry(37, '2026/02/02 10:00', 5450, 3, true, false),
      makeEntry(38, '2026/02/06 14:00', 5550, 2, false, false),  // 部分
      makeEntry(39, '2026/02/10 10:00', 5750, 4.5, true, false),
      makeEntry(40, '2026/02/14 11:00', 5900, 3.3, true, true),  // 忘れ
      makeEntry(41, '2026/02/18 10:00', 6050, 3.2, true, false),
      makeEntry(42, '2026/02/22 14:00', 6200, 3.3, true, false),
      makeEntry(43, '2026/02/28 10:00', 6350, 3, true, false), 
    ];
  }

  // 満タン法で燃費を計算
  const history = calculateFuelEfficiency(rawHistory, initOdo);
  
  return { initOdo, history };
}

export function makeInitHistory(catalogH: number): HistoryEntry[] {
  return makeDemoData('mantan', catalogH).history;
}
