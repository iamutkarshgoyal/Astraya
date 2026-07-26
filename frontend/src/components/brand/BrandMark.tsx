import { Sparkles } from 'lucide-react';
import { Link } from 'react-router';

type BrandMarkProps = {
  compact?: boolean;
  inverse?: boolean;
};

export function BrandMark({ compact = false, inverse = false }: BrandMarkProps) {
  return (
    <Link className="group inline-flex items-center gap-3" to="/" aria-label="Astraya home">
      <span className="grid h-10 w-10 place-items-center rounded-md border border-astraya-gold/45 bg-astraya-navy text-astraya-gold shadow-glow">
        <Sparkles size={18} aria-hidden="true" />
      </span>
      {!compact && (
        <span className="flex flex-col">
          <span className={inverse ? 'font-display text-2xl leading-none text-white' : 'font-display text-2xl leading-none text-astraya-navy'}>
            Astraya
          </span>
          <span className="text-[0.68rem] font-semibold uppercase text-astraya-gold">
            Celestial candles
          </span>
        </span>
      )}
    </Link>
  );
}
