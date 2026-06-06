import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function PageHeader({ title, subtitle, breadcrumbs = [], actions }) {
  return (
    <div className="mb-6">
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <div className="flex items-center text-xs font-medium text-text-tertiary mb-2">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <div key={idx} className="flex items-center">
                {isLast ? (
                  <span className="text-text-primary capitalize">{crumb.label}</span>
                ) : (
                  <>
                    {crumb.href ? (
                      <Link to={crumb.href} className="hover:text-text-secondary transition-colors capitalize">
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="capitalize">{crumb.label}</span>
                    )}
                    <ChevronRight size={12} className="mx-1.5 opacity-70" />
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
      
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-semibold text-text-primary">{title}</h2>
          {subtitle && <p className="text-sm text-text-secondary mt-1">{subtitle}</p>}
        </div>
        {actions && (
          <div className="flex items-center gap-3 shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
