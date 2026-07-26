import { FormEvent, useState } from 'react';
import { KeyRound } from 'lucide-react';
import { Link } from 'react-router';

import { SectionHeading } from '@/components/sections/SectionHeading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authService } from '@/services/auth-service';
import { getErrorMessage } from '@/utils/errors';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  async function requestReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    try {
      const response = await authService.forgotPassword(email);
      if (response.reset_token) {
        setResetToken(response.reset_token);
      }
      setMessage(response.message);
    } catch (error) {
      setMessage(getErrorMessage(error, 'Reset request failed'));
    }
  }

  async function completeReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    try {
      const response = await authService.resetPassword({
        email,
        reset_token: resetToken,
        new_password: newPassword,
      });
      setMessage(response.message);
      setNewPassword('');
    } catch (error) {
      setMessage(getErrorMessage(error, 'Password reset failed'));
    }
  }

  return (
    <div className="container py-12">
      <SectionHeading
        eyebrow="Account"
        title="Reset password"
        text="Prepare a reset token for your Astraya account and set a new password."
      />
      <div className="mx-auto grid max-w-2xl gap-6">
        <form
          className="grid gap-4 rounded-lg border border-astraya-navy/10 bg-white p-6 shadow-sm"
          onSubmit={requestReset}
        >
          <label className="grid gap-2 text-sm font-semibold text-astraya-navy">
            Email
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <Button type="submit" variant="primary">
            <KeyRound size={17} aria-hidden="true" />
            Prepare reset
          </Button>
        </form>
        <form
          className="grid gap-4 rounded-lg border border-astraya-navy/10 bg-white p-6 shadow-sm"
          onSubmit={completeReset}
        >
          <label className="grid gap-2 text-sm font-semibold text-astraya-navy">
            Reset token
            <Input value={resetToken} onChange={(event) => setResetToken(event.target.value)} required />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-astraya-navy">
            New password
            <Input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              required
            />
          </label>
          <Button type="submit" variant="gold">
            Set password
          </Button>
        </form>
        {message && <p className="rounded-md bg-white p-4 text-sm text-astraya-text/70">{message}</p>}
        <Link className="text-sm font-semibold text-astraya-gold" to="/login">
          Return to login
        </Link>
      </div>
    </div>
  );
}
