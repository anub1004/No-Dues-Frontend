// src/pages/approver/RequestDetailPage.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout'
import FileUploadSection from '../../components/FileUploadSection'
import { useAuthStore } from '../../store/authStore'
import { approverAPI } from '../../services/api'
import { ArrowLeft, CheckCircle2, XCircle, User, Briefcase, Calendar, FileText, AlertTriangle, Clock, Loader2 } from 'lucide-react'

export default function RequestDetailPage() {
  const { id } = useParams()
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const [request, setRequest] = useState(null)
  const [remarks, setRemarks] = useState('')
  const [action, setAction] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    fetchRequest()
  }, [id])

  async function fetchRequest() {
    try {
      setLoading(true)
      const data = await approverAPI.getRequestById(id)
      setRequest(data)
    } catch (err) {
      setError(err.message || 'Failed to load request')
      console.error('Fetch request error:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleAction(type) {
    if (type === 'reject' && !remarks.trim()) {
      alert('Please add remarks before rejecting.')
      return
    }

    try {
      setActionLoading(true)
      setAction(type)

      await approverAPI.processAction(id, {
        action: type === 'approve' ? 'APPROVED' : 'REJECTED',
        remarks
      })

      setDone(true)
      setTimeout(() => {
        navigate('/approver/pending')
      }, 2000)
    } catch (err) {
      alert(err.message || 'Failed to process action')
      console.error('Action error:', err)
    } finally {
      setActionLoading(false)
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

  const alreadyActed = request.overallStatus !== 'PENDING' && request.overallStatus !== 'IN_PROGRESS'

  return (
    <AppLayout title={`Review: ${request.id}`}>
      <div className="max-w-2xl mx-auto space-y-5">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft size={16} /> Back
        </button>

        {/* Success state */}
        {done && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
            <CheckCircle2 size={40} className="text-green-500 mx-auto mb-2" />
            <div className="font-bold text-green-800 text-lg">Action Recorded!</div>
            <div className="text-green-600 text-sm mb-4">The employee has been notified.</div>
            <div className="flex justify-center gap-3">
              <button onClick={() => navigate('/approver/pending')} className="btn-primary">Back to Queue</button>
              <button onClick={() => { setDone(false); setRemarks('') }} className="btn-secondary">View Updated Status</button>
            </div>
          </div>
        )}

        {!done && (
          <>
            {/* Employee info */}
            <div className="card p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg">
                    {request.empName?.charAt(0) || '?'}
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 text-lg">{request.empName}</div>
                    <div className="text-slate-500 text-sm">{request.empCode}</div>
                  </div>
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
                  [User, 'Department', request.department],
                  [Briefcase, 'Designation', request.designation],
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

            {/* Already acted */}
            {alreadyActed ? (
              <div className={`rounded-2xl p-4 border ${
                request.overallStatus === 'APPROVED' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                <div className="font-bold text-sm mb-1">
                  {request.overallStatus === 'APPROVED' ? '✅ Request has been approved' : '❌ Request has been rejected'}
                </div>
                <p className="text-xs text-slate-400 mt-1">Status: {request.overallStatus}</p>
              </div>
            ) : (
              /* Approval action area */
              <div className="card p-5">
                <h3 className="font-bold text-slate-800 mb-3">Take Action</h3>

                <div>
                  <label className="label">Remarks</label>
                  <textarea
                    className="input-field resize-none h-24"
                    placeholder="Add remarks (required for rejection, optional for approval)..."
                    value={remarks}
                    onChange={e => setRemarks(e.target.value)}
                    disabled={actionLoading}
                  />
                </div>

                {!remarks && action === 'reject' && (
                  <div className="flex items-center gap-2 text-amber-600 text-xs mt-2">
                    <AlertTriangle size={13} /> Remarks are required when rejecting
                  </div>
                )}

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => handleAction('reject')}
                    disabled={actionLoading}
                    className="btn-danger flex-1 flex items-center justify-center gap-2"
                  >
                    <XCircle size={16} />
                    {actionLoading && action === 'reject' ? 'Processing...' : 'Reject Request'}
                  </button>
                  <button
                    onClick={() => handleAction('approve')}
                    disabled={actionLoading}
                    className="btn-success flex-1 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={16} />
                    {actionLoading && action === 'approve' ? 'Processing...' : 'Approve Clearance'}
                  </button>
                </div>
              </div>
            )}

            {/* Approval steps timeline */}
            {request.approvalSteps && request.approvalSteps.length > 0 && (
              <div className="card">
                <div className="px-6 py-4 border-b border-slate-200">
                  <h3 className="font-bold text-slate-800">All Departments Status</h3>
                </div>
                <div className="divide-y">
                  {request.approvalSteps.map((step, idx) => (
                    <div key={idx} className="p-4 flex items-start gap-3">
                      {step.status === 'APPROVED' ? (
                        <CheckCircle2 size={16} className="text-green-500 mt-0.5" />
                      ) : step.status === 'REJECTED' ? (
                        <XCircle size={16} className="text-red-500 mt-0.5" />
                      ) : (
                        <Clock size={16} className="text-amber-500 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <div className="font-semibold text-slate-700">{step.departmentName || 'Department'}</div>
                        <div className="text-sm text-slate-500">{step.status}</div>
                        {step.remarks && <div className="text-xs text-slate-600 mt-1">{step.remarks}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  )
}
