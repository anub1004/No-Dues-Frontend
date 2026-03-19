// src/pages/employee/CertificatesPage.jsx
import AppLayout from '../../components/layout/AppLayout'
import { useAuthStore } from '../../store/authStore'
import { useRequestStore } from '../../store/requestStore'
import EmptyState from '../../components/common/EmptyState'
import { formatDate } from '../../utils/helpers'
import { Download, Award, Shield } from 'lucide-react'

export default function CertificatesPage() {
  const { user } = useAuthStore()
  const { getRequestsByEmpId } = useRequestStore()

  const approved = getRequestsByEmpId(user?.id).filter(r => r.overallStatus === 'APPROVED')

  return (
    <AppLayout title="My Certificates">
      <div className="max-w-2xl mx-auto space-y-4">
        <h2 className="text-lg font-bold text-slate-800">No-Dues Certificates</h2>

        {approved.length === 0 ? (
          <div className="card">
            <EmptyState
              icon="🎓"
              title="No certificates yet"
              description="Certificates will appear here once all departments approve your clearance request."
            />
          </div>
        ) : (
          approved.map(req => (
            <div key={req.id} className="card p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Award size={22} className="text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800">No-Dues Certificate</div>
                      <div className="font-mono text-xs text-slate-500 mt-0.5">{req.id}</div>
                    </div>
                    <span className="badge badge-approved">✓ Issued</span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-slate-400">Employee:</span> <span className="font-semibold">{req.empName}</span></div>
                    <div><span className="text-slate-400">Reason:</span> <span className="font-semibold">{req.reason}</span></div>
                    <div><span className="text-slate-400">Submitted:</span> <span className="font-semibold">{formatDate(req.submittedAt)}</span></div>
                    <div><span className="text-slate-400">Depts Cleared:</span> <span className="font-semibold">{req.departmentStatuses.length}/{req.departmentStatuses.length}</span></div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => alert(`Certificate ${req.id} would download as PDF in a real system.\n\nEmployee: ${req.empName}\nID: ${req.empCode}\nReason: ${req.reason}`)}
                      className="btn-success flex items-center gap-2 text-sm"
                    >
                      <Download size={14} /> Download PDF
                    </button>
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <Shield size={12} /> Digitally Verified
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </AppLayout>
  )
}
