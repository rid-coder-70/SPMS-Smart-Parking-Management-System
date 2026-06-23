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
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { Cta4 } from '@/components/ui/cta-4';
import { Button } from '@/components/ui/button';
import { ParticleBackground } from '@/components/ui/particle-background';

const features = [
  {
    icon: <MapPin className="h-5 w-5 text-orange-500" />,
    bg: 'bg-orange-50 border-orange-200 hover:border-orange-400 hover:bg-orange-100',
    title: 'Real-Time Slot Detection',
    description:
      'Live availability tracking across all parking zones. See open slots the moment they become free.',
  },
  {
    icon: <Shield className="h-5 w-5 text-yellow-500" />,
    bg: 'bg-yellow-50 border-yellow-200 hover:border-yellow-400 hover:bg-yellow-100',
    title: 'Enterprise-Grade Security',
    description:
      'JWT-based authentication with automated account lockout and role-based access control.',
  },
  {
    icon: <CreditCard className="h-5 w-5 text-orange-500" />,
    bg: 'bg-orange-50 border-orange-200 hover:border-orange-400 hover:bg-orange-100',
    title: 'Automated Billing',
    description:
      'Dynamic pricing by vehicle type and duration. Instant receipts on check-out.',
  },
  {
    icon: <Clock className="h-5 w-5 text-yellow-500" />,
    bg: 'bg-yellow-50 border-yellow-200 hover:border-yellow-400 hover:bg-yellow-100',
    title: 'Advance Reservations',
    description: 'Book your spot before you arrive. No more circling the lot.',
  },
  {
    icon: <Zap className="h-5 w-5 text-orange-500" />,
    bg: 'bg-orange-50 border-orange-200 hover:border-orange-400 hover:bg-orange-100',
    title: 'Instant Check-In/Out',
    description:
      'One-tap check-in and check-out with real-time slot status updates.',
  },
  {
    icon: <BarChart3 className="h-5 w-5 text-yellow-500" />,
    bg: 'bg-yellow-50 border-yellow-200 hover:border-yellow-400 hover:bg-yellow-100',
    title: 'Admin Analytics',
    description:
      'Revenue reports, occupancy heatmaps, and lot performance metrics at a glance.',
  },
];

const stats = [
  { label: 'Parking Lots', value: '12+' },
  { label: 'Slot Capacity', value: '500+' },
  { label: 'Reservations', value: '24/7' },
  { label: 'Uptime', value: '99.9%' },
];

const perks = [
  'No hidden fees',
  'Instant confirmation',
  'Cancel anytime',
  'Mobile-friendly',
];

const ctaItems = [
  'Real-Time Slot Updates',
  'Advance Reservations',
  'Automated Billing',
  'Enterprise Security',
  '24/7 Availability',
];

