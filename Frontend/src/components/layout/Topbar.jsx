import { useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { Menu, Bell, Search, ChevronRight } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { useLogout } from '../../hooks/useAuth';

export default function Topbar() {
  const { user } = useAuthStore();
  const location = useLocation();
  const logoutMutation = useLogout();

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const pathSegments = location.pathname.split('/').filter(Boolean);
  const currentTitle = pathSegments.length > 0 
    ? pathSegments[pathSegments.length - 1].replace(/-/g, ' ') 
    : 'Dashboard';

  return (
    <header className="h-[60px] bg-bg-secondary border-b border-border-primary flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-4">
        {/* Mobile Menu Icon (Placeholder for now) */}
        <button className="md:hidden text-text-secondary hover:text-text-primary">
          <Menu size={20} />
        </button>

        {/* Title and Breadcrumbs */}
        <div className="flex flex-col">
          <div className="flex items-center text-xs text-text-tertiary font-medium">
            <span className="capitalize">App</span>
            {pathSegments.map((segment, index) => (
              <span key={index} className="flex items-center capitalize">
                <ChevronRight size={12} className="mx-1" />
                {segment.replace(/-/g, ' ')}
              </span>
            ))}
          </div>
          <h1 className="text-lg font-display font-semibold text-text-primary capitalize leading-tight mt-0.5">
            {currentTitle}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <button className="text-text-secondary hover:text-text-primary transition-colors">
          <Search size={18} />
        </button>

        {/* Notifications */}
        <button className="text-text-secondary hover:text-text-primary transition-colors relative">
          <Bell size={18} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-accent-amber rounded-full"></span>
        </button>

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="outline-none ml-2">
            <div className="w-8 h-8 rounded-full bg-accent-blue/20 text-accent-blue-bright flex items-center justify-center text-xs font-bold hover:bg-accent-blue/30 transition-colors cursor-pointer border border-accent-blue/20">
              {getInitials(user?.name)}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-bg-secondary border-border-primary text-text-primary">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name}</p>
                <p className="text-xs leading-none text-text-secondary">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border-primary" />
            <DropdownMenuItem className="focus:bg-bg-tertiary focus:text-text-primary cursor-pointer">
              My Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="focus:bg-bg-tertiary focus:text-text-primary cursor-pointer">
              Change Password
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border-primary" />
            <DropdownMenuItem 
              className="text-accent-red focus:bg-accent-red/10 focus:text-accent-red cursor-pointer"
              onClick={() => logoutMutation.mutate()}
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
