import { useEffect, useState } from "react";
import { UserService } from "@/features/auth/user.service";
import { Users, Search, CheckCircle2, XCircle, KeyRound, ShieldAlert } from "lucide-react";
export default function AdminUsersPage() {
  const [data, setData] = useState(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [resetModalUser, setResetModalUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const loadUsers = async (p = 0) => {
    setLoading(true);
    try {
      const res = await UserService.listUsers(p, 10);
      setData(res);
    } catch (err) {
      alert(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadUsers(page);
  }, [page]);
  const handleActivate = async (id) => {
    try {
      await UserService.activateUser(id);
      loadUsers(page);
    } catch (err) {
      alert(err.message);
    }
  };
  const handleDeactivate = async (id) => {
    if (!confirm("Are you sure you want to deactivate this account?")) return;
    try {
      await UserService.deactivateUser(id);
      loadUsers(page);
    } catch (err) {
      alert(err.message);
    }
  };
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetModalUser || !newPassword) return;
    try {
      await UserService.resetPassword(resetModalUser.id, { newPassword });
      alert(`Password for ${resetModalUser.username} has been reset.`);
      setResetModalUser(null);
      setNewPassword("");
    } catch (err) {
      alert(err.message || "Failed to reset password");
    }
  };
  const filteredUsers = data?.content.filter(
    (u) => u.username.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  ) ?? [];
  return <div className="space-y-6 animate-fade-in max-w-6xl mx-auto"><div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"><div><h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5"><Users className="h-6 w-6 text-orange-500" /> User Management
          </h1><p className="text-sm text-gray-500 mt-1">Manage platform accounts, roles, and security credentials.</p></div><div className="relative w-full sm:w-64"><Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" /><input
    type="text"
    placeholder="Search users..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="input-field pl-9 text-xs py-2"
  /></div></div><div className="card p-0 overflow-hidden shadow-sm"><div className="overflow-x-auto"><table className="w-full text-left text-xs border-collapse"><thead><tr className="bg-orange-50/50 border-b border-orange-100 text-gray-500 font-semibold uppercase tracking-wider"><th className="px-4 py-3">User</th><th className="px-4 py-3">Email & Phone</th><th className="px-4 py-3">Vehicle Info</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-gray-100">{loading ? <tr><td colSpan={6} className="text-center py-12 text-gray-400">Loading accounts...</td></tr> : filteredUsers.length === 0 ? <tr><td colSpan={6} className="text-center py-12 text-gray-400">No users found.</td></tr> : filteredUsers.map((u) => <tr key={u.id} className="hover:bg-orange-50/30 transition-colors"><td className="px-4 py-3.5 font-semibold text-gray-900"><div>{u.username}</div><span className="text-[10px] text-gray-400 font-normal">ID #{u.id}</span></td><td className="px-4 py-3.5"><div className="text-gray-800">{u.email}</div><div className="text-[10px] text-gray-400">{u.phone || "N/A"}</div></td><td className="px-4 py-3.5">{u.vehicleType ? <span className="badge bg-gray-100 text-gray-700 font-mono text-[10px]">{u.vehicleType} • {u.vehicleNumber || "No Plate"}</span> : <span className="text-gray-400 font-italic">None</span>}</td><td className="px-4 py-3.5"><span className={`badge ${u.role === "ADMIN" ? "bg-violet-50 text-violet-700 border-violet-200" : "bg-gray-50 text-gray-600"}`}>{u.role}</span></td><td className="px-4 py-3.5"><span className={`badge ${u.accountStatus === "ACTIVE" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-600 border-red-200"}`}>{u.accountStatus}</span></td><td className="px-4 py-3.5 text-right space-x-1.5">{u.accountStatus === "ACTIVE" ? <button
    onClick={() => handleDeactivate(u.id)}
    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
    title="Deactivate Account"
  ><XCircle className="h-4 w-4" /></button> : <button
    onClick={() => handleActivate(u.id)}
    className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors"
    title="Activate Account"
  ><CheckCircle2 className="h-4 w-4" /></button>}<button
    onClick={() => setResetModalUser(u)}
    className="p-1.5 rounded-lg text-orange-600 hover:bg-orange-50 transition-colors"
    title="Reset Password"
  ><KeyRound className="h-4 w-4" /></button></td></tr>)}</tbody></table></div>{data && data.totalPages > 1 && <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-xs"><span className="text-gray-500">Page {page + 1} of {data.totalPages}</span><div className="flex gap-2"><button
    disabled={page === 0}
    onClick={() => setPage((p) => p - 1)}
    className="btn-secondary text-xs py-1 px-3"
  >
                Previous
              </button><button
    disabled={page >= data.totalPages - 1}
    onClick={() => setPage((p) => p + 1)}
    className="btn-secondary text-xs py-1 px-3"
  >
                Next
              </button></div></div>}</div>{resetModalUser && <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"><form onSubmit={handleResetPassword} className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl"><div className="flex items-center gap-2 text-gray-900 font-bold"><ShieldAlert className="h-5 w-5 text-orange-500" /><span>Reset Password for {resetModalUser.username}</span></div><div><label className="label-text">New Password</label><input
    type="password"
    required
    minLength={6}
    value={newPassword}
    onChange={(e) => setNewPassword(e.target.value)}
    className="input-field"
    placeholder="Enter new password"
  /></div><div className="flex gap-2 pt-2"><button type="button" onClick={() => setResetModalUser(null)} className="btn-secondary flex-1">Cancel</button><button type="submit" className="btn-primary flex-1">Save Password</button></div></form></div>}</div>;
}
