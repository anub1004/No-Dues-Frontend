// src/pages/approver/RequestDetailPage.jsx
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout'
import StatusBadge from '../../components/common/StatusBadge'
import ClearanceTimeline from '../../components/common/ClearanceTimeline'
import { useAuthStore } from '../../store/authStore'
import { useRequestStore } from '../../store/requestStore'
import { formatDate } from '../../utils/helpers'
import { ArrowLeft, CheckCircle2, XCircle, User, Briefcase, Calendar, FileText, AlertTriangle } from 'lucide-react'

export default function RequestDetailPage() {
  const { id } = useParams()
  const { user } = useAuthStore()
  const { requests, updateDeptStatus } = useRequestStore()
  const navigate = useNavigate()

  const [remarks, setRemarks] = useState('')
  const [action, setAction] = useState(null) // 'approve' | 'reject'
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const req = requests.find(r => r.id === id)
  if (!req) {
    return (
      <AppLayout title="Not Found">
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🔍</div>
          <button onClick={() => navigate(-1)} className="btn-secondary">Go Back</button>
        </div>
      </AppLayout>
    )
  }

  const deptId = user?.departmentId
  const myDeptStatus = req.departmentStatuses.find(d => d.deptId === deptId)
  const alreadyActed = myDeptStatus?.status !== 'PENDING'

  function handleAction(type) {
    if (type === 'reject' && !remarks.trim()) {
      alert('Please add remarks before rejecting.')
      return
    }
    setLoading(true)
    setTimeout(() => {
      updateDeptStatus(id, deptId, type === 'approve' ? 'APPROVED' : 'REJECTED', remarks, user?.name)
      setDone(true)
      setLoading(false)
    }, 800)
  }

  return (
    <AppLayout title={`Review: ${req.id}`}>
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
                    {req.empName.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 text-lg">{req.empName}</div>
                    <div className="text-slate-500 text-sm">{req.empCode}</div>
                  </div>
                </div>
                <StatusBadge status={myDeptStatus?.status || 'PENDING'} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  [User, 'Designation', req.designation],
                  [Briefcase, 'Department', req.department],
                  [FileText, 'Reason', req.reason],
                  [Calendar, 'Submitted', formatDate(req.submittedAt)],
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

              {req.documents?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Attached Documents</div>
                  <div className="flex flex-wrap gap-2">
                    {req.documents.map((d, i) => (
                      <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg flex items-center gap-1">
                        <FileText size={11} /> {d}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Already acted */}
            {alreadyActed ? (
              <div className={`rounded-2xl p-4 border ${
                myDeptStatus?.status === 'APPROVED' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                <div className="font-bold text-sm mb-1">
                  {myDeptStatus?.status === 'APPROVED' ? '✅ You have approved this request' : '❌ You have rejected this request'}
                </div>
                {myDeptStatus?.remarks && (
                  <p className="text-xs text-slate-600">Remarks: {myDeptStatus.remarks}</p>
                )}
                <p className="text-xs text-slate-400 mt-1">Actioned on {formatDate(myDeptStatus?.approvedAt)}</p>
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
                  />
                </div>

                {!remarks && action === 'reject' && (
                  <div className="flex items-center gap-2 text-amber-600 text-xs mt-2">
                    <AlertTriangle size={13} /> Remarks are required when rejecting
                  </div>
                )}

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => { setAction('reject'); handleAction('reject') }}
                    disabled={loading}
                    className="btn-danger flex-1 flex items-center justify-center gap-2"
                  >
                    <XCircle size={16} />
                    {loading && action === 'reject' ? 'Processing...' : 'Reject Request'}
                  </button>
                  <button
                    onClick={() => { setAction('approve'); handleAction('approve') }}
                    disabled={loading}
                    className="btn-success flex-1 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={16} />
                    {loading && action === 'approve' ? 'Processing...' : 'Approve Clearance'}
                  </button>
                </div>
              </div>
            )}

            {/* Full timeline */}
            <div className="card p-5">
              <h3 className="section-title mb-4">All Departments Status</h3>
              <ClearanceTimeline departmentStatuses={req.departmentStatuses} />
            </div>
          </>
        )}
      </div>
    </AppLayout>
  )
}
