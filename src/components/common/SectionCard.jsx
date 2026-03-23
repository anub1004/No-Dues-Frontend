export default function SectionCard({
  title,
  icon: Icon,
  children,
  className = '',
  headerAction,
  noPadding = false,
}) {
  return (
    <div className={`card ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {Icon && <Icon size={18} className="text-slate-600 flex-shrink-0" />}
            <h2 className="font-bold text-slate-900">{title}</h2>
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}

      <div className={!noPadding ? 'px-6 py-4' : ''}>
        {children}
      </div>
    </div>
  )
}
