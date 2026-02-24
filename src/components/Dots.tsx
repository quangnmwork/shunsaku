import { colors } from '../constants';

interface DotsProps {
  total: number;
  current: number;
}

export function Dots({ total, current }: DotsProps) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 28 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            width: i === current ? 20 : 8,
            height: 8,
            borderRadius: 4,
            background: i === current ? colors.red : colors.light,
          }}
        />
      ))}
    </div>
  );
}
