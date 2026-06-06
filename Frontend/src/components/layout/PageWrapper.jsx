export default function PageWrapper({ children }) {
  return (
    <div className="page-enter h-full">
      {children}
    </div>
  );
}
