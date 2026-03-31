// src/pages/admin/ManageEmployeesPage.jsx
import { useState, useEffect } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import { adminAPI } from '../../services/api'
import { Search, Plus, Edit2, UserX, Shield, User, Loader2, AlertCircle } from 'lucide-react'

const ROLE_COLOR = { EMPLOYEE: 'blue', HOD: 'purple', ADMIN: 'red' }
const ROLE_ICON = { EMPLOYEE: User, HOD: Shield, ADMIN: Shield }
const DEPARTMENTS = ['HR', 'Finance', 'IT', 'Operations', 'Administration', 'Library']

export default function ManageEmployeesPage() {
  const [employees, setEmployees] = useState([])
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [showAdd, setShowAdd] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  // Form state for adding employee
  const [formData, setFormData] = useState({
    name: '',
    empId: '',
    email: '',
    designation: '',
    role: 'EMPLOYEE',
    department: DEPARTMENTS[0],
    password: ''
  })

  useEffect(() => {
    fetchEmployees()
  }, [])

  async function fetchEmployees() {
    try {
      setLoading(true)
      const data = await adminAPI.getEmployees()
      setEmployees(data || [])
      setError('')
    } catch (err) {
      setError(err.message || 'Failed to load employees')
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddEmployee() {
    if (!formData.name || !formData.empId || !formData.email) {
      alert('Please fill in all required fields')
      return
    }

    try {
      setActionLoading(true)
      await adminAPI.createEmployee(formData)
      setShowAdd(false)
      setFormData({
        name: '',
        empId: '',
        email: '',
        designation: '',
        role: 'EMPLOYEE',
        department: DEPARTMENTS[0],
        password: ''
      })
      await fetchEmployees()
    } catch (err) {
      alert(err.message || 'Failed to create employee')
      console.error('Create error:', err)
    } finally {
      setActionLoading(false)
    }
  }

  async function handleDeactivate(empId) {
    if (!window.confirm('Are you sure you want to deactivate this employee?')) {
      return
    }

    try {
      setActionLoading(true)
      await adminAPI.deactivateEmployee(empId)
      await fetchEmployees()
    } catch (err) {
      alert(err.message || 'Failed to deactivate employee')
      console.error('Deactivate error:', err)
    } finally {
      setActionLoading(false)
    }
  }

  const filtered = employees.filter(u => {
    const matchSearch = u.name?.toLowerCase().includes(search.toLowerCase()) ||
                        u.empId?.toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter
    return matchSearch && matchRole
  })

  if (loading) {
    return (
      <AppLayout title="Manage Employees">
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="animate-spin" size={32} />
        </div>
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout title="Manage Employees">
        <div className="text-red-600 text-center p-6">
          <AlertCircle className="inline-block mb-2" size={40} />
          <p>Error: {error}</p>
          <button onClick={fetchEmployees} className="btn-primary mt-4">
            Retry
          </button>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title="Manage Employees">
      <div className="space-y-4">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex gap-3 flex-1 w-full">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search employees..."
                className="input-field pl-9"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              {['ALL', 'EMPLOYEE', 'HOD', 'ADMIN'].map(r => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    roleFilter === r ? 'bg-primary-600 text-white' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="btn-primary flex items-center gap-2 whitespace-nowrap"
          >
            <Plus size={15} /> Add Employee
          </button>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="hidden md:grid grid-cols-12 gap-2 px-5 py-3 bg-slate-700 text-white text-xs font-bold uppercase tracking-wider">
            <div className="col-span-4">Employee</div>
            <div className="col-span-2">ID</div>
            <div className="col-span-3">Department</div>
            <div className="col-span-2">Role</div>
            <div className="col-span-1">Actions</div>
          </div>
          <div className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                No employees found
              </div>
            ) : (
              filtered.map(emp => {
                const RoleIcon = ROLE_ICON[emp.role]
                return (
                  <div key={emp.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 px-5 py-4 items-center hover:bg-slate-50 transition-all">
                    <div className="col-span-4 flex items-center gap-3">
                      <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {emp.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-800">{emp.name}</div>
                        <div className="text-xs text-slate-400">{emp.email}</div>
                      </div>
                    </div>
                    <div className="col-span-2 font-mono text-xs text-slate-600">{emp.empId}</div>
                    <div className="col-span-3 text-xs text-slate-600">{emp.department}</div>
                    <div className="col-span-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        emp.role === 'EMPLOYEE' ? 'bg-blue-100 text-blue-800' :
                        emp.role === 'HOD' ? 'bg-purple-100 text-purple-800' :
                        'bg-red-100 text-red-800'
                      } flex items-center gap-1 w-fit`}>
                        <RoleIcon size={10} /> {emp.role}
                      </span>
                    </div>
                    <div className="col-span-1 flex gap-1">
                      <button
                        disabled={actionLoading}
                        className="p-1.5 text-slate-400 hover:text-accent-600 hover:bg-accent-50 rounded-lg transition-all disabled:opacity-50"
                        title="Edit (Coming Soon)"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleDeactivate(emp.id)}
                        disabled={actionLoading}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                        title="Deactivate"
                      >
                        <UserX size={13} />
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Add Employee Modal */}
        {showAdd && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Add New Employee</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Full Name *</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="label">Employee ID *</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="EMP010"
                      value={formData.empId}
                      onChange={e => setFormData({...formData, empId: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="label">Email *</label>
                  <input
                    type="email"
                    className="input-field"
                    placeholder="john@cdgi.edu.in"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Designation</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Assistant Professor"
                      value={formData.designation}
                      onChange={e => setFormData({...formData, designation: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="label">Role</label>
                    <select
                      className="input-field"
                      value={formData.role}
                      onChange={e => setFormData({...formData, role: e.target.value})}
                    >
                      <option value="EMPLOYEE">EMPLOYEE</option>
                      <option value="HOD">HOD</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label">Department</label>
                  <select
                    className="input-field"
                    value={formData.department}
                    onChange={e => setFormData({...formData, department: e.target.value})}
                  >
                    {DEPARTMENTS.map(d => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Temporary Password</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="emp123"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setShowAdd(false)}
                  disabled={actionLoading}
                  className="btn-secondary flex-1 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddEmployee}
                  disabled={actionLoading}
                  className="btn-primary flex-1 disabled:opacity-50"
                >
                  {actionLoading ? 'Adding...' : 'Add Employee'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
