import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import * as authApi from '../../api/auth.api';

import FormField from '../../components/forms/FormField';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  role: z.enum(['procurement_officer', 'manager', 'vendor'], { required_error: 'Please select a role' }),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', role: '', password: '', confirmPassword: '' },
  });

  const passwordValue = watch('password');

  const getPasswordStrength = (pass) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const strength = getPasswordStrength(passwordValue);
  const strengthColors = ['bg-bg-tertiary', 'bg-accent-red', 'bg-accent-amber', 'bg-accent-emerald', 'bg-accent-emerald'];

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const { confirmPassword: _cp, ...payload } = data;
      await authApi.register(payload);
      toast.success('Account created! Please log in.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to register account');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-bg-secondary p-8 rounded-2xl border border-border-primary shadow-xl my-8">
      <div className="mb-8">
        <h2 className="text-2xl font-display font-semibold text-text-primary">Create an account</h2>
        <p className="text-sm text-text-secondary mt-2">Join QuoteFlow to streamline your procurement</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField label="Full Name" error={errors.name?.message} required>
          <Input 
            {...register('name')} 
            placeholder="John Doe" 
            className="bg-bg-primary border-border-primary text-text-primary"
          />
        </FormField>

        <FormField label="Email" error={errors.email?.message} required>
          <Input 
            {...register('email')} 
            type="email" 
            placeholder="you@company.com" 
            className="bg-bg-primary border-border-primary text-text-primary"
          />
        </FormField>

        <FormField label="Role" error={errors.role?.message} required>
          <Select onValueChange={(val) => setValue('role', val, { shouldValidate: true })}>
            <SelectTrigger className="bg-bg-primary border-border-primary text-text-primary">
              <SelectValue placeholder="Select your role" />
            </SelectTrigger>
            <SelectContent className="bg-bg-secondary border-border-primary text-text-primary">
              <SelectItem value="procurement_officer">Procurement Officer</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="vendor">Vendor</SelectItem>
            </SelectContent>
          </Select>
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
          {/* Strength Indicator */}
          <div className="flex gap-1 mt-2">
            {[1, 2, 3, 4].map((level) => (
              <div 
                key={level} 
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${strength >= level ? strengthColors[strength] : 'bg-bg-tertiary'}`}
              ></div>
            ))}
          </div>
        </FormField>

        <FormField label="Confirm Password" error={errors.confirmPassword?.message} required>
          <Input 
            {...register('confirmPassword')} 
            type={showPassword ? "text" : "password"} 
            placeholder="••••••••" 
            className="bg-bg-primary border-border-primary text-text-primary"
          />
        </FormField>

        <Button 
          type="submit" 
          disabled={isSubmitting} 
          className="w-full bg-accent-blue hover:bg-accent-blue-bright text-white h-11 text-base mt-4"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Creating account...
            </>
          ) : (
            'Create Account'
          )}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-text-secondary">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-accent-blue hover:text-accent-blue-bright transition-colors">
          Sign in
        </Link>
      </div>
    </div>
  );
}
