import type { ReactNode } from 'react';
import { colors } from '../constants';

interface BtnProps {
  onClick: () => void;
  children: ReactNode;
  secondary?: boolean;
  danger?: boolean;
  disabled?: boolean;
}

function resolveStyles({ secondary, danger, disabled }: Pick<BtnProps, 'secondary' | 'danger' | 'disabled'>) {
  if (disabled) return { bg: colors.light, fg: colors.gray, border: 'none' };
  if (danger) return { bg: '#FFEBEE', fg: '#C62828', border: '1px solid #C62828' };
  if (secondary) return { bg: colors.white, fg: colors.red, border: `1px solid ${colors.red}` };
  return { bg: colors.red, fg: colors.white, border: 'none' };
}

export function Btn({ onClick, children, secondary, danger, disabled }: BtnProps) {
  const { bg, fg, border } = resolveStyles({ secondary, danger, disabled });
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%',
        padding: 14,
        borderRadius: 8,
        marginBottom: 8,
        border,
        cursor: disabled ? 'not-allowed' : 'pointer',
        background: bg,
        color: fg,
        fontWeight: 700,
        fontSize: 15,
      }}
    >
      {children}
    </button>
  );
}
