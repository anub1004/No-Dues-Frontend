// src/pages/approver/PendingRequestsPage.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout'
import StatusBadge from '../../components/common/StatusBadge'
import EmptyState from '../../components/common/EmptyState'
import { useAuthStore } from '../../store/authStore'
import { useRequestStore } from '../../store/requestStore'
import { formatDate } from '../../utils/helpers'
import { Search } from 'lucide-react'

export default function PendingRequestsPage() {
  const { user } = useAuthStore()
  const { getRequestsByDeptId, getPendingForDept } = useRequestStore()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('PENDING')

  const deptId = user?.departmentId
  const allRequests = getRequestsByDeptId(deptId)

  const filtered = allRequests.filter(r => {
    const myStatus = r.departmentStatuses.find(d => d.deptId === deptId)?.status
    const matchSearch = r.empName.toLowerCase().includes(search.toLowerCase()) ||
                        r.id.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'ALL' || myStatus === filter
    return matchSearch && matchFilter
  })

  return (
    <AppLayout title="Pending Requests">
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or request ID..."
              className="input-field pl-9"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  filter === s ? 'bg-primary-600 text-white' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          {filtered.length === 0 ? (
            <EmptyState icon="📭" title="No requests found" description="Try adjusting your search or filter" />
          ) : (
            <>
              <div className="hidden md:grid grid-cols-12 gap-2 px-5 py-3 bg-slate-700 text-white text-xs font-bold uppercase tracking-wider">
                <div className="col-span-3">Employee</div>
                <div className="col-span-2">Request ID</div>
                <div className="col-span-2">Submitted</div>
                <div className="col-span-2">Reason</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-1">Action</div>
              </div>
              <div className="divide-y divide-slate-100">
                {filtered.map(req => {
                  const myStatus = req.departmentStatuses.find(d => d.deptId === deptId)?.status
                  return (
                    <div
                      key={req.id}
                      onClick={() => navigate(`/approver/requests/${req.id}`)}
                      className="grid grid-cols-1 md:grid-cols-12 gap-2 px-5 py-4 hover:bg-slate-50 cursor-pointer transition-all items-center"
                    >
                      <div className="col-span-3 flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary-600/10 rounded-lg flex items-center justify-center text-xs font-bold text-primary-600">
                          {req.empName.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-800">{req.empName}</div>
                          <div className="text-xs text-slate-400">{req.empCode}</div>
                        </div>
                      </div>
                      <div className="col-span-2 font-mono text-xs text-slate-600">{req.id}</div>
                      <div className="col-span-2 text-xs text-slate-500">{formatDate(req.submittedAt)}</div>
                      <div className="col-span-2 text-xs text-slate-600">{req.reason}</div>
                      <div className="col-span-2"><StatusBadge status={myStatus} /></div>
                      <div className="col-span-1">
                        <span className="text-accent-600 text-xs font-bold">Review →</span>
                      </div>
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
