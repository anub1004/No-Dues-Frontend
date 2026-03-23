import Accordion from './Accordion'
import { renderAccordionContent } from '../../utils/helpers'

export default function StatusSection({
  title,
  subtitle,
  icon,
  statuses = [],
  className = '',
}) {
  if (!statuses || statuses.length === 0) {
    return null
  }

  const items = statuses.map((status, idx) => ({
    id: `status-${idx}`,
    title: status.deptName || status.name,
    subtitle: status.subtitle,
    icon: status.icon,
    content: renderAccordionContent(status),
    headerClass: status.headerClass,
    contentClass: status.contentClass,
  }))

  return (
    <div className={`card ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            {icon && <icon.type size={20} className="text-slate-600" />}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-900">{title}</h3>
              {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
            </div>
          </div>
        </div>
      )}
      <Accordion items={items} containerClass="!rounded-none" />
    </div>
  )
}
