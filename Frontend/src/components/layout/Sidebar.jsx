import { NavLink, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { useUIStore } from '../../store/ui.store';
import { ROLES } from '../../utils/constants';
import {
  LayoutDashboard,
  Building2,
  FileText,
  MessageSquare,
  CheckCircle,
  ShoppingCart,
  Receipt,
  Activity,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Zap
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useLogout } from '../../hooks/useAuth';

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.PROCUREMENT_OFFICER, ROLES.VENDOR] },
  { label: 'Vendors', path: '/vendors', icon: Building2, roles: [ROLES.ADMIN, ROLES.PROCUREMENT_OFFICER] },
  { label: 'RFQs', path: '/rfqs', icon: FileText, roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.PROCUREMENT_OFFICER] },
  { label: 'Quotations', path: '/quotations', icon: MessageSquare, roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.PROCUREMENT_OFFICER, ROLES.VENDOR] },
  { label: 'Approvals', path: '/approvals', icon: CheckCircle, roles: [ROLES.MANAGER, ROLES.ADMIN] },
  { label: 'Purchase Orders', path: '/purchase-orders', icon: ShoppingCart, roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.PROCUREMENT_OFFICER] },
  { label: 'Invoices', path: '/invoices', icon: Receipt, roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.PROCUREMENT_OFFICER] },
  { label: 'Activity Log', path: '/activity', icon: Activity, roles: [ROLES.ADMIN] },
  { label: 'Analytics', path: '/analytics', icon: BarChart3, roles: [ROLES.ADMIN, ROLES.MANAGER] },
];

export default function Sidebar() {
  const { user } = useAuthStore();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const location = useLocation();
  const logoutMutation = useLogout();

  const userRole = user?.role;
  const filteredNav = NAV_ITEMS.filter((item) => item.roles.includes(userRole));

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-bg-secondary border-r border-border-primary transition-all duration-300 relative",
        sidebarCollapsed ? "w-[60px]" : "w-[240px]"
      )}
    >
      {/* Logo Area */}
      <div className="h-[60px] flex items-center justify-center border-b border-border-primary px-3 overflow-hidden">
        {sidebarCollapsed ? (
          <div className="w-8 h-8 bg-accent-blue rounded text-white flex items-center justify-center font-bold">
            Q
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xl font-display font-bold text-text-primary">
            <Zap className="text-accent-blue" size={24} />
            QuoteFlow
          </div>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {filteredNav.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.path);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              title={sidebarCollapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                isActive 
                  ? "bg-accent-blue-glow text-accent-blue-bright border-l-2 border-accent-blue" 
                  : "text-text-secondary hover:bg-bg-tertiary hover:text-text-primary border-l-2 border-transparent"
              )}
            >
              <Icon size={20} className={cn("min-w-[20px]", isActive ? "text-accent-blue-bright" : "text-text-secondary group-hover:text-text-primary")} />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-3 border-t border-border-primary flex items-center justify-between overflow-hidden relative group">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-accent-blue/20 text-accent-blue-bright flex items-center justify-center text-xs font-bold shrink-0">
            {getInitials(user?.name)}
          </div>
          {!sidebarCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-text-primary truncate">{user?.name || 'User'}</span>
              <span className="text-xs text-text-tertiary truncate">{user?.role?.replace('_', ' ')}</span>
            </div>
          )}
        </div>
        {!sidebarCollapsed && (
          <button 
            onClick={() => logoutMutation.mutate()} 
            className="text-text-tertiary hover:text-accent-red transition-colors"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        )}
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 bottom-16 bg-bg-tertiary border border-border-primary text-text-secondary rounded-full p-1 hover:text-text-primary hover:bg-bg-secondary transition-colors z-10"
      >
        {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </aside>
  );
}
