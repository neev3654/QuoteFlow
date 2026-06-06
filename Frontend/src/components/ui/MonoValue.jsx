export default function MonoValue({ children, className = "" }) {
  return (
    <span className={`font-mono text-sm text-text-primary ${className}`}>
      {children}
    </span>
  );
}
