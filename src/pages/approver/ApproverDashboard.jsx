// src/pages/approver/ApproverDashboard.jsx
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import StatCard from '../../components/common/StatCard'
import { useAuthStore } from '../../store/authStore'
import { approverAPI } from '../../services/api'
import { ClipboardList, CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react'

export default function ApproverDashboard() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [dashboard, setDashboard] = useState(null)
  const [pending, setPending] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      setLoading(true)
      const [dashData, pendingData] = await Promise.all([
        approverAPI.getDashboard(),
        approverAPI.getPendingRequests()
      ])
      setDashboard(dashData)
      setPending(pendingData || [])
    } catch (err) {
      setError(err.message || 'Failed to load dashboard')
      console.error('Dashboard error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AppLayout title="Loading Dashboard...">
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="animate-spin" size={32} />
        </div>
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout title="Error">
        <div className="text-red-600 text-center p-6">
          <p>Error: {error}</p>
          <button
            onClick={fetchData}
            className="btn-primary mt-4"
          >
            Retry
          </button>
        </div>
      </AppLayout>
    )
  }

  const totalCount = dashboard?.totalReceived || 0
  const pendingCount = dashboard?.pendingCount || 0
  const approvedCount = dashboard?.approvedCount || 0
  const rejectedCount = dashboard?.rejectedCount || 0

  return (
    <AppLayout title="Department Dashboard">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-teal-600 rounded-lg p-6 text-white">
          <p className="text-white/70 text-sm">Welcome,</p>
          <h2 className="text-2xl text-white/70 font-bold">{user?.name} 👋</h2>
          <p className="text-white/60 text-sm mt-1">{user?.designation} · {user?.department}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard value={totalCount} label="Total Received" icon={ClipboardList} accent="border-blue-400" />
          <StatCard value={pendingCount} label="Pending Action" icon={Clock} accent="border-amber-400" />
          <StatCard value={approvedCount} label="Approved" icon={CheckCircle2} accent="border-green-400" />
          <StatCard value={rejectedCount} label="Rejected" icon={XCircle} accent="border-red-400" />
        </div>

        {/* Pending requests table */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-800">Pending Approvals</h3>
            <button
              onClick={() => navigate('/approver/pending')}
              className="text-xs text-accent-600 font-semibold hover:underline"
            >
              View all →
            </button>
          </div>

          {pending.length === 0 ? (
            <div className="py-10 text-center">
              <div className="text-3xl mb-2">✅</div>
              <div className="text-sm font-semibold text-slate-600">All caught up!</div>
              <div className="text-xs text-slate-400">No pending requests</div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {pending.slice(0, 5).map(req => (
                <div
                  key={req.id}
                  onClick={() => navigate(`/approver/requests/${req.id}`)}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 cursor-pointer transition-all"
                >
                  <div className="w-9 h-9 bg-primary-600/10 rounded-xl flex items-center justify-center text-xs font-bold text-primary-600">
                    {req.empName?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-800">{req.empName}</div>
                    <div className="text-xs text-slate-400">{req.empCode} · {req.designation}</div>
                  </div>
                  <div className="text-xs text-slate-400 hidden sm:block">{req.submittedAt}</div>
                  <div className="font-mono text-xs text-slate-500 hidden md:block">{req.id}</div>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    req.overallStatus === 'APPROVED' ? 'bg-green-100 text-green-800' :
                    req.overallStatus === 'REJECTED' ? 'bg-red-100 text-red-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {req.overallStatus}
                  </span>
                  <span className="text-accent-600 text-xs font-bold">Review →</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
