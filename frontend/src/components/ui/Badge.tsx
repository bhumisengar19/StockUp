import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'secondary';
  className?: string;
}

const variantStyles: Record<string, React.CSSProperties> = {
  success:   { background: 'rgba(34,197,94,0.15)',   color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' },
  warning:   { background: 'rgba(249,115,22,0.15)',  color: '#f97316', border: '1px solid rgba(249,115,22,0.3)' },
  error:     { background: 'rgba(239,68,68,0.15)',   color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' },
  info:      { background: 'rgba(59,130,246,0.15)',  color: '#3b82f6', border: '1px solid rgba(59,130,246,0.3)' },
  secondary: { background: 'var(--card)', color: 'var(--text-muted)', border: '1px solid var(--border)' },
};

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'info', className = '' }) => {
  return (
    <span
      className={`badge ${className}`}
      style={variantStyles[variant]}
    >
      {children}
    </span>
  );
};
