// src/pages/auth/LoginPage.jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { DEMO_USERS } from '../../constants/mockData'
import { authAPI } from '../../services/api'
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react'

const ROLE_REDIRECTS = {
  EMPLOYEE: '/employee/dashboard',
  HOD:      '/approver/dashboard',
  ADMIN:    '/admin/dashboard',
}

/* ── Validation rules ── */
function validateEmpId(val) {
  if (!val.trim())                             return 'Employee ID is required.'
  if (val.trim().length < 3)                   return 'Must be at least 3 characters.'
  if (!/^[A-Za-z0-9]+$/.test(val.trim()))     return 'Only letters and numbers allowed.'
  return ''
}
function validatePassword(val) {
  if (!val)           return 'Password is required.'
  if (val.length < 4) return 'Must be at least 4 characters.'
  return ''
}

/* password strength: 0-4 */
function getStrength(pw) {
  let s = 0
  if (pw.length >= 6)            s++
  if (pw.length >= 10)           s++
  if (/[A-Z]/.test(pw))         s++
  if (/[0-9]/.test(pw))         s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  return Math.min(s, 4)
}

const STRENGTH_LEVELS = [
  { pct: '20%',  bg: '#ef4444', label: 'Very weak',   color: '#ef4444' },
  { pct: '40%',  bg: '#f97316', label: 'Weak',         color: '#f97316' },
  { pct: '60%',  bg: '#eab308', label: 'Fair',         color: '#eab308' },
  { pct: '80%',  bg: '#22c55e', label: 'Strong',       color: '#22c55e' },
  { pct: '100%', bg: '#16a34a', label: 'Very strong',  color: '#16a34a' },
]

