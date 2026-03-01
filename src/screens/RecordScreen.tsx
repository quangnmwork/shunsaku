import { useState, useMemo } from 'react';
import { colors } from '../constants';
import { Shell } from '../components/Shell';
import { Field } from '../components/Field';
import { Btn } from '../components/Btn';
import { Toggle } from '../components/Toggle';
import { parseDate } from '../utils';
import type { HistoryEntry } from '../types';

export interface RecordResult {
  date: string;
  odo: number;
  fuel: number;
  isFullTank: boolean;
  skipCalculation: boolean;
}

interface RecordScreenProps {
  history: HistoryEntry[];
  initOdo: number;
  editEntry?: HistoryEntry; // If provided, we're in edit mode
  onSave: (data: RecordResult, editId?: number) => void;
  onBack: () => void;
}

// Convert Date to input format "YYYY-MM-DDTHH:mm"
function dateToInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Get current datetime in local format for input
function getLocalDatetime(): string {
  return dateToInput(new Date());
}

// Convert "YYYY/MM/DD HH:mm" to input format "YYYY-MM-DDTHH:mm"
function displayToInput(dateStr: string): string {
  // "2026/03/01 14:30" → "2026-03-01T14:30"
  return dateStr.replace(/\//g, '-').replace(' ', 'T');
}

// Convert input datetime to display format
function formatDatetime(input: string): string {
  // "2026-03-01T14:30" → "2026/03/01 14:30"
  return input.replace('T', ' ').replace(/-/g, '/');
}

export function RecordScreen({ history, initOdo, editEntry, onSave, onBack }: RecordScreenProps) {
  const isEditMode = !!editEntry;
  
  // Initialize state from editEntry if in edit mode
  const [datetime, setDatetime] = useState(() => 
    editEntry ? displayToInput(editEntry.date) : getLocalDatetime()
  );
  const [odoStr, setOdoStr] = useState(() => 
    editEntry ? String(editEntry.odo) : ''
  );
  const [liters, setLiters] = useState(() => 
    editEntry ? String(editEntry.fuel) : ''
  );
  const [isFullTank, setIsFullTank] = useState(() => 
    editEntry ? editEntry.isFullTank : true
  );
  const [skipCalculation, setSkipCalculation] = useState(() => 
    editEntry ? editEntry.skipCalculation : false
  );

  const odoVal = Number(odoStr) || 0;
  const fuelVal = Number(liters) || 0;

  // Calculate ODO range based on selected datetime
  const odoRange = useMemo(() => {
    const selectedTime = parseDate(formatDatetime(datetime));
    
    // Get other records (exclude current record if editing)
    const otherRecords = isEditMode 
      ? history.filter(h => h.id !== editEntry.id)
      : history;
    
    // Sort by date
    const sorted = [...otherRecords].sort((a, b) => 
      parseDate(a.date).getTime() - parseDate(b.date).getTime()
    );
    
    // Find position based on selected time
    let prevOdo = initOdo;
    let nextOdo = Infinity;
    
    for (let i = 0; i < sorted.length; i++) {
      const recordTime = parseDate(sorted[i].date);
      if (recordTime > selectedTime) {
        nextOdo = sorted[i].odo;
        break;
      }
      prevOdo = sorted[i].odo;
    }
    
    return { min: prevOdo, max: nextOdo };
  }, [datetime, history, initOdo, isEditMode, editEntry]);

  // Validation
  const isOdoValid = odoVal > odoRange.min && (odoRange.max === Infinity || odoVal < odoRange.max);
  const isFuelValid = fuelVal > 0;
  const canSave = isOdoValid && isFuelValid;

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      date: formatDatetime(datetime),
      odo: odoVal,
      fuel: fuelVal,
      isFullTank,
      skipCalculation,
    }, editEntry?.id);
  };

  // Generate ODO hint text
  const odoHint = odoRange.max === Infinity 
    ? `${odoRange.min + 1} 以上`
    : `${odoRange.min + 1} ~ ${odoRange.max - 1}`;

  // Generate error message
  const getOdoError = () => {
    if (!odoStr) return null;
    if (odoVal <= odoRange.min) {
      return `${odoRange.min} km より大きい値を入力`;
    }
    if (odoRange.max !== Infinity && odoVal >= odoRange.max) {
      return `${odoRange.max} km より小さい値を入力`;
    }
    return null;
  };

  const odoError = getOdoError();

  return (
    <Shell title={isEditMode ? "記録を編集" : "給油記録"} onBack={onBack}>
      {/* Date & Time */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: colors.gray, marginBottom: 4 }}>日付・時刻</div>
        <div style={{
          background: colors.white,
          borderRadius: 8,
          padding: '4px 8px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <span style={{ fontSize: 16 }}>📅</span>
          <input
            type="datetime-local"
            value={datetime}
            onChange={(e) => setDatetime(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              fontSize: 14,
              color: colors.dark,
              padding: '8px 0',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* ODO Range info */}
      <div style={{
        background: colors.light,
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        fontSize: 12,
        color: colors.gray,
      }}>
        ODO入力可能範囲: <strong style={{ color: colors.dark }}>{odoHint}</strong> km
      </div>

      {/* Current ODO (editable) */}
      <Field
        label="現在ODO *"
        value={odoStr}
        onChange={setOdoStr}
        unit="km"
        placeholder={odoHint}
      />

      {/* ODO validation error */}
      {odoError && (
        <div style={{
          background: '#FFEBEE',
          borderRadius: 8,
          padding: 12,
          marginBottom: 16,
          fontSize: 13,
          color: '#D32F2F',
        }}>
          {odoError}
        </div>
      )}

      {/* Fuel */}
      <Field
        label="給油量 *"
        value={liters}
        onChange={setLiters}
        unit="L"
        placeholder="例：3.00"
      />

      {/* Toggles section */}
      <div style={{
        background: colors.white,
        borderRadius: 12,
        padding: '0 16px',
        marginTop: 20,
        marginBottom: 20,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}>
        <Toggle
          label="満タン給油"
          hint="※満タン給油OFFの場合は燃費算出は次回に持ち越されます。"
          checked={isFullTank}
          onChange={(v) => {
            setIsFullTank(v);
            // Reset 記録忘れ when turning off 満タン
            if (!v) setSkipCalculation(false);
          }}
        />
        <Toggle
          label="記録忘れがある"
          hint="※以前の満タン給油から記録忘れがある場合は、平均燃費の計算にも含まれなくなります"
          checked={skipCalculation}
          onChange={setSkipCalculation}
          disabled={!isFullTank}
        />
      </div>

      <Btn onClick={handleSave} disabled={!canSave}>
        {isEditMode ? '更新する' : '保存する'}
      </Btn>
      <div style={{ marginTop: 8 }}>
        <Btn secondary onClick={onBack}>キャンセル</Btn>
      </div>
    </Shell>
  );
}

// Keep old export for compatibility (can remove later)
export type Record2Result = RecordResult;
export const Record2 = RecordScreen;
