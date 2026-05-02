// src/pages/auth/LoginPage.jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { authAPI } from '../../services/api'
import { Eye, EyeOff, AlertCircle, LogIn } from 'lucide-react'

const ROLE_REDIRECTS = {
  EMPLOYEE: '/employee/dashboard',
  HOD:      '/approver/dashboard',
  ADMIN:    '/admin/dashboard',
}

function validateEmpId(val) {
  if (!val.trim()) return 'Employee ID is required'
  if (val.trim().length < 3) return 'Must be at least 3 characters'
  return ''
}

function validatePassword(val) {
  if (!val) return 'Password is required'
  if (val.length < 4) return 'Must be at least 4 characters'
  return ''
}

export default function LoginPage() {
  const [empId, setEmpId] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [fieldErr, setFieldErr] = useState({ empId: '', password: '' })

  const { login } = useAuthStore()
  const navigate = useNavigate()

  function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const eE = validateEmpId(empId)
    const pE = validatePassword(password)
    setFieldErr({ empId: eE, password: pE })
    if (eE || pE) return

    setLoading(true)
    authAPI.login(empId.trim(), password)
      .then(response => {
        login(response, response.token)
        navigate(ROLE_REDIRECTS[response.role])
      })
      .catch(err => {
        setError(err.message || 'Login failed. Please try again.')
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: #d2d6de;
          min-height: 90vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .login-container {
          width: 100%;
         max-height: 89vh;
         min-height: 80vh;
          max-width: 620px;
          width:500px;
          padding: 20px;
          margin-bottom: 40px;
         
        }

        .login-card {
          background: white;
        height: 90%;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
          padding: 48px 40px;
          border-top: 3px solid #6278a4;
          border-bottom: 3px solid #6278a4;
        }

        .login-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .logo {
          width: 270px;
          height: 150px;
          margin: 0 auto 20px;
          display: block;
          border-radius: 12px;
          object-fit: contain;
      
        }

        .login-title {
          font-size: 28px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }

        .login-subtitle {
          font-size: 14px;
          color: #64748b;
          font-weight: 400;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .form-input {
          width: 100%;
          padding: 12px 16px;
          font-size: 14px;
          border: 1.5px solid #e2e8f0;
          border-radius: 8px;
          font-family: 'Inter', sans-serif;
          background: #f8fafc;
          transition: all 0.2s ease;
          color: #0f172a;
        }

        .form-input::placeholder {
          color: #cbd5e1;
        }

        .form-input:focus {
          outline: none;
          border-color: #667eea;
          background: white;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-input.error {
          border-color: #ef4444;
          background: #fef2f2;
        }

        .form-input.error:focus {
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
        }

        .form-error {
          font-size: 12px;
          color: #ef4444;
          margin-top: 6px;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .input-wrapper {
          position: relative;
        }

        .password-toggle {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #94a3b8;
          padding: 4px;
          display: flex;
          align-items: center;
          transition: color 0.2s;
        }

        .password-toggle:hover {
          color: #667eea;
        }

        .forgot-link {
          font-size: 13px;
          color: #667eea;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s;
          margin-bottom: 24px;
          display: inline-block;
        }

        .forgot-link:hover {
          color: #764ba2;
          text-decoration: underline;
        }

        .error-banner {
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          padding: 12px 14px;
          margin-bottom: 20px;
          display: flex;
          gap: 10px;
          align-items: flex-start;
        }

        .error-banner-icon {
          color: #dc2626;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .error-banner-text {
          font-size: 13px;
          color: #991b1b;
          line-height: 1.4;
        }

        .login-button {
          width: 100%;
          padding: 12px 16px;
          font-size: 14px;
          font-weight: 600;
          color: white;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          letter-spacing: 0.3px;
          margin-bottom: 16px;
        }

        .login-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
        }

        .login-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .login-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .demo-section {
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid #e2e8f0;
        }

        .demo-title {
          font-size: 12px;
          font-weight: 600;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 12px;
        }

        .demo-credentials {
          background: #f8fafc;
          border-radius: 8px;
          padding: 12px 14px;
          font-size: 12px;
          color: #475569;
          line-height: 1.6;
          font-family: 'Monaco', 'Courier New', monospace;
        }

        .demo-item {
          margin-bottom: 8px;
        }

        .demo-item:last-child {
          margin-bottom: 0;
        }

        .demo-label {
          color: #64748b;
          font-weight: 500;
        }

        .demo-value {
          color: #0f172a;
          font-weight: 600;
        }

        @media (max-width: 640px) {
          .login-card {
            padding: 32px 24px;
          }

          .login-title {
            font-size: 24px;
          }

          .logo {
            width: 64px;
            height: 64px;
          }
        }
      `}</style>

      <div className="login-container">
        <div className="login-card">
          {/* Header */}
          <div className="login-header">
            <img src="../public/citm_icon1.png" alt="CDGI Logo" className="logo" />
            <h1 className="login-title">No-Dues Portal</h1>
            <p className="login-subtitle">Chameli Devi Group of Institutions, Indore</p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="error-banner">
              <AlertCircle size={18} className="error-banner-icon" />
              <div className="error-banner-text">{error}</div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} noValidate>
            {/* Employee ID */}
            <div className="form-group">
              <label className="form-label">Employee ID</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  className={`form-input ${fieldErr.empId ? 'error' : ''}`}
                  placeholder="Enter your employee ID"
                  value={empId}
                  onChange={(e) => setEmpId(e.target.value)}
                  disabled={loading}
                  autoFocus
                />
              </div>
              {fieldErr.empId && <div className="form-error"><AlertCircle size={13} />{fieldErr.empId}</div>}
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrapper">
                <input
                  type={showPw ? 'text' : 'password'}
                  className={`form-input ${fieldErr.password ? 'error' : ''}`}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPw(!showPw)}
                  tabIndex="-1"
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {fieldErr.password && <div className="form-error"><AlertCircle size={13} />{fieldErr.password}</div>}
            </div>

            {/* Forgot Password */}
            <Link to="/forgot-password" className="forgot-link">
              Forgot password?
            </Link>

            {/* Login Button */}
            <button type="submit" className="login-button" disabled={loading}>
              {loading ? (
                <>
                  <div className="spinner" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
         
        </div>
      </div>
    </>
  )
}
