import { colors } from '../constants';

interface TabBarProps {
  tabs: string[];
  active: string;
  onChange: (tab: string) => void;
}

export function TabBar({ tabs, active, onChange }: TabBarProps) {
  return (
    <div style={{ display: 'flex', background: colors.light, borderRadius: 8, padding: 3, marginBottom: 16 }}>
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          style={{
            flex: 1,
            padding: '8px 0',
            borderRadius: 6,
            border: 'none',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: active === t ? 700 : 400,
            background: active === t ? colors.white : 'transparent',
            color: active === t ? colors.red : colors.gray,
            boxShadow: active === t ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
          }}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
