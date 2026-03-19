// src/pages/admin/AuditPage.jsx
import AppLayout from '../../components/layout/AppLayout'
import { useRequestStore } from '../../store/requestStore'
import { formatDate } from '../../utils/helpers'
import { Shield } from 'lucide-react'

export default function AuditPage() {
  const { requests } = useRequestStore()

  // Generate audit log entries from request data
  const logs = []
  requests.forEach(req => {
    logs.push({
      id: `${req.id}-sub`,
      time: req.submittedAt,
      action: 'REQUEST_SUBMITTED',
      actor: req.empName,
      detail: `Clearance request ${req.id} submitted`,
      type: 'info',
    })
    req.departmentStatuses.forEach(d => {
      if (d.approvedAt) {
        logs.push({
          id: `${req.id}-${d.deptId}`,
          time: d.approvedAt,
          action: d.status === 'APPROVED' ? 'DEPT_APPROVED' : 'DEPT_REJECTED',
          actor: d.approvedBy || 'System',
          detail: `${d.deptName} ${d.status.toLowerCase()} for ${req.empName} (${req.id})`,
          type: d.status === 'APPROVED' ? 'success' : 'danger',
        })
      }
    })
  })

  logs.sort((a, b) => b.time?.localeCompare(a.time))

  const typeColor = {
    info:    'bg-blue-100 text-blue-700',
    success: 'bg-green-100 text-green-700',
    danger:  'bg-red-100 text-red-700',
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
            {logs.map((log, i) => (
              <div key={log.id} className={`grid grid-cols-1 md:grid-cols-12 gap-2 px-5 py-3 items-center ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                <div className="col-span-2 text-xs text-slate-400 font-mono">{formatDate(log.time)}</div>
                <div className="col-span-3">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${typeColor[log.type] || typeColor.info}`}>
                    {log.action}
                  </span>
                </div>
                <div className="col-span-2 text-xs font-semibold text-slate-700">{log.actor}</div>
                <div className="col-span-5 text-xs text-slate-500">{log.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
