import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import PageWrapper from './PageWrapper';

export default function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-bg-primary">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden relative">
        <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none z-0"></div>
        <div className="relative z-10 flex flex-col h-full">
          <Topbar />
          <main className="flex-1 overflow-y-auto p-6">
            <PageWrapper>
              <Outlet />
            </PageWrapper>
          </main>
        </div>
      </div>
    </div>
  );
}
