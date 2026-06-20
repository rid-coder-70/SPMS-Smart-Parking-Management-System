import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider } from '@/features/auth/AuthContext';
import { ProtectedRoute, AdminRoute } from '@/common/ProtectedRoute';

// ── Public pages ────────────────────────────────────────────────
import LandingPage  from '@/features/landing/LandingPage';
import LoginPage    from '@/features/auth/LoginPage';
import RegisterPage from '@/features/auth/RegisterPage';
import ProfilePage  from '@/features/auth/ProfilePage';

// ── Module 2 — Parking ────────────────────────────────────────
import { AdminLotsPage }  from '@/features/parking/AdminLotsPage';
import { AdminSlotsPage } from '@/features/parking/AdminSlotsPage';

// ── Module 3 — Reservations ───────────────────────────────────
import ReservationsPage from '@/features/reservations/ReservationsPage';

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
          <Route path="/"         element={<LandingPage />} />
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* ── Authenticated routes ─────────────────────── */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile"      element={<ProfilePage />} />

            {/* Module 3 — Reservations */}
            <Route path="/reservations" element={<ReservationsPage />} />

            {/* Module 4 — Billing (uncomment when built) */}
            {/* <Route path="/billing" element={<BillingPage />} /> */}
          </Route>

          {/* ── Admin-only routes ─────────────────────────── */}
          <Route element={<AdminRoute />}>
            {/* Module 5 — Admin (uncomment when built) */}
            {/* <Route path="/admin" element={<AdminDashboard />} /> */}
            <Route path="/admin/lots"  element={<AdminLotsPage />} />
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

