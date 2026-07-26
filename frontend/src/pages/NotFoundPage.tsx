import { Link } from 'react-router';

import { Button } from '@/components/ui/button';

export function NotFoundPage() {
  return (
    <section className="container grid min-h-[calc(100vh-10rem)] place-items-center py-16 text-center">
      <div className="max-w-lg rounded-lg border border-astraya-navy/10 bg-white p-8 shadow-luxury">
        <p className="text-sm font-bold uppercase text-astraya-gold">Astraya</p>
        <h1 className="mt-2 font-display text-5xl text-astraya-navy">Page not found</h1>
        <p className="mt-4 text-astraya-text/70">
          The address does not match an available Astraya page.
        </p>
        <Button asChild className="mt-7" variant="gold">
          <Link to="/">Return home</Link>
        </Button>
      </div>
    </section>
  );
}
