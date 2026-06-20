import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/features/auth/AuthContext';
import { ProtectedRoute, AdminRoute } from '@/common/ProtectedRoute';
import Layout from '@/common/Layout';

// ── Public pages ────────────────────────────────────────────────
import LandingPage  from '@/features/landing/LandingPage';
import LoginPage    from '@/features/auth/LoginPage';
import RegisterPage from '@/features/auth/RegisterPage';
import ProfilePage  from '@/features/auth/ProfilePage';

// ── Placeholder pages for future modules ─────────────────────
// Module 2 — Parking
// import ParkingMapPage  from '@/features/parking/ParkingMapPage';

// Module 3 — Reservations
import ReservationForm from '@/features/reservations/ReservationForm';
import MyReservationsPage from '@/features/reservations/MyReservationsPage';
import CheckInOutPage from '@/features/reservations/CheckInOutPage';

// Module 4 — Billing
import BillingHistoryPage from '@/features/billing/BillingHistoryPage';

// Module 5 — Admin/Analytics
import PricingConfigPage from '@/features/admin/PricingConfigPage';
import ReportsPage from '@/features/admin/ReportsPage';
import AdminLotsPage from '@/features/parking/AdminLotsPage';
import AdminSlotsPage from '@/features/parking/AdminSlotsPage';

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

          <Route element={<Layout />}>
            {/* ── Public routes ────────────────────────────── */}
            <Route path="/"         element={<LandingPage />} />
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* ── Authenticated routes ─────────────────────── */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<ProfilePage />} />



            {/* Module 2 — Parking (uncomment when built) */}
            {/* <Route path="/parking"      element={<ParkingMapPage />} /> */}

            {/* Module 4 — Billing */}
            <Route path="/billing" element={<BillingHistoryPage />} />

            {/* Module 3 — Reservations */}
            <Route path="/reservations/new" element={<ReservationForm />} />
            <Route path="/reservations/me" element={<MyReservationsPage />} />
            <Route path="/reservations/check-in-out" element={<CheckInOutPage />} />

          </Route>

          {/* ── Admin-only routes ─────────────────────────── */}
          <Route element={<AdminRoute />}>
            <Route path="/admin/lots" element={<AdminLotsPage />} />
            <Route path="/admin/slots" element={<AdminSlotsPage />} />
            {/* Module 5 — Admin (uncomment when built) */}
            {/* <Route path="/admin" element={<AdminDashboard />} /> */}
            <Route path="/admin/pricing" element={<PricingConfigPage />} />
            <Route path="/admin/reports" element={<ReportsPage />} />
          </Route>

            {/* ── Fallback ─────────────────────────────────── */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
