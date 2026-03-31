// src/pages/employee/RequestTrackerPage.jsx
import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import FileUploadSection from '../../components/FileUploadSection'
import { employeeAPI } from '../../services/api'
import { ArrowLeft, Download, Calendar, User, Briefcase, FileText, CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react'

export default function RequestTrackerPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [request, setRequest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    console.log('[RequestTracker] Params ID:', id)
    if (id) {
      fetchRequest()
    } else {
      setError('Request ID not found in URL')
      setLoading(false)
    }
  }, [id])

  async function fetchRequest() {
    try {
      setLoading(true)
      setError('')
      console.log('[RequestTracker] Fetching request:', id)
      const data = await employeeAPI.getRequestById(id)
      console.log('[RequestTracker] Request data received:', data)
      setRequest(data)
    } catch (err) {
      console.error('[RequestTracker] Fetch error:', err)
      const errorMsg = err.data?.message || err.message || 'Failed to load request'
      setError(errorMsg)
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
      <AppLayout title="Request Not Found">
        <div className="max-w-2xl mx-auto">
          {/* Back button */}
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-4">
            <ArrowLeft size={16} /> Back to Requests
          </button>

          {/* Error card */}
          <div className="card p-8">
            <div className="text-center">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-lg font-bold text-slate-700 mb-2">{error || 'Request not found'}</h3>
              {error && (
                <p className="text-sm text-slate-600 mb-4 bg-slate-50 p-3 rounded border border-slate-200">
                  {error}
                </p>
              )}
              <button
                onClick={fetchRequest}
                className="btn-primary mt-4"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  const approvalSteps = request.approvalSteps || []
  const approved = approvalSteps.filter(s => s.status === 'APPROVED').length
  const total = approvalSteps.length || 1
  const pct = total > 0 ? Math.round((approved / total) * 100) : 0

  return (
    <AppLayout title={`Request ${request.id}`}>
      <div className="max-w-2xl mx-auto space-y-5">
        {/* Back button */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft size={16} /> Back to Requests
        </button>

        {/* Header card */}
        <div className="card p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="font-mono text-lg font-bold text-slate-800">{request.id}</div>
              <div className="text-sm text-slate-500 mt-0.5">Submitted {request.submittedAt}</div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              request.overallStatus === 'APPROVED' ? 'bg-green-100 text-green-800' :
              request.overallStatus === 'REJECTED' ? 'bg-red-100 text-red-800' :
              'bg-amber-100 text-amber-800'
            }`}>
              {request.overallStatus}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs mb-4">
            {[
              [User, 'Employee', request.empName],
              [Briefcase, 'Department', request.department],
              [FileText, 'Reason', request.reason],
              [Calendar, 'Last Day', request.lastWorkingDay || '—'],
            ].map(([Icon, label, value]) => (
              <div key={label} className="flex items-start gap-2">
                <Icon size={13} className="text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-slate-400">{label}</div>
                  <div className="font-semibold text-slate-700">{value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Overall progress */}
          {total > 0 && (
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-500 font-semibold">Overall Progress</span>
                <span className="font-bold text-slate-700">{approved} of {total} cleared</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    request.overallStatus === 'REJECTED' ? 'bg-red-500' :
                    request.overallStatus === 'APPROVED' ? 'bg-green-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="text-xs text-slate-400 mt-1">{pct}% complete</div>
            </div>
          )}
        </div>

        {/* Certificate download (if all approved) */}
        {request.overallStatus === 'APPROVED' && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <div className="font-bold text-green-800 text-sm">🎉 No-Dues Certificate Ready!</div>
              <div className="text-green-600 text-xs mt-0.5">All departments have cleared your request</div>
            </div>
            <button
              onClick={() => navigate('/employee/certificates')}
              className="btn-success flex items-center gap-2 text-sm"
            >
              <Download size={15} /> Download
            </button>
          </div>
        )}

        {/* Rejection alert */}
        {request.overallStatus === 'REJECTED' && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
            <div className="font-bold text-red-800 text-sm mb-1">❌ Request Rejected</div>
            <div className="text-red-600 text-xs">
              Some departments have rejected your request. Please review and resubmit if needed.
            </div>
          </div>
        )}

        {/* Approval steps timeline */}
        {approvalSteps.length > 0 && (
          <div className="card">
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="section-title">Clearance Status</h3>
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
                    <div className="font-semibold text-slate-700">{step.departmentName}</div>
                    <div className="text-sm text-slate-500">{step.status}</div>
                    {step.remarks && <div className="text-xs text-slate-600 mt-1">{step.remarks}</div>}
                    {step.approvedBy && <div className="text-xs text-slate-400 mt-1">By {step.approvedBy}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* File upload section */}
        <div className="card">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="section-title">Documents</h3>
          </div>
          <div className="p-6">
            <FileUploadSection
              requestId={request.id}
              isEditable={request.overallStatus === 'PENDING' || request.overallStatus === 'IN_PROGRESS'}
              onFileChange={fetchRequest}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
