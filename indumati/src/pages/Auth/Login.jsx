import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { BackgroundShell } from '../../components/BackgroundShell';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const resetSchema = z.object({
  email: z.string().email('Enter a valid email')
});

export default function Login() {
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const { login } = useAuth();
  const [showReset, setShowReset] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({ resolver: zodResolver(schema) });

  const {
    register: registerReset,
    handleSubmit: handleSubmitReset,
    formState: { errors: resetErrors, isSubmitting: isResetSubmitting }
  } = useForm({ resolver: zodResolver(resetSchema) });

  useEffect(() => {
    if (token) navigate('/dashboard');
  }, [token, navigate]);

  const onSubmit = (values) => handleSubmit(login)(values);

  const onResetSubmit = async (values) => {
    try {
      await api.post('/auth/forgot-password', values);
      toast.success('Password reset instructions sent to your email');
      setShowReset(true);
    } catch (error) {
      toast.success('If your email exists, reset instructions were sent');
      setShowReset(true);
    }
  };

  return (
    <BackgroundShell>
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-md rounded-[32px] border border-white/20 bg-white/70 p-10 shadow-soft backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-950/70">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-sky-500/15 to-indigo-500/15 ring-1 ring-sky-200/30 dark:ring-slate-800/60">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 7h16" stroke="rgb(14 165 233)" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M7 7v14h10V7" stroke="rgb(99 102 241)" strokeWidth="1.8" strokeLinejoin="round" />
                <path d="M9 11h6" stroke="rgb(56 189 248)" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M9 15h6" stroke="rgb(56 189 248)" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>

            <p className="text-sm uppercase tracking-[0.22em] text-sky-600">STUDENT MANAGEMENT AND TRACKING SYSTEM</p>
            <h1 className="mt-4 text-3xl font-semibold text-slate-900 dark:text-slate-100">Login</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Sign in to your account</p>
          </div>

          {!showReset ? (
            <form className="space-y-5" onSubmit={handleSubmit(login)}>
              <Input label="Email" type="email" placeholder="user@example.com" {...register('email')} error={errors.email?.message} />
              <Input label="Password" type="password" placeholder="••••••••" {...register('password')} error={errors.password?.message} />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Signing in…' : 'Login'}
              </Button>
            </form>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmitReset(onResetSubmit)}>
              <Input
                label="Account Email"
                type="email"
                placeholder="user@example.com"
                {...registerReset('email')}
                error={resetErrors.email?.message}
              />
              <Button type="submit" className="w-full" disabled={isResetSubmitting}>
                {isResetSubmitting ? 'Sending…' : 'Send reset link'}
              </Button>
            </form>
          )}

          <div className="mt-6 space-y-3 text-center text-sm">
            {!showReset ? (
              <button
                type="button"
                onClick={() => setShowReset(true)}
                className="font-semibold text-sky-600 hover:text-sky-700 dark:text-sky-400"
              >
                Forgot password?
              </button>
            ) : (
              <div className="space-y-2 text-slate-500 dark:text-slate-400">
                <p className="text-sm">Check your inbox for reset instructions.</p>
                <button
                  type="button"
                  onClick={() => setShowReset(false)}
                  className="inline-flex font-semibold text-sky-600 hover:text-sky-700 dark:text-sky-400"
                >
                  Back to login
                </button>
              </div>
            )}

            {/* Keep legacy route accessible */}
            <div className="sr-only">
              <Link to="/forgot-password">Forgot password route</Link>
            </div>
          </div>
        </div>
      </div>
    </BackgroundShell>
  );
}