export default function LoginPage() {
  const [empId,    setEmpId]    = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [active,   setActive]   = useState(null)
  const [remember, setRemember] = useState(false)

  /* per-field touched + inline error */
  const [touched,  setTouched]  = useState({ empId: false, password: false })
  const [fieldErr, setFieldErr] = useState({ empId: '',    password: '' })

  const { login } = useAuthStore()
  const navigate  = useNavigate()

  /* blur → mark touched + validate */
  function handleBlur(field) {
    setTouched(p => ({ ...p, [field]: true }))
    setFieldErr(p => ({
      ...p,
      [field]: field === 'empId' ? validateEmpId(empId) : validatePassword(password),
    }))
  }

  /* live-validate only after first touch */
  function onEmpIdChange(val) {
    setEmpId(val)
    if (touched.empId) setFieldErr(p => ({ ...p, empId: validateEmpId(val) }))
  }
  function onPasswordChange(val) {
    setPassword(val)
    if (touched.password) setFieldErr(p => ({ ...p, password: validatePassword(val) }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const eE = validateEmpId(empId)
    const pE = validatePassword(password)
    setTouched({ empId: true, password: true })
    setFieldErr({ empId: eE, password: pE })
    if (eE || pE) return

    setLoading(true)
    authAPI.login(empId.trim(), password)
      .then(response => {
        // Response should have: token, id, empId, name, email, role, department, departmentId, designation
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

  function fillDemo(user) {
    setEmpId(user.empId); setPassword(user.password)
    setActive(user.empId); setError('')
    setTouched({ empId: false, password: false })
    setFieldErr({ empId: '', password: '' })
  }

  const demoGroups = [
    { label: 'Employee',       color: '#2563eb', users: DEMO_USERS.filter(u => u.role === 'EMPLOYEE') },
    { label: 'HOD / Approver', color: '#7c3aed', users: DEMO_USERS.filter(u => u.role === 'HOD') },
    { label: 'HR / Admin',     color: '#dc2626', users: DEMO_USERS.filter(u => u.role === 'ADMIN') },
  ]

  /* border / shadow helpers */
  const ib = f => !touched[f] ? '#e5e7eb' : fieldErr[f] ? '#ef4444' : '#22c55e'
  const is = f => !touched[f] ? 'none'    : fieldErr[f] ? '0 0 0 3px rgba(239,68,68,.12)' : '0 0 0 3px rgba(34,197,94,.12)'
  const bg = f => touched[f] && !fieldErr[f] ? '#f0fdf4' : ''

  const empOk = touched.empId     && !fieldErr.empId
  const pwOk  = touched.password  && !fieldErr.password
  const str   = STRENGTH_LEVELS[getStrength(password)]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: 'Poppins', sans-serif;
          background: #1565c0; min-height: 100vh;
          display: flex; align-items: center; justify-content: center;
        }

        .lp-wrap {
          width: 900px; max-width: 96vw; min-height: 520px;
          display: flex; border-radius: 22px; overflow: hidden;
          box-shadow: 0 30px 80px rgba(0,0,0,.35);
        }

        /* LEFT */
        .lp-left {
          width: 340px; flex-shrink: 0; background: #1565c0;
          position: relative; display: flex; flex-direction: column;
          align-items: flex-start; justify-content: center;
          padding: 48px 40px; overflow: hidden;
        }
        .lp-circle { position: absolute; border-radius: 50%; }
        .lp-circle-1 { width:280px;height:280px;top:-60px;left:-80px;background:#1976d2; }
        .lp-circle-2 { width:200px;height:200px;bottom:-50px;right:-60px;background:#1976d2; }
        .lp-circle-3 { width:130px;height:130px;bottom:60px;left:20px;background:#0d47a1; }
        .lp-circle-4 { width:80px;height:80px;top:180px;right:10px;background:#0d47a1; }
        .lp-left-content { position:relative;z-index:2; }
        .lp-welcome { font-size:34px;font-weight:800;color:#fff;line-height:1.1;letter-spacing:-.5px;margin-bottom:6px; }
        .lp-tagline { font-size:12px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.6);margin-bottom:20px; }
        .lp-desc    { font-size:12.5px;color:rgba(255,255,255,.5);line-height:1.7;max-width:220px; }
        .lp-badge   { display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.15);border-radius:20px;padding:5px 14px;font-size:11px;color:rgba(255,255,255,.7);margin-top:28px; }
        .lp-badge-dot { width:6px;height:6px;background:#4ade80;border-radius:50%; }
        .lp-logo { width:150px;height:150px;object-fit:contain;background:transparent;margin:10px 0 8px;display:block;border-radius:50%;filter:drop-shadow(0 3px 10px rgba(0,0,0,.25)); }

        /* RIGHT */
        .lp-right { flex:1;background:#fff;display:flex;align-items:center;justify-content:center;padding:36px 44px;overflow-y:auto; }
        .lp-form-box { width:100%;max-width:320px; }
        .lp-form-title { font-size:26px;font-weight:700;color:#0d1b2a;margin-bottom:4px; }
        .lp-form-sub   { font-size:12.5px;color:#9ca3af;margin-bottom:26px; }

        /* inputs */
        .lp-input-group { position:relative;margin-bottom:2px; }
        .lp-input-icon  { position:absolute;left:13px;top:50%;transform:translateY(-50%);color:#9ca3af;display:flex;align-items:center;pointer-events:none;transition:color .15s; }
        .lp-input-icon.ok  { color:#22c55e; }
        .lp-input-icon.err { color:#ef4444; }
        .lp-input {
          width:100%;padding:11px 36px 11px 38px;
          border:1.5px solid #e5e7eb;border-radius:10px;
          font-family:'Poppins',sans-serif;font-size:13px;color:#111827;
          background:#f9fafb;outline:none;
          transition:border-color .15s,background .15s,box-shadow .15s;
        }
        .lp-input::placeholder { color:#c4c9d4; }
        .lp-input:focus { border-color:#1565c0;background:#fff;box-shadow:0 0 0 3px rgba(21,101,192,.1); }

        /* status icon right side */
        .lp-status-icon {
          position:absolute;right:11px;top:50%;transform:translateY(-50%);
          display:flex;align-items:center;pointer-events:none;
          animation:lp-pop .2s ease;
        }
        @keyframes lp-pop {
          from{opacity:0;transform:translateY(-50%) scale(.5);}
          to  {opacity:1;transform:translateY(-50%) scale(1);}
        }
        .lp-eye-btn { position:absolute;right:11px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#9ca3af;display:flex;align-items:center;padding:2px;transition:color .12s; }
        .lp-eye-btn:hover { color:#374151; }

        /* field messages */
        .lp-field-msg {
          display:flex;align-items:center;gap:5px;
          font-size:11px;margin:3px 0 8px 2px;
          animation:lp-slide .18s ease;
        }
        @keyframes lp-slide { from{opacity:0;transform:translateY(-4px);}to{opacity:1;transform:translateY(0);} }
        .lp-field-msg.err { color:#ef4444; }
        .lp-field-msg.ok  { color:#16a34a; }

        /* strength meter */
        .lp-str { margin:3px 0 8px; }
        .lp-str-bar  { height:3px;border-radius:2px;background:#e5e7eb;overflow:hidden; }
        .lp-str-fill { height:100%;border-radius:2px;transition:width .25s,background .25s; }
        .lp-str-lbl  { font-size:10px;font-weight:600;margin-top:3px;letter-spacing:.04em; }

        /* row */
        .lp-row { display:flex;align-items:center;justify-content:space-between;margin:10px 0 18px; }
        .lp-remember { display:flex;align-items:center;gap:7px;font-size:12px;color:#6b7280;cursor:pointer; }
        .lp-remember input { accent-color:#1565c0;width:13px;height:13px;cursor:pointer; }
        .lp-forgot { font-size:12px;color:#1565c0;background:none;border:none;cursor:pointer;font-family:'Poppins',sans-serif;font-weight:500; }
        .lp-forgot:hover { text-decoration:underline; }

        /* server error */
        .lp-error { display:flex;align-items:center;gap:8px;background:#fef2f2;border:1px solid #fecaca;color:#b91c1c;font-size:12px;border-radius:8px;padding:9px 12px;margin-bottom:13px;animation:lp-slide .2s ease; }

        /* btn */
        .lp-btn {
          width:100%;padding:12px;background:#1565c0;color:#fff;
          border:none;border-radius:10px;font-family:'Poppins',sans-serif;
          font-size:13.5px;font-weight:600;cursor:pointer;letter-spacing:.03em;
          display:flex;align-items:center;justify-content:center;gap:8px;
          transition:background .15s,transform .1s,box-shadow .15s;
          box-shadow:0 4px 14px rgba(21,101,192,.35);
        }
        .lp-btn:hover:not(:disabled) { background:#1254a5;box-shadow:0 6px 18px rgba(21,101,192,.4); }
        .lp-btn:active:not(:disabled){ transform:scale(.985); }
        .lp-btn:disabled { opacity:.55;cursor:not-allowed; }
        .lp-spinner { width:15px;height:15px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:lp-spin .6s linear infinite; }
        @keyframes lp-spin { to{transform:rotate(360deg);} }

        .lp-div { display:flex;align-items:center;gap:12px;margin:14px 0; }
        .lp-div-line { flex:1;height:1px;background:#e5e7eb; }
        .lp-div-txt  { font-size:11.5px;color:#9ca3af; }

        /* demo */
        .lp-demo { margin-top:18px;border:1.5px dashed #bfdbfe;border-radius:12px;padding:13px 15px;background:#f8fbff; }
        .lp-demo-ttl { font-size:10.5px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#93c5fd;margin-bottom:11px; }
        .lp-demo-grp { margin-bottom:9px; }
        .lp-demo-grp:last-child { margin-bottom:0; }
        .lp-demo-role { font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;margin-bottom:5px; }
        .lp-demo-row  { display:flex;gap:5px;flex-wrap:wrap; }
        .lp-chip { display:flex;align-items:center;gap:5px;padding:5px 10px;background:#fff;border:1.5px solid #e2e8f0;border-radius:7px;font-size:11.5px;cursor:pointer;font-family:'Poppins',sans-serif;transition:all .12s;color:#374151; }
        .lp-chip:hover  { border-color:#1565c0;background:#eff6ff; }
        .lp-chip.active { border-color:#1565c0;background:#dbeafe; }
        .lp-chip-id   { font-weight:700;font-size:11px;color:#1e40af; }
        .lp-chip-name { color:#9ca3af;font-size:11px; }

        @media(max-width:640px){
          .lp-left{display:none;}
          .lp-wrap{border-radius:0;min-height:100vh;}
          .lp-right{padding:32px 24px;}
        }
      `}</style>

      <div className="lp-wrap">

        {/* LEFT */}
        <div className="lp-left">
          <div className="lp-circle lp-circle-1" /><div className="lp-circle lp-circle-2" />
          <div className="lp-circle lp-circle-3" /><div className="lp-circle lp-circle-4" />
          <div className="lp-left-content">
            <h1 className="lp-welcome">WELCOME</h1>
            <img src="/image.png" alt="CDGI Logo" className="lp-logo" />
            <p className="lp-tagline">CDGI No-Dues Portal</p>
            <p className="lp-desc">Chameli Devi Group of Institutions, Indore.<br />Submit, track, and download your No-Dues clearance — fully online.</p>
           
          </div>
        </div>

        {/* RIGHT */}
        <div className="lp-right">
          <div className="lp-form-box">
            <h2 className="lp-form-title">Sign in</h2>
            <p className="lp-form-sub">Enter your Employee ID and password to continue</p>

            <form onSubmit={handleSubmit} noValidate autoComplete="off">

              {/* ── Employee ID ── */}
              <div className="lp-input-group">
                <span className={`lp-input-icon${touched.empId ? (fieldErr.empId ? ' err' : ' ok') : ''}`}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                </span>
                <input
                  type="text" className="lp-input" placeholder="Employee ID"
                  value={empId}
                  onChange={e => onEmpIdChange(e.target.value)}
                  onBlur={() => handleBlur('empId')}
                  required autoComplete="username"
                  style={{ borderColor: ib('empId'), boxShadow: is('empId'), background: bg('empId') }}
                />
                {touched.empId && (
                  <span className="lp-status-icon">
                    {fieldErr.empId
                      ? <AlertCircle   size={15} color="#ef4444" />
                      : <CheckCircle2  size={15} color="#22c55e" />}
                  </span>
                )}
              </div>
              {touched.empId && fieldErr.empId && (
                <div className="lp-field-msg err"><AlertCircle size={11}/>{fieldErr.empId}</div>
              )}
              {empOk && (
                <div className="lp-field-msg ok"><CheckCircle2 size={11}/></div>
              )}

              {/* ── Password ── */}
              <div className="lp-input-group">
                <span className={`lp-input-icon${touched.password ? (fieldErr.password ? ' err' : ' ok') : ''}`}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input
                  type={showPw ? 'text' : 'password'} className="lp-input" placeholder="Password"
                  value={password}
                  onChange={e => onPasswordChange(e.target.value)}
                  onBlur={() => handleBlur('password')}
                  required autoComplete="current-password"
                  style={{ borderColor: ib('password'), boxShadow: is('password'), background: bg('password') }}
                />
                <button type="button" className="lp-eye-btn" onClick={() => setShowPw(v => !v)} aria-label="Toggle password">
                  {showPw ? <EyeOff size={14}/> : <Eye size={14}/>}
                </button>
              </div>

              {/* Strength meter */}
              {password.length > 0 && (
                <div className="lp-str">
                  <div className="lp-str-bar">
                    <div className="lp-str-fill" style={{ width: str.pct, background: str.bg }} />
                  </div>
                  <div className="lp-str-lbl" style={{ color: str.color }}>{str.label}</div>
                </div>
              )}

              {touched.password && fieldErr.password && (
                <div className="lp-field-msg err"><AlertCircle size={11}/>{fieldErr.password}</div>
              )}
              {pwOk && (
                <div className="lp-field-msg ok"><CheckCircle2 size={11}/>Password accepted</div>
              )}

              {/* Remember + Forgot */}
              <div className="lp-row">
                <label className="lp-remember">
                  <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}/>
                  Remember me
                </label>
                <Link to="/forgot-password" className="lp-forgot">Forgot Password?</Link>
              </div>

              {/* Server error */}
              {error && (
                <div className="lp-error"><AlertCircle size={13}/>{error}</div>
              )}

              <button type="submit" className="lp-btn" disabled={loading}>
                {loading ? <><div className="lp-spinner"/>Signing in…</> : 'Sign In'}
              </button>

             

            </form>

           

          </div>
        </div>
      </div>
    </>
  )
}