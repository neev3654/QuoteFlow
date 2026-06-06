import { CheckCircle2, Zap } from 'lucide-react';
import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen bg-bg-primary text-text-primary">
      {/* Left Panel - Hidden on mobile */}
      <div className="hidden lg:flex lg:w-[40%] bg-bg-secondary border-r border-border-primary relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 grid-pattern opacity-20 pointer-events-none z-0"></div>
        
        <div className="relative z-10 flex-1 flex flex-col justify-center max-w-md mx-auto">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 bg-accent-blue rounded-xl text-white flex items-center justify-center font-bold shadow-lg shadow-accent-blue/20">
              <Zap size={24} />
            </div>
            <span className="text-3xl font-display font-bold text-white tracking-tight">QuoteFlow</span>
          </div>

          <h1 className="text-3xl lg:text-4xl font-display font-semibold text-white leading-tight mb-8">
            Procurement intelligence for modern enterprises
          </h1>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <CheckCircle2 className="text-accent-emerald shrink-0" size={24} />
              <span className="text-lg text-text-secondary">End-to-end vendor management</span>
            </div>
            <div className="flex items-center gap-4">
              <CheckCircle2 className="text-accent-emerald shrink-0" size={24} />
              <span className="text-lg text-text-secondary">Structured RFQ & quotation workflows</span>
            </div>
            <div className="flex items-center gap-4">
              <CheckCircle2 className="text-accent-emerald shrink-0" size={24} />
              <span className="text-lg text-text-secondary">Automated purchase orders & invoices</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-12 flex items-center gap-4">
          <div className="flex -space-x-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-10 h-10 rounded-full border-2 border-bg-secondary bg-bg-tertiary flex items-center justify-center text-xs font-bold text-text-secondary">
                U{i}
              </div>
            ))}
          </div>
          <span className="text-sm font-medium text-text-secondary">Trusted by procurement teams</span>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-12 relative">
        {/* Mobile Logo */}
        <div className="lg:hidden absolute top-6 left-6 flex items-center gap-2">
          <div className="w-8 h-8 bg-accent-blue rounded text-white flex items-center justify-center font-bold">
            <Zap size={18} />
          </div>
          <span className="text-xl font-display font-bold text-white">QuoteFlow</span>
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
