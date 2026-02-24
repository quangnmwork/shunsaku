import { useState } from 'react';
import { colors, DEFAULT_UNIT_PRICE } from '../constants';
import { Shell } from '../components/Shell';
import { Dots } from '../components/Dots';
import { Field } from '../components/Field';
import { Btn } from '../components/Btn';
import { nowStr, isAnomalous } from '../utils';

export interface Record2Result {
  fuel: number;
  amount: number;
  unitPrice: number;
  kmpl: number | null;
  flagged: boolean;
  isEstimated: boolean;
}

export interface Record2AnomalyData {
  fuel: number;
  amount: number;
  unitPrice: number;
  kmpl: number;
}

interface Record2Props {
  odo: number;
  lastOdo: number | null;
  catalogH: number;
  onNext: (data: Record2Result) => void;
  onNeedMissedCheck: (data: Record2AnomalyData) => void;
  onBack: () => void;
}

const MODE_OPTIONS = [
  { value: 'liters' as const, label: 'リットルで入力' },
  { value: 'amount' as const, label: '金額で入力' },
];

export function Record2({ odo, lastOdo, catalogH, onNext, onNeedMissedCheck, onBack }: Record2Props) {
  const [mode, setMode] = useState<'liters' | 'amount'>('liters');
  const [liters, setLiters] = useState('');
  const [amount, setAmount] = useState('');
  const [unitPrice, setUnitPrice] = useState('');

  const autoUP = Number(unitPrice) || DEFAULT_UNIT_PRICE;
  const calcL = amount ? (Number(amount) / autoUP).toFixed(2) : '';
  const fuelVal = mode === 'liters' ? Number(liters) : Number(calcL);
  const amountVal = mode === 'liters' ? Math.round(Number(liters) * autoUP) : Number(amount);

  const handleNext = () => {
    const dist = odo - (lastOdo ?? odo);
    const kmpl = fuelVal > 0 ? parseFloat((dist / fuelVal).toFixed(1)) : null;
    const resolvedUnitPrice = Number(unitPrice) || DEFAULT_UNIT_PRICE;

    if (kmpl && isAnomalous(kmpl, catalogH)) {
      onNeedMissedCheck({ fuel: fuelVal, amount: amountVal, unitPrice: resolvedUnitPrice, kmpl });
    } else {
      onNext({ fuel: fuelVal, amount: amountVal, unitPrice: resolvedUnitPrice, kmpl, flagged: false, isEstimated: false });
    }
  };

  return (
    <Shell title="給油記録" onBack={onBack}>
      <Dots total={2} current={1} />
      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: colors.dark }}>
        給油量を入力
      </div>
      <div
        style={{
          background: colors.light,
          borderRadius: 8,
          padding: '10px 14px',
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ fontSize: 13, color: colors.gray }}>記録日時</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: colors.dark }}>{nowStr()}</span>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {MODE_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setMode(value)}
            style={{
              flex: 1,
              padding: '10px 0',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 13,
              border: `2px solid ${mode === value ? colors.red : colors.light}`,
              background: mode === value ? '#FFF0F0' : colors.white,
              color: mode === value ? colors.red : colors.gray,
              fontWeight: mode === value ? 700 : 400,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === 'liters' ? (
        <>
          <Field label="給油量 *" value={liters} onChange={setLiters} unit="L" placeholder="例：8.5" />
          <Field
            label="1Lあたりの金額（任意）"
            value={unitPrice}
            onChange={setUnitPrice}
            unit="円/L"
            placeholder="例：172"
            hint="入力すると支払金額を自動計算します"
          />
          {liters && (
            <div style={{ background: colors.greenBg, borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 13, color: colors.green }}>
              支払金額目安：¥{Math.round(Number(liters) * autoUP).toLocaleString()}
            </div>
          )}
        </>
      ) : (
        <>
          <Field label="支払総額（任意）" value={amount} onChange={setAmount} unit="円" placeholder="例：1,460" />
          <Field
            label="1Lあたりの金額（任意）"
            value={unitPrice}
            onChange={setUnitPrice}
            unit="円/L"
            placeholder="例：172"
            hint="入力するとリットル数を自動計算します"
          />
          {amount && unitPrice && (
            <div style={{ background: colors.greenBg, borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 13, color: colors.green }}>
              換算：約 {(Number(amount) / Number(unitPrice)).toFixed(2)} L
            </div>
          )}
        </>
      )}

      <Btn onClick={handleNext} disabled={!fuelVal}>記録する</Btn>
    </Shell>
  );
}
