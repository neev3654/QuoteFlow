export default function FormSection({ title, description, children }) {
  return (
    <div className="mb-8">
      <div className="mb-4 pb-2 border-b border-border-primary">
        <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-text-secondary mt-1">
            {description}
          </p>
        )}
      </div>
      <div className="pt-2 flex flex-col gap-4">
        {children}
      </div>
    </div>
  );
}
