// src/pages/approver/PendingRequestsPage.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout'
import EmptyState from '../../components/common/EmptyState'
import { approverAPI } from '../../services/api'
import { Search, Loader2 } from 'lucide-react'

export default function PendingRequestsPage() {
  const navigate = useNavigate()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('PENDING')

  useEffect(() => {
    fetchRequests()
  }, [])

  async function fetchRequests() {
    try {
      setLoading(true)
      const data = await approverAPI.getPendingRequests()
      setRequests(data || [])
    } catch (err) {
      setError(err.message || 'Failed to load requests')
      console.error('Fetch requests error:', err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = requests.filter(r => {
    const matchSearch = r.empName?.toLowerCase().includes(search.toLowerCase()) ||
                        r.id.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'ALL' || r.overallStatus === filter
    return matchSearch && matchFilter
  })

  if (loading) {
    return (
      <AppLayout title="Pending Requests">
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="animate-spin" size={32} />
        </div>
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout title="Pending Requests">
        <div className="text-red-600 text-center p-6">
          <p>Error: {error}</p>
          <button
            onClick={fetchRequests}
            className="btn-primary mt-4"
          >
            Retry
          </button>
        </div>
      </AppLayout>
    )
  }

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
                {filtered.map(req => (
                  <div
                    key={req.id}
                    onClick={() => navigate(`/approver/requests/${req.id}`)}
                    className="grid grid-cols-1 md:grid-cols-12 gap-2 px-5 py-4 hover:bg-slate-50 cursor-pointer transition-all items-center"
                  >
                    <div className="col-span-3 flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary-600/10 rounded-lg flex items-center justify-center text-xs font-bold text-primary-600">
                        {req.empName?.charAt(0) || '?'}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-800">{req.empName}</div>
                        <div className="text-xs text-slate-400">{req.empCode}</div>
                      </div>
                    </div>
                    <div className="col-span-2 font-mono text-xs text-slate-600">{req.id}</div>
                    <div className="col-span-2 text-xs text-slate-500">{req.submittedAt}</div>
                    <div className="col-span-2 text-xs text-slate-600">{req.reason}</div>
                    <div className="col-span-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        req.overallStatus === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        req.overallStatus === 'REJECTED' ? 'bg-red-100 text-red-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {req.overallStatus}
                      </span>
                    </div>
                    <div className="col-span-1">
                      <span className="text-accent-600 text-xs font-bold">Review →</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
