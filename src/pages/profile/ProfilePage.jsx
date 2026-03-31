// src/pages/profile/ProfilePage.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout'
import { useAuthStore } from '../../store/authStore'
import { authAPI } from '../../services/api'
import { ArrowLeft, Edit2, Save, X, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({})

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    try {
      setLoading(true)
      setError('')
      const data = await authAPI.getProfile()
      setProfile(data)
      setFormData(data)
    } catch (err) {
      setError(err.message || 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveProfile() {
    try {
      setError('')
      setSuccess('')
      setLoading(true)

      await authAPI.updateProfile(formData)
      setProfile(formData)
      setEditing(false)
      setSuccess('Profile updated successfully')

      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  if (loading && !profile) {
    return (
      <AppLayout title="Profile">
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="animate-spin" size={32} />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title="My Profile">
      <div className="max-w-2xl mx-auto">
        {/* Back button */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-4">
          <ArrowLeft size={16} /> Back
        </button>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
            <CheckCircle2 className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        {/* Profile Card */}
        <div className="card p-6">
          {/* Header with avatar */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-teal-600">
                  {profile?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{profile?.name}</h1>
                <p className="text-sm text-slate-500">{profile?.role}</p>
              </div>
            </div>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="btn-secondary flex items-center gap-2 text-sm"
              >
                <Edit2 size={16} /> Edit Profile
              </button>
            )}
          </div>

          {/* Profile Information */}
          <div className="space-y-4">
            {/* Row 1 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Employee ID</label>
                {editing ? (
                  <input
                    type="text"
                    className="input-field"
                    value={formData.empId}
                    disabled
                  />
                ) : (
                  <div className="p-3 bg-slate-50 rounded-lg text-slate-700 font-medium">
                    {profile?.empId}
                  </div>
                )}
              </div>
              <div>
                <label className="label">Email Address</label>
                {editing ? (
                  <input
                    type="email"
                    className="input-field"
                    value={formData.email}
                    disabled
                  />
                ) : (
                  <div className="p-3 bg-slate-50 rounded-lg text-slate-700 font-medium">
                    {profile?.email}
                  </div>
                )}
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Full Name</label>
                {editing ? (
                  <input
                    type="text"
                    className="input-field"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                ) : (
                  <div className="p-3 bg-slate-50 rounded-lg text-slate-700 font-medium">
                    {profile?.name}
                  </div>
                )}
              </div>
              <div>
                <label className="label">Role</label>
                <div className="p-3 bg-slate-50 rounded-lg text-slate-700 font-medium">
                  {profile?.role}
                </div>
              </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Department</label>
                <div className="p-3 bg-slate-50 rounded-lg text-slate-700 font-medium">
                  {profile?.department || '—'}
                </div>
              </div>
              <div>
                <label className="label">Designation</label>
                <div className="p-3 bg-slate-50 rounded-lg text-slate-700 font-medium">
                  {profile?.designation || '—'}
                </div>
              </div>
            </div>

            {/* Account Status */}
            <div>
              <label className="label">Account Status</label>
              <div className={`p-3 rounded-lg font-medium ${
                profile?.isActive
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-700'
              }`}>
                {profile?.isActive ? '✓ Active' : '✗ Deactivated'}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 pt-6 border-t border-slate-200 flex gap-3">
            {editing ? (
              <>
                <button
                  onClick={() => {
                    setEditing(false)
                    setFormData(profile)
                  }}
                  className="btn-secondary flex-1 flex items-center justify-center gap-2"
                >
                  <X size={16} /> Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {loading ? 'Saving...' : <><Save size={16} /> Save Changes</>}
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate('/settings')}
                className="btn-secondary flex-1"
              >
                Go to Settings
              </button>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
