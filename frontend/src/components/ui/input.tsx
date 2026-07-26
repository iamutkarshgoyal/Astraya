import * as React from 'react';

import { cn } from '@/utils/cn';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        'h-11 w-full rounded-md border border-astraya-navy/15 bg-white px-3 text-sm text-astraya-text shadow-sm transition-colors placeholder:text-astraya-text/45 focus:border-astraya-gold',
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
);
Input.displayName = 'Input';

export { Input };
