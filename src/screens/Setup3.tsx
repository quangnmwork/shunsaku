import { useState } from 'react';
import { colors } from '../constants';
import { Shell } from '../components/Shell';
import { Dots } from '../components/Dots';
import { Btn } from '../components/Btn';

interface Setup3Props {
  onNext: (unit: string) => void;
  onBack: () => void;
}

const UNIT_OPTIONS = [
  { value: 'kmpl', label: 'km/L', desc: '数値が大きいほど燃費が良い' },
  { value: 'l100', label: 'L/100km', desc: '数値が小さいほど燃費が良い' },
] as const;

export function Setup3({ onNext, onBack }: Setup3Props) {
  const [unit, setUnit] = useState('kmpl');
  return (
    <Shell title="初回セットアップ" onBack={onBack}>
      <Dots total={3} current={2} />
      <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: colors.dark }}>
        燃費の表示単位を選択
      </div>
      {UNIT_OPTIONS.map(({ value, label, desc }) => (
        <div
          key={value}
          onClick={() => setUnit(value)}
          style={{
            padding: 16,
            borderRadius: 8,
            marginBottom: 12,
            cursor: 'pointer',
            background: colors.white,
            border: `2px solid ${unit === value ? colors.red : colors.light}`,
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 16, color: unit === value ? colors.red : colors.dark }}>{label}</div>
          <div style={{ fontSize: 12, color: colors.gray, marginTop: 4 }}>{desc}</div>
        </div>
      ))}
      <Btn onClick={() => onNext(unit)}>設定完了</Btn>
    </Shell>
  );
}
