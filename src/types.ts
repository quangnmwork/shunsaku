export interface HistoryEntry {
  id: number;
  date: string;
  odo: number;
  fuel: number;
  amount: number;
  unitPrice: number;
  kmpl: number | null;
  flagged: boolean;
  isEstimated: boolean;
  // 満タン法対応
  isFullTank: boolean;      // 満タン給油かどうか
  skipCalculation: boolean; // 燃費算出しない（記録忘れ）
}
