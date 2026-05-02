// src/pages/approver/RequestDetailPage.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout'
import FileUploadSection from '../../components/FileUploadSection'
import ExitInterviewSchedule from '../../components/ExitInterviewSchedule'
import StageProgressIndicator from '../../components/StageProgressIndicator'
import CertificateDownload from '../../components/CertificateDownload'
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

  // Get current step(s) for this department
  // Note: HR has both Step 2 and Step 4, so we may have multiple
  const getStepsForDept = () => {
    if (!request?.departmentStatuses) return []
    return request.departmentStatuses.filter(step => {
      return step.deptName === user?.department
    })
  }

  // Get pending step for this department (only PENDING status can be acted on)
  const getPendingStepForDept = () => {
    const deptSteps = getStepsForDept()
    return deptSteps.find(s => s.status === 'PENDING')
  }

  // Check if this step can be acted on (must be PENDING, not LOCKED or already processed)
  const canActOnStep = (step) => {
    return step && step.status === 'PENDING'
  }

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
    const pendingStep = getPendingStepForDept()

    if (!pendingStep) {
      alert('No pending action for your department')
      return
    }

    // Step 4 (Exit Interview): Must have interview date set and date must have passed
    if (pendingStep.stepOrder === 4 && pendingStep.stepName === 'EXIT_INTERVIEW') {
      if (!pendingStep.interviewDate) {
        alert('Schedule the exit interview date before proceeding')
        return
      }

      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const interviewDate = new Date(pendingStep.interviewDate)
      interviewDate.setHours(0, 0, 0, 0)

      // Can only approve if interview date is today or earlier
      if (type === 'approve' && today < interviewDate) {
        alert(`Cannot complete exit interview before scheduled date: ${pendingStep.interviewDate}`)
        return
      }
    }

    if (type === 'reject' && !remarks.trim()) {
      alert('Please add remarks before rejecting.')
      return
    }

    try {
      setActionLoading(true)
      setAction(type)

      await approverAPI.processAction(request.id, {
        status: type === 'approve' ? 'APPROVED' : 'REJECTED',
        remarks,
        stepOrder: pendingStep.stepOrder
      })

      // Refresh to get updated data
      await fetchRequest()

      setDone(true)
      setTimeout(() => {
        navigate('/approver/pending')
      }, 2000)
    } catch (err) {
      alert(err.message || 'Failed to process action')
      console.error('Action error:', err)
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

  const pendingStep = getPendingStepForDept()
  const deptSteps = getStepsForDept()
  const exitStep = request.departmentStatuses?.find(s => s.stepOrder === 4 && s.stepName === 'EXIT_INTERVIEW')
  const canApprove = canActOnStep(pendingStep)
  const hasLockedSteps = deptSteps.some(s => s.status === 'LOCKED')
  const alreadyActed = request.overallStatus !== 'PENDING' && request.overallStatus !== 'IN_PROGRESS'

  return (
    <AppLayout title={`Review: ${request.id}`}>
      <div className="max-w-2xl mx-auto space-y-5">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft size={16} /> Back
        </button>

        {/* Workflow Progress */}
        {request.departmentStatuses && request.departmentStatuses.length > 0 && (
          <StageProgressIndicator
            request={request}
          />
        )}

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

        {/* Certificate ready (if all approved) */}
        {!done && request.overallStatus === 'APPROVED' && (
          <CertificateDownload
            request={request}
            onDownload={() => approverAPI.downloadCertificate(request.id)}
          />
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

            {/* Show current step info */}
            {pendingStep && canApprove && (
              <div className="card p-4 bg-blue-50 border border-blue-200">
                <div className="text-sm text-blue-800">
                  <strong>Your Turn:</strong> Step {pendingStep.stepOrder} - {pendingStep.deptName}
                  {pendingStep.stepName === 'EXIT_INTERVIEW' && ' (Exit Interview)'}
                </div>
                {pendingStep.stepOrder === 3 && (
                  <div className="text-xs text-blue-700 mt-2">
                    ℹ️ <strong>Parallel Approval:</strong> All 5 clearance departments must approve before moving to the next stage.
                  </div>
                )}
              </div>
            )}

            {/* Show locked steps message */}
            {hasLockedSteps && !canApprove && (
              <div className="card p-4 bg-amber-50 border border-amber-200">
                <div className="text-sm text-amber-800">
                  ⏳ Your steps are currently LOCKED. Waiting for previous departments to approve.
                </div>
              </div>
            )}

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
            ) : !canApprove ? (
              <div className="rounded-2xl p-4 bg-slate-50 border border-slate-200">
                <div className="font-bold text-sm text-slate-700 mb-1">
                  ℹ️ Not Your Turn Yet
                </div>
                <p className="text-xs text-slate-600">
                  {hasLockedSteps
                    ? 'Waiting for other departments to complete their approvals'
                    : 'Your department has already acted on this request'
                  }
                </p>
              </div>
            ) : (
              /* Approval action area - only show if PENDING */
              <div className="card p-5">
                <h3 className="font-bold text-slate-800 mb-3">Take Action</h3>

                {/* Exit Interview Date Validation Message */}
                {pendingStep?.stepName === 'EXIT_INTERVIEW' && pendingStep?.interviewDate && (
                  <div className={`p-3 rounded-lg mb-4 text-sm ${
                    new Date(pendingStep.interviewDate) <= new Date()
                      ? 'bg-green-50 border border-green-200 text-green-700'
                      : 'bg-amber-50 border border-amber-200 text-amber-700'
                  }`}>
                    {new Date(pendingStep.interviewDate) <= new Date()
                      ? '✓ Exit interview date has passed. You can proceed.'
                      : `⏳ Interview scheduled for ${pendingStep.interviewDate}. You cannot complete it before this date.`
                    }
                  </div>
                )}

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
                    disabled={actionLoading || (pendingStep?.stepName === 'EXIT_INTERVIEW' && pendingStep?.interviewDate && new Date(pendingStep.interviewDate) > new Date())}
                    className="btn-danger flex-1 flex items-center justify-center gap-2"
                    title={pendingStep?.stepName === 'EXIT_INTERVIEW' && pendingStep?.interviewDate && new Date(pendingStep.interviewDate) > new Date() ? 'Cannot reject before interview date' : ''}
                  >
                    <XCircle size={16} />
                    {actionLoading && action === 'reject' ? 'Processing...' : 'Reject Request'}
                  </button>
                  <button
                    onClick={() => handleAction('approve')}
                    disabled={actionLoading || (pendingStep?.stepName === 'EXIT_INTERVIEW' && (!pendingStep?.interviewDate || new Date(pendingStep.interviewDate) > new Date()))}
                    className="btn-success flex-1 flex items-center justify-center gap-2"
                    title={
                      pendingStep?.stepName === 'EXIT_INTERVIEW' && !pendingStep?.interviewDate
                        ? 'Schedule interview date first'
                        : pendingStep?.stepName === 'EXIT_INTERVIEW' && new Date(pendingStep.interviewDate) > new Date()
                        ? 'Cannot approve before interview date'
                        : ''
                    }
                  >
                    <CheckCircle2 size={16} />
                    {actionLoading && action === 'approve' ? 'Processing...' : pendingStep?.stepName === 'EXIT_INTERVIEW' ? 'Complete Interview' : 'Approve Clearance'}
                  </button>
                </div>
              </div>
            )}

            {/* Exit Interview Scheduling - Only for Step 4 and if PENDING */}
            {pendingStep && pendingStep.stepOrder === 4 && pendingStep.stepName === 'EXIT_INTERVIEW' && canApprove && (
              <ExitInterviewSchedule
                requestId={request.id}
                exitStep={pendingStep}
                departmentStatuses={request.departmentStatuses}
                onUpdate={fetchRequest}
              />
            )}

            {/* Workflow Status */}
            {request.departmentStatuses && request.departmentStatuses.length > 0 && (
              <div className="card">
                <div className="px-6 py-4 border-b border-slate-200">
                  <h3 className="font-bold text-slate-800">Workflow Status (4-Stage Process)</h3>
                </div>
                <div className="divide-y">
                  {request.departmentStatuses.map((step, idx) => (
                    <div key={idx} className="p-4 flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {step.status === 'APPROVED' ? (
                          <CheckCircle2 size={16} className="text-green-500" />
                        ) : step.status === 'REJECTED' ? (
                          <XCircle size={16} className="text-red-500" />
                        ) : step.status === 'PENDING' ? (
                          <Clock size={16} className="text-amber-500" />
                        ) : (
                          <div className="w-4 h-4 border-2 border-slate-300 rounded-full" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-slate-700">
                          Step {step.stepOrder}: {step.deptName}
                          {step.stepName === 'EXIT_INTERVIEW' && ' (Exit Interview)'}
                        </div>
                        <div className={`text-sm mt-1 font-medium ${
                          step.status === 'APPROVED' ? 'text-green-600' :
                          step.status === 'REJECTED' ? 'text-red-600' :
                          step.status === 'PENDING' ? 'text-amber-600' :
                          'text-slate-500'
                        }`}>
                          {step.status}
                        </div>
                        {step.interviewDate && (
                          <div className="text-xs text-slate-600 mt-1">
                            Interview Scheduled: {step.interviewDate}
                          </div>
                        )}
                        {step.remarks && (
                          <div className="text-xs text-slate-600 mt-1">
                            {step.remarks}
                          </div>
                        )}
                        {step.approvedBy && (
                          <div className="text-xs text-slate-600 mt-1">
                            Approved by: {step.approvedBy} on {step.approvedAt}
                          </div>
                        )}
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
