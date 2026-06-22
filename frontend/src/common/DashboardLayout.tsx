import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import {
  LayoutDashboard,
  MapPin,
  CalendarCheck,
  Receipt,
  ParkingCircle,
  LayoutGrid,
  BarChart3,
  LogOut,
  Menu,
  X,
  ChevronRight,
  User,
  Shield,
  Bell,
} from 'lucide-react';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

const USER_NAV: NavItem[] = [
  { to: '/dashboard',    label: 'Dashboard',       icon: <LayoutDashboard className="h-4 w-4" /> },
  { to: '/parking',      label: 'Parking Map',     icon: <MapPin className="h-4 w-4" /> },
  { to: '/reservations', label: 'Reservations',    icon: <CalendarCheck className="h-4 w-4" /> },
  { to: '/billing',      label: 'Billing',         icon: <Receipt className="h-4 w-4" /> },
];

const ADMIN_NAV: NavItem[] = [
  { to: '/admin',         label: 'Overview',       icon: <LayoutDashboard className="h-4 w-4" /> },
  { to: '/admin/lots',   label: 'Manage Lots',     icon: <ParkingCircle className="h-4 w-4" /> },
  { to: '/admin/slots',  label: 'Manage Slots',    icon: <LayoutGrid className="h-4 w-4" /> },
  { to: '/admin/reports', label: 'Reports',        icon: <BarChart3 className="h-4 w-4" /> },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const location   = useLocation();
  const navigate   = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdmin  = user?.role === 'ADMIN';
  const navItems = isAdmin ? ADMIN_NAV : USER_NAV;

  const isActive = (path: string) =>
    location.pathname === path || (path !== '/dashboard' && path !== '/admin' && location.pathname.startsWith(path + '/'));

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const NavLink = ({ item }: { item: NavItem }) => (
    <Link
      to={item.to}
      onClick={() => setMobileOpen(false)}
      className={isActive(item.to) ? 'sidebar-link-active' : 'sidebar-link'}
    >
      {item.icon}
      <span>{item.label}</span>
    </Link>
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/5">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center flex-shrink-0 shadow-lg shadow-brand-500/25">
          <ParkingCircle className="h-4 w-4 text-white" />
        </div>
        <div>
          <span className="text-sm font-bold text-white tracking-tight">SPMS</span>
          <p className="text-[10px] text-white/30 font-medium tracking-wider uppercase">Smart Parking</p>
        </div>
      </div>

      {/* Role badge */}
      {isAdmin && (
        <div className="mx-4 mt-4 px-3 py-2 rounded-lg bg-violet-500/10 border border-violet-500/15 flex items-center gap-2">
          <Shield className="h-3.5 w-3.5 text-violet-400" />
          <span className="text-xs font-semibold text-violet-300">Administrator</span>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-bold text-white/25 uppercase tracking-widest px-3 mb-2 pt-1">
          {isAdmin ? 'Admin Panel' : 'Navigation'}
        </p>
        {navItems.map(item => <NavLink key={item.to} item={item} />)}


      </nav>

      {/* Notification bell (decorative) */}
      <div className="px-4 pb-2">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/40 hover:text-white/70 hover:bg-white/4 transition-all duration-150">
          <Bell className="h-4 w-4" />
          <span>Notifications</span>
          <span className="ml-auto w-5 h-5 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-[10px] font-bold text-brand-400">0</span>
        </button>
      </div>

      {/* User footer */}
      <div className="border-t border-white/5 p-3">
        <Link
          to="/profile"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/4 transition-all group"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500/30 to-violet-500/30 border border-white/10 flex items-center justify-center flex-shrink-0">
            <User className="h-3.5 w-3.5 text-white/70" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate leading-none mb-0.5">{user?.username}</p>
            <p className="text-[11px] text-white/35 truncate">{user?.email}</p>
          </div>
          <ChevronRight className="h-3.5 w-3.5 text-white/20 group-hover:text-white/50 transition-colors flex-shrink-0" />
        </Link>
        <button
          onClick={handleLogout}
          className="mt-1 w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-red-400/60 hover:text-red-400 hover:bg-red-500/8 transition-all"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-night-950 flex">

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-60 border-r border-white/5 flex-shrink-0 sticky top-0 h-screen"
        style={{ background: 'linear-gradient(180deg, #080d1a 0%, #050814 100%)' }}>
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-black/70"
            style={{ backdropFilter: 'blur(4px)' }}
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed left-0 top-0 h-full w-64 border-r border-white/6 z-50 animate-slide-in"
            style={{ background: 'linear-gradient(180deg, #080d1a 0%, #050814 100%)' }}>
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/8 transition-all"
            >
              <X className="h-4 w-4" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">

        {/* Mobile header */}
        <header className="lg:hidden flex items-center gap-4 px-4 py-3.5 border-b border-white/5 sticky top-0 z-30"
          style={{ background: 'rgba(8,13,26,0.9)', backdropFilter: 'blur(20px)' }}>
          <button
            onClick={() => setMobileOpen(true)}
            className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/8 transition-all"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
              <ParkingCircle className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-white">SPMS</span>
          </div>
          <div className="ml-auto">
            <div className="w-7 h-7 rounded-full bg-white/8 border border-white/10 flex items-center justify-center">
              <User className="h-3.5 w-3.5 text-white/60" />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
