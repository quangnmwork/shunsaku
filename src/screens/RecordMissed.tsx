import { useState } from 'react';
import { colors } from '../constants';
import { Shell } from '../components/Shell';
import { Btn } from '../components/Btn';

interface RecordMissedProps {
  kmpl: number;
  catalogH: number;
  deltaOdo: number;
  onNext: (wasMissed: boolean, estimatedL: number | null, estimatedKmpl: number | null) => void;
  onBack: () => void;
}

const ANSWER_OPTIONS = [
  { value: 'no' as const, label: 'いいえ、記録は正確です' },
  { value: 'yes' as const, label: 'はい、記録忘れがありました' },
];

export function RecordMissed({ kmpl, catalogH, deltaOdo, onNext, onBack }: RecordMissedProps) {
  const [ans, setAns] = useState<'yes' | 'no' | null>(null);
  const diff = Math.round((Math.abs(kmpl - catalogH) / catalogH) * 100);
  const estimatedL = parseFloat((deltaOdo / catalogH).toFixed(2));

  return (
    <Shell title="給油記録の確認" onBack={onBack}>
      <div
        style={{
          background: colors.warnBg,
          borderRadius: 10,
          padding: 16,
          marginBottom: 24,
          borderLeft: `3px solid ${colors.warn}`,
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 700, color: '#E65100', marginBottom: 6 }}>
          ⚠️ 燃費が大きく変化しています
        </div>
        <div style={{ fontSize: 13, color: colors.dark, lineHeight: 1.6 }}>
          今回の燃費 <strong>{kmpl} km/L</strong> はカタログ値より約{' '}
          <strong>{diff}%</strong> 乖離しています。
          前回の給油後、記録し忘れた給油はありましたか？
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        {ANSWER_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setAns(value)}
            style={{
              flex: 1,
              padding: '14px 8px',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 13,
              border: `2px solid ${ans === value ? colors.red : colors.light}`,
              background: ans === value ? '#FFF0F0' : colors.white,
              color: ans === value ? colors.red : colors.gray,
              fontWeight: ans === value ? 700 : 400,
              lineHeight: 1.4,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {ans === 'yes' && (
        <div style={{ background: colors.blueBg, borderRadius: 8, padding: 14, marginBottom: 16, fontSize: 13, color: colors.blue, lineHeight: 1.6 }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>🔵 参考値として記録します</div>
          <div>カタログ値（{catalogH} km/L）をもとに給油量を推定：</div>
          <div style={{ marginTop: 4 }}>推定給油量：約 <strong>{estimatedL} L</strong></div>
          <div>参考燃費：<strong>{catalogH} km/L</strong></div>
          <div style={{ fontSize: 11, marginTop: 6, opacity: 0.8 }}>グラフには参考値として表示されます</div>
        </div>
      )}
      {ans === 'no' && (
        <div style={{ background: colors.greenBg, borderRadius: 8, padding: 14, marginBottom: 16, fontSize: 13, color: colors.green, lineHeight: 1.6 }}>
          ✓ 通常通り燃費を記録します。
        </div>
      )}

      <Btn onClick={() => onNext(ans === 'yes', estimatedL, catalogH)} disabled={!ans}>
        確定する
      </Btn>
    </Shell>
  );
}
