// src/pages/admin/ReportsPage.jsx
import AppLayout from '../../components/layout/AppLayout'
import { useRequestStore } from '../../store/requestStore'
import StatusBadge from '../../components/common/StatusBadge'
import { formatDate } from '../../utils/helpers'
import { Download, TrendingUp, BarChart3, FileDown } from 'lucide-react'

export default function ReportsPage() {
  const { requests } = useRequestStore()

  const stats = {
    total: requests.length,
    approved: requests.filter(r => r.overallStatus === 'APPROVED').length,
    rejected: requests.filter(r => r.overallStatus === 'REJECTED').length,
    inProgress: requests.filter(r => r.overallStatus === 'IN_PROGRESS' || r.overallStatus === 'PENDING').length,
  }

  // Dept performance
  const deptStats = {}
  requests.forEach(r => {
    r.departmentStatuses.forEach(d => {
      if (!deptStats[d.deptName]) deptStats[d.deptName] = { approved: 0, rejected: 0, pending: 0 }
      if (d.status === 'APPROVED') deptStats[d.deptName].approved++
      else if (d.status === 'REJECTED') deptStats[d.deptName].rejected++
      else deptStats[d.deptName].pending++
    })
  })

  return (
    <AppLayout title="Reports & Analytics">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">System Reports</h2>
          <button className="btn-secondary flex items-center gap-2 text-sm" onClick={() => alert('CSV export would download in a real system.')}>
            <FileDown size={15} /> Export CSV
          </button>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            ['Total Requests', stats.total, 'bg-blue-500', '100%'],
            ['Approved', stats.approved, 'bg-green-500', `${Math.round(stats.approved/stats.total*100)||0}%`],
            ['In Progress', stats.inProgress, 'bg-amber-500', `${Math.round(stats.inProgress/stats.total*100)||0}%`],
            ['Rejected', stats.rejected, 'bg-red-500', `${Math.round(stats.rejected/stats.total*100)||0}%`],
          ].map(([label, val, color, pct]) => (
            <div key={label} className="card p-4">
              <div className="text-2xl font-bold text-slate-800">{val}</div>
              <div className="text-xs text-slate-500 font-semibold mt-0.5">{label}</div>
              <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${color}`} style={{ width: pct }} />
              </div>
              <div className="text-xs text-slate-400 mt-1">{pct} of total</div>
            </div>
          ))}
        </div>

        {/* Department performance */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <BarChart3 size={16} className="text-accent-600" />
            <h3 className="font-bold text-slate-800">Department Performance</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-700 text-white">
                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider">Department</th>
                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider">Approved</th>
                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider">Rejected</th>
                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider">Pending</th>
                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider">Clearance Rate</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(deptStats).map(([dept, s], i) => {
                  const total = s.approved + s.rejected + s.pending
                  const rate = total > 0 ? Math.round((s.approved / total) * 100) : 0
                  return (
                    <tr key={dept} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className="px-5 py-3 font-semibold text-slate-700">{dept}</td>
                      <td className="px-5 py-3 text-green-600 font-bold">{s.approved}</td>
                      <td className="px-5 py-3 text-red-600 font-bold">{s.rejected}</td>
                      <td className="px-5 py-3 text-amber-600 font-bold">{s.pending}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden max-w-20">
                            <div className={`h-full rounded-full ${rate >= 80 ? 'bg-green-500' : rate >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${rate}%` }} />
                          </div>
                          <span className="text-xs font-bold text-slate-600">{rate}%</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* All requests log */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <TrendingUp size={16} className="text-accent-600" />
            <h3 className="font-bold text-slate-800">All Requests Log</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-700 text-white">
                  {['Request ID', 'Employee', 'Reason', 'Submitted', 'Status'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {requests.map((r, i) => (
                  <tr key={r.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="px-5 py-3 font-mono text-xs text-slate-600">{r.id}</td>
                    <td className="px-5 py-3 font-semibold text-slate-700">{r.empName}</td>
                    <td className="px-5 py-3 text-slate-500">{r.reason}</td>
                    <td className="px-5 py-3 text-slate-500">{formatDate(r.submittedAt)}</td>
                    <td className="px-5 py-3"><StatusBadge status={r.overallStatus} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
