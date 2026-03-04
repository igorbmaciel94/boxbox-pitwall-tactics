import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

const variantClasses = {
  primary:
    'bg-f1-red text-white shadow-lg shadow-f1-red/20 hover:bg-[#cc0500] active:bg-[#b00400]',
  secondary:
    'bg-white/10 text-white hover:bg-white/15',
  ghost:
    'bg-white/5 text-white/90 hover:bg-white/10',
  danger:
    'bg-hud-red/15 text-hud-red hover:bg-hud-red/25',
};

const sizeClasses = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2.5 text-[15px]',
  lg: 'px-6 py-3 text-base',
};

export function Button({ variant = 'primary', size = 'md', className = '', children, ...props }: ButtonProps) {
  return (
    <button
      className={`relative inline-flex min-h-11 items-center justify-center rounded-xl font-ui font-semibold tracking-wide transition-all duration-150 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
