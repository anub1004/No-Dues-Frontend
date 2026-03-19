// src/pages/employee/RequestsPage.jsx
import { useNavigate } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout'
import RequestCard from '../../components/common/RequestCard'
import EmptyState from '../../components/common/EmptyState'
import { useAuthStore } from '../../store/authStore'
import { useRequestStore } from '../../store/requestStore'

export default function RequestsPage() {
  const { user } = useAuthStore()
  const { getRequestsByEmpId } = useRequestStore()
  const navigate = useNavigate()

  const requests = getRequestsByEmpId(user?.id)

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
              icon="📋" title="No requests yet"
              description="Start your no-dues clearance process"
              action={<button onClick={() => navigate('/employee/new-request')} className="btn-primary">+ New Request</button>}
            />
          </div>
        ) : (
          requests.map(r => <RequestCard key={r.id} request={r} linkBase="/employee" />)
        )}
      </div>
    </AppLayout>
  )
}
