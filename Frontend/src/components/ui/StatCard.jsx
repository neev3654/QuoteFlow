import { TrendingUp, TrendingDown } from 'lucide-react';

const colorMap = {
  blue: { bg: 'bg-accent-blue/20', text: 'text-accent-blue-bright' },
  emerald: { bg: 'bg-accent-emerald/20', text: 'text-accent-emerald' },
  amber: { bg: 'bg-accent-amber/20', text: 'text-accent-amber' },
  red: { bg: 'bg-accent-red/20', text: 'text-accent-red' },
};

export default function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  color = 'blue', 
  loading = false, 
  prefix = '', 
  suffix = '' 
}) {
  const colors = colorMap[color] || colorMap.blue;

  return (
    <div className="bg-bg-secondary rounded-xl border border-border-primary p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-text-secondary">{title}</h3>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors.bg} ${colors.text}`}>
          {Icon && <Icon size={20} />}
        </div>
      </div>
      
      <div className="mt-auto">
        {loading ? (
          <div className="skeleton h-9 w-2/3 rounded mb-2"></div>
        ) : (
          <div className="font-mono font-semibold text-3xl text-text-primary stat-value flex items-baseline gap-1">
            {prefix && <span className="text-xl text-text-tertiary">{prefix}</span>}
            {value}
            {suffix && <span className="text-xl text-text-tertiary">{suffix}</span>}
          </div>
        )}

        <div className="mt-2 h-5">
          {loading ? (
            <div className="skeleton h-4 w-1/3 rounded"></div>
          ) : trend ? (
            <div className={`flex items-center text-xs font-medium ${trend.direction === 'up' ? 'text-accent-emerald' : 'text-accent-red'}`}>
              {trend.direction === 'up' ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
              <span>{trend.value}</span>
              <span className="text-text-tertiary ml-2">vs last month</span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
