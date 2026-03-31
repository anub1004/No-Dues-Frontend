// src/pages/admin/ReportsPage.jsx
import { useEffect, useState } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import { adminAPI } from '../../services/api'
import { Download, TrendingUp, BarChart3, FileDown, Loader2, AlertCircle, RefreshCw } from 'lucide-react'

export default function ReportsPage() {
  const [reports, setReports] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [exporting, setExporting] = useState(false)
  const [exportSuccess, setExportSuccess] = useState('')

  useEffect(() => {
    fetchReports()
  }, [])

  async function fetchReports() {
    try {
      setLoading(true)
      const data = await adminAPI.getReports()
      setReports(data)
      setError('')
    } catch (err) {
      setError(err.message || 'Failed to load reports')
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleExport(type) {
    try {
      setExporting(true)
      const endpoint = `/api/export/${type}/csv`
      const token = localStorage.getItem('token')

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Export failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${type}_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      setExportSuccess(`${type} exported successfully!`)
      setTimeout(() => setExportSuccess(''), 3000)
    } catch (err) {
      setError('Export failed: ' + err.message)
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return (
      <AppLayout title="Reports & Analytics">
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="animate-spin" size={32} />
        </div>
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout title="Reports & Analytics">
        <div className="text-red-600 text-center p-6">
          <AlertCircle className="inline-block mb-2" size={40} />
          <p>Error: {error}</p>
          <button onClick={fetchReports} className="btn-primary mt-4">
            Retry
          </button>
        </div>
      </AppLayout>
    )
  }

  const stats = {
    total: reports?.stats?.total || 0,
    approved: reports?.stats?.approved || 0,
    rejected: reports?.stats?.rejected || 0,
    inProgress: reports?.stats?.inProgress || 0,
  }

  const deptStats = reports?.deptStats || []
  const requestsLog = reports?.allRequests || []

  return (
    <AppLayout title="Reports & Analytics">
      <div className="space-y-6">
        {exportSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
            <span className="text-sm font-medium">{exportSuccess}</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">System Reports</h2>
          <div className="flex gap-2">
            <button
              className="btn-secondary flex items-center gap-2 text-sm"
              onClick={fetchReports}
              disabled={loading}
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
            <div className="relative inline-block">
              <button
                className="btn-secondary flex items-center gap-2 text-sm"
                disabled={exporting}
              >
                <FileDown size={15} /> Export
              </button>
              <div className="hidden group-hover:block absolute right-0 mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-slate-50 text-sm"
                  onClick={() => handleExport('requests')}
                  disabled={exporting}
                >
                  📊 Export Requests
                </button>
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-slate-50 text-sm"
                  onClick={() => handleExport('analytics')}
                  disabled={exporting}
                >
                  📈 Export Analytics
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            ['Total Requests', stats.total, 'bg-blue-500', '100%'],
            ['Approved', stats.approved, 'bg-green-500', `${stats.total > 0 ? Math.round(stats.approved / stats.total * 100) : 0}%`],
            ['In Progress', stats.inProgress, 'bg-amber-500', `${stats.total > 0 ? Math.round(stats.inProgress / stats.total * 100) : 0}%`],
            ['Rejected', stats.rejected, 'bg-red-500', `${stats.total > 0 ? Math.round(stats.rejected / stats.total * 100) : 0}%`],
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
                {deptStats.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-3 text-center text-slate-400">
                      No department data available
                    </td>
                  </tr>
                ) : (
                  deptStats.map((s, i) => {
                    const total = s.approved + s.rejected + s.pending
                    const rate = total > 0 ? Math.round((s.approved / total) * 100) : 0
                    return (
                      <tr key={s.deptName} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                        <td className="px-5 py-3 font-semibold text-slate-700">{s.deptName}</td>
                        <td className="px-5 py-3 text-green-600 font-bold">{s.approved}</td>
                        <td className="px-5 py-3 text-red-600 font-bold">{s.rejected}</td>
                        <td className="px-5 py-3 text-amber-600 font-bold">{s.pending}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden max-w-20">
                              <div
                                className={`h-full rounded-full ${
                                  rate >= 80 ? 'bg-green-500' : rate >= 50 ? 'bg-amber-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${rate}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold text-slate-600">{rate}%</span>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* All requests log */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <TrendingUp size={16} className="text-accent-600" />
            <h3 className="font-bold text-slate-800">Recent Requests Log</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-700 text-white">
                  {['Request ID', 'Employee', 'Reason', 'Submitted', 'Status'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {requestsLog.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-3 text-center text-slate-400">
                      No requests available
                    </td>
                  </tr>
                ) : (
                  requestsLog.map((r, i) => (
                    <tr key={r.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className="px-5 py-3 font-mono text-xs text-slate-600">{r.id}</td>
                      <td className="px-5 py-3 font-semibold text-slate-700">{r.empName}</td>
                      <td className="px-5 py-3 text-slate-500">{r.reason}</td>
                      <td className="px-5 py-3 text-slate-500">{r.submittedAt}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          r.overallStatus === 'APPROVED' ? 'bg-green-100 text-green-800' :
                          r.overallStatus === 'REJECTED' ? 'bg-red-100 text-red-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {r.overallStatus}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
