import { CheckCircle2, Clock, AlertCircle, XCircle } from 'lucide-react'

const STATUS_CONFIG = {
  APPROVED: {
    icon: CheckCircle2,
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    label: 'Approved',
  },
  REJECTED: {
    icon: XCircle,
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    label: 'Rejected',
  },
  PENDING: {
    icon: Clock,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    label: 'Pending',
  },
  IN_PROGRESS: {
    icon: Clock,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    label: 'In Progress',
  },
}

export default function StatusIndicator({ status = 'PENDING', size = 'md', showLabel = true }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING
  const Icon = config.icon

  const sizeClass = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }[size]

  return (
    <div className="flex items-center gap-2">
      <Icon className={`${sizeClass} ${config.color}`} />
      {showLabel && <span className="text-sm font-medium text-slate-700">{config.label}</span>}
    </div>
  )
}
