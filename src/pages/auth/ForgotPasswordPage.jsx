// src/pages/auth/ForgotPasswordPage.jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react'
import { authAPI } from '../../services/api'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0) // 0: email, 1: verify code, 2: success
  const [email, setEmail] = useState('')
  const [resetCode, setResetCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleRequestCode() {
    try {
      setError('')
      setLoading(true)

      if (!email) {
        setError('Please enter your email address')
        return
      }

      await authAPI.forgotPassword(email)
      setSuccess('Reset code sent to your email. Check your inbox!')
      setStep(1)
    } catch (err) {
      setError(err.message || 'Failed to send reset code')
    } finally {
      setLoading(false)
    }
  }

  async function handleResetPassword() {
    try {
      setError('')
      setLoading(true)

      if (!resetCode || !newPassword || !confirmPassword) {
        setError('Please fill all fields')
        return
      }

      if (newPassword !== confirmPassword) {
        setError('Passwords do not match')
        return
      }

      if (newPassword.length < 6) {
        setError('Password must be at least 6 characters')
        return
      }

      await authAPI.resetPassword(email, resetCode, newPassword)
      setSuccess('Password reset successful! Redirecting to login...')
      setStep(2)

      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (err) {
      setError(err.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-teal-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🔐</div>
          <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
          <p className="text-slate-200">Recover access to your account</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Step 0: Email */}
          {step === 0 && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                <Mail size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-semibold mb-1">Enter your email address</p>
                  <p className="text-xs">We'll send you a reset code to verify your identity</p>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                  <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {success && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
                  <CheckCircle2 className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              )}

              <div>
                <label className="label">Email Address</label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>

              <button
                onClick={handleRequestCode}
                disabled={loading || !email}
                className="btn-primary w-full"
              >
                {loading ? 'Sending...' : 'Send Reset Code'}
              </button>
            </div>
          )}

          {/* Step 1: Reset Code & Password */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-900">
                  ✓ Reset code sent to <strong>{email}</strong>
                </p>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                  <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div>
                <label className="label">Reset Code</label>
                <input
                  type="text"
                  className="input-field text-center text-lg tracking-widest font-mono"
                  placeholder="000000"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength="6"
                  disabled={loading}
                />
                <p className="text-xs text-slate-500 mt-1">Check your email for the 6-digit code</p>
              </div>

              <div>
                <label className="label">New Password</label>
                <input
                  type="password"
                  className="input-field"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div>
                <label className="label">Confirm Password</label>
                <input
                  type="password"
                  className="input-field"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setStep(0)
                    setError('')
                    setResetCode('')
                    setNewPassword('')
                    setConfirmPassword('')
                  }}
                  className="btn-secondary flex-1"
                  disabled={loading}
                >
                  Back
                </button>
                <button
                  onClick={handleResetPassword}
                  disabled={loading}
                  className="btn-primary flex-1"
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Success */}
          {step === 2 && (
            <div className="text-center space-y-4 animate-fade-in">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={32} className="text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Password Reset!</h2>
              <p className="text-sm text-slate-600">{success}</p>
              <button
                onClick={() => navigate('/login')}
                className="btn-primary w-full"
              >
                Go to Login
              </button>
            </div>
          )}

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-slate-200 text-center">
            <p className="text-sm text-slate-600">
              Remember your password?{' '}
              <Link to="/login" className="text-teal-600 hover:text-teal-700 font-semibold">
                Back to Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
