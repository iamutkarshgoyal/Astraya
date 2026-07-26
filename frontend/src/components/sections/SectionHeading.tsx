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
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-astraya-gold">
            {eyebrow}
          </p>
        )}
        <h2 className="font-display text-3xl leading-tight text-astraya-navy md:text-5xl">
          {title}
        </h2>
        {text && <p className="mt-3 text-base leading-7 text-astraya-text/70">{text}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
