import type { ReactNode } from 'react';
import { Sparkles } from 'lucide-react';

type EmptyStateProps = {
  title: string;
  text: string;
  action?: ReactNode;
};

export function EmptyState({ title, text, action }: EmptyStateProps) {
  return (
    <div className="mx-auto max-w-xl rounded-lg border border-astraya-navy/10 bg-white p-8 text-center shadow-sm">
      <Sparkles className="mx-auto text-astraya-gold" size={28} aria-hidden="true" />
      <h2 className="mt-4 font-serif text-3xl text-astraya-navy">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-astraya-text/70">{text}</p>
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}
