import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  headerAction?: React.ReactNode;
  hoverable?: boolean;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  className = '',
  headerAction,
  hoverable = false,
  style,
}) => {
  return (
    <div
      className={`card ${hoverable ? 'card-hover' : ''} ${className}`}
      style={style}
    >
      {(title || subtitle || headerAction) && (
        <div className="flex items-center justify-between mb-6">
          <div>
            {title    && <h3 className="text-lg font-bold" style={{ color: 'var(--text)' }}>{title}</h3>}
            {subtitle && <p className="text-sm font-medium mt-0.5" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
