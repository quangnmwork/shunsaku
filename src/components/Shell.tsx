import type { ReactNode } from 'react';
import { colors } from '../constants';

interface ShellProps {
  children: ReactNode;
  title: string;
  onBack?: () => void;
}

export function Shell({ children, title, onBack }: ShellProps) {
  return (
    <div
      style={{
        width: 375,
        minHeight: 667,
        background: colors.bg,
        fontFamily: 'sans-serif',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          background: colors.white,
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          borderBottom: `1px solid ${colors.light}`,
        }}
      >
        {onBack && (
          <button
            onClick={onBack}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 20,
              cursor: 'pointer',
              marginRight: 8,
              color: colors.dark,
            }}
          >
            ←
          </button>
        )}
        <span style={{ fontWeight: 700, fontSize: 16, color: colors.dark }}>
          {title}
        </span>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 16px' }}>
        {children}
      </div>
    </div>
  );
}
