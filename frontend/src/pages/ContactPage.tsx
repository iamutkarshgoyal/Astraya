import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, MapPin, Phone, Send } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { SectionHeading } from '@/components/sections/SectionHeading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { engagementService } from '@/services/engagement-service';
import { getErrorMessage } from '@/utils/errors';

const contactSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().optional(),
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

  async function onSubmit(values: ContactValues) {
    setStatus(null);
    try {
      await engagementService.sendContactMessage({
        ...values,
        phone: values.phone || null,
      });
      reset();
      setStatus('Message received. Astraya will get back to you soon.');
    } catch (error) {
      setStatus(getErrorMessage(error, 'Message could not be sent'));
    }
  }

  return (
    <div className="py-12">
      <div className="container">
        <SectionHeading
          eyebrow="Contact"
          title="Speak with Astraya"
          text="For custom gifting, wedding quantities, corporate sets, or candle care questions."
        />
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <aside className="rounded-lg border border-astraya-navy/10 bg-white p-6 shadow-sm">
            <h2 className="font-serif text-3xl text-astraya-navy">Studio details</h2>
            <ul className="mt-6 grid gap-4 text-sm text-astraya-text/72">
              <li className="flex gap-3">
                <Mail className="text-astraya-gold" size={18} aria-hidden="true" />
                hello@astraya.in
              </li>
              <li className="flex gap-3">
                <Phone className="text-astraya-gold" size={18} aria-hidden="true" />
                +91 98765 43210
              </li>
              <li className="flex gap-3">
                <MapPin className="text-astraya-gold" size={18} aria-hidden="true" />
                India
              </li>
            </ul>
          </aside>
          <form
            className="grid gap-5 rounded-lg border border-astraya-navy/10 bg-white p-6 shadow-sm"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold text-astraya-navy">
                Name
                <Input {...register('name')} />
                {errors.name && <span className="text-xs text-red-600">{errors.name.message}</span>}
              </label>
              <label className="grid gap-2 text-sm font-semibold text-astraya-navy">
                Email
                <Input type="email" {...register('email')} />
                {errors.email && <span className="text-xs text-red-600">{errors.email.message}</span>}
              </label>
              <label className="grid gap-2 text-sm font-semibold text-astraya-navy">
                Phone
                <Input {...register('phone')} />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-astraya-navy">
                Subject
                <Input {...register('subject')} />
                {errors.subject && (
                  <span className="text-xs text-red-600">{errors.subject.message}</span>
                )}
              </label>
            </div>
            <label className="grid gap-2 text-sm font-semibold text-astraya-navy">
              Message
              <Textarea {...register('message')} />
              {errors.message && (
                <span className="text-xs text-red-600">{errors.message.message}</span>
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
        </div>
      </div>
    </div>
  );
}
