import { colors } from '../constants';
import { Shell } from '../components/Shell';
import { Btn } from '../components/Btn';
import type { HistoryEntry } from '../types';

interface RecordDoneProps {
  entry: HistoryEntry;
  onDone: () => void;
}

export function RecordDone({ entry, onDone }: RecordDoneProps) {
  return (
    <Shell title="給油記録">
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: colors.dark, marginBottom: 8 }}>
          記録完了！
        </div>
        <div
          style={{
            background: colors.white,
            borderRadius: 12,
            padding: 20,
            margin: '24px 0',
            textAlign: 'left',
          }}
        >
          <div style={{ fontSize: 13, color: colors.gray, marginBottom: 4 }}>今回の燃費</div>
          {entry.flagged ? (
            <div style={{ fontSize: 20, fontWeight: 700, color: colors.warn }}>⚠️ ODOのみ記録（燃費なし）</div>
          ) : (
            <div style={{ fontSize: 42, fontWeight: 700, color: entry.isEstimated ? colors.blue : colors.red }}>
              {entry.kmpl?.toFixed(1)}{' '}
              <span style={{ fontSize: 16, fontWeight: 400 }}>km/L</span>
            </div>
          )}
          {entry.isEstimated && (
            <div style={{ fontSize: 12, color: colors.blue, marginTop: 4 }}>
              🔵 カタログ値をもとにした参考値
            </div>
          )}
          <div style={{ fontSize: 13, color: colors.gray, marginTop: 8 }}>
            {entry.fuel?.toFixed(1)} L　
            {entry.amount ? `¥${Math.round(entry.amount).toLocaleString()}` : ''}
          </div>
          <div style={{ fontSize: 12, color: colors.gray, marginTop: 4 }}>{entry.date}</div>
        </div>
        <Btn onClick={onDone}>ダッシュボードへ戻る</Btn>
      </div>
    </Shell>
  );
}
