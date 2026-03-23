// src/pages/admin/AdminDashboard.jsx
import { useNavigate } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout'
import StatCard from '../../components/common/StatCard'
import StatusBadge from '../../components/common/StatusBadge'
import { useAuthStore } from '../../store/authStore'
import { useRequestStore } from '../../store/requestStore'
import { DEMO_USERS } from '../../constants/mockData'
import { formatDate } from '../../utils/helpers'
import { Users, FileText, CheckCircle2, Clock, TrendingUp, AlertTriangle } from 'lucide-react'

export default function AdminDashboard() {
  const { user } = useAuthStore()
  const { requests } = useRequestStore()
  const navigate = useNavigate()

  const total    = requests.length
  const pending  = requests.filter(r => r.overallStatus === 'PENDING' || r.overallStatus === 'IN_PROGRESS').length
  const approved = requests.filter(r => r.overallStatus === 'APPROVED').length
  const rejected = requests.filter(r => r.overallStatus === 'REJECTED').length

  // Dept bottlenecks: count pending per dept
  const deptPending = {}
  requests.forEach(r => {
    r.departmentStatuses.forEach(d => {
      if (d.status === 'PENDING') {
        deptPending[d.deptName] = (deptPending[d.deptName] || 0) + 1
      }
    })
  })
  const bottlenecks = Object.entries(deptPending)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  return (
    <AppLayout title="Admin Dashboard">
      <div className="space-y-6">
        {/* Welcome */}
        <div className="bg-gradient-to-r from-slate-900 to-teal-600 rounded-lg p-6 text-white relative overflow-hidden">
          <div className="absolute right-0 bottom-0 w-40 h-40 bg-white/10 rounded-full translate-x-1/4 translate-y-1/4" />
          <p className="text-white/70 text-sm">System Administrator</p>
          <h2 className="text-2xl font-bold">{user?.name}</h2>
          <p className="text-white/60 text-sm">{user?.designation} · CDGI</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard value={total}    label="Total Requests" icon={FileText}    accent="border-blue-400" />
          <StatCard value={pending}  label="In Progress"    icon={Clock}       accent="border-amber-400" />
          <StatCard value={approved} label="Completed"      icon={CheckCircle2} accent="border-green-400" />
          <StatCard value={DEMO_USERS.filter(u=>u.role==='EMPLOYEE').length} label="Total Employees" icon={Users} accent="border-purple-400" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* All requests */}
          <div className="lg:col-span-2 card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">All Clearance Requests</h3>
              <span className="badge badge-pending">{total} Total</span>
            </div>
            <div className="divide-y divide-slate-100">
              {requests.map(req => (
                <div
                  key={req.id}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 cursor-pointer transition-all"
                  onClick={() => navigate(`/admin/requests/${req.id}`)}
                >
                  <div className="w-8 h-8 bg-primary-600/10 rounded-lg flex items-center justify-center text-xs font-bold text-primary-600">
                    {req.empName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-800">{req.empName}</div>
                    <div className="text-xs text-slate-400 font-mono">{req.id} · {req.reason}</div>
                  </div>
                  <div className="text-xs text-slate-400 hidden sm:block">{formatDate(req.submittedAt)}</div>
                  <StatusBadge status={req.overallStatus} />
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar info */}
          <div className="space-y-4">
            {/* Bottlenecks */}
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={15} className="text-amber-500" />
                <h3 className="section-title">Dept Bottlenecks</h3>
              </div>
              {bottlenecks.length === 0 ? (
                <div className="text-xs text-slate-400 text-center py-3">No pending items 🎉</div>
              ) : (
                <div className="space-y-2">
                  {bottlenecks.map(([dept, count]) => (
                    <div key={dept} className="flex items-center justify-between">
                      <span className="text-xs text-slate-600 truncate">{dept}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        count >= 3 ? 'bg-red-100 text-red-700' : count >= 2 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                      }`}>{count} pending</span>
                    </div>
                  ))}
                </div>
              )}
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
