import { Link, Outlet, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import {
  LayoutDashboard,
  MapPin,
  CalendarCheck,
  Receipt,
  ParkingCircle,
  Grid3X3,
  BarChart3,
  LogOut,
  Menu,
  X,
  ChevronRight,
  User,
} from 'lucide-react';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard',     label: 'Dashboard',        icon: <LayoutDashboard className="h-5 w-5" /> },
  { to: '/parking',       label: 'Parking Map',      icon: <MapPin className="h-5 w-5" /> },
  { to: '/reservations',  label: 'My Reservations',  icon: <CalendarCheck className="h-5 w-5" /> },
  { to: '/billing',       label: 'My Billing',       icon: <Receipt className="h-5 w-5" /> },
];

const ADMIN_ITEMS: NavItem[] = [
  { to: '/admin/lots',    label: 'Manage Lots',      icon: <ParkingCircle className="h-5 w-5" />,  adminOnly: true },
  { to: '/admin/slots',   label: 'Manage Slots',     icon: <Grid3X3 className="h-5 w-5" />,       adminOnly: true },
  { to: '/admin/reports', label: 'Reports',           icon: <BarChart3 className="h-5 w-5" />,     adminOnly: true },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const renderNavLink = (item: NavItem) => (
    <Link
      key={item.to}
      to={item.to}
      onClick={() => setSidebarOpen(false)}
      className={isActive(item.to) ? 'sidebar-link-active' : 'sidebar-link'}
    >
      {item.icon}
      {item.label}
    </Link>
  );

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-night-700">
        <div className="w-9 h-9 rounded-lg bg-brand-500 flex items-center justify-center flex-shrink-0">
          <span className="text-night-900 font-bold text-lg">P</span>
        </div>
        <span className="text-lg font-bold text-white tracking-tight">SPMS</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <p className="text-xs font-semibold text-white/30 uppercase tracking-widest px-4 mb-3">Menu</p>
        {NAV_ITEMS.map(renderNavLink)}

        {user?.role === 'ADMIN' && (
          <>
            <div className="my-4 border-t border-night-700" />
            <p className="text-xs font-semibold text-white/30 uppercase tracking-widest px-4 mb-3">Admin</p>
            {ADMIN_ITEMS.map(renderNavLink)}
          </>
        )}
      </nav>

      {/* User Footer */}
      <div className="border-t border-night-700 p-4">
        <Link
          to="/profile"
          onClick={() => setSidebarOpen(false)}
          className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/5 transition-colors group"
        >
          <div className="w-9 h-9 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
            <User className="h-4 w-4 text-brand-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.username}</p>
            <p className="text-xs text-white/40 truncate">{user?.email}</p>
          </div>
          <ChevronRight className="h-4 w-4 text-white/30 group-hover:text-white/60 transition-colors" />
        </Link>
        <button
          onClick={() => { logout(); setSidebarOpen(false); }}
          className="mt-2 w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-night-900 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 border-r border-night-700 bg-night-800/50 flex-shrink-0 sticky top-0 h-screen">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed left-0 top-0 h-full w-72 bg-night-800 border-r border-night-700 z-50 animate-slide-in">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-5 right-4 text-white/50 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center gap-4 px-4 py-4 border-b border-night-700 bg-night-800/50 backdrop-blur-md sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="text-white/70 hover:text-white transition-colors">
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center">
              <span className="text-night-900 font-bold text-sm">P</span>
            </div>
            <span className="text-base font-bold text-white">SPMS</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
