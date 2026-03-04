import type { ReactNode } from 'react';
import { NavBar } from './NavBar';

interface ShellProps {
  children: ReactNode;
}

export function Shell({ children }: ShellProps) {
  return (
    <div className="min-h-dvh bg-carbon bg-noise text-white">
      <div className="mx-auto max-w-lg pb-20">{children}</div>
      <NavBar />
    </div>
  );
}
