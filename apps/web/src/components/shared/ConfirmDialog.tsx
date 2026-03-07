import { useEffect } from 'react';
import { Button } from './Button';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'primary';
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  variant = 'danger',
}: ConfirmDialogProps) {
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

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 animate-fade-in bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
      />
      {/* Dialog */}
      <div className="animate-slide-up relative z-10 w-full max-w-sm px-4 pb-6 sm:px-0 sm:pb-0">
        <div className="overflow-hidden rounded-2xl bg-carbon-mid/95 shadow-2xl shadow-black/50 backdrop-blur-xl">
          <div className="px-5 pb-5 pt-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-hud-red/15">
              <svg
                className="h-6 w-6 text-hud-red"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                />
              </svg>
            </div>
            <h3 className="font-display text-base font-bold uppercase tracking-wide text-white">
              {title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-metal-light">
              {message}
            </p>
          </div>
          <div className="flex gap-3 border-t border-white/8 px-5 py-4">
            <Button
              variant="secondary"
              size="md"
              className="flex-1"
              onClick={onCancel}
            >
              {cancelLabel}
            </Button>
            <Button
              variant={variant}
              size="md"
              className="flex-1"
              onClick={onConfirm}
            >
              {confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
