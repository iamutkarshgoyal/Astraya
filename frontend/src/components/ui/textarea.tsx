import * as React from 'react';

import { cn } from '@/utils/cn';

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      className={cn(
        'min-h-28 w-full rounded-md border border-astraya-border bg-astraya-card px-3 py-3 font-body text-sm text-astraya-text shadow-sm transition-all duration-300 placeholder:text-astraya-text/45 focus:border-astraya-gold focus:shadow-glow',
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
);
Textarea.displayName = 'Textarea';

export { Textarea };
