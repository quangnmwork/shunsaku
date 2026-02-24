import { colors } from '../constants';

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  unit?: string;
  placeholder?: string;
  hint?: string;
  readonly?: boolean;
}

export function Field({ label, value, onChange, unit, placeholder, hint, readonly }: FieldProps) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 13, color: colors.gray, marginBottom: 6 }}>{label}</div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          background: readonly ? colors.light : colors.white,
          borderRadius: 8,
          border: `1px solid ${colors.light}`,
          padding: '0 12px',
        }}
      >
        <input
          type="number"
          value={value}
          onChange={(e) => !readonly && onChange(e.target.value)}
          placeholder={placeholder}
          readOnly={readonly}
          style={{
            flex: 1,
            padding: '12px 0',
            border: 'none',
            outline: 'none',
            fontSize: 16,
            background: 'transparent',
            color: readonly ? colors.gray : colors.dark,
          }}
        />
        {unit && <span style={{ color: colors.gray, fontSize: 14 }}>{unit}</span>}
      </div>
      {hint && <div style={{ fontSize: 11, color: colors.gray, marginTop: 4 }}>{hint}</div>}
    </div>
  );
}
