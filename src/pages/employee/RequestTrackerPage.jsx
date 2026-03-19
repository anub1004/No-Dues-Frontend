// src/pages/employee/RequestTrackerPage.jsx
import { useParams, useNavigate } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout'
import ClearanceTimeline from '../../components/common/ClearanceTimeline'
import StatusBadge from '../../components/common/StatusBadge'
import { useRequestStore } from '../../store/requestStore'
import { formatDate, getProgressCount } from '../../utils/helpers'
import { ArrowLeft, Download, Calendar, User, Briefcase, FileText } from 'lucide-react'

export default function RequestTrackerPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { requests } = useRequestStore()

  const req = requests.find(r => r.id === id)

  if (!req) {
    return (
      <AppLayout title="Request Not Found">
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-lg font-bold text-slate-700">Request not found</h3>
          <button onClick={() => navigate(-1)} className="btn-secondary mt-4">Go Back</button>
        </div>
      </AppLayout>
    )
  }

  const { approved, total } = getProgressCount(req.departmentStatuses)
  const pct = Math.round((approved / total) * 100)

  return (
    <AppLayout title={`Request ${req.id}`}>
      <div className="max-w-2xl mx-auto space-y-5">
        {/* Back button */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft size={16} /> Back to Requests
        </button>

        {/* Header card */}
        <div className="card p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="font-mono text-lg font-bold text-slate-800">{req.id}</div>
              <div className="text-sm text-slate-500 mt-0.5">Submitted {formatDate(req.submittedAt)}</div>
            </div>
            <StatusBadge status={req.overallStatus} />
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs mb-4">
            {[
              [User, 'Employee', req.empName],
              [Briefcase, 'Designation', req.designation],
              [FileText, 'Reason', req.reason],
              [Calendar, 'Last Day', formatDate(req.lastWorkingDay) || '—'],
            ].map(([Icon, label, value]) => (
              <div key={label} className="flex items-start gap-2">
                <Icon size={13} className="text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-slate-400">{label}</div>
                  <div className="font-semibold text-slate-700">{value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Overall progress */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-500 font-semibold">Overall Progress</span>
              <span className="font-bold text-slate-700">{approved} of {total} departments cleared</span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  req.overallStatus === 'REJECTED' ? 'bg-red-500' :
                  req.overallStatus === 'APPROVED' ? 'bg-green-500' : 'bg-accent-500'
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="text-xs text-slate-400 mt-1">{pct}% complete</div>
          </div>
        </div>

        {/* Certificate download (if all approved) */}
        {req.overallStatus === 'APPROVED' && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <div className="font-bold text-green-800 text-sm">🎉 No-Dues Certificate Ready!</div>
              <div className="text-green-600 text-xs mt-0.5">All departments have cleared your request</div>
            </div>
            <button
              onClick={() => navigate('/employee/certificates')}
              className="btn-success flex items-center gap-2 text-sm"
            >
              <Download size={15} /> Download
            </button>
          </div>
        )}

        {/* Rejection alert */}
        {req.overallStatus === 'REJECTED' && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
            <div className="font-bold text-red-800 text-sm mb-1">❌ Request Rejected</div>
            <div className="text-red-600 text-xs">
              {req.departmentStatuses.filter(d => d.status === 'REJECTED').map(d => (
                <div key={d.deptId}><strong>{d.deptName}:</strong> {d.remarks}</div>
              ))}
            </div>
          </div>
        )}

        {/* Department-wise timeline */}
        <div className="card p-5">
          <h3 className="section-title mb-4">Department-wise Clearance Status</h3>
          <ClearanceTimeline departmentStatuses={req.departmentStatuses} />
        </div>

        {/* Documents */}
        {req.documents?.length > 0 && (
          <div className="card p-5">
            <h3 className="section-title mb-3">Attached Documents</h3>
            <div className="space-y-2">
              {req.documents.map((doc, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 rounded-xl px-3 py-2">
                  <FileText size={14} className="text-accent-600" />
                  <span className="flex-1">{doc}</span>
                  <span className="text-xs text-slate-400">PDF</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
