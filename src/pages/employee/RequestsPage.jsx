// src/pages/employee/RequestsPage.jsx
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import RequestCard from '../../components/common/RequestCard'
import EmptyState from '../../components/common/EmptyState'
import { employeeAPI } from '../../services/api'
import { Loader2 } from 'lucide-react'

export default function RequestsPage() {
  const navigate = useNavigate()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchRequests()
  }, [])

  async function fetchRequests() {
    try {
      setLoading(true)
      const data = await employeeAPI.getMyRequests()
      setRequests(data || [])
    } catch (err) {
      setError(err.message || 'Failed to load requests')
      console.error('Fetch requests error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AppLayout title="My Requests">
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="animate-spin" size={32} />
        </div>
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout title="My Requests">
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
    <AppLayout title="My Requests">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">All Clearance Requests</h2>
          <button onClick={() => navigate('/employee/new-request')} className="btn-primary text-sm">
            + New Request
          </button>
        </div>

        {requests.length === 0 ? (
          <div className="card">
            <EmptyState
              icon="📋"
              title="No requests yet"
              description="Start your no-dues clearance process"
              action={<button onClick={() => navigate('/employee/new-request')} className="btn-primary">+ New Request</button>}
            />
          </div>
        ) : (
          requests.map(r => (
            <RequestCard key={r.id} request={r} linkBase="/employee" />
          ))
        )}
      </div>
    </AppLayout>
  )
}
