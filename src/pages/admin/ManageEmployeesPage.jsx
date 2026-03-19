// src/pages/admin/ManageEmployeesPage.jsx
import { useState } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import { DEMO_USERS, DEPARTMENTS } from '../../constants/mockData'
import { Search, Plus, Edit2, UserX, Shield, User } from 'lucide-react'

const ROLE_COLOR = { EMPLOYEE: 'blue', HOD: 'purple', ADMIN: 'red' }
const ROLE_ICON = { EMPLOYEE: User, HOD: Shield, ADMIN: Shield }

export default function ManageEmployeesPage() {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [showAdd, setShowAdd] = useState(false)

  const filtered = DEMO_USERS.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
                        u.empId.toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter
    return matchSearch && matchRole
  })

  return (
    <AppLayout title="Manage Employees">
      <div className="space-y-4">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex gap-3 flex-1 w-full">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Search employees..." className="input-field pl-9" value={search} onChange={e => setSearch(e.target.value)} />
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
            {filtered.map(emp => {
              const RoleIcon = ROLE_ICON[emp.role]
              return (
                <div key={emp.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 px-5 py-4 items-center hover:bg-slate-50 transition-all">
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {emp.avatar}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-800">{emp.name}</div>
                      <div className="text-xs text-slate-400">{emp.email}</div>
                    </div>
                  </div>
                  <div className="col-span-2 font-mono text-xs text-slate-600">{emp.empId}</div>
                  <div className="col-span-3 text-xs text-slate-600">{emp.department}</div>
                  <div className="col-span-2">
                    <span className={`badge ${
                      emp.role === 'EMPLOYEE' ? 'badge-review' :
                      emp.role === 'HOD' ? 'badge-pending' : 'badge-rejected'
                    } flex items-center gap-1 w-fit`}>
                      <RoleIcon size={10} /> {emp.role}
                    </span>
                  </div>
                  <div className="col-span-1 flex gap-1">
                    <button className="p-1.5 text-slate-400 hover:text-accent-600 hover:bg-accent-50 rounded-lg transition-all" title="Edit">
                      <Edit2 size={13} />
                    </button>
                    <button className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Deactivate">
                      <UserX size={13} />
                    </button>
                  </div>
                </div>
              )
            })}
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
                    <label className="label">Full Name</label>
                    <input type="text" className="input-field" placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="label">Employee ID</label>
                    <input type="text" className="input-field" placeholder="EMP010" />
                  </div>
                </div>
                <div>
                  <label className="label">Email</label>
                  <input type="email" className="input-field" placeholder="john@cdgi.edu.in" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Designation</label>
                    <input type="text" className="input-field" placeholder="Assistant Professor" />
                  </div>
                  <div>
                    <label className="label">Role</label>
                    <select className="input-field">
                      <option value="EMPLOYEE">EMPLOYEE</option>
                      <option value="HOD">HOD</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label">Department</label>
                  <select className="input-field">
                    {DEPARTMENTS.map(d => <option key={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Temporary Password</label>
                  <input type="text" className="input-field" placeholder="emp123" />
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setShowAdd(false)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={() => { alert('In a real system, this would save to the database.'); setShowAdd(false) }} className="btn-primary flex-1">
                  Add Employee
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
