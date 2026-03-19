// src/components/common/RequestCard.jsx
import { useNavigate } from 'react-router-dom'
import StatusBadge from './StatusBadge'
import { formatDate, getProgressCount } from '../../utils/helpers'
import { FileText, Calendar, ChevronRight } from 'lucide-react'

export default function RequestCard({ request, linkBase = '/employee' }) {
  const navigate = useNavigate()
  const { approved, total } = getProgressCount(request.departmentStatuses)
  const pct = Math.round((approved / total) * 100)

  return (
    <div
      onClick={() => navigate(`${linkBase}/requests/${request.id}`)}
      className="card p-5 cursor-pointer hover:shadow-md hover:border-accent-300 transition-all duration-200 group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-primary-600/10 rounded-xl flex items-center justify-center">
            <FileText size={16} className="text-primary-600" />
          </div>
          <div>
            <div className="font-mono text-sm font-bold text-slate-700">{request.id}</div>
            <div className="text-xs text-slate-400">{request.reason}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={request.overallStatus} />
          <ChevronRight size={16} className="text-slate-300 group-hover:text-accent-500 transition-all" />
        </div>
      </div>

      <div className="flex items-center gap-1 text-xs text-slate-400 mb-3">
        <Calendar size={12} />
        <span>Submitted {formatDate(request.submittedAt)}</span>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-slate-500 font-medium">Clearance Progress</span>
          <span className="font-bold text-slate-600">{approved}/{total} Depts</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              request.overallStatus === 'REJECTED' ? 'bg-red-400' :
              request.overallStatus === 'APPROVED' ? 'bg-green-500' : 'bg-accent-500'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  )
}
