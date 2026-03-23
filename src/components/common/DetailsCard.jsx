export default function DetailsCard({
  title,
  subtitle,
  icon: Icon,
  children,
  className = '',
  headerClass = '',
}) {
  return (
    <div className={`card ${className}`}>
      {/* Header */}
      {title && (
        <div className={`px-6 py-4 border-b border-slate-200 ${headerClass}`}>
          <div className="flex items-start gap-3">
            {Icon && <Icon size={20} className="text-slate-600 mt-0.5 flex-shrink-0" />}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-900">{title}</h3>
              {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="px-6 py-4">
        {children}
      </div>
    </div>
  )
}
