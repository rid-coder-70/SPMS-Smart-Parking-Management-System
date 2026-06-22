import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  MapPin,
  Shield,
  CreditCard,
  Clock,
  Zap,
  BarChart3,
  ParkingCircle,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';

const features = [
  {
    icon: <MapPin className="h-5 w-5 text-blue-400" />,
    color: 'blue',
    title: 'Real-Time Slot Detection',
    description: 'Live availability tracking across all parking zones. See open slots the moment they become free.',
  },
  {
    icon: <Shield className="h-5 w-5 text-violet-400" />,
    color: 'violet',
    title: 'Enterprise-Grade Security',
    description: 'JWT-based authentication with automated account lockout and role-based access control.',
  },
  {
    icon: <CreditCard className="h-5 w-5 text-emerald-400" />,
    color: 'emerald',
    title: 'Automated Billing',
    description: 'Dynamic pricing by vehicle type and duration. Instant receipts on check-out.',
  },
  {
    icon: <Clock className="h-5 w-5 text-amber-400" />,
    color: 'amber',
    title: 'Advance Reservations',
    description: 'Book your spot before you arrive. No more circling the lot.',
  },
  {
    icon: <Zap className="h-5 w-5 text-rose-400" />,
    color: 'rose',
    title: 'Instant Check-In/Out',
    description: 'One-tap check-in and check-out with real-time slot status updates.',
  },
  {
    icon: <BarChart3 className="h-5 w-5 text-cyan-400" />,
    color: 'cyan',
    title: 'Admin Analytics',
    description: 'Revenue reports, occupancy heatmaps, and lot performance metrics at a glance.',
  },
];

const colorMap: Record<string, string> = {
  blue:    'bg-blue-500/8 border-blue-500/15 group-hover:border-blue-500/30 group-hover:bg-blue-500/12',
  violet:  'bg-violet-500/8 border-violet-500/15 group-hover:border-violet-500/30 group-hover:bg-violet-500/12',
  emerald: 'bg-emerald-500/8 border-emerald-500/15 group-hover:border-emerald-500/30 group-hover:bg-emerald-500/12',
  amber:   'bg-amber-500/8 border-amber-500/15 group-hover:border-amber-500/30 group-hover:bg-amber-500/12',
  rose:    'bg-rose-500/8 border-rose-500/15 group-hover:border-rose-500/30 group-hover:bg-rose-500/12',
  cyan:    'bg-cyan-500/8 border-cyan-500/15 group-hover:border-cyan-500/30 group-hover:bg-cyan-500/12',
};

const stats = [
  { label: 'Parking Lots',   value: '12+' },
  { label: 'Slot Capacity',  value: '500+' },
  { label: 'Reservations',   value: '24/7' },
  { label: 'Uptime',         value: '99.9%' },
];

