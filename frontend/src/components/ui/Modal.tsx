import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen, onClose, title, children, footer, size = 'md'
}) => {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
    >
      <div
        className={`w-full ${sizes[size]} rounded-2xl overflow-hidden animate-slide-in`}
        style={{
          background: 'var(--card)',
          border: '1.5px solid var(--card-border)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          boxShadow: '0 16px 64px var(--shadow), inset 0 1px 0 rgba(255,255,255,0.15)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1.5px solid var(--border)' }}
        >
          <h3 className="text-lg font-bold" style={{ color: 'var(--text)' }}>{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-all hover:scale-110"
            style={{
              color: 'var(--text-muted)',
              background: 'var(--bg-2)',
              border: '1px solid var(--border)',
            }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            className="flex items-center justify-end gap-3 px-6 py-4"
            style={{
              borderTop: '1.5px solid var(--border)',
              background: 'var(--bg-2)',
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
