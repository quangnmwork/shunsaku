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
}

export interface RecordDraft {
  odo?: number;
  fuel?: number;
  amount?: number;
  unitPrice?: number;
  kmpl?: number | null;
}
