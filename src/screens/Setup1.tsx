import { useState } from 'react';
import { colors } from '../constants';
import { Shell } from '../components/Shell';
import { Dots } from '../components/Dots';
import { Field } from '../components/Field';
import { Btn } from '../components/Btn';

interface Setup1Props {
  onNext: (odo: number) => void;
}

export function Setup1({ onNext }: Setup1Props) {
  const [val, setVal] = useState('');
  return (
    <Shell title="初回セットアップ">
      <Dots total={3} current={0} />
      <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: colors.dark }}>
        現在の走行距離を入力
      </div>
      <div style={{ fontSize: 13, color: colors.gray, marginBottom: 24 }}>
        メーターに表示されているODO（総走行距離）を入力してください
      </div>
      <Field label="ODO（総走行距離）" value={val} onChange={setVal} unit="km" placeholder="例：1,234" />
      <Btn onClick={() => onNext(Number(val))} disabled={!val}>次へ</Btn>
    </Shell>
  );
}
