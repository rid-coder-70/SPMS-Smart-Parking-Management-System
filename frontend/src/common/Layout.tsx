import { Link, Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className="min-h-screen bg-night-900 text-white font-sans flex flex-col">
      {/* Universal Navbar */}
      <nav className="relative z-50 border-b border-white/10 bg-night-900/80 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <div className="flex items-center gap-2">
              <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
                  <span className="text-night-900 font-bold text-xl">P</span>
                </div>
                <span className="text-xl font-bold text-white hidden sm:block">
                  SPMS
                </span>
              </Link>
            </div>
            
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="text-xs sm:text-sm font-mono text-white/50 bg-night-800 px-3 py-1 rounded-full border border-night-700 hidden md:block">
                {formattedTime}
              </div>
              
              {user ? (
                <>
                  <Link to="/reservations/new" className="text-sm font-medium text-white/80 hover:text-white transition-colors hidden sm:block">
                    Book Slot
                  </Link>
                  <Link to="/profile" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
                    Dashboard
                  </Link>
                  {user.role === 'ADMIN' && (
                    <Link to="/admin/reports" className="text-sm font-medium text-brand-400 hover:text-brand-300 transition-colors hidden lg:block">
                      Admin
                    </Link>
                  )}
                  <button onClick={logout} className="btn-secondary py-1.5 px-3 text-xs sm:text-sm">
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
                    Sign In
                  </Link>
                  <Link to="/register" className="btn-primary py-1.5 px-3 sm:py-2 sm:px-4 text-xs sm:text-sm">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main className="flex-1 w-full relative z-10 flex flex-col">
        <Outlet />
      </main>
      
      {/* Universal Footer */}
      <footer className="border-t border-white/5 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-white/40 text-sm">
          &copy; {new Date().getFullYear()} Smart Parking Management System. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
