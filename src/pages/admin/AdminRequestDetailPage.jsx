// src/pages/admin/AdminRequestDetailPage.jsx
import { useParams, useNavigate } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout'
import ClearanceTimeline from '../../components/common/ClearanceTimeline'
import StatusBadge from '../../components/common/StatusBadge'
import { useRequestStore } from '../../store/requestStore'
import { formatDate, getProgressCount } from '../../utils/helpers'
import { ArrowLeft, User, Briefcase, Calendar, FileText } from 'lucide-react'

export default function AdminRequestDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { requests } = useRequestStore()

  const req = requests.find(r => r.id === id)
  if (!req) {
    return (
      <AppLayout title="Not Found">
        <div className="text-center py-16">
          <button onClick={() => navigate(-1)} className="btn-secondary">Go Back</button>
        </div>
      </AppLayout>
    )
  }

  const { approved, total } = getProgressCount(req.departmentStatuses)

  return (
    <AppLayout title={`Request ${req.id}`}>
      <div className="max-w-2xl mx-auto space-y-5">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft size={16} /> Back
        </button>

        <div className="card p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="font-mono text-lg font-bold text-slate-800">{req.id}</div>
              <div className="text-sm text-slate-500">{formatDate(req.submittedAt)}</div>
            </div>
            <StatusBadge status={req.overallStatus} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              [User, 'Employee', req.empName],
              [Briefcase, 'Designation', req.designation],
              [FileText, 'Reason', req.reason],
              [Calendar, 'Department', req.department],
            ].map(([Icon, label, value]) => (
              <div key={label} className="flex items-start gap-2 text-xs">
                <Icon size={13} className="text-slate-400 mt-0.5" />
                <div>
                  <div className="text-slate-400">{label}</div>
                  <div className="font-semibold text-slate-700">{value}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-500">Progress</span>
              <span className="font-bold">{approved}/{total}</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-accent-500 rounded-full"
                style={{ width: `${Math.round((approved / total) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="section-title mb-4">Department Status</h3>
          <ClearanceTimeline departmentStatuses={req.departmentStatuses} />
        </div>
      </div>
    </AppLayout>
  )
}
