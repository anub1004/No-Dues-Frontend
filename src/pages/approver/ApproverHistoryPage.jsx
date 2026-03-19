// src/pages/approver/ApproverHistoryPage.jsx
import AppLayout from '../../components/layout/AppLayout'
import StatusBadge from '../../components/common/StatusBadge'
import { useAuthStore } from '../../store/authStore'
import { useRequestStore } from '../../store/requestStore'
import { formatDate } from '../../utils/helpers'
import { useNavigate } from 'react-router-dom'
import EmptyState from '../../components/common/EmptyState'

export default function ApproverHistoryPage() {
  const { user } = useAuthStore()
  const { getRequestsByDeptId } = useRequestStore()
  const navigate = useNavigate()
  const deptId = user?.departmentId

  const acted = getRequestsByDeptId(deptId).filter(r => {
    const d = r.departmentStatuses.find(d => d.deptId === deptId)
    return d?.status !== 'PENDING'
  })

  return (
    <AppLayout title="Approval History">
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-800">My Approval History</h2>
        <div className="card overflow-hidden">
          {acted.length === 0 ? (
            <EmptyState icon="📋" title="No history yet" description="Actions you take on requests will appear here." />
          ) : (
            <>
              <div className="hidden md:grid grid-cols-12 gap-2 px-5 py-3 bg-slate-700 text-white text-xs font-bold uppercase tracking-wider">
                <div className="col-span-3">Employee</div>
                <div className="col-span-2">Request ID</div>
                <div className="col-span-2">Submitted</div>
                <div className="col-span-2">My Decision</div>
                <div className="col-span-3">Remarks</div>
              </div>
              <div className="divide-y divide-slate-100">
                {acted.map(req => {
                  const myDept = req.departmentStatuses.find(d => d.deptId === deptId)
                  return (
                    <div
                      key={req.id}
                      onClick={() => navigate(`/approver/requests/${req.id}`)}
                      className="grid grid-cols-1 md:grid-cols-12 gap-2 px-5 py-3.5 hover:bg-slate-50 cursor-pointer transition-all items-center"
                    >
                      <div className="col-span-3 text-sm font-semibold text-slate-800">{req.empName}</div>
                      <div className="col-span-2 font-mono text-xs text-slate-600">{req.id}</div>
                      <div className="col-span-2 text-xs text-slate-500">{formatDate(req.submittedAt)}</div>
                      <div className="col-span-2"><StatusBadge status={myDept?.status} /></div>
                      <div className="col-span-3 text-xs text-slate-500 truncate">{myDept?.remarks || '—'}</div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
