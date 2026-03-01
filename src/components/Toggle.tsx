import { colors } from '../constants';

interface ToggleProps {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function Toggle({ label, hint, checked, onChange, disabled }: ToggleProps) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '14px 0',
        borderBottom: `1px solid ${colors.light}`,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: colors.dark }}>{label}</div>
        {hint && <div style={{ fontSize: 11, color: colors.gray, marginTop: 2 }}>{hint}</div>}
      </div>
      <button
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        style={{
          width: 48,
          height: 28,
          borderRadius: 14,
          border: 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
          background: checked ? '#4CD964' : colors.light,
          position: 'relative',
          transition: 'background 0.2s',
        }}
      >
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            background: colors.white,
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            position: 'absolute',
            top: 2,
            left: checked ? 22 : 2,
            transition: 'left 0.2s',
          }}
        />
      </button>
    </div>
  );
}
