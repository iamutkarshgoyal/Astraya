import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/utils/cn';

const buttonVariants = cva(
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-astraya-navy text-white shadow-luxury hover:bg-[#123060]',
        gold: 'bg-astraya-gold text-astraya-ink hover:bg-[#b8892c]',
        outline:
          'border border-astraya-gold/60 bg-white/70 text-astraya-navy hover:bg-astraya-ivory',
        ghost: 'text-astraya-navy hover:bg-astraya-ivory',
      },
      size: {
        default: 'h-11',
        sm: 'h-9 px-3 text-xs',
        icon: 'h-11 w-11 px-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  },
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
