import { Minus, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';

type QuantityStepperProps = {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
};

export function QuantityStepper({ value, min = 1, max = 99, onChange }: QuantityStepperProps) {
  function update(nextValue: number) {
    onChange(Math.min(max, Math.max(min, nextValue)));
  }

  return (
    <div className="inline-grid h-11 grid-cols-[2.75rem_3rem_2.75rem] overflow-hidden rounded-md border border-astraya-navy/15 bg-white">
      <Button
        aria-label="Decrease quantity"
        className="h-11 rounded-none border-r border-astraya-navy/10"
        disabled={value <= min}
        size="icon"
        type="button"
        variant="ghost"
        onClick={() => update(value - 1)}
      >
        <Minus size={16} aria-hidden="true" />
      </Button>
      <span className="grid place-items-center text-sm font-bold text-astraya-navy">{value}</span>
      <Button
        aria-label="Increase quantity"
        className="h-11 rounded-none border-l border-astraya-navy/10"
        disabled={value >= max}
        size="icon"
        type="button"
        variant="ghost"
        onClick={() => update(value + 1)}
      >
        <Plus size={16} aria-hidden="true" />
      </Button>
    </div>
  );
}
