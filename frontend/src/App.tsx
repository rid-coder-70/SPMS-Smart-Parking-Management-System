import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/features/auth/AuthContext';
import { ProtectedRoute, AdminRoute } from '@/common/ProtectedRoute';

// ── Auth pages (Module 1) ─────────────────────────────────────
import LoginPage    from '@/features/auth/LoginPage';
import RegisterPage from '@/features/auth/RegisterPage';
import ProfilePage  from '@/features/auth/ProfilePage';

// ── Placeholder pages for future modules ─────────────────────
// Module 2 — Parking
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
              <div className="flex min-h-screen items-center justify-center text-gray-500">
                <p>Welcome to SPMS — select a feature from the menu.</p>
              </div>
            } />
          </Route>

          {/* ── Admin-only routes ─────────────────────────── */}
          <Route element={<AdminRoute />}>
            {/* Module 5 — Admin (uncomment when built) */}
            {/* <Route path="/admin" element={<AdminDashboard />} /> */}
          </Route>

          {/* ── Fallback ─────────────────────────────────── */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