export default function LandingPage() {
  const { user, logout } = useAuth();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const formattedTime = time.toLocaleTimeString([], {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

  return (
    <div className="min-h-screen bg-night-950 overflow-hidden relative" style={{
      background: 'linear-gradient(180deg, #050814 0%, #08101f 100%)',
    }}>
      {/* Grid pattern overlay */}
      <div className="fixed inset-0 grid-pattern opacity-50 pointer-events-none" />

      {/* Radial glow */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(99,102,241,0.18) 0%, transparent 60%)',
      }} />

      {/* Navbar */}
      <nav className="relative z-20 border-b border-white/5"
        style={{ background: 'rgba(5,8,20,0.85)', backdropFilter: 'blur(24px)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/25">
                <ParkingCircle className="h-4 w-4 text-white" />
              </div>
              <span className="text-base font-bold text-white tracking-tight">SPMS</span>
              <span className="hidden sm:block ml-1 px-2 py-0.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-[10px] font-bold text-brand-400 uppercase tracking-wider">Beta</span>
            </div>

            {/* Center: live clock */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/6 bg-white/3 mono text-xs text-white/40">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {formattedTime}
            </div>

            {/* Right: actions */}
            <div className="flex items-center gap-2">
              {user ? (
                <>
                  <Link to="/dashboard"
                    className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-white/60 hover:text-white transition-colors px-3 py-1.5">
                    Dashboard
                  </Link>
                  <button
                    onClick={logout}
                    className="text-sm font-medium text-white/50 hover:text-white transition-colors px-3 py-1.5">
                    Sign Out
                  </button>
                  <Link to="/dashboard" className="btn-primary text-sm px-4 py-2">
                    Go to App <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/login"
                    className="text-sm font-medium text-white/60 hover:text-white transition-colors px-3 py-1.5">
                    Sign In
                  </Link>
                  <Link to="/register" className="btn-primary text-sm px-4 py-2">
                    Get Started <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        <div className="text-center max-w-4xl mx-auto">

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/8 border border-brand-500/18 text-brand-300 text-xs font-semibold mb-8 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
              Smart Parking Management System
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] mb-7"
          >
            <span className="text-white">Park Smarter,</span>
            <br />
            <span className="text-gradient-indigo">Not Harder.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2 }}
            className="text-base sm:text-lg text-white/50 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            A seamless, automated platform for real-time parking reservations, check-in/out, and billing. Built for enterprises and campuses alike.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            {user ? (
              <Link to="/dashboard" className="btn-primary text-sm px-6 py-3 group w-full sm:w-auto">
                Go to Dashboard
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn-primary text-sm px-6 py-3 group w-full sm:w-auto">
                  Start for Free
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link to="/login" className="btn-secondary text-sm px-6 py-3 w-full sm:w-auto">
                  Sign In
                </Link>
              </>
            )}
          </motion.div>
        </div>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-px rounded-2xl overflow-hidden border border-white/5"
          style={{ background: 'rgba(255,255,255,0.03)' }}
        >
          {stats.map((s, i) => (
            <div key={i} className="flex flex-col items-center py-6 px-4 text-center hover:bg-white/2 transition-colors">
              <span className="text-2xl sm:text-3xl font-black text-white mb-1">{s.value}</span>
              <span className="text-xs text-white/35 font-medium uppercase tracking-wider">{s.label}</span>
            </div>
          ))}
        </motion.div>

        {/* Features grid */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.65 }}
          className="mt-24"
        >
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Everything you need</h2>
            <p className="text-sm text-white/40 max-w-lg mx-auto">
              From reservation to checkout, SPMS handles the full parking lifecycle with enterprise-grade reliability.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.7 + i * 0.07 }}
                className={`group rounded-2xl border p-6 transition-all duration-200 cursor-default ${colorMap[f.color]}`}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-white/5 border border-white/8 group-hover:scale-105 transition-transform">
                  {f.icon}
                </div>
                <h3 className="text-sm font-bold text-white mb-2 group-hover:text-white/90">{f.title}</h3>
                <p className="text-xs text-white/45 leading-relaxed">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA footer */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.1 }}
          className="mt-24 rounded-2xl border border-brand-500/15 p-8 sm:p-12 text-center relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(99,102,241,0.03) 100%)',
          }}
        >
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(99,102,241,0.1) 0%, transparent 60%)' }} />
          <div className="relative">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Ready to transform your parking?
            </h2>
            <p className="text-sm text-white/45 mb-8 max-w-md mx-auto">
              Join and start managing parking reservations with full automation today.
            </p>
            {!user && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link to="/register" className="btn-primary px-7 py-3 text-sm group">
                  Create Free Account
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link to="/login" className="btn-secondary px-7 py-3 text-sm">
                  I have an account
                </Link>
              </div>
            )}
            {user && (
              <Link to="/dashboard" className="btn-primary px-7 py-3 text-sm group inline-flex">
                Open Dashboard
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            )}
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
              <ParkingCircle className="h-3 w-3 text-white" />
            </div>
            <span className="text-xs font-semibold text-white/40">SPMS</span>
          </div>
          <p className="text-xs text-white/25">
            Smart Parking Management System · Built with Spring Boot + React
          </p>
        </div>
      </footer>
    </div>
  );
}
