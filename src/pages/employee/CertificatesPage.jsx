// src/pages/employee/CertificatesPage.jsx
import { useEffect, useState } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import EmptyState from '../../components/common/EmptyState'
import { employeeAPI } from '../../services/api'
import { Download, Award, Shield, Loader2 } from 'lucide-react'

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCertificates()
  }, [])

  async function fetchCertificates() {
    try {
      setLoading(true)
      const data = await employeeAPI.getCertificates()
      setCertificates(data || [])
    } catch (err) {
      setError(err.message || 'Failed to load certificates')
      console.error('Fetch certificates error:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleDownloadCertificate(certificateId) {
    try {
      const result = await employeeAPI.downloadCertificate(certificateId)
      console.log('✅ Certificate downloaded:', result.message)
    } catch (err) {
      const errorMessage = err.message || 'Failed to download certificate'
      console.error('❌ Download error:', err)
      alert(`Download failed: ${errorMessage}\n\nPlease try again or contact support if the problem persists.`)
    }
  }

  if (loading) {
    return (
      <AppLayout title="My Certificates">
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="animate-spin" size={32} />
        </div>
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout title="My Certificates">
        <div className="text-red-600 text-center p-6">
          <p>Error: {error}</p>
          <button
            onClick={fetchCertificates}
            className="btn-primary mt-4"
          >
            Retry
          </button>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title="My Certificates">
      <div className="max-w-2xl mx-auto space-y-4">
        <h2 className="text-lg font-bold text-slate-800">No-Dues Certificates</h2>

        {certificates.length === 0 ? (
          <div className="card">
            <EmptyState
              icon="🎓"
              title="No certificates yet"
              description="Certificates will appear here once all departments approve your clearance request."
            />
          </div>
        ) : (
          certificates.map(req => (
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
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">✓ Issued</span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-slate-400">Employee:</span> <span className="font-semibold">{req.empName}</span></div>
                    <div><span className="text-slate-400">Reason:</span> <span className="font-semibold">{req.reason}</span></div>
                    <div><span className="text-slate-400">Submitted:</span> <span className="font-semibold">{req.submittedAt}</span></div>
                    <div><span className="text-slate-400">Status:</span> <span className="font-semibold">{req.overallStatus}</span></div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleDownloadCertificate(req.id)}
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
