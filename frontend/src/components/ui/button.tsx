import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/utils/cn';

const buttonVariants = cva(
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-none px-6 py-2.5 font-button text-xs font-medium uppercase tracking-[0.13em] transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0',
  {
    variants: {
      variant: {
        primary:
          'border border-astraya-navy bg-astraya-navy text-white hover:border-astraya-gold hover:bg-astraya-gold',
        gold:
          'border border-astraya-gold bg-astraya-gold text-white hover:border-astraya-darkGold hover:bg-astraya-darkGold',
        outline:
          'border border-astraya-navy/35 bg-transparent text-astraya-navy hover:border-astraya-gold hover:bg-astraya-gold hover:text-white',
        ghost:
          'border border-transparent text-astraya-navy hover:bg-astraya-cream hover:text-astraya-gold',
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
