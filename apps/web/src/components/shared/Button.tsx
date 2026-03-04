import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

const variantClasses = {
  primary:
    'bg-hud-blue hover:bg-hud-blue/80 text-white border border-hud-blue/50',
  secondary:
    'bg-metal hover:bg-metal-light text-white border border-metal-light/50',
  ghost:
    'bg-transparent hover:bg-white/10 text-white border border-white/20',
  danger:
    'bg-hud-red/20 hover:bg-hud-red/30 text-hud-red border border-hud-red/50',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export function Button({ variant = 'primary', size = 'md', className = '', children, ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-md font-mono font-medium transition-all duration-150 active:scale-95 disabled:opacity-40 disabled:pointer-events-none ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
