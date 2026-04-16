'use client';

import { cn } from '@/lib/utils';

export default function DarkVeil({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn('absolute inset-0 pointer-events-none', className)}
      style={{
        background:
          'radial-gradient(circle at center, rgba(59,130,246,0.25) 0%, rgba(59,130,246,0.1) 40%, transparent 70%)',
      }}
    />
  );
}
