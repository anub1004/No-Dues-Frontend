// src/pages/employee/EmployeeDashboard.jsx
import { useNavigate } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout'
import StatCard from '../../components/common/StatCard'
import RequestCard from '../../components/common/RequestCard'
import EmptyState from '../../components/common/EmptyState'
import { useAuthStore } from '../../store/authStore'
import { employeeAPI } from '../../services/api'
import { FilePlus, FileText, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function EmployeeDashboard() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [dashboard, setDashboard] = useState(null)
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchData = async () => {
    try {
      setLoading(true)
      setError('')
      const [dashboardData, requestsData] = await Promise.all([
        employeeAPI.getDashboard(),
        employeeAPI.getMyRequests()
      ])
      setDashboard(dashboardData)
      setRequests(requestsData)
    } catch (err) {
      const errorMsg = err.data?.message || err.message || 'Failed to load dashboard'
      setError(errorMsg)
      console.error('Dashboard error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.id) {
      fetchData()
    }
  }, [user?.id])

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
    const isAuthError = error.includes('session') || error.includes('expired') || error.includes('401') || error.includes('403')

    return (
      <AppLayout title="Error">
        <div className="max-w-md mx-auto text-center p-8 mt-20">
          <div className="text-4xl mb-4">{isAuthError ? '🔐' : '⚠️'}</div>
          <h2 className="text-lg font-bold text-slate-800 mb-2">
            {isAuthError ? 'Session Expired' : 'Failed to load dashboard'}
          </h2>
          <p className="text-sm text-slate-600 mb-4 bg-slate-50 p-3 rounded border border-slate-200">
            {error}
          </p>
          <div className="space-y-2">
            {!isAuthError && (
              <button
                onClick={fetchData}
                className="btn-primary w-full"
              >
                Try Again
              </button>
            )}
            <button
              onClick={() => {
                localStorage.removeItem('token')
                window.location.href = '/login'
              }}
              className={isAuthError ? 'btn-primary w-full' : 'btn-secondary w-full'}
            >
              Back to Login
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-4">
            💡 Tip: If the error persists, try refreshing the page (Ctrl+F5 or Cmd+Shift+R)
          </p>
        </div>
      </AppLayout>
    )
  }

  const active = dashboard?.active || 0
  const approved = dashboard?.approved || 0
  const rejected = dashboard?.rejected || 0
  const total = dashboard?.totalRequests || 0
  const activeRequestsList = requests.filter(r => r.overallStatus === 'PENDING' || r.overallStatus === 'IN_PROGRESS')

  return (
    <AppLayout title="Employee Dashboard">
      <div className="space-y-6">
        {/* Welcome banner */}
        <div className="bg-gradient-to-r from-slate-900 to-teal-600 rounded-lg p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="relative">
            <p className="text-white/70 text-sm mb-1">Welcome back,</p>
            <h2 className="text-white text-2xl font-bold mb-1">{user?.name} 👋</h2>
            <p className="text-white/60 text-sm">{user?.designation} · {user?.department}</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard value={total} label="Total Requests" icon={FileText} accent="border-blue-400" />
          <StatCard value={active} label="Active" icon={FilePlus} accent="border-amber-400" />
          <StatCard value={approved} label="Approved" icon={CheckCircle2} accent="border-green-400" />
          <StatCard value={rejected} label="Rejected" icon={XCircle} accent="border-red-400" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active requests */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="section-title">Active Requests</h3>
              <button
                onClick={() => navigate('/employee/requests')}
                className="text-xs text-accent-600 font-semibold hover:underline"
              >
                View all →
              </button>
            </div>

            {activeRequestsList.length === 0 ? (
              <div className="card">
                <EmptyState
                  icon="📋"
                  title="No active requests"
                  description="Submit a new clearance request to get started"
                  action={
                    <button
                      onClick={() => navigate('/employee/new-request')}
                      className="btn-primary"
                    >
                      + New Request
                    </button>
                  }
                />
              </div>
            ) : (
              activeRequestsList.slice(0, 3).map(r => (
                <div key={r.id} className="card p-4 hover:shadow-md cursor-pointer" onClick={() => navigate(`/employee/requests/${r.id}`)}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-slate-800">{r.id}</p>
                      <p className="text-sm text-slate-600">{r.reason}</p>
                      <p className="text-xs text-slate-400 mt-1">{r.submittedAt}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      r.overallStatus === 'APPROVED' ? 'bg-green-100 text-green-800' :
                      r.overallStatus === 'REJECTED' ? 'bg-red-100 text-red-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {r.overallStatus}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Quick actions */}
          <div className="space-y-4">
            <h3 className="section-title">Quick Actions</h3>
            <div className="card divide-y divide-slate-100">
              <button
                onClick={() => navigate('/employee/new-request')}
                className="flex items-center gap-3 p-4 w-full text-left hover:bg-slate-50 transition-all rounded-t-2xl"
              >
                <FilePlus size={16} className="text-accent-600" />
                <div>
                  <div className="text-sm font-semibold">New Request</div>
                  <div className="text-xs text-slate-400">Start clearance</div>
                </div>
              </button>
              <button
                onClick={() => navigate('/employee/requests')}
                className="flex items-center gap-3 p-4 w-full text-left hover:bg-slate-50 transition-all"
              >
                <FileText size={16} className="text-blue-500" />
                <div>
                  <div className="text-sm font-semibold">My Requests</div>
                  <div className="text-xs text-slate-400">{total} total</div>
                </div>
              </button>
              {approved > 0 && (
                <button
                  onClick={() => navigate('/employee/certificates')}
                  className="flex items-center gap-3 p-4 w-full text-left hover:bg-slate-50 transition-all rounded-b-2xl"
                >
                  <CheckCircle2 size={16} className="text-green-500" />
                  <div>
                    <div className="text-sm font-semibold">Certificates</div>
                    <div className="text-xs text-slate-400">{approved} ready</div>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
