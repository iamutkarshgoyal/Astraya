import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formError, setFormError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: LoginFormValues) {
    setFormError('');
    try {
      await login(values);
      navigate('/');
    } catch (error) {
      const message =
        error instanceof AxiosError
          ? error.response?.data?.detail ?? 'Unable to sign in.'
          : 'Unable to sign in.';
      setFormError(message);
    }
  }

  return (
    <section className="container grid min-h-[calc(100vh-10rem)] place-items-center py-12">
      <div className="w-full max-w-md rounded-lg border border-astraya-navy/10 bg-white p-6 shadow-luxury">
        <p className="text-sm font-bold uppercase text-astraya-gold">Customer account</p>
        <h1 className="mt-2 font-display text-4xl text-astraya-navy">Login</h1>
        <form className="mt-7 grid gap-5" onSubmit={handleSubmit(onSubmit)}>
          <label className="grid gap-2 text-sm font-semibold text-astraya-navy">
            Email
            <Input autoComplete="email" type="email" {...register('email')} />
            {errors.email && <span className="text-sm text-red-700">{errors.email.message}</span>}
          </label>
          <label className="grid gap-2 text-sm font-semibold text-astraya-navy">
            Password
            <Input autoComplete="current-password" type="password" {...register('password')} />
            {errors.password && (
              <span className="text-sm text-red-700">{errors.password.message}</span>
            )}
          </label>
          {formError && <p className="text-sm font-medium text-red-700">{formError}</p>}
          <Button disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
        <Link className="mt-4 inline-block text-sm font-semibold text-astraya-gold" to="/forgot-password">
          Forgot password?
        </Link>
        <p className="mt-5 text-sm text-astraya-text/70">
          New to Astraya?{' '}
          <Link className="font-semibold text-astraya-gold" to="/signup">
            Create an account
          </Link>
        </p>
      </div>
    </section>
  );
}
