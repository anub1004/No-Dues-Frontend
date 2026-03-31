// src/pages/admin/AuditPage.jsx
import { useEffect, useState } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import { adminAPI } from '../../services/api'
import { Shield, Loader2, AlertCircle } from 'lucide-react'

export default function AuditPage() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAuditLogs()
  }, [])

  async function fetchAuditLogs() {
    try {
      setLoading(true)
      const data = await adminAPI.getAuditLogs()
      setLogs(data || [])
      setError('')
    } catch (err) {
      setError(err.message || 'Failed to load audit logs')
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const typeColor = {
    info: 'bg-blue-100 text-blue-700',
    success: 'bg-green-100 text-green-700',
    danger: 'bg-red-100 text-red-700',
    warning: 'bg-amber-100 text-amber-700',
  }

  if (loading) {
    return (
      <AppLayout title="Audit Logs">
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="animate-spin" size={32} />
        </div>
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout title="Audit Logs">
        <div className="text-red-600 text-center p-6">
          <AlertCircle className="inline-block mb-2" size={40} />
          <p>Error: {error}</p>
          <button onClick={fetchAuditLogs} className="btn-primary mt-4">
            Retry
          </button>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title="Audit Logs">
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="flex items-center gap-2">
          <Shield size={18} className="text-accent-600" />
          <h2 className="text-lg font-bold text-slate-800">System Audit Trail</h2>
        </div>

        <div className="card overflow-hidden">
          <div className="hidden md:grid grid-cols-12 gap-2 px-5 py-3 bg-slate-700 text-white text-xs font-bold uppercase tracking-wider">
            <div className="col-span-2">Date</div>
            <div className="col-span-3">Action</div>
            <div className="col-span-2">Actor</div>
            <div className="col-span-5">Details</div>
          </div>
          <div className="divide-y divide-slate-100">
            {logs.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                No audit logs available
              </div>
            ) : (
              logs.map((log, i) => (
                <div
                  key={log.id}
                  className={`grid grid-cols-1 md:grid-cols-12 gap-2 px-5 py-3 items-center ${
                    i % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                  }`}
                >
                  <div className="col-span-2 text-xs text-slate-400 font-mono">{log.timestamp || log.time}</div>
                  <div className="col-span-3">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        typeColor[log.type] || typeColor.info
                      }`}
                    >
                      {log.action}
                    </span>
                  </div>
                  <div className="col-span-2 text-xs font-semibold text-slate-700">{log.actor || 'System'}</div>
                  <div className="col-span-5 text-xs text-slate-500">{log.description || log.detail}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {logs.length > 0 && (
          <div className="text-xs text-slate-400 text-center">
            Showing {logs.length} audit log entries
          </div>
        )}
      </div>
    </AppLayout>
  )
}
