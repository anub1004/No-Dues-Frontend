import { CheckCircle2, XCircle, Lock } from 'lucide-react'

export default function StageProgressIndicator({ request }) {
  if (!request) return null

  const stages = [
    { order: 1, name: 'Branch HOD', desc: 'Employee\'s Department' },
    { order: 2, name: 'HR Department', desc: 'Human Resources' },
    { order: 3, name: 'Clearance', desc: 'IT Department' },
    { order: 4, name: 'Exit Interview', desc: 'Final HR Interview' }
  ]

  // Use departmentStatuses from backend (or fallback to approvalSteps)
  const steps = request.departmentStatuses || request.approvalSteps || []

  const getStageStatus = (stepOrder) => {
    if (stepOrder <= 3) {
      const step = steps.find(s => s.stepOrder === stepOrder)
      return step?.status
    } else {
      const exitStep = steps.find(s => s.stepName === 'EXIT_INTERVIEW')
      return exitStep?.status
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'APPROVED': return 'bg-green-500 text-white'
      case 'REJECTED': return 'bg-red-500 text-white'
      case 'PENDING': return 'bg-blue-500 text-white'
      case 'LOCKED': return 'bg-gray-300 text-gray-600'
      default: return 'bg-gray-200'
    }
  }

  const getStageBorderColor = (status) => {
    switch(status) {
      case 'APPROVED': return 'border-green-500'
      case 'REJECTED': return 'border-red-500'
      case 'LOCKED': return 'border-gray-300'
      case 'PENDING': return 'border-blue-500'
      default: return 'border-gray-300'
    }
  }

  return (
    <div className="space-y-2">
      {stages.map((stage, idx) => {
        const status = getStageStatus(stage.order)
        const isCompleted = status === 'APPROVED'
        const isLocked = status === 'LOCKED'
        const isRejected = status === 'REJECTED'
        const isPending = status === 'PENDING'

        return (
          <div key={stage.order}>
            {/* Stage Box */}
            <div className={`card p-4 border-l-4 ${getStageBorderColor(status)}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4">
                  {/* Stage Number Badge */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${getStatusColor(status)}`}>
                    {isCompleted && <CheckCircle2 size={24} />}
                    {isRejected && <XCircle size={24} />}
                    {isLocked && <Lock size={24} />}
                    {isPending && stage.order}
                  </div>

                  {/* Stage Info */}
                  <div>
                    <h3 className="font-bold text-slate-800">
                      Stage {stage.order}: {stage.name}
                    </h3>
                    <p className="text-sm text-slate-500">{stage.desc}</p>
                  </div>
                </div>

                {/* Status Badge */}
                <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                  isCompleted ? 'bg-green-100 text-green-700' :
                  isRejected ? 'bg-red-100 text-red-700' :
                  isLocked ? 'bg-gray-100 text-gray-600' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {status || 'UNKNOWN'}
                </span>
              </div>

              {/* Stage Details */}
              {stage.order < 4 && (
                <StageDetails stepOrder={stage.order} steps={steps} />
              )}

              {/* Exit Interview Details */}
              {stage.order === 4 && (
                <ExitInterviewDetails steps={steps} />
              )}
            </div>

            {/* Arrow Between Stages */}
            {idx < stages.length - 1 && (
              <div className="flex justify-center py-1">
                <div className="text-2xl text-gray-300">↓</div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function StageDetails({ stepOrder, steps }) {
  const stageSteps = (steps || []).filter(s => s.stepOrder === stepOrder)

  if (stageSteps.length === 0) return null

  // For Stage 3: show as parallel approval group
  if (stepOrder === 3) {
    const approved = stageSteps.filter(s => s.status === 'APPROVED').length
    const total = stageSteps.length

    return (
      <div className="mt-3 ml-16 space-y-2 border-t pt-3">
        <div className="mb-3 p-2 bg-blue-50 rounded border border-blue-200 text-xs text-blue-700 font-medium">
          🔄 Parallel Approvals: {approved}/{total} departments approved (ALL must approve)
        </div>
        {stageSteps.map(step => (
          <div key={step.deptId || step.id} className="text-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-600 font-medium">{step.deptName}</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                step.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                step.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                step.status === 'LOCKED' ? 'bg-gray-100 text-gray-600' :
                'bg-blue-100 text-blue-700'
              }`}>
                {step.status}
              </span>
            </div>
            {step.approvedBy && (
              <div className="text-xs text-slate-500 mt-1">
                by <span className="font-semibold">{step.approvedBy}</span> on {step.approvedAt}
              </div>
            )}
            {step.remarks && (
              <div className="text-xs text-slate-600 italic mt-1">
                "{step.remarks}"
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="mt-3 ml-16 space-y-2 border-t pt-3">
      {stageSteps.map(step => (
        <div key={step.deptId || step.id} className="text-sm">
          <div className="flex justify-between items-center">
            <span className="text-slate-600 font-medium">{step.deptName}</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded ${
              step.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
              step.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
              step.status === 'LOCKED' ? 'bg-gray-100 text-gray-600' :
              'bg-blue-100 text-blue-700'
            }`}>
              {step.status}
            </span>
          </div>
          {step.approvedBy && (
            <div className="text-xs text-slate-500 mt-1">
              by <span className="font-semibold">{step.approvedBy}</span> on {step.approvedAt}
            </div>
          )}
          {step.remarks && (
            <div className="text-xs text-slate-600 italic mt-1">
              "{step.remarks}"
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function ExitInterviewDetails({ steps }) {
  const exitStep = (steps || []).find(s => s.stepName === 'EXIT_INTERVIEW')

  if (!exitStep) return null

  return (
    <div className="mt-3 ml-16 text-sm space-y-2 border-t pt-3">
      {exitStep.interviewDate && (
        <div className="flex justify-between items-center">
          <span className="text-slate-600">Scheduled Date:</span>
          <span className="font-semibold text-slate-800">{exitStep.interviewDate}</span>
        </div>
      )}
      {exitStep.approvedBy && (
        <div className="text-xs text-slate-500">
          Conducted by: <span className="font-semibold">{exitStep.approvedBy}</span>
        </div>
      )}
      {exitStep.remarks && (
        <div className="text-xs text-slate-600 italic">
          "{exitStep.remarks}"
        </div>
      )}
      {exitStep.status === 'PENDING' && !exitStep.interviewDate && (
        <p className="text-slate-600 italic">Waiting to schedule...</p>
      )}
    </div>
  )
}

