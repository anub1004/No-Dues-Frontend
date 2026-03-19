// src/components/common/StatCard.jsx
export default function StatCard({ value, label, icon: Icon, accent = 'border-accent-500', sub }) {
  return (
    <div className={`stat-card border-t-4 ${accent}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-3xl font-bold text-slate-800">{value}</div>
          <div className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wide">{label}</div>
          {sub && <div className="text-xs text-slate-400 mt-0.5">{sub}</div>}
        </div>
        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
            <Icon size={18} />
          </div>
        )}
      </div>
    </div>
  )
}
