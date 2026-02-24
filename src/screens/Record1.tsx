import { useState } from 'react';
import { colors } from '../constants';
import { Shell } from '../components/Shell';
import { Dots } from '../components/Dots';
import { Field } from '../components/Field';
import { Btn } from '../components/Btn';

interface Record1Props {
  lastOdo: number | null;
  onNext: (odo: number) => void;
  onBack: () => void;
}

export function Record1({ lastOdo, onNext, onBack }: Record1Props) {
  const [val, setVal] = useState('');
  const diff = val && lastOdo != null ? Number(val) - lastOdo : null;
  const hasError = diff !== null && diff < 0;
  const hasWarning = diff !== null && diff > 1500;

  return (
    <Shell title="給油記録" onBack={onBack}>
      <Dots total={2} current={0} />
      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: colors.dark }}>
        現在の走行距離を入力
      </div>
      {lastOdo != null && (
        <div
          style={{
            background: colors.blueBg,
            borderRadius: 8,
            padding: '10px 14px',
            marginBottom: 20,
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontSize: 13, color: colors.blue }}>前回のODO</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: colors.blue }}>
            {lastOdo.toLocaleString()} km
          </span>
        </div>
      )}
      <Field label="現在のODO（総走行距離）" value={val} onChange={setVal} unit="km" placeholder={`前回: ${lastOdo} km`} />
      {hasError && (
        <div style={{ background: '#FFEBEE', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 13, color: '#C62828' }}>
          ⚠️ 前回の走行距離より小さい値です
        </div>
      )}
      {hasWarning && !hasError && diff !== null && (
        <div style={{ background: '#FFF8E1', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 13, color: '#E65100' }}>
          ⚠️ 前回から {diff.toLocaleString()} km — 距離が大きいですが正しいですか？
        </div>
      )}
      {diff !== null && diff > 0 && !hasError && !hasWarning && (
        <div style={{ background: colors.greenBg, borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 13, color: colors.green }}>
          ✓ 今回の走行距離：{diff.toLocaleString()} km
        </div>
      )}
      <Btn onClick={() => onNext(Number(val))} disabled={!val || hasError}>次へ</Btn>
    </Shell>
  );
}
