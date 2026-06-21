import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/features/auth/AuthContext';
import { ProtectedRoute, AdminRoute } from '@/common/ProtectedRoute';
import DashboardLayout from '@/common/DashboardLayout';

// ── Public pages ────────────────────────────────────────────────
import LandingPage   from '@/features/landing/LandingPage';
import LoginPage     from '@/features/auth/LoginPage';
import RegisterPage  from '@/features/auth/RegisterPage';
import ProfilePage   from '@/features/auth/ProfilePage';

// ── Authenticated pages ─────────────────────────────────────────
import UserDashboard from '@/features/dashboard/UserDashboard';
import ParkingMapPage from '@/features/parking/ParkingMapPage';
import ReservationsPage from '@/features/reservations/ReservationsPage';
import BillingPage from '@/features/billing/BillingPage';

// ── Admin pages ─────────────────────────────────────────────────
import { AdminLotsPage } from '@/features/parking/AdminLotsPage';
import { AdminSlotsPage } from '@/features/parking/AdminSlotsPage';
import AdminDashboard from '@/features/admin/AdminDashboard';
import ReportsPage from '@/features/admin/ReportsPage';

// ─────────────────────────────────────────────────────────────

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* ── Public routes ────────────────────────────── */}
          <Route path="/"         element={<LandingPage />} />
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* ── Authenticated routes with sidebar layout ─── */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard"    element={<UserDashboard />} />
              <Route path="/profile"      element={<ProfilePage />} />
              <Route path="/parking"      element={<ParkingMapPage />} />
              <Route path="/reservations" element={<ReservationsPage />} />
              <Route path="/billing"      element={<BillingPage />} />
            </Route>
          </Route>

          {/* ── Admin-only routes with sidebar layout ────── */}
          <Route element={<AdminRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/admin"         element={<AdminDashboard />} />
              <Route path="/admin/lots"    element={<AdminLotsPage />} />
              <Route path="/admin/slots"   element={<AdminSlotsPage />} />
              <Route path="/admin/reports" element={<ReportsPage />} />
            </Route>
          </Route>

          {/* ── Fallback ─────────────────────────────────── */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
