// src/pages/employee/EmployeeDashboard.jsx
import { useNavigate } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout'
import StatCard from '../../components/common/StatCard'
import RequestCard from '../../components/common/RequestCard'
import EmptyState from '../../components/common/EmptyState'
import { useAuthStore } from '../../store/authStore'
import { useRequestStore } from '../../store/requestStore'
import { FilePlus, FileText, CheckCircle2, XCircle } from 'lucide-react'
import { getProgressCount } from '../../utils/helpers'

export default function EmployeeDashboard() {
  const { user } = useAuthStore()
  const { getRequestsByEmpId } = useRequestStore()
  const navigate = useNavigate()

  const myRequests = getRequestsByEmpId(user?.id)
  const active    = myRequests.filter(r => r.overallStatus === 'IN_PROGRESS' || r.overallStatus === 'PENDING')
  const approved  = myRequests.filter(r => r.overallStatus === 'APPROVED')
  const rejected  = myRequests.filter(r => r.overallStatus === 'REJECTED')

  // Count total cleared depts across all requests
  const totalCleared = myRequests.reduce((sum, r) => {
    return sum + r.departmentStatuses.filter(d => d.status === 'APPROVED').length
  }, 0)

  const latestRequest = myRequests[0]

  return (
    <AppLayout title="Chameli Devi Group of Institutions-(CDGI)">
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
          <StatCard value={myRequests.length} label="Total Requests"  icon={FileText}      accent="border-blue-400" />
          <StatCard value={active.length}     label="Active"          icon={FilePlus}       accent="border-amber-400" />
          <StatCard value={approved.length}   label="Approved"        icon={CheckCircle2}   accent="border-green-400" />
          <StatCard value={rejected.length}   label="Rejected"        icon={XCircle}        accent="border-red-400" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active request */}
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

            {active.length === 0 ? (
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
              active.map(r => <RequestCard key={r.id} request={r} linkBase="/employee" />)
            )}
          </div>

          {/* Quick actions + mini summary */}
          <div className="space-y-4">
            <h3 className="section-title">Quick Actions</h3>
            <div className="card divide-y divide-slate-100">
              <button
                onClick={() => navigate('/employee/new-request')}
                className="flex items-center gap-3 p-4 w-full text-left hover:bg-slate-50 transition-all rounded-t-2xl"
              >
                <div className="w-9 h-9 bg-accent-600/10 rounded-xl flex items-center justify-center">
                  <FilePlus size={16} className="text-accent-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-700">New Clearance Request</div>
                  <div className="text-xs text-slate-400">Start your no-dues process</div>
                </div>
              </button>
              <button
                onClick={() => navigate('/employee/requests')}
                className="flex items-center gap-3 p-4 w-full text-left hover:bg-slate-50 transition-all"
              >
                <div className="w-9 h-9 bg-blue-500/10 rounded-xl flex items-center justify-center">
                  <FileText size={16} className="text-blue-500" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-700">View All Requests</div>
                  <div className="text-xs text-slate-400">{myRequests.length} request(s) total</div>
                </div>
              </button>
              {approved.length > 0 && (
                <button
                  onClick={() => navigate('/employee/certificates')}
                  className="flex items-center gap-3 p-4 w-full text-left hover:bg-slate-50 transition-all rounded-b-2xl"
                >
                  <div className="w-9 h-9 bg-green-500/10 rounded-xl flex items-center justify-center">
                    <CheckCircle2 size={16} className="text-green-500" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-700">Download Certificate</div>
                    <div className="text-xs text-slate-400">{approved.length} certificate(s) ready</div>
                  </div>
                </button>
              )}
            </div>

            {/* Profile summary card */}
            <div className="card p-4">
              <h4 className="section-title mb-3">My Profile</h4>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                  {user?.avatar}
                </div>
                <div>
                  <div className="font-bold text-slate-800 text-sm">{user?.name}</div>
                  <div className="text-xs text-slate-500">{user?.empId}</div>
                </div>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between"><span className="text-slate-400">Designation</span><span className="font-medium text-slate-700">{user?.designation}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Department</span><span className="font-medium text-slate-700 max-w-32 text-right">{user?.department}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Email</span><span className="font-medium text-slate-700 truncate max-w-40">{user?.email}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
