// src/pages/employee/NewRequestPage.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout'
import { useAuthStore } from '../../store/authStore'
import { useRequestStore } from '../../store/requestStore'
import { CLEARANCE_DEPARTMENTS } from '../../constants/mockData'
import { generateRequestId } from '../../utils/helpers'
import { CheckCircle2, Upload, Eye, Send, ChevronRight, ChevronLeft, FileUp, X } from 'lucide-react'

const STEPS = ['Personal Details', 'Upload Documents', 'Review & Confirm', 'Submitted']

export default function NewRequestPage() {
  const { user } = useAuthStore()
  const { addRequest } = useRequestStore()
  const navigate = useNavigate()

  const [step, setStep] = useState(0)
  const [reason, setReason] = useState('')
  const [lastDay, setLastDay] = useState('')
  const [remarks, setRemarks] = useState('')
  const [files, setFiles] = useState([])
  const [submitted, setSubmitted] = useState(null)
  const [loading, setLoading] = useState(false)

  function handleFileAdd(e) {
    const f = Array.from(e.target.files)
    setFiles(prev => [...prev, ...f])
  }

  function removeFile(idx) {
    setFiles(prev => prev.filter((_, i) => i !== idx))
  }

  function handleSubmit() {
    setLoading(true)
    setTimeout(() => {
      const id = generateRequestId()
      const newReq = {
        id,
        empId: user.id,
        empName: user.name,
        empCode: user.empId,
        designation: user.designation,
        department: user.department,
        submittedAt: new Date().toISOString().split('T')[0],
        reason,
        lastWorkingDay: lastDay,
        remarks,
        overallStatus: 'PENDING',
        documents: files.map(f => f.name),
        departmentStatuses: CLEARANCE_DEPARTMENTS.map(d => ({
          deptId: d.id, deptName: d.name,
          status: 'PENDING', remarks: '', approvedAt: null, approvedBy: null,
        })),
      }
      addRequest(newReq)
      setSubmitted(id)
      setStep(3)
      setLoading(false)
    }, 1000)
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
          {/* Step 0: Personal details */}
          {step === 0 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Personal & Request Details</h2>

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
                  <option>Resignation</option>
                  <option>Retirement</option>
                  <option>End of Contract</option>
                  <option>Transfer</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="label">Last Working Day <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  className="input-field"
                  value={lastDay}
                  onChange={(e) => setLastDay(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
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
                <strong>Note:</strong> Your request will be sent to the following departments for clearance:
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {CLEARANCE_DEPARTMENTS.map(d => (
                    <span key={d.id} className="bg-blue-100 px-2 py-0.5 rounded-full">{d.icon} {d.name}</span>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => step === 0 && reason && lastDay && setStep(1)}
                  disabled={!reason || !lastDay}
                  className="btn-primary flex items-center gap-2"
                >
                  Next: Upload Documents <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}

          {/* Step 1: Documents */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Upload Supporting Documents</h2>
              <p className="text-sm text-slate-500">Attach relevant documents (resignation letter, experience certificate, etc.)</p>

              <label className="block border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center cursor-pointer hover:border-accent-400 hover:bg-accent-50/30 transition-all">
                <FileUp size={28} className="mx-auto text-slate-400 mb-2" />
                <div className="text-sm font-semibold text-slate-600">Click to upload files</div>
                <div className="text-xs text-slate-400 mt-1">PDF, DOC, JPG up to 5MB each</div>
                <input type="file" multiple accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" className="hidden" onChange={handleFileAdd} />
              </label>

              {files.length > 0 && (
                <div className="space-y-2">
                  {files.map((f, i) => (
                    <div key={i} className="flex items-center gap-3 bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-200">
                      <Upload size={14} className="text-accent-600" />
                      <span className="flex-1 text-sm text-slate-700 truncate">{f.name}</span>
                      <span className="text-xs text-slate-400">{(f.size / 1024).toFixed(0)} KB</span>
                      <button onClick={() => removeFile(i)} className="text-red-400 hover:text-red-600">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-xs text-slate-400">Documents are optional but recommended for faster processing.</p>

              <div className="flex justify-between">
                <button onClick={() => setStep(0)} className="btn-secondary flex items-center gap-2">
                  <ChevronLeft size={15} /> Back
                </button>
                <button onClick={() => setStep(2)} className="btn-primary flex items-center gap-2">
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
                  ['Email', user?.email],
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
                  ['Last Working Day', lastDay],
                  ['Documents', files.length ? `${files.length} file(s) attached` : 'None'],
                  ['Remarks', remarks || '—'],
                ].map(([l, v]) => (
                  <div key={l} className="flex justify-between text-sm">
                    <span className="text-slate-500">{l}</span>
                    <span className="font-semibold text-slate-700">{v}</span>
                  </div>
                ))}
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
                By submitting, your request will be sent to all 6 departments for clearance. You will receive email notifications on each action.
              </div>

              <div className="flex justify-between">
                <button onClick={() => setStep(1)} className="btn-secondary flex items-center gap-2">
                  <ChevronLeft size={15} /> Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="btn-success flex items-center gap-2"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                      </svg>
                      Submitting...
                    </span>
                  ) : (
                    <><Send size={15} /> Submit Request</>
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
              <p className="text-slate-500 mb-4">Your clearance request has been submitted successfully.</p>
              <div className="bg-slate-50 rounded-2xl px-6 py-4 inline-block mb-6">
                <div className="text-xs text-slate-400 mb-1">Request ID</div>
                <div className="font-mono text-xl font-bold text-primary-600">{submitted}</div>
              </div>
              <p className="text-sm text-slate-500 mb-6">
                Your request has been sent to all 6 departments. You will be notified via email when each department takes action.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => navigate(`/employee/requests/${submitted}`)}
                  className="btn-primary"
                >
                  Track Status
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
