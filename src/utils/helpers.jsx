// src/utils/helpers.js

export function getStatusBadgeClass(status) {
  switch (status) {
    case 'APPROVED':    return 'badge badge-approved'
    case 'REJECTED':    return 'badge badge-rejected'
    case 'PENDING':     return 'badge badge-pending'
    case 'IN_PROGRESS': return 'badge badge-review'
    default:            return 'badge badge-pending'
  }
}

export function getStatusLabel(status) {
  switch (status) {
    case 'APPROVED':    return '✓ Approved'
    case 'REJECTED':    return '✕ Rejected'
    case 'PENDING':     return '● Pending'
    case 'IN_PROGRESS': return '◐ In Progress'
    default:            return status
  }
}

export function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

export function getInitials(name = '') {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

export function getProgressCount(departmentStatuses = []) {
  const approved = departmentStatuses.filter((d) => d.status === 'APPROVED').length
  return { approved, total: departmentStatuses.length }
}

export function generateRequestId() {
  const n = Math.floor(Math.random() * 900) + 100
  return `REQ-2025-0${n}`
}

export function getAvatarColor(name = '') {
  const colors = [
    'bg-blue-500', 'bg-purple-500', 'bg-teal-500',
    'bg-orange-500', 'bg-pink-500', 'bg-indigo-500',
  ]
  const idx = name.charCodeAt(0) % colors.length
  return colors[idx]
}

/**
 * Render accordion content for department status
 */
export function renderAccordionContent(status) {
  if (!status) return null

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-xs font-semibold text-slate-600 uppercase">Status</div>
          <div className="mt-1 text-sm font-medium text-slate-900">
            {getStatusLabel(status.status)}
          </div>
        </div>
        {status.approvedAt && (
          <div>
            <div className="text-xs font-semibold text-slate-600 uppercase">Approved On</div>
            <div className="mt-1 text-sm font-medium text-slate-900">
              {formatDate(status.approvedAt)}
            </div>
          </div>
        )}
      </div>

      {status.approvedBy && (
        <div>
          <div className="text-xs font-semibold text-slate-600 uppercase">Approved By</div>
          <div className="mt-1 text-sm font-medium text-slate-900">{status.approvedBy}</div>
        </div>
      )}

      {status.remarks && (
        <div>
          <div className="text-xs font-semibold text-slate-600 uppercase">Remarks</div>
          <div className="mt-1 text-sm text-slate-700 bg-slate-100 rounded p-2">
            {status.remarks}
          </div>
        </div>
      )}
    </div>
  )
}
