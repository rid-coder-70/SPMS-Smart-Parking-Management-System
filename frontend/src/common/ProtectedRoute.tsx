import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';

// ─── Loading spinner ──────────────────────────────────────────

function LoadingSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
    </div>
  );
}

// ─── ProtectedRoute ───────────────────────────────────────────
/**
 * Redirect to /login if no authenticated user.
 * Shows a spinner while the auth state is being rehydrated from localStorage.
 *
 * Usage:
 *   <Route element={<ProtectedRoute />}>
 *     <Route path="/profile" element={<ProfilePage />} />
 *   </Route>
 */
export function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!user)   return <Navigate to="/login" replace />;

  return <Outlet />;
}

// ─── AdminRoute ───────────────────────────────────────────────
/**
 * Same as ProtectedRoute but additionally requires role === "ADMIN".
 * Non-admin authenticated users are redirected to /.
 *
 * Usage:
 *   <Route element={<AdminRoute />}>
 *     <Route path="/admin" element={<AdminDashboard />} />
 *   </Route>
 */
export function AdminRoute() {
  const { user, loading } = useAuth();

  if (loading)                   return <LoadingSpinner />;
  if (!user)                     return <Navigate to="/login" replace />;
  if (user.role !== 'ADMIN')     return <Navigate to="/profile" replace />;

  return <Outlet />;
}
