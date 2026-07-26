import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, MapPin, MessageCircle, Send, Sparkles } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Reveal } from '@/components/sections/Reveal';
import { SectionHeading } from '@/components/sections/SectionHeading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ASTRAYA_EMAIL, ASTRAYA_WHATSAPP_URL, buildContactWhatsAppUrl } from '@/utils/brand';

const contactSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  subject: z.string().min(3, 'Subject is required'),
  message: z.string().min(10, 'Message is required'),
});

type ContactValues = z.infer<typeof contactSchema>;

export function ContactPage() {
  const [status, setStatus] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactValues>({ resolver: zodResolver(contactSchema) });

  function onSubmit(values: ContactValues) {
    setStatus(null);
    window.open(buildContactWhatsAppUrl(values), '_blank', 'noopener,noreferrer');
    reset();
    setStatus('WhatsApp message prepared. Astraya will reply there soon.');
  }

  return (
    <div className="py-16">
      <div className="container">
        <Reveal>
          <SectionHeading
            eyebrow="Contact"
            title="Speak with Astraya"
            text="For custom gifting, wedding quantities, corporate sets, or candle care questions."
          />
        </Reveal>
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal>
            <aside className="h-full rounded-lg border border-astraya-border bg-astraya-card p-6 shadow-card">
              <Sparkles className="mb-4 text-astraya-gold" size={24} aria-hidden="true" />
              <h2 className="font-serif text-3xl text-astraya-navy">Studio details</h2>
              <ul className="mt-6 grid gap-4 text-sm text-astraya-text/72">
                <li>
                  <a
                    className="flex gap-3 transition-colors hover:text-astraya-darkGold"
                    href={`mailto:${ASTRAYA_EMAIL}`}
                  >
                    <Mail className="text-astraya-gold" size={18} aria-hidden="true" />
                    {ASTRAYA_EMAIL}
                  </a>
                </li>
                <li>
                  <a
                    className="flex gap-3 transition-colors hover:text-astraya-darkGold"
                    href={ASTRAYA_WHATSAPP_URL}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MessageCircle className="text-astraya-gold" size={18} aria-hidden="true" />
                    WhatsApp
                  </a>
                </li>
                <li className="flex gap-3">
                  <MapPin className="text-astraya-gold" size={18} aria-hidden="true" />
                  India
                </li>
              </ul>
            </aside>
          </Reveal>
          <Reveal delay={0.08}>
            <form
              className="grid gap-5 rounded-lg border border-astraya-border bg-astraya-card p-6 shadow-card"
              onSubmit={handleSubmit(onSubmit)}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 font-button text-sm font-semibold uppercase tracking-[0.12em] text-astraya-navy">
                  Name
                  <Input {...register('name')} />
                  {errors.name && <span className="font-body text-xs text-red-700">{errors.name.message}</span>}
                </label>
                <label className="grid gap-2 font-button text-sm font-semibold uppercase tracking-[0.12em] text-astraya-navy">
                  Email
                  <Input type="email" {...register('email')} />
                  {errors.email && <span className="font-body text-xs text-red-700">{errors.email.message}</span>}
                </label>
                <label className="grid gap-2 font-button text-sm font-semibold uppercase tracking-[0.12em] text-astraya-navy md:col-span-2">
                  Subject
                  <Input {...register('subject')} />
                  {errors.subject && (
                    <span className="font-body text-xs text-red-700">{errors.subject.message}</span>
                  )}
                </label>
              </div>
              <label className="grid gap-2 font-button text-sm font-semibold uppercase tracking-[0.12em] text-astraya-navy">
                Message
                <Textarea {...register('message')} />
                {errors.message && (
                  <span className="font-body text-xs text-red-700">{errors.message.message}</span>
                )}
              </label>
              <div className="flex flex-wrap items-center gap-3">
                <Button disabled={isSubmitting} type="submit" variant="gold">
                  <Send size={17} aria-hidden="true" />
                  Send message
                </Button>
                {status && <p className="text-sm text-astraya-text/68">{status}</p>}
              </div>
            </form>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
