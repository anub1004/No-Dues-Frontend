import { ChevronDown } from 'lucide-react'

export default function AccordionItem({
  id,
  title,
  subtitle,
  icon: Icon,
  content,
  isOpen,
  onToggle,
  headerClass = '',
  contentClass = '',
}) {
  return (
    <div className="border-b border-slate-200 last:border-b-0">
      {/* Header */}
      <button
        onClick={() => onToggle(id)}
        className={`w-full flex items-center justify-between gap-3 px-6 py-4 hover:bg-slate-50 transition-colors text-left ${headerClass}`}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {Icon && (
            <Icon size={18} className="text-slate-600 flex-shrink-0" />
          )}
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-slate-900 text-sm">{title}</h4>
            {subtitle && (
              <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
        <ChevronDown
          size={18}
          className={`text-slate-500 flex-shrink-0 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Content */}
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: isOpen ? '1000px' : '0px',
          opacity: isOpen ? 1 : 0,
        }}
      >
        <div className={`px-6 py-4 bg-slate-50 text-sm ${contentClass}`}>
          {content}
        </div>
      </div>
    </div>
  )
}
