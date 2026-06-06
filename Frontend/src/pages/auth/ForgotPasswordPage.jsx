import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { MailCheck, Loader2, ArrowLeft } from 'lucide-react';
import * as authApi from '../../api/auth.api';

import FormField from '../../components/forms/FormField';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export default function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setServerError('');
    try {
      await authApi.forgotPassword(data.email);
      setSubmittedEmail(data.email);
      setIsSubmitted(true);
    } catch (error) {
      setServerError(error.response?.data?.message || error.message || 'Failed to send reset link');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-bg-secondary p-8 rounded-2xl border border-border-primary shadow-xl text-center">
        <div className="w-16 h-16 bg-accent-emerald/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <MailCheck size={32} className="text-accent-emerald" />
        </div>
        <h2 className="text-2xl font-display font-semibold text-text-primary">Check your inbox</h2>
        <p className="text-sm text-text-secondary mt-3 mb-8">
          We've sent a password reset link to <br/>
          <span className="font-medium text-text-primary">{submittedEmail}</span>
        </p>
        <Link to="/login" className="inline-flex items-center text-sm font-medium text-accent-blue hover:text-accent-blue-bright transition-colors">
          <ArrowLeft size={16} className="mr-2" />
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-bg-secondary p-8 rounded-2xl border border-border-primary shadow-xl">
      <div className="mb-8">
        <h2 className="text-2xl font-display font-semibold text-text-primary">Forgot password</h2>
        <p className="text-sm text-text-secondary mt-2">Enter your email and we'll send you a reset link</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <FormField label="Email" error={errors.email?.message} required>
          <Input 
            {...register('email')} 
            type="email" 
            placeholder="you@company.com" 
            className="bg-bg-primary border-border-primary text-text-primary"
          />
        </FormField>

        {serverError && (
          <p className="text-sm text-accent-red font-medium">{serverError}</p>
        )}

        <Button 
          type="submit" 
          disabled={isSubmitting} 
          className="w-full bg-accent-blue hover:bg-accent-blue-bright text-white h-11 text-base mt-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Sending link...
            </>
          ) : (
            'Send reset link'
          )}
        </Button>
      </form>

      <div className="mt-8 text-center text-sm">
        <Link to="/login" className="inline-flex items-center font-medium text-text-secondary hover:text-text-primary transition-colors">
          <ArrowLeft size={16} className="mr-2" />
          Back to login
        </Link>
      </div>
    </div>
  );
}
