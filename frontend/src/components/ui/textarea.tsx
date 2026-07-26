import * as React from 'react';

import { cn } from '@/utils/cn';

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      className={cn(
        'min-h-28 w-full rounded-md border border-astraya-navy/15 bg-white px-3 py-3 text-sm text-astraya-text shadow-sm transition-colors placeholder:text-astraya-text/45 focus:border-astraya-gold',
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
);
Textarea.displayName = 'Textarea';

export { Textarea };
