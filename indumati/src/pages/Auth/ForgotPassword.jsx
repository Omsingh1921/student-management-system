import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';

const schema = z.object({
  email: z.string().email('Enter a valid email')
});

export default function ForgotPassword() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (values) => {
    try {
      await api.post('/auth/forgot-password', values);
      toast.success('Password reset instructions sent to your email');
    } catch (error) {
      toast.success('If your email exists, reset instructions were sent');
    } finally {
      setSubmitted(true);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6 dark:bg-slate-950">
      <div className="w-full max-w-md rounded-[32px] border border-slate-200 bg-white p-10 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.22em] text-sky-600">Student Management System</p>
          <h1 className="mt-4 text-3xl font-semibold text-slate-900 dark:text-slate-100">Forgot Password</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Enter your account email to recover access.</p>
        </div>

        {submitted ? (
          <div className="space-y-4 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">Check your inbox for reset instructions. If you do not receive an email, contact your administrator.</p>
            <Link to="/login" className="inline-flex rounded-full bg-sky-600 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-700">
              Back to login
            </Link>
          </div>
        ) : (
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <Input label="Email" type="email" placeholder="user@example.com" {...register('email')} error={errors.email?.message} />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send reset link'}
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Remembered your password?{' '}
          <Link to="/login" className="font-semibold text-sky-600 hover:text-sky-700 dark:text-sky-400">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
