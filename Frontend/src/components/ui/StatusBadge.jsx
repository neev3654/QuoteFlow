import { STATUS_COLORS } from '../../utils/constants';

export default function StatusBadge({ status, size = 'sm' }) {
  if (!status) return null;

  const normalizedStatus = status.toLowerCase();
  
  // Find mapped color, fallback to draft (gray)
  let colorClasses = STATUS_COLORS[normalizedStatus] || 'bg-gray-500/15 text-gray-400 border-gray-500/20';

  const sizeClasses = size === 'sm' 
    ? 'px-2.5 py-0.5 text-xs' 
    : 'px-3 py-1 text-sm';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium border ${sizeClasses} ${colorClasses}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {status.replace(/_/g, ' ')}
    </span>
  );
}
