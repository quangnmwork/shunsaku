import { useState } from 'react';
import { colors, BIKES, type BikeModel } from '../constants';
import { Shell } from '../components/Shell';
import { Dots } from '../components/Dots';
import { Btn } from '../components/Btn';

interface Setup2Props {
  onNext: (bike: BikeModel) => void;
  onBack: () => void;
}

export function Setup2({ onNext, onBack }: Setup2Props) {
  const [selected, setSelected] = useState<BikeModel | null>(null);
  return (
    <Shell title="初回セットアップ" onBack={onBack}>
      <Dots total={3} current={1} />
      <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: colors.dark }}>
        車種を選択
      </div>
      <div style={{ fontSize: 13, color: colors.gray, marginBottom: 24 }}>
        カタログ燃費の取得に使用します
      </div>
      {BIKES.map((b) => (
        <div
          key={b.id}
          onClick={() => setSelected(b)}
          style={{
            padding: 16,
            borderRadius: 8,
            marginBottom: 12,
            cursor: 'pointer',
            background: colors.white,
            border: `2px solid ${selected?.id === b.id ? colors.red : colors.light}`,
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 16, color: selected?.id === b.id ? colors.red : colors.dark }}>
            {b.name}
          </div>
          <div style={{ fontSize: 12, color: colors.gray, marginTop: 4 }}>
            カタログ燃費：{b.catalog} km/L
          </div>
        </div>
      ))}
      <Btn onClick={() => onNext(selected!)} disabled={!selected}>次へ</Btn>
    </Shell>
  );
}
