// src/components/common/StatusBadge.jsx
import { CheckCircle2, Clock, AlertCircle, XCircle } from 'lucide-react'
import { getStatusBadgeClass, getStatusLabel } from '../../utils/helpers'

export default function StatusBadge({
  status = 'PENDING',
  size = 'md',
  variant = 'badge',
  showIcon = false,
}) {
  const badgeClass = getStatusBadgeClass(status)
  const label = getStatusLabel(status)

  const sizeClass = {
    sm: 'text-xs px-2 py-1',
    md: 'text-xs px-2.5 py-1.5',
    lg: 'text-sm px-3 py-2',
  }[size]

  const STATUS_ICONS = {
    APPROVED: CheckCircle2,
    REJECTED: XCircle,
    PENDING: Clock,
    IN_PROGRESS: AlertCircle,
  }

  const Icon = showIcon ? STATUS_ICONS[status] : null

  if (variant === 'dot') {
    return (
      <div className="flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${
            status === 'APPROVED'
              ? 'bg-green-500'
              : status === 'REJECTED'
              ? 'bg-red-500'
              : status === 'IN_PROGRESS'
              ? 'bg-blue-500'
              : 'bg-amber-500'
          }`}
        />
        <span className="text-xs font-medium text-slate-700">{label}</span>
      </div>
    )
  }

  return (
    <span className={`${badgeClass} ${sizeClass} inline-flex items-center gap-1.5`}>
      {Icon && <Icon size={14} />}
      {label}
    </span>
  )
}
