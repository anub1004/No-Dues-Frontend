// src/pages/employee/NewRequestPage.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout'
import FileUploadSection from '../../components/FileUploadSection'
import { useAuthStore } from '../../store/authStore'
import { employeeAPI } from '../../services/api'
import { CheckCircle2, Send, ChevronRight, ChevronLeft, AlertCircle, Upload } from 'lucide-react'

const STEPS = ['Details', 'Upload Documents', 'Review', 'Submitted']

export default function NewRequestPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const [step, setStep] = useState(0)
  const [reason, setReason] = useState('')
  const [lastDay, setLastDay] = useState('')
  const [remarks, setRemarks] = useState('')
  const [submitted, setSubmitted] = useState(null)
  const [requestId, setRequestId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Step 0→1: Submit details to create request
  async function handleCreateRequest() {
    try {
      setError('')
      setLoading(true)

      const response = await employeeAPI.submitRequest({
        reason,
        lastWorkingDay: lastDay,
        remarks
      })

      console.log('[NewRequest] Request created:', response.id)
      setRequestId(response.id)
      setStep(1) // Go to upload documents step
    } catch (err) {
      setError(err.message || 'Failed to create request')
      console.error('Create request error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Step 2→3: Final submission (with files already uploaded)
  async function handleFinalSubmit() {
    try {
      setError('')
      setLoading(true)
      // Final confirmation that files are uploaded
      setSubmitted(requestId)
      setStep(3) // Go to success step

      // Redirect after 3 seconds
      setTimeout(() => {
        navigate(`/employee/requests/${requestId}`)
      }, 3000)
    } catch (err) {
      setError(err.message || 'Failed to submit')
      console.error('Submit error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppLayout title="New Clearance Request">
      <div className="max-w-2xl mx-auto">
        {/* Step indicator */}
        <div className="flex items-center gap-0 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                  i < step ? 'bg-accent-600 border-accent-600 text-white' :
                  i === step ? 'bg-white border-accent-600 text-accent-600' :
                  'bg-white border-slate-200 text-slate-400'
                }`}>
                  {i < step ? <CheckCircle2 size={14} /> : i + 1}
                </div>
                <div className={`text-xs mt-1 font-medium hidden sm:block ${i === step ? 'text-accent-600' : 'text-slate-400'}`}>{s}</div>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 ${i < step ? 'bg-accent-600' : 'bg-slate-200'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="card p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-red-800">Error</p>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Step 0: Personal details */}
          {step === 0 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Request Details</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Employee ID</label>
                  <input className="input-field" value={user?.empId} disabled />
                </div>
                <div>
                  <label className="label">Full Name</label>
                  <input className="input-field" value={user?.name} disabled />
                </div>
                <div>
                  <label className="label">Department</label>
                  <input className="input-field" value={user?.department} disabled />
                </div>
                <div>
                  <label className="label">Designation</label>
                  <input className="input-field" value={user?.designation} disabled />
                </div>
              </div>

              <div>
                <label className="label">Reason for Clearance <span className="text-red-500">*</span></label>
                <select
                  className="input-field"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                >
                  <option value="">Select reason</option>
                  <option value="Graduation">Graduation</option>
                  <option value="Transfer">Transfer / Relocation</option>
                  <option value="Resignation">Resignation</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="label">Last Working Day</label>
                <input
                  type="date"
                  className="input-field"
                  value={lastDay}
                  onChange={(e) => setLastDay(e.target.value)}
                />
              </div>

              <div>
                <label className="label">Additional Remarks</label>
                <textarea
                  className="input-field resize-none h-20"
                  placeholder="Any additional information for the departments..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700">
                <strong>Note:</strong> After submitting details, you can upload supporting documents before final submission.
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleCreateRequest}
                  disabled={!reason || loading}
                  className="btn-primary flex items-center gap-2"
                >
                  {loading ? 'Creating...' : <>Next: Upload Documents <ChevronRight size={15} /></>}
                </button>
              </div>
            </div>
          )}

          {/* Step 1: Upload Documents */}
          {step === 1 && requestId && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Upload Supporting Documents</h2>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex gap-3">
                  <Upload size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-blue-900">Upload documents (optional)</p>
                    <p className="text-blue-700 text-xs mt-1">You can upload any supporting documents like ID proof, work certificates, or other relevant files. These will be visible to the departments during approval.</p>
                  </div>
                </div>
              </div>

              {/* File Upload Section */}
              <div className="bg-slate-50 rounded-lg p-4">
                <FileUploadSection
                  requestId={requestId}
                  isEditable={true}
                  onFileChange={() => {
                    console.log('[NewRequest] Files updated for request:', requestId)
                  }}
                />
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-xs text-green-700">
                <strong>Tip:</strong> You can add more documents later from your request details page if needed.
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => {
                    setRequestId(null)
                    setStep(0)
                  }}
                  className="btn-secondary flex items-center gap-2"
                >
                  <ChevronLeft size={15} /> Back
                </button>
                <button
                  onClick={() => setStep(2)}
                  className="btn-primary flex items-center gap-2"
                >
                  Next: Review <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Review */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Review Your Request</h2>

              <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Employee Information</h3>
                {[
                  ['Employee ID', user?.empId],
                  ['Name', user?.name],
                  ['Department', user?.department],
                  ['Designation', user?.designation],
                ].map(([l, v]) => (
                  <div key={l} className="flex justify-between text-sm">
                    <span className="text-slate-500">{l}</span>
                    <span className="font-semibold text-slate-700">{v}</span>
                  </div>
                ))}
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Request Details</h3>
                {[
                  ['Reason', reason],
                  ['Last Working Day', lastDay || 'Not specified'],
                  ['Remarks', remarks || '—'],
                  ['Request ID', requestId],
                ].map(([l, v]) => (
                  <div key={l} className="flex justify-between text-sm">
                    <span className="text-slate-500">{l}</span>
                    <span className="font-semibold text-slate-700">{v}</span>
                  </div>
                ))}
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
                By confirming, your request with all uploaded documents will be sent to all departments for clearance.
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="btn-secondary flex items-center gap-2"
                >
                  <ChevronLeft size={15} /> Back to Upload
                </button>
                <button
                  onClick={handleFinalSubmit}
                  disabled={loading}
                  className="btn-success flex items-center gap-2"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                      </svg>
                      Confirming...
                    </span>
                  ) : (
                    <><Send size={15} /> Confirm & Submit</>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <div className="text-center py-8 animate-fade-in">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={40} className="text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Request Submitted!</h2>
              <p className="text-slate-500 mb-4">Your clearance request has been submitted successfully with all documents.</p>
              <div className="bg-slate-50 rounded-2xl px-6 py-4 inline-block mb-6">
                <div className="text-xs text-slate-400 mb-1">Request ID</div>
                <div className="font-mono text-xl font-bold text-primary-600">{submitted}</div>
              </div>
              <p className="text-sm text-slate-500 mb-6">
                You can track your request progress and add more documents from the request details page.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => navigate(`/employee/requests`)}
                  className="btn-primary"
                >
                  View My Requests
                </button>
                <button
                  onClick={() => navigate('/employee/dashboard')}
                  className="btn-secondary"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
