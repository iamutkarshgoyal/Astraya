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
        'mb-9 grid gap-5 md:grid-cols-[1.25fr_0.75fr_auto] md:items-center',
        className,
      )}
    >
      <div>
        {eyebrow && (
          <p className="mb-3 font-button text-[0.68rem] font-medium uppercase tracking-[0.24em] text-astraya-gold">
            {eyebrow}
          </p>
        )}
        <h2 className="font-display text-4xl font-medium leading-tight text-astraya-gold md:text-5xl">
          {title}
        </h2>
      </div>
      {text && <p className="max-w-sm font-button text-sm leading-6 text-astraya-text/80 md:text-base">{text}</p>}
      {action && <div className="shrink-0 md:justify-self-end">{action}</div>}
    </div>
  );
}
