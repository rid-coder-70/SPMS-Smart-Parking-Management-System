import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider } from '@/features/auth/AuthContext';
import { ProtectedRoute, AdminRoute } from '@/common/ProtectedRoute';

// ── Auth pages (Module 1) ─────────────────────────────────────
import LoginPage    from '@/features/auth/LoginPage';
import RegisterPage from '@/features/auth/RegisterPage';
import ProfilePage  from '@/features/auth/ProfilePage';

// ── Placeholder pages for future modules ─────────────────────
// Module 2 — Parking
import { AdminLotsPage } from '@/features/parking/AdminLotsPage';
import { AdminSlotsPage } from '@/features/parking/AdminSlotsPage';
// import ParkingMapPage  from '@/features/parking/ParkingMapPage';

// Module 3 — Reservations
// import ReservationsPage from '@/features/reservations/ReservationsPage';

// Module 4 — Billing
// import BillingPage from '@/features/billing/BillingPage';

// Module 5 — Admin
// import AdminDashboard from '@/features/admin/AdminDashboard';

// ─────────────────────────────────────────────────────────────

function App() {
  return (
    <BrowserRouter>
      {/*
        AuthProvider wraps the entire tree so every page and component
        can call useAuth() — it must be inside BrowserRouter because
        AuthContext reads from the router state on mount.
      */}
      <AuthProvider>
        <Routes>

          {/* ── Public routes ────────────────────────────── */}
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* ── Authenticated routes ─────────────────────── */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<ProfilePage />} />

            {/* Module 2 — Parking (uncomment when built) */}
            {/* <Route path="/parking"      element={<ParkingMapPage />} /> */}

            {/* Module 3 — Reservations (uncomment when built) */}
            {/* <Route path="/reservations" element={<ReservationsPage />} /> */}

            {/* Module 4 — Billing (uncomment when built) */}
            {/* <Route path="/billing"      element={<BillingPage />} /> */}

            {/* Default authenticated landing page */}
            <Route index path="/" element={
              <div className="flex flex-col min-h-screen items-center justify-center bg-gray-50 text-gray-800 p-6">
                <h1 className="text-4xl font-bold mb-2">Welcome to SPMS</h1>
                <p className="text-gray-500 mb-8">Select a management module below to get started:</p>
                <div className="flex gap-4">
                  <Link to="/admin/lots" className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow-sm hover:bg-blue-700 hover:shadow font-medium transition-all">Manage Parking Lots</Link>
                  <Link to="/admin/slots" className="px-6 py-3 bg-indigo-600 text-white rounded-xl shadow-sm hover:bg-indigo-700 hover:shadow font-medium transition-all">Manage Parking Slots</Link>
                </div>
              </div>
            } />
          </Route>

          {/* ── Admin-only routes ─────────────────────────── */}
          <Route element={<AdminRoute />}>
            {/* Module 5 — Admin (uncomment when built) */}
            {/* <Route path="/admin" element={<AdminDashboard />} /> */}
            <Route path="/admin/lots" element={<AdminLotsPage />} />
            <Route path="/admin/slots" element={<AdminSlotsPage />} />
          </Route>

          {/* ── Fallback ─────────────────────────────────── */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
