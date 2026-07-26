import * as React from 'react';

import { cn } from '@/utils/cn';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        'h-11 w-full rounded-md border border-astraya-border bg-astraya-card px-3 font-body text-sm text-astraya-text shadow-sm transition-all duration-300 placeholder:text-astraya-text/45 focus:border-astraya-gold focus:shadow-glow',
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
);
Input.displayName = 'Input';

export { Input };
