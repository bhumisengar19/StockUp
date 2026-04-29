import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading,
  className = '',
  disabled,
  ...props
}) => {
  const variants: Record<string, React.CSSProperties> = {
    primary: {
      background: 'var(--button)',
      color: '#fff',
      border: '1px solid transparent',
      boxShadow: '0 2px 12px rgba(59,130,246,0.4)',
    },
    secondary: {
      background: 'var(--card)',
      color: 'var(--text)',
      border: '1.5px solid var(--border)',
      backdropFilter: 'blur(8px)',
    },
    danger: {
      background: 'rgba(239,68,68,0.12)',
      color: '#ef4444',
      border: '1.5px solid rgba(239,68,68,0.3)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-muted)',
      border: '1.5px solid transparent',
    },
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={`btn ${sizes[size]} ${className}`}
      style={variants[variant]}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <div className="mr-2 w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin-slow" />
      ) : null}
      {children}
    </button>
  );
};
