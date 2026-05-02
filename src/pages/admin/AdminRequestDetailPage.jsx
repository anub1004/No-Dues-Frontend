// src/pages/admin/AdminRequestDetailPage.jsx
import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import FileUploadSection from '../../components/FileUploadSection'
import { adminAPI } from '../../services/api'
import { ArrowLeft, User, Briefcase, Calendar, FileText, Loader2, Clock, CheckCircle2, XCircle } from 'lucide-react'

export default function AdminRequestDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [request, setRequest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchRequest()
  }, [id])

  async function fetchRequest() {
    try {
      setLoading(true)
      const data = await adminAPI.getRequestById(id)
      setRequest(data)
      setError('')
    } catch (err) {
      setError(err.message || 'Failed to load request')
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AppLayout title="Loading...">
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="animate-spin" size={32} />
        </div>
      </AppLayout>
    )
  }

  if (error || !request) {
    return (
      <AppLayout title="Not Found">
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-slate-600 mb-4">{error || 'Request not found'}</p>
          <button onClick={() => navigate(-1)} className="btn-secondary">Go Back</button>
        </div>
      </AppLayout>
    )
  }

  const approvalSteps = request.departmentStatuses || []
  const approved = approvalSteps.filter(s => s.status === 'APPROVED').length
  const total = approvalSteps.length || 1
  const pct = total > 0 ? Math.round((approved / total) * 100) : 0

  return (
    <AppLayout title={`Request ${request.id}`}>
      <div className="max-w-2xl mx-auto space-y-5">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft size={16} /> Back
        </button>

        <div className="card p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="font-mono text-lg font-bold text-slate-800">{request.id}</div>
              <div className="text-sm text-slate-500">{request.submittedAt}</div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              request.overallStatus === 'APPROVED' ? 'bg-green-100 text-green-800' :
              request.overallStatus === 'REJECTED' ? 'bg-red-100 text-red-800' :
              'bg-amber-100 text-amber-800'
            }`}>
              {request.overallStatus}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              [User, 'Employee', request.empName],
              [Briefcase, 'Department', request.department],
              [FileText, 'Reason', request.reason],
              [Calendar, 'Submitted', request.submittedAt],
            ].map(([Icon, label, value]) => (
              <div key={label} className="flex items-start gap-2 text-xs">
                <Icon size={13} className="text-slate-400 mt-0.5" />
                <div>
                  <div className="text-slate-400">{label}</div>
                  <div className="font-semibold text-slate-700">{value}</div>
                </div>
              </div>
            ))}
          </div>
          {total > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-500">Progress</span>
                <span className="font-bold">{approved}/{total} cleared</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    request.overallStatus === 'REJECTED' ? 'bg-red-500' :
                    request.overallStatus === 'APPROVED' ? 'bg-green-500' :
                    'bg-amber-500'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Documents section */}
        <div className="card">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="font-bold text-slate-800">Attached Documents</h3>
          </div>
          <div className="p-6">
            <FileUploadSection
              requestId={request.id}
              isEditable={false}
              onFileChange={() => {}}
            />
          </div>
        </div>

        {/* Department status timeline */}
        {approvalSteps.length > 0 && (
          <div className="card">
            <div className="px-5 py-4 border-b border-slate-200">
              <h3 className="font-bold text-slate-800">Department Clearance Status</h3>
            </div>
            <div className="divide-y">
              {approvalSteps.map((step, idx) => (
                <div key={idx} className="p-4 flex items-start gap-3">
                  {step.status === 'APPROVED' ? (
                    <CheckCircle2 size={16} className="text-green-500 mt-0.5" />
                  ) : step.status === 'REJECTED' ? (
                    <XCircle size={16} className="text-red-500 mt-0.5" />
                  ) : (
                    <Clock size={16} className="text-amber-500 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="font-semibold text-slate-700">{step.deptName || 'Department'}</div>
                    <div className="text-sm text-slate-500">{step.status}</div>
                    {step.remarks && <div className="text-xs text-slate-600 mt-1">{step.remarks}</div>}
                    {step.approvedBy && <div className="text-xs text-slate-400 mt-1">By {step.approvedBy}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
