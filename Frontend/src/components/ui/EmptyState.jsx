import { Inbox } from 'lucide-react';

export default function EmptyState({ title, description, action, icon: Icon = Inbox }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="bg-bg-tertiary rounded-2xl p-6 text-text-tertiary mb-4 border border-border-primary/50 shadow-sm">
        <Icon size={40} strokeWidth={1.5} />
      </div>
      <h3 className="text-lg font-medium text-text-primary text-center">{title}</h3>
      {description && (
        <p className="text-sm text-text-secondary mt-2 max-w-sm text-center">
          {description}
        </p>
      )}
      {action && (
        <div className="mt-6">
          {action}
        </div>
      )}
    </div>
  );
}
