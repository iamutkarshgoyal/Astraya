import type { ReactNode } from 'react';

import { cn } from '@/utils/cn';

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  text?: string;
  action?: ReactNode;
  className?: string;
};

export function SectionHeading({ eyebrow, title, text, action, className }: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between',
        className,
      )}
    >
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="mb-3 font-button text-xs font-bold uppercase tracking-[0.22em] text-astraya-gold">
            {eyebrow}
          </p>
        )}
        <div className="mb-4 h-px w-20 bg-astraya-gold/70" aria-hidden="true" />
        <h2 className="font-display text-3xl font-semibold leading-tight tracking-[0.04em] text-astraya-navy md:text-5xl">
          {title}
        </h2>
        {text && <p className="mt-3 text-base leading-7 text-astraya-text/70">{text}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
