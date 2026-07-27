import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/features/auth/AuthContext";
import {
  LayoutDashboard,
  MapPin,
  CalendarCheck,
  ParkingCircle,
  LayoutGrid,
  LogOut,
  Menu,
  X,
  ChevronRight,
  User,
  Shield,
  Users,
  DollarSign,
  BarChart3,
  ShieldCheck
} from "lucide-react";
const USER_NAV = [
  { to: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { to: "/parking", label: "Parking Map", icon: <MapPin className="h-4 w-4" /> },
  { to: "/reservations", label: "Reservations", icon: <CalendarCheck className="h-4 w-4" /> }
];
const ADMIN_NAV = [
  { to: "/admin", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
  { to: "/admin/lots", label: "Manage Lots", icon: <ParkingCircle className="h-4 w-4" /> },
  { to: "/admin/slots", label: "Manage Slots", icon: <LayoutGrid className="h-4 w-4" /> },
  { to: "/admin/users", label: "Manage Users", icon: <Users className="h-4 w-4" /> },
  { to: "/admin/pricing", label: "Pricing Config", icon: <DollarSign className="h-4 w-4" /> },
  { to: "/admin/reports", label: "Reports", icon: <BarChart3 className="h-4 w-4" /> },
  { to: "/admin/audit", label: "Audit Trail", icon: <ShieldCheck className="h-4 w-4" /> }
];
export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAdmin = user?.role === "ADMIN";
  const navItems = isAdmin ? ADMIN_NAV : USER_NAV;
  const isActive = (path) => location.pathname === path || path !== "/dashboard" && path !== "/admin" && location.pathname.startsWith(path + "/");
  const handleLogout = () => {
    logout();
    navigate("/");
  };
  const NavLink = ({ item }) => <Link
    to={item.to}
    onClick={() => setMobileOpen(false)}
    className={isActive(item.to) ? "sidebar-link-active" : "sidebar-link"}
  >{item.icon}<span>{item.label}</span></Link>;
  const SidebarContent = () => <div className="flex flex-col h-full"><div className="flex items-center gap-3 px-5 py-5 border-b border-orange-100"><div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-400/30"><ParkingCircle className="h-4 w-4 text-white" /></div><div><span className="text-sm font-bold text-gray-900 tracking-tight">SPMS</span><p className="text-[10px] text-gray-400 font-medium tracking-wider uppercase">Smart Parking</p></div></div>{isAdmin && <div className="mx-4 mt-4 px-3 py-2 rounded-lg bg-violet-50 border border-violet-200 flex items-center gap-2"><Shield className="h-3.5 w-3.5 text-violet-600" /><span className="text-xs font-semibold text-violet-700">Administrator</span></div>}<nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto"><p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest px-3 mb-2 pt-1">{isAdmin ? "Admin Panel" : "Navigation"}</p>{navItems.map((item) => <NavLink key={item.to} item={item} />)}</nav><div className="border-t border-orange-100 p-3"><Link
    to="/profile"
    onClick={() => setMobileOpen(false)}
    className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-orange-50 transition-all group"
  ><div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-100 to-yellow-100 border border-orange-200 flex items-center justify-center flex-shrink-0"><User className="h-3.5 w-3.5 text-orange-600" /></div><div className="flex-1 min-w-0"><p className="text-sm font-semibold text-gray-800 truncate leading-none mb-0.5">{user?.username}</p><p className="text-[11px] text-gray-400 truncate">{user?.email}</p></div><ChevronRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-orange-500 transition-colors flex-shrink-0" /></Link><button
    onClick={handleLogout}
    className="mt-1 w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-red-400 hover:text-red-600 hover:bg-red-50 transition-all"
  ><LogOut className="h-4 w-4" />
          Sign Out
        </button></div></div>;
  return <div className="min-h-screen flex" style={{ background: "#FFFBF5" }}><aside className="hidden lg:flex lg:flex-col w-60 border-r border-orange-100 flex-shrink-0 sticky top-0 h-screen bg-white"><SidebarContent /></aside>{mobileOpen && <div className="fixed inset-0 z-40 lg:hidden"><div
    className="fixed inset-0 bg-black/20"
    style={{ backdropFilter: "blur(4px)" }}
    onClick={() => setMobileOpen(false)}
  /><aside className="fixed left-0 top-0 h-full w-64 border-r border-orange-100 z-50 animate-slide-in bg-white shadow-xl"><button
    onClick={() => setMobileOpen(false)}
    className="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-orange-50 transition-all"
  ><X className="h-4 w-4" /></button><SidebarContent /></aside></div>}<div className="flex-1 flex flex-col min-h-screen min-w-0"><header
    className="lg:hidden flex items-center gap-4 px-4 py-3.5 border-b border-orange-100 sticky top-0 z-30"
    style={{ background: "rgba(255,251,245,0.92)", backdropFilter: "blur(20px)" }}
  ><button
    onClick={() => setMobileOpen(true)}
    className="p-1.5 rounded-lg text-gray-500 hover:text-orange-600 hover:bg-orange-50 transition-all"
  ><Menu className="h-5 w-5" /></button><div className="flex items-center gap-2"><div className="w-6 h-6 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center"><ParkingCircle className="h-3.5 w-3.5 text-white" /></div><span className="text-sm font-bold text-gray-900">SPMS</span></div><div className="ml-auto"><div className="w-7 h-7 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center"><User className="h-3.5 w-3.5 text-orange-600" /></div></div></header><main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto"><Outlet /></main></div></div>;
}
