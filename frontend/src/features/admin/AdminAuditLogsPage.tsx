import { useEffect, useState } from 'react';
import { AuditService } from '@/features/admin/audit.service';
import type { AuditLog, Page } from '@/common/types';
import { ShieldCheck, RotateCcw } from 'lucide-react';

export default function AdminAuditLogsPage() {
  const [data, setData] = useState<Page<AuditLog> | null>(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');

  const loadLogs = async (p = 0) => {
    setLoading(true);
    try {
      const res = await AuditService.getLogs(actionFilter, p, 15);
      setData(res);
    } catch (err: any) {
      alert(err.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadLogs(page); }, [page, actionFilter]);

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
            <ShieldCheck className="h-6 w-6 text-orange-500" /> Administrative Audit Trail
          </h1>
          <p className="text-sm text-gray-500 mt-1">Permanent log of all administrative system actions and security events.</p>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Filter by action type..."
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="input-field text-xs py-2 w-48"
          />
          <button
            onClick={() => loadLogs(0)}
            className="btn-secondary text-xs px-3 py-2 flex items-center gap-1"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Refresh
          </button>
        </div>
      </div>

      <div className="card p-0 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-orange-50/50 border-b border-orange-100 text-gray-500 font-semibold uppercase tracking-wider">
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Administrator</th>
                <th className="px-4 py-3">Action Type</th>
                <th className="px-4 py-3">Target Entity</th>
                <th className="px-4 py-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-400">Loading audit records...</td>
                </tr>
              ) : !data || data.content.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-400">No audit logs recorded yet.</td>
                </tr>
              ) : (
                data.content.map((log) => (
                  <tr key={log.id} className="hover:bg-orange-50/30 transition-colors">
                    <td className="px-4 py-3.5 text-gray-500 font-mono whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-gray-900">
                      {log.adminUsername} <span className="text-[10px] text-gray-400 font-normal">(ID #{log.adminId})</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="badge bg-orange-50 text-orange-700 border-orange-200 font-mono text-[10px]">
                        {log.actionType}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-medium text-gray-800">{log.targetEntity}</td>
                    <td className="px-4 py-3.5 text-gray-600 max-w-xs truncate">{log.details || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-xs">
            <span className="text-gray-500">Page {page + 1} of {data.totalPages}</span>
            <div className="flex gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
                className="btn-secondary text-xs py-1 px-3"
              >
                Previous
              </button>
              <button
                disabled={page >= data.totalPages - 1}
                onClick={() => setPage(p => p + 1)}
                className="btn-secondary text-xs py-1 px-3"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
