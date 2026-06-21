import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, MapPin, Shield, CreditCard, ChevronRight } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';

export default function LandingPage() {
  const { user, logout } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const features = [
    {
      icon: <MapPin className="h-6 w-6 text-brand-400" />,
      title: 'Smart Slot Detection',
      description: 'Real-time availability tracking across multiple parking zones with IoT integration.'
    },
    {
      icon: <Shield className="h-6 w-6 text-brand-400" />,
      title: 'Secure Authentication',
      description: 'Enterprise-grade JWT security with automated account lockout policies.'
    },
    {
      icon: <CreditCard className="h-6 w-6 text-brand-400" />,
      title: 'Automated Billing',
      description: 'Seamless checkout process with dynamic pricing based on vehicle type and duration.'
    }
  ];

  return (
    <div className="min-h-screen bg-night-900 overflow-hidden relative">
      {/* Background removed for minimal style */}

      {/* Navbar */}
      <nav className="relative z-10 border-b border-white/10 bg-night-900/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
                <span className="text-night-900 font-bold text-xl">P</span>
              </div>
              <span className="text-xl font-bold text-white">
                SPMS
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm font-mono text-white/50 bg-night-800 px-3 py-1 rounded-full border border-night-700 hidden sm:block">
                {formattedTime}
              </div>
              {user ? (
                <>
                  <Link to="/dashboard" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
                    Dashboard
                  </Link>
                  <button onClick={logout} className="btn-primary py-2 px-4 text-sm">
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
                    Sign In
                  </Link>
                  <Link to="/register" className="btn-primary py-2 px-4 text-sm">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        <div className="text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-sm font-medium mb-8">
              <span className="flex h-2 w-2 rounded-full bg-brand-500"></span>
              Now in Public Beta
            </span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8"
          >
            The Future of <br className="hidden md:block" />
            <span className="text-brand-500">
              Smart Parking
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-white/60 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            A seamless, automated platform for managing parking spaces, reservations, and billing. Built with enterprise-grade security and a premium user experience.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            {user ? (
              <Link to="/dashboard" className="btn-primary group w-full sm:w-auto text-base px-8 py-4">
                Go to Dashboard
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn-primary group w-full sm:w-auto text-base px-8 py-4">
                  Start Reserving Now
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/login" className="btn-secondary w-full sm:w-auto text-base px-8 py-4 bg-transparent border-white/20 hover:bg-white/5">
                  Access Dashboard
                </Link>
              </>
            )}
          </motion.div>
        </div>

        {/* Feature Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="grid md:grid-cols-3 gap-6 mt-32"
        >
          {features.map((feature, idx) => (
            <div key={idx} className="card group hover:-translate-y-2 hover:border-brand-500/30 transition-all duration-300 cursor-default">
              <div className="w-14 h-14 rounded-xl bg-night-900 border border-night-700 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:border-brand-500/50 group-hover:bg-brand-500/10 transition-all duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 text-white group-hover:text-brand-400 transition-colors">{feature.title}</h3>
              <p className="text-white/70 leading-relaxed text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
