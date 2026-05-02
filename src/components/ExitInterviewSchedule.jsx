import { useState } from 'react'
import { approverAPI } from '../services/api'
import { Calendar, CheckCircle2, AlertCircle, Loader2, Lock } from 'lucide-react'

export default function ExitInterviewSchedule({ requestId, exitStep, onUpdate, departmentStatuses }) {
  // Exit interview must be PENDING (unlocked) to schedule, not LOCKED
  if (!exitStep || (exitStep.status !== 'PENDING' && exitStep.status !== 'IN_PROGRESS')) {
    return null
  }

  // ✅ NEW: Verify ALL Stage 3 departments are APPROVED
  const stage3Steps = (departmentStatuses || []).filter(s => s.stepOrder === 3)
  const allStage3Approved = stage3Steps.length > 0 &&
                           stage3Steps.every(s => s.status === 'APPROVED')

  const [scheduledDate, setScheduledDate] = useState(exitStep?.interviewDate || '')
  const [remarks, setRemarks] = useState(exitStep?.remarks || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSchedule() {
    if (!scheduledDate) {
      setError('Please select a date')
      return
    }

    // Validate date is not in the past
    const selectedDate = new Date(scheduledDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (selectedDate < today) {
      setError('Interview date must be today or a future date')
      return
    }

    try {
      setLoading(true)
      setError('')
      setSuccess('')

      await approverAPI.setExitInterviewDate(requestId, {
        interviewDate: scheduledDate,
        remarks: remarks.trim() || null
      })

      setSuccess('✓ Exit interview scheduled successfully')
      setTimeout(() => {
        setSuccess('')
        onUpdate?.()
      }, 2000)
    } catch (err) {
      setError(err.message || 'Failed to schedule interview')
      console.error('Schedule error:', err)
    } finally {
      setLoading(false)
    }
  }

  // If already completed
  if (exitStep?.status === 'APPROVED') {
    return (
      <div className="card p-4 space-y-3 border-l-4 border-green-500 bg-green-50">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={18} className="text-green-600" />
          <h3 className="font-bold text-slate-800">Exit Interview Completed</h3>
        </div>
        {exitStep?.interviewDate && (
          <div>
            <span className="text-slate-600">Interview Date: </span>
            <span className="font-semibold text-slate-800">{exitStep.interviewDate}</span>
          </div>
        )}
        {exitStep?.approvedBy && (
          <div className="text-sm text-slate-600">
            Approved by: <span className="font-semibold">{exitStep.approvedBy}</span>
          </div>
        )}
      </div>
    )
  }

  // If rejected
  if (exitStep?.status === 'REJECTED') {
    return (
      <div className="card p-4 space-y-3 border-l-4 border-red-500 bg-red-50">
        <div className="flex items-center gap-2">
          <AlertCircle size={18} className="text-red-600" />
          <h3 className="font-bold text-slate-800">Exit Interview Rejected</h3>
        </div>
        {exitStep?.remarks && (
          <div className="text-sm text-red-700">
            <strong>Reason:</strong> {exitStep.remarks}
          </div>
        )}
      </div>
    )
  }

  // ✅ NEW: Show locked state if Stage 3 not fully approved
  if (!allStage3Approved) {
    const approvedCount = stage3Steps.filter(s => s.status === 'APPROVED').length
    return (
      <div className="card p-4 space-y-3 border-l-4 border-gray-400 bg-gray-50">
        <div className="flex items-center gap-2">
          <Lock size={18} className="text-gray-600" />
          <h3 className="font-bold text-slate-800">Step 4: Waiting for All Clearances</h3>
        </div>
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700 flex gap-2">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          <span>
            Cannot schedule exit interview yet. All clearance departments must approve first.
            <br />
            Progress: {approvedCount}/{stage3Steps.length} departments approved
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="card p-4 space-y-4 border-l-4 border-purple-500">
      <div className="flex items-center gap-2">
        <Calendar size={18} className="text-purple-600" />
        <h3 className="font-bold text-slate-800">Step 4: Schedule Exit Interview</h3>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700 flex gap-2">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded text-sm text-green-700 flex gap-2">
          <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Interview Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            disabled={loading}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            min={new Date().toISOString().split('T')[0]}
          />
          <p className="text-xs text-slate-500 mt-1">Must be today or a future date</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Notes (Optional)
          </label>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            disabled={loading}
            placeholder="Add any notes about the interview..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none h-20"
          />
        </div>
      </div>

      <button
        onClick={handleSchedule}
        disabled={loading || !scheduledDate}
        className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Scheduling...
          </>
        ) : (
          <>
            <Calendar size={16} />
            Schedule Interview
          </>
        )}
      </button>
    </div>
  )
}

