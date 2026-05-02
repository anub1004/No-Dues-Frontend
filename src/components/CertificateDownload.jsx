import { useState } from 'react'
import { Download, FileText, AlertCircle, Loader2 } from 'lucide-react'

export default function CertificateDownload({ request, onDownload }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!request || request.overallStatus !== 'APPROVED' || !request.certificatePath) {
    return null
  }

  async function handleDownload() {
    try {
      setLoading(true)
      setError('')
      if (onDownload) {
        await onDownload()
        // Show success feedback
        console.log('✅ Certificate downloaded successfully')
      }
    } catch (err) {
      const errorMsg = err.message || 'Failed to download certificate'
      console.error('❌ Download error:', err)
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card p-6 bg-gradient-to-r from-emerald-50 to-teal-50 border-l-4 border-emerald-500">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1">
          <div className="w-14 h-14 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <FileText size={28} className="text-emerald-600" />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-bold text-slate-800 text-lg">🎓 Certificate Generated</h3>
            </div>
            <p className="text-slate-600 text-sm">
              Your no-dues certificate has been successfully generated. Download it now.
            </p>

            <div className="grid grid-cols-2 gap-3 mt-4">
              {request.empName && (
                <div>
                  <div className="text-xs text-slate-500 font-medium">Employee Name</div>
                  <div className="font-semibold text-slate-800">{request.empName}</div>
                </div>
              )}
              {request.department && (
                <div>
                  <div className="text-xs text-slate-500 font-medium">Department</div>
                  <div className="font-semibold text-slate-800">{request.department}</div>
                </div>
              )}
              {request.empCode && (
                <div>
                  <div className="text-xs text-slate-500 font-medium">Employee Code</div>
                  <div className="font-semibold text-slate-800">{request.empCode}</div>
                </div>
              )}
              {request.designation && (
                <div>
                  <div className="text-xs text-slate-500 font-medium">Designation</div>
                  <div className="font-semibold text-slate-800">{request.designation}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={handleDownload}
          disabled={loading}
          className="btn-primary flex items-center gap-2 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Downloading...
            </>
          ) : (
            <>
              <Download size={16} />
              Download PDF
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mt-3 p-2 bg-red-100 border border-red-200 rounded text-xs text-red-700 flex gap-2">
          <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}

