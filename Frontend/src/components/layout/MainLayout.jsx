import { Outlet } from 'react-router-dom';

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="p-4 border-b border-border">QuoteFlow Header</header>
      <div className="flex flex-1">
        <aside className="w-64 border-r border-border p-4">Sidebar</aside>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
