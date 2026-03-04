import type { ReactNode } from 'react';
import { NavBar } from './NavBar';
import { LanguageBar } from './LanguageBar';

interface ShellProps {
  children: ReactNode;
}

export function Shell({ children }: ShellProps) {
  return (
    <div className="relative isolate min-h-dvh overflow-x-clip bg-carbon text-white">
      {/* Subtle top accent */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-f1-red/70 to-transparent" />

      <LanguageBar />
      <div className="mx-auto max-w-xl pb-24">{children}</div>
      <NavBar />
    </div>
  );
}
