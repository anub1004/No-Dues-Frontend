// src/pages/approver/ApproverHistoryPage.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout'
import EmptyState from '../../components/common/EmptyState'
import { approverAPI } from '../../services/api'
import { Loader2 } from 'lucide-react'

export default function ApproverHistoryPage() {
  const navigate = useNavigate()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchHistory()
  }, [])

  async function fetchHistory() {
    try {
      setLoading(true)
      const data = await approverAPI.getHistory()
      setHistory(data || [])
    } catch (err) {
      setError(err.message || 'Failed to load history')
      console.error('Fetch history error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AppLayout title="Approval History">
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="animate-spin" size={32} />
        </div>
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout title="Approval History">
        <div className="text-red-600 text-center p-6">
          <p>Error: {error}</p>
          <button
            onClick={fetchHistory}
            className="btn-primary mt-4"
          >
            Retry
          </button>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title="Approval History">
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-800">My Approval History</h2>
        <div className="card overflow-hidden">
          {history.length === 0 ? (
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
                {history.map(req => (
                  <div
                    key={req.id}
                    onClick={() => navigate(`/approver/requests/${req.id}`)}
                    className="grid grid-cols-1 md:grid-cols-12 gap-2 px-5 py-3.5 hover:bg-slate-50 cursor-pointer transition-all items-center"
                  >
                    <div className="col-span-3 text-sm font-semibold text-slate-800">{req.empName}</div>
                    <div className="col-span-2 font-mono text-xs text-slate-600">{req.id}</div>
                    <div className="col-span-2 text-xs text-slate-500">{req.submittedAt}</div>
                    <div className="col-span-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        req.overallStatus === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        req.overallStatus === 'REJECTED' ? 'bg-red-100 text-red-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {req.overallStatus}
                      </span>
                    </div>
                    <div className="col-span-3 text-xs text-slate-500 truncate">{req.remarks || '—'}</div>
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