export default function LandingPage() {
  const { user, logout } = useAuth();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const formattedTime = time.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div
      className="min-h-screen overflow-hidden relative"
      style={{ background: '#FFFFFF' }}
    >
      {/* Animated network particle background */}
      <ParticleBackground />

      {/* Top warm glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 90% 50% at 50% -10%, rgba(251,146,60,0.18) 0%, transparent 60%)',
        }}
      />

      {/* ── Navbar ──────────────────────────────────────────────────── */}
      <nav
        className="relative z-20 border-b border-orange-100"
        style={{
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-400/30">
                <ParkingCircle className="h-4 w-4 text-white" />
              </div>
              <span className="text-base font-black text-gray-900 tracking-tight">
                SPMS
              </span>
              <span className="hidden sm:block ml-1 px-2 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-[10px] font-bold text-orange-600 uppercase tracking-wider">
                Beta
              </span>
            </div>

            {/* Center: live clock */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-orange-100 bg-orange-50/60 font-mono text-xs text-orange-500">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              {formattedTime}
            </div>

            {/* Right: nav actions */}
            <div className="flex items-center gap-2">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-orange-600 transition-colors px-3 py-1.5"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={logout}
                    className="text-sm font-medium text-gray-400 hover:text-gray-700 transition-colors px-3 py-1.5"
                  >
                    Sign Out
                  </button>
                  <Button asChild size="sm">
                    <Link to="/dashboard">
                      Go to App <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-sm font-medium text-gray-500 hover:text-orange-600 transition-colors px-3 py-1.5"
                  >
                    Sign In
                  </Link>
                  <Button asChild size="sm">
                    <Link to="/register">
                      Get Started <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ── Hero (above fold) ────────────────────────────────────────── */}
      <main className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-0">
          <div className="text-center max-w-4xl mx-auto">

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-orange-600 text-xs font-bold mb-8 uppercase tracking-wider shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                Smart Parking Management System
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] mb-6 text-gray-900"
            >
              Park Smarter,{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #f97316, #fb923c, #facc15)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Not Harder.
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.2 }}
              className="text-base sm:text-lg text-gray-500 mb-8 max-w-2xl mx-auto leading-relaxed"
            >
              A seamless, automated platform for real-time parking reservations,
              check-in/out, and billing. Built for enterprises and campuses alike.
            </motion.p>

            {/* Perks row */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.28 }}
              className="flex flex-wrap items-center justify-center gap-4 mb-10"
            >
              {perks.map((p) => (
                <span
                  key={p}
                  className="flex items-center gap-1.5 text-xs font-semibold text-gray-500"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-orange-400" />
                  {p}
                </span>
              ))}
            </motion.div>

            {/* Hero CTAs — using Button component */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-3"
            >
              {user ? (
                <Button asChild size="lg">
                  <Link to="/dashboard">
                    Go to Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button asChild size="lg">
                    <Link to="/register">
                      Start for Free
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link to="/login">Sign In</Link>
                  </Button>
                </>
              )}
            </motion.div>
          </div>
        </div>

        {/* ── Stats strip ──────────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-px rounded-2xl overflow-hidden border border-orange-100 shadow-xl shadow-orange-100/50"
            style={{ background: 'rgba(249,115,22,0.08)' }}
          >
            {stats.map((s, i) => (
              <div
                key={i}
                className="flex flex-col items-center py-8 px-4 text-center hover:bg-orange-50 transition-colors bg-white"
              >
                <span className="text-3xl sm:text-4xl font-black text-orange-500 mb-1">
                  {s.value}
                </span>
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                  {s.label}
                </span>
              </div>
            ))}
          </motion.div>

          {/* ── Features grid ──────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.65 }}
            className="mt-24"
          >
            <div className="text-center mb-12">
              <span className="inline-block px-3 py-1 rounded-full bg-yellow-50 border border-yellow-200 text-yellow-600 text-xs font-bold uppercase tracking-wider mb-4">
                Features
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-3">
                Everything you need
              </h2>
              <p className="text-sm text-gray-400 max-w-lg mx-auto">
                From reservation to checkout, SPMS handles the full parking lifecycle
                with enterprise-grade reliability.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="group relative overflow-hidden rounded-3xl border border-gray-200/60 bg-white/60 p-8 shadow-sm backdrop-blur-md transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-100 cursor-default"
                >
                  <div className={`absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-10 ${f.bg.split(' ')[0]}`} />
                  
                  <div className="relative z-10">
                    <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-md border border-gray-100 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                      {f.icon}
                    </div>
                    <h3 className="mb-3 text-lg font-bold text-gray-900 tracking-tight">
                      {f.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-gray-500">
                      {f.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ── CTA-4 Section ──────────────────────────────────────── */}
          <div className="mt-16">
            {user ? (
              <Cta4
                title="Welcome back! Manage your parking."
                description="Head to your dashboard to view reservations, check slot availability, and manage your account."
                buttonText="Open Dashboard"
                to="/dashboard"
                items={ctaItems}
                showSecondaryButton={false}
              />
            ) : (
              <Cta4
                title="Ready to transform your parking?"
                description="Join SPMS and start managing parking reservations with full automation today. No hidden fees, instant setup."
                buttonText="Create Free Account"
                to="/register"
                items={ctaItems}
              />
            )}
          </div>
        </div>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-orange-100 py-8 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow">
              <ParkingCircle className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-black text-gray-700">SPMS</span>
          </div>
          <p className="text-xs text-gray-400">
            Smart Parking Management System · Built with Spring Boot + React
          </p>
        </div>
      </footer>
    </div>
  );
}
