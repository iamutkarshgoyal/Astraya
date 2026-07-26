import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';

const signupSchema = z.object({
  full_name: z.string().min(2, 'Enter your name.').max(150),
  email: z.string().email('Enter a valid email address.'),
  phone: z.string().max(30).optional(),
  password: z.string().min(8, 'Use at least 8 characters.').max(128),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [formError, setFormError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      full_name: '',
      email: '',
      phone: '',
      password: '',
    },
  });

  async function onSubmit(values: SignupFormValues) {
    setFormError('');
    try {
      await signup(values);
      navigate('/');
    } catch (error) {
      const message =
        error instanceof AxiosError
          ? error.response?.data?.detail ?? 'Unable to create account.'
          : 'Unable to create account.';
      setFormError(message);
    }
  }

  return (
    <section className="container grid min-h-[calc(100vh-10rem)] place-items-center py-12">
      <div className="w-full max-w-xl rounded-lg border border-astraya-navy/10 bg-white p-6 shadow-luxury">
        <p className="text-sm font-bold uppercase text-astraya-gold">Join Astraya</p>
        <h1 className="mt-2 font-display text-4xl text-astraya-navy">Create account</h1>
        <form className="mt-7 grid gap-5" onSubmit={handleSubmit(onSubmit)}>
          <label className="grid gap-2 text-sm font-semibold text-astraya-navy">
            Full name
            <Input autoComplete="name" {...register('full_name')} />
            {errors.full_name && (
              <span className="text-sm text-red-700">{errors.full_name.message}</span>
            )}
          </label>
          <label className="grid gap-2 text-sm font-semibold text-astraya-navy">
            Email
            <Input autoComplete="email" type="email" {...register('email')} />
            {errors.email && <span className="text-sm text-red-700">{errors.email.message}</span>}
          </label>
          <label className="grid gap-2 text-sm font-semibold text-astraya-navy">
            Phone
            <Input autoComplete="tel" {...register('phone')} />
            {errors.phone && <span className="text-sm text-red-700">{errors.phone.message}</span>}
          </label>
          <label className="grid gap-2 text-sm font-semibold text-astraya-navy">
            Password
            <Input autoComplete="new-password" type="password" {...register('password')} />
            {errors.password && (
              <span className="text-sm text-red-700">{errors.password.message}</span>
            )}
          </label>
          {formError && <p className="text-sm font-medium text-red-700">{formError}</p>}
          <Button disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </Button>
        </form>
        <p className="mt-5 text-sm text-astraya-text/70">
          Already have an account?{' '}
          <Link className="font-semibold text-astraya-gold" to="/login">
            Sign in
          </Link>
        </p>
      </div>
    </section>
  );
}
