import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/features/auth/AuthContext";
import { ProtectedRoute, AdminRoute } from "@/common/ProtectedRoute";
import DashboardLayout from "@/common/DashboardLayout";
import LandingPage from "@/features/landing/LandingPage";
import LoginPage from "@/features/auth/LoginPage";
import RegisterPage from "@/features/auth/RegisterPage";
import ProfilePage from "@/features/auth/ProfilePage";
import UserDashboard from "@/features/dashboard/UserDashboard";
import ParkingMapPage from "@/features/parking/ParkingMapPage";
import ReservationsPage from "@/features/reservations/ReservationsPage";
import AdminDashboard from "@/features/admin/AdminDashboard";
import { AdminLotsPage } from "@/features/parking/AdminLotsPage";
import { AdminSlotsPage } from "@/features/parking/AdminSlotsPage";
import AdminUsersPage from "@/features/admin/AdminUsersPage";
import AdminPricingPage from "@/features/parking/AdminPricingPage";
import AdminReportsPage from "@/features/reports/AdminReportsPage";
import AdminAuditLogsPage from "@/features/admin/AdminAuditLogsPage";
function App() {
  return <BrowserRouter><AuthProvider><Routes><Route path="/" element={<LandingPage />} /><Route path="/login" element={<LoginPage />} /><Route path="/register" element={<RegisterPage />} /><Route element={<ProtectedRoute />}><Route element={<DashboardLayout />}><Route path="/dashboard" element={<UserDashboard />} /><Route path="/profile" element={<ProfilePage />} /><Route path="/parking" element={<ParkingMapPage />} /><Route path="/reservations" element={<ReservationsPage />} /></Route></Route><Route element={<AdminRoute />}><Route element={<DashboardLayout />}><Route path="/admin" element={<AdminDashboard />} /><Route path="/admin/lots" element={<AdminLotsPage />} /><Route path="/admin/slots" element={<AdminSlotsPage />} /><Route path="/admin/users" element={<AdminUsersPage />} /><Route path="/admin/pricing" element={<AdminPricingPage />} /><Route path="/admin/reports" element={<AdminReportsPage />} /><Route path="/admin/audit" element={<AdminAuditLogsPage />} /></Route></Route><Route path="*" element={<Navigate to="/" replace />} /></Routes></AuthProvider></BrowserRouter>;
}
export default App;
