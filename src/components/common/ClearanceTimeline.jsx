// src/components/common/ClearanceTimeline.jsx
import { formatDate } from '../../utils/helpers'
import { CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react'

function DeptIcon({ status }) {
  switch (status) {
    case 'APPROVED':
      return <CheckCircle2 size={20} className="text-green-500 flex-shrink-0" />
    case 'REJECTED':
      return <XCircle size={20} className="text-red-500 flex-shrink-0" />
    case 'IN_PROGRESS':
      return <Loader2 size={20} className="text-blue-500 animate-spin flex-shrink-0" />
    default:
      return <Clock size={20} className="text-slate-300 flex-shrink-0" />
  }
}

function rowBg(status) {
  switch (status) {
    case 'APPROVED':    return 'bg-green-50 border-green-200'
    case 'REJECTED':    return 'bg-red-50 border-red-200'
    case 'IN_PROGRESS': return 'bg-blue-50 border-blue-200'
    default:            return 'bg-slate-50 border-slate-200'
  }
}

export default function ClearanceTimeline({ departmentStatuses = [] }) {
  return (
    <div className="space-y-2">
      {departmentStatuses.map((ds) => (
        <div
          key={ds.deptId}
          className={`flex items-center gap-4 p-3.5 rounded-xl border ${rowBg(ds.status)} transition-all`}
        >
          <DeptIcon status={ds.status} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-slate-700">{ds.deptName}</span>
              <span className="text-xs text-slate-400 flex-shrink-0">{formatDate(ds.approvedAt)}</span>
            </div>
            {ds.remarks && (
              <p className="text-xs text-slate-500 mt-0.5 truncate">{ds.remarks}</p>
            )}
            {ds.approvedBy && (
              <p className="text-xs text-slate-400">By {ds.approvedBy}</p>
            )}
          </div>
          <div className={`text-xs font-bold flex-shrink-0 ${
            ds.status === 'APPROVED' ? 'text-green-600' :
            ds.status === 'REJECTED' ? 'text-red-600' :
            ds.status === 'IN_PROGRESS' ? 'text-blue-600' : 'text-slate-400'
          }`}>
            {ds.status === 'APPROVED' ? 'Cleared' :
             ds.status === 'REJECTED' ? 'Rejected' :
             ds.status === 'IN_PROGRESS' ? 'In Review' : 'Awaiting'}
          </div>
        </div>
      ))}
    </div>
  )
}
