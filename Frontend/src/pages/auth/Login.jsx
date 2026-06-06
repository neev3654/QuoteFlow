import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useLogin } from '../../hooks/useAuth';

import FormField from '../../components/forms/FormField';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const loginMutation = useLogin();

  const { register, handleSubmit, formState: { errors }, setValue } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = (data) => {
    loginMutation.mutate(data, {
      onSuccess: () => navigate('/dashboard'),
    });
  };

  const setDemoCredentials = (email, password) => {
    setValue('email', email);
    setValue('password', password);
  };

  return (
    <div className="bg-bg-secondary p-8 rounded-2xl border border-border-primary shadow-xl">
      <div className="mb-8">
        <h2 className="text-2xl font-display font-semibold text-text-primary">Welcome back</h2>
        <p className="text-sm text-text-secondary mt-2">Sign in to your account to continue</p>
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

        <FormField label="Password" error={errors.password?.message} required>
          <div className="relative">
            <Input 
              {...register('password')} 
              type={showPassword ? "text" : "password"} 
              placeholder="••••••••" 
              className="bg-bg-primary border-border-primary text-text-primary pr-10"
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </FormField>

        <div className="flex items-center justify-between mt-2">
          <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
            <input type="checkbox" className="rounded border-border-primary bg-bg-primary text-accent-blue focus:ring-accent-blue/50" />
            <span>Remember me</span>
          </label>
          <Link to="/forgot-password" className="text-sm font-medium text-accent-blue hover:text-accent-blue-bright transition-colors">
            Forgot password?
          </Link>
        </div>

        <Button 
          type="submit" 
          disabled={loginMutation.isPending} 
          className="w-full bg-accent-blue hover:bg-accent-blue-bright text-white h-11 text-base mt-2"
        >
          {loginMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-text-secondary">
        Don't have an account?{' '}
        <Link to="/register" className="font-medium text-accent-blue hover:text-accent-blue-bright transition-colors">
          Register
        </Link>
      </div>

      <div className="mt-8 pt-6 border-t border-border-primary">
        <details className="text-sm group cursor-pointer">
          <summary className="text-text-tertiary hover:text-text-secondary font-medium outline-none">
            Demo Credentials
          </summary>
          <div className="mt-4 space-y-2">
            {[
              { label: 'Admin', email: 'admin@quoteflow.com', pass: 'Admin@12345' },
              { label: 'Manager', email: 'manager@quoteflow.com', pass: 'Manager@12345' },
              { label: 'Officer', email: 'officer@quoteflow.com', pass: 'Officer@12345' },
            ].map((cred) => (
              <div 
                key={cred.label}
                onClick={() => setDemoCredentials(cred.email, cred.pass)}
                className="flex items-center justify-between p-2 rounded-lg bg-bg-primary border border-border-primary hover:border-accent-blue/50 transition-colors"
              >
                <div>
                  <div className="font-medium text-text-primary text-xs">{cred.label}</div>
                  <div className="text-text-tertiary text-[11px]">{cred.email}</div>
                </div>
                <div className="text-[11px] text-text-secondary font-mono">{cred.pass}</div>
              </div>
            ))}
          </div>
        </details>
      </div>
    </div>
  );
}
