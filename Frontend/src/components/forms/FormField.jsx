import { AlertCircle } from 'lucide-react';

export default function FormField({ label, error, required, children, hint }) {
  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label className="text-sm font-medium text-text-secondary flex items-center">
          {label} {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      {children}
      {hint && <p className="text-xs text-text-tertiary">{hint}</p>}
      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1 mt-1">
          <AlertCircle size={12} />
          {error}
        </p>
      )}
    </div>
  );
}
