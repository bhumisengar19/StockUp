import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-bold mb-1.5" style={{ color: 'var(--text)' }}>
          {label}
        </label>
      )}
      <input
        className={`input-field ${className}`}
        style={error ? { borderColor: '#ef4444', boxShadow: '0 0 0 3px rgba(239,68,68,0.15)' } : undefined}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-xs font-semibold animate-fade-in" style={{ color: '#ef4444' }}>
          {error}
        </p>
      )}
    </div>
  );
};
