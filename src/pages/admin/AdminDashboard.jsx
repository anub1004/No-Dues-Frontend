// src/pages/admin/AdminDashboard.jsx
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import StatCard from '../../components/common/StatCard'
import { useAuthStore } from '../../store/authStore'
import { adminAPI } from '../../services/api'
import { Users, FileText, CheckCircle2, Clock, TrendingUp, AlertTriangle, Loader2, RefreshCw } from 'lucide-react'

export default function AdminDashboard() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [dashboard, setDashboard] = useState(null)
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  useEffect(() => {
    fetchData()
  }, [])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      fetchData()
      setLastRefresh(new Date())
    }, 30000)

    return () => clearInterval(interval)
  }, [autoRefresh])

  async function fetchData() {
    try {
      setLoading(true)
      const dashData = await adminAPI.getDashboard()
      setDashboard(dashData)
      setRequests(dashData.recentRequests || [])
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

  const totalCount = dashboard?.total || 0
  const pendingCount = dashboard?.pending || 0
  const approvedCount = dashboard?.approved || 0
  const employeeCount = dashboard?.totalEmployees || 0

  return (
    <AppLayout title="Admin Dashboard">
      <div className="space-y-6">
        {/* Welcome */}
        <div className="bg-gradient-to-r from-slate-900 to-teal-600 rounded-lg p-6 text-white relative overflow-hidden">
          <div className="absolute right-0 bottom-0 w-40 h-40 bg-white/10 rounded-full translate-x-1/4 translate-y-1/4" />
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-white/90 text-sm">System Administrator</p>
              <h2 className="text-2xl font-bold">{user?.name}</h2>
              <p className="text-white/60 text-sm">{user?.designation} · CDGI</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-white/70 text-xs">Last Updated</p>
                <p className="text-white text-sm font-mono">{lastRefresh.toLocaleTimeString()}</p>
              </div>
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                title={autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
                className={`p-2 rounded-lg transition ${
                  autoRefresh ? 'bg-white/20 hover:bg-white/30' : 'bg-red-500/20 hover:bg-red-500/30'
                }`}
              >
                <RefreshCw size={20} className={autoRefresh ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard value={totalCount} label="Total Requests" icon={FileText} accent="border-blue-400" />
          <StatCard value={pendingCount} label="In Progress" icon={Clock} accent="border-amber-400" />
          <StatCard value={approvedCount} label="Completed" icon={CheckCircle2} accent="border-green-400" />
          <StatCard value={employeeCount} label="Total Employees" icon={Users} accent="border-purple-400" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* All requests */}
          <div className="lg:col-span-2 card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">Recent Requests</h3>
              <span className="badge bg-blue-100 text-blue-800">{totalCount} Total</span>
            </div>
            <div className="divide-y divide-slate-100">
              {requests.length === 0 ? (
                <div className="py-8 text-center text-slate-400">
                  <p>No recent requests</p>
                </div>
              ) : (
                requests.map(req => (
                  <div
                    key={req.id}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 cursor-pointer transition-all"
                    onClick={() => navigate(`/admin/requests/${req.id}`)}
                  >
                    <div className="w-8 h-8 bg-primary-600/10 rounded-lg flex items-center justify-center text-xs font-bold text-primary-600">
                      {req.empName?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-800">{req.empName}</div>
                      <div className="text-xs text-slate-400 font-mono">{req.id} · {req.reason}</div>
                    </div>
                    <div className="text-xs text-slate-400 hidden sm:block">{req.submittedAt}</div>
                    <span className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${
                      req.overallStatus === 'APPROVED' ? 'bg-green-100 text-green-800' :
                      req.overallStatus === 'REJECTED' ? 'bg-red-100 text-red-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {req.overallStatus}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sidebar info */}
          <div className="space-y-4">
            {/* Summary */}
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={15} className="text-blue-500" />
                <h3 className="section-title">Summary</h3>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">Total Requests</span>
                  <span className="font-bold">{totalCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Pending</span>
                  <span className="font-bold text-amber-600">{pendingCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Approved</span>
                  <span className="font-bold text-green-600">{approvedCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Employees</span>
                  <span className="font-bold text-purple-600">{employeeCount}</span>
                </div>
              </div>
            </div>

            {/* Quick admin actions */}
            <div className="card p-4">
              <h3 className="section-title mb-3">Quick Actions</h3>
              <div className="space-y-2">
                {[
                  { label: 'Manage Employees', to: '/admin/employees', icon: Users },
                  { label: 'View Reports', to: '/admin/reports', icon: TrendingUp },
                  { label: 'Audit Logs', to: '/admin/audit', icon: FileText },
                ].map(({ label, to, icon: Icon }) => (
                  <button
                    key={to}
                    onClick={() => navigate(to)}
                    className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-all text-left border border-slate-100"
                  >
                    <Icon size={15} className="text-accent-600" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
