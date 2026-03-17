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
        className="absolute inset-0 animate-fade-in bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Content */}
      <div className="animate-slide-up relative z-10 max-h-modal-safe w-full max-w-xl overflow-y-auto rounded-t-2xl bg-carbon-mid/95 shadow-2xl shadow-black/50 backdrop-blur-xl sm:rounded-2xl">
        {title && (
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/8 bg-carbon-mid/90 px-5 py-3.5 backdrop-blur-sm">
            <h2 className="font-display text-lg font-semibold uppercase tracking-wide">
              {title}
            </h2>
            {onClose && (
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-lg text-metal-light transition-colors hover:bg-white/15 hover:text-white"
              >
                &times;
              </button>
            )}
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
