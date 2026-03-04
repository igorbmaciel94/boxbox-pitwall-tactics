import type { ReactNode } from 'react';
import { useEffect } from 'react';

interface ModalProps {
  open: boolean;
  onClose?: () => void;
  title?: string;
  children: ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 animate-fade-in"
        onClick={onClose}
      />
      {/* Content */}
      <div className="relative z-10 w-full max-w-lg max-h-[85dvh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-carbon-mid border border-metal-light/30 animate-slide-up">
        {title && (
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-metal-light/20 bg-carbon-mid px-4 py-3">
            <h2 className="font-display text-sm font-semibold uppercase tracking-wider">
              {title}
            </h2>
            {onClose && (
              <button
                onClick={onClose}
                className="text-metal-light hover:text-white transition-colors text-xl leading-none"
              >
                &times;
              </button>
            )}
          </div>
        )}
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
