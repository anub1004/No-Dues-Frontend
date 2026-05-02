// src/pages/admin/ManageDepartmentsPage.jsx
import { useState, useEffect } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import { adminAPI } from '../../services/api'
import { Plus, Edit2, Trash2, CheckCircle2, Loader2, AlertCircle } from 'lucide-react'

const CLEARANCE_DEPARTMENTS = [
  { id: 1, name: 'HR Department', icon: '👔' },
  { id: 2, name: 'Finance Department', icon: '💰' },
  { id: 3, name: 'Library', icon: '📚' },
  { id: 4, name: 'IT Department', icon: '💻' },
  { id: 5, name: 'Operations', icon: '⚙️' },
  { id: 6, name: 'Administration', icon: '📋' },
]

export default function ManageDepartmentsPage() {
  const [departments, setDepartments] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState('BRANCH')
  const [newHodName, setNewHodName] = useState('')
  const [newHodEmail, setNewHodEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchDepartments()
  }, [])

  async function fetchDepartments() {
    try {
      setLoading(true)
      const data = await adminAPI.getDepartments()
      setDepartments(data || [])
      setError('')
    } catch (err) {
      setError(err.message || 'Failed to load departments')
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddDepartment() {
    if (!newName.trim()) {
      alert('Please enter department name')
      return
    }

    try {
      setActionLoading(true)
      await adminAPI.createDepartment({
        name: newName.trim(),
        type: newType,
        hodName: newHodName.trim() || null,
        hodEmail: newHodEmail.trim() || null
      })
      setNewName('')
      setNewType('BRANCH')
      setNewHodName('')
      setNewHodEmail('')
      setShowAdd(false)
      await fetchDepartments()
    } catch (err) {
      alert(err.message || 'Failed to create department')
      console.error('Create error:', err)
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <AppLayout title="Manage Departments">
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="animate-spin" size={32} />
        </div>
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout title="Manage Departments">
        <div className="text-red-600 text-center p-6">
          <AlertCircle className="inline-block mb-2" size={40} />
          <p>Error: {error}</p>
          <button onClick={fetchDepartments} className="btn-primary mt-4">
            Retry
          </button>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title="Manage Departments">
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">All Departments</h2>
          <button
            onClick={() => setShowAdd(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={15} /> Add Department
          </button>
        </div>

        <div className="card overflow-hidden">
          <div className="divide-y divide-slate-100">
            {departments.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                No departments found
              </div>
            ) : (
              departments.map(d => {
                const isClearance = CLEARANCE_DEPARTMENTS.find(cd => cd.name.toLowerCase() === d.name?.toLowerCase())
                return (
                  <div key={d.id} className="flex items-center gap-3 px-5 py-3.5">
                    <div className="w-8 h-8 bg-primary-600/10 rounded-lg flex items-center justify-center text-xs font-bold text-primary-600">
                      {d.name?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-slate-800">{d.name}</div>
                      <div className="flex gap-2 mt-0.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          d.type === 'HR' ? 'bg-red-100 text-red-700' :
                          d.type === 'CLEARANCE' ? 'bg-green-100 text-green-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {d.type || 'BRANCH'}
                        </span>
                        {isClearance && (
                          <span className="text-xs text-green-600 flex items-center gap-1">
                            <CheckCircle2 size={11} /> Required
                          </span>
                        )}
                      </div>
                      {d.hodName && (
                        <div className="text-xs text-slate-500 mt-1">HOD: {d.hodName} ({d.hodEmail})</div>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button
                        disabled
                        className="p-1.5 text-slate-400 hover:text-accent-600 hover:bg-accent-50 rounded-lg disabled:opacity-50"
                        title="Edit (Coming Soon)"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        disabled
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-50"
                        title="Delete (Coming Soon)"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="section-title mb-3">Clearance Chain Configuration</h3>
          <p className="text-xs text-slate-500 mb-3">These departments are part of the mandatory no-dues clearance process:</p>
          <div className="grid grid-cols-2 gap-2">
            {CLEARANCE_DEPARTMENTS.map(d => (
              <div key={d.id} className="flex items-center gap-2 bg-accent-50 border border-accent-200 rounded-xl px-3 py-2">
                <span className="text-base">{d.icon}</span>
                <span className="text-xs font-semibold text-accent-700">{d.name}</span>
              </div>
            ))}
          </div>
        </div>

        {showAdd && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm animate-fade-in">
              <h3 className="font-bold text-slate-800 mb-4">Add Department</h3>
              <div className="space-y-4">
                <div>
                  <label className="label">Department Name *</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. HR Department"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    disabled={actionLoading}
                  />
                </div>
                <div>
                  <label className="label">Department Type *</label>
                  <select
                    className="input-field"
                    value={newType}
                    onChange={e => setNewType(e.target.value)}
                    disabled={actionLoading}
                  >
                    <option value="BRANCH">Branch (User's Department)</option>
                    <option value="HR">HR (Required for all requests)</option>
                    <option value="CLEARANCE">Clearance (Finance, Library, etc.)</option>
                  </select>
                </div>
                <div>
                  <label className="label">HOD Name</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. John Doe"
                    value={newHodName}
                    onChange={e => setNewHodName(e.target.value)}
                    disabled={actionLoading}
                  />
                </div>
                <div>
                  <label className="label">HOD Email</label>
                  <input
                    type="email"
                    className="input-field"
                    placeholder="e.g. hod@company.com"
                    value={newHodEmail}
                    onChange={e => setNewHodEmail(e.target.value)}
                    disabled={actionLoading}
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowAdd(false)
                    setNewName('')
                    setNewType('BRANCH')
                    setNewHodName('')
                    setNewHodEmail('')
                  }}
                  disabled={actionLoading}
                  className="btn-secondary flex-1 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddDepartment}
                  disabled={actionLoading}
                  className="btn-primary flex-1 disabled:opacity-50"
                >
                  {actionLoading ? 'Adding...' : 'Add'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
