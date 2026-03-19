// src/components/layout/Sidebar.jsx
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import {
  LayoutDashboard, FilePlus, FileText, Award, Bell,
  Users, Building2, GitBranch, BarChart3, Shield,
  ClipboardList, CheckSquare, LogOut, X, ChevronRight,
} from 'lucide-react'

const NAV = {
  EMPLOYEE: [
    { to: '/employee/dashboard',   label: 'Dashboard',        icon: LayoutDashboard },
    { to: '/employee/new-request', label: 'New Request',      icon: FilePlus },
    { to: '/employee/requests',    label: 'My Requests',      icon: FileText },
    { to: '/employee/certificates',label: 'Certificates',     icon: Award },
  ],
  HOD: [
    { to: '/approver/dashboard',   label: 'Dashboard',        icon: LayoutDashboard },
    { to: '/approver/pending',     label: 'Pending Requests', icon: ClipboardList },
    { to: '/approver/history',     label: 'Approval History', icon: CheckSquare },
  ],
  ADMIN: [
    { to: '/admin/dashboard',      label: 'Dashboard',        icon: LayoutDashboard },
    { to: '/admin/employees',      label: 'Employees',        icon: Users },
    { to: '/admin/departments',    label: 'Departments',      icon: Building2 },
    { to: '/admin/workflow',       label: 'Workflow Config',  icon: GitBranch },
    { to: '/admin/reports',        label: 'Reports',          icon: BarChart3 },
    { to: '/admin/audit',          label: 'Audit Logs',       icon: Shield },
  ],
}

const ROLE_META = {
  EMPLOYEE: { label: 'Employee Portal',   badge: 'STAFF',  color: '#22d3ee' },
  HOD:      { label: 'Department Portal', badge: 'HOD',    color: '#a78bfa' },
  ADMIN:    { label: 'Admin Panel',       badge: 'ADMIN',  color: '#fb923c' },
}

export default function Sidebar({ onClose }) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const items    = NAV[user?.role] || []
  const meta     = ROLE_META[user?.role] || { label: 'Portal', badge: '—', color: '#22d3ee' }

  function handleLogout() {
    logout()
    navigate('/login')
  }

  /* initials from name */
  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : 'U'

  return (
    <>
      {/* ── Google Font ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        .sb-root {
          font-family: 'Plus Jakarta Sans', sans-serif;
          display: flex;
          flex-direction: column;
          height: 100%;
          width: 100%;
          background: #0b1120;
          position: relative;
          overflow: hidden;
        }

        /* mesh gradient background */
        .sb-root::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 70% 50% at 10% 0%,   rgba(99,102,241,.18) 0%, transparent 55%),
            radial-gradient(ellipse 50% 40% at 90% 100%, rgba(20,184,166,.12) 0%, transparent 50%);
          pointer-events: none;
        }

        /* subtle grid lines */
        .sb-root::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px);
          background-size: 28px 28px;
          pointer-events: none;
        }

        /* ── HEADER ── */
        .sb-header {
          position: relative; z-index: 2;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 22px 20px 18px;
          border-bottom: 1px solid rgba(255,255,255,.06);
        }

        .sb-brand {
          display: flex; align-items: center; gap: 11px;
        }

        .sb-logo-box {
          width: 38px; height: 38px;
          border-radius: 11px;
          background: linear-gradient(135deg, #6366f1 0%, #22d3ee 100%);
          display: flex; align-items: center; justify-content: center;
          font-weight: 800; font-size: 17px; color: #fff;
          box-shadow: 0 4px 14px rgba(99,102,241,.45);
          flex-shrink: 0;
          letter-spacing: -.5px;
        }

        .sb-brand-text {}
        .sb-brand-name {
          font-size: 13.5px; font-weight: 700;
          color: #f1f5f9;
          line-height: 1.2;
          letter-spacing: -.2px;
        }
        .sb-brand-sub {
          font-size: 10.5px; font-weight: 500;
          color: rgba(255,255,255,.35);
          margin-top: 1px;
        }

        .sb-close-btn {
          background: rgba(255,255,255,.06);
          border: none; cursor: pointer;
          color: rgba(255,255,255,.4);
          border-radius: 8px;
          padding: 5px;
          display: flex; align-items: center;
          transition: all .15s;
        }
        .sb-close-btn:hover { background: rgba(255,255,255,.1); color: #fff; }

        /* ── ROLE PILL ── */
        .sb-role-pill {
          position: relative; z-index: 2;
          margin: 14px 16px 6px;
          display: flex; align-items: center; gap: 9px;
          background: rgba(255,255,255,.04);
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 10px;
          padding: 9px 12px;
        }

        .sb-role-indicator {
          width: 7px; height: 7px;
          border-radius: 50%;
          flex-shrink: 0;
          box-shadow: 0 0 8px currentColor;
        }

        .sb-role-label {
          flex: 1;
          font-size: 11.5px; font-weight: 600;
          color: rgba(255,255,255,.55);
          letter-spacing: .04em;
        }

        .sb-role-badge {
          font-size: 9.5px; font-weight: 800;
          letter-spacing: .1em;
          padding: 2px 7px;
          border-radius: 20px;
          border: 1px solid;
        }

        /* ── SECTION LABEL ── */
        .sb-section-label {
          position: relative; z-index: 2;
          font-size: 9.5px; font-weight: 700;
          letter-spacing: .14em;
          text-transform: uppercase;
          color: rgba(255,255,255,.2);
          padding: 14px 20px 6px;
        }

        /* ── NAV ── */
        .sb-nav {
          position: relative; z-index: 2;
          flex: 1;
          padding: 4px 12px;
          overflow-y: auto;
          scrollbar-width: none;
        }
        .sb-nav::-webkit-scrollbar { display: none; }

        .sb-link {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 10px 12px;
          border-radius: 10px;
          margin-bottom: 2px;
          text-decoration: none;
          font-size: 13px;
          font-weight: 500;
          transition: all .18s;
          color: rgba(255,255,255,.45);
          position: relative;
          border: 1px solid transparent;
        }

        .sb-link:hover {
          color: rgba(255,255,255,.85);
          background: rgba(255,255,255,.06);
          border-color: rgba(255,255,255,.08);
        }

        .sb-link.active {
          color: #fff;
          background: linear-gradient(135deg, rgba(99,102,241,.28) 0%, rgba(34,211,238,.12) 100%);
          border-color: rgba(99,102,241,.35);
          box-shadow: 0 2px 12px rgba(99,102,241,.15);
          font-weight: 600;
        }

        /* active left accent bar */
        .sb-link.active::before {
          content: '';
          position: absolute;
          left: -1px; top: 20%; bottom: 20%;
          width: 3px;
          border-radius: 0 3px 3px 0;
          background: linear-gradient(180deg, #6366f1, #22d3ee);
        }

        .sb-link-icon {
          flex-shrink: 0;
          opacity: .7;
          transition: opacity .18s;
        }
        .sb-link.active .sb-link-icon { opacity: 1; }

        .sb-link-arrow {
          margin-left: auto;
          opacity: 0;
          transition: opacity .15s, transform .15s;
        }
        .sb-link.active .sb-link-arrow,
        .sb-link:hover .sb-link-arrow {
          opacity: .5;
          transform: translateX(2px);
        }

        /* ── FOOTER ── */
        .sb-footer {
          position: relative; z-index: 2;
          padding: 12px 12px 16px;
          border-top: 1px solid rgba(255,255,255,.06);
        }

        /* user card */
        .sb-user-card {
          display: flex; align-items: center; gap: 10px;
          background: rgba(255,255,255,.05);
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 12px;
          padding: 10px 12px;
          margin-bottom: 6px;
        }

        .sb-avatar {
          width: 34px; height: 34px;
          border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 800;
          color: #fff;
          flex-shrink: 0;
          background: linear-gradient(135deg, #6366f1 0%, #22d3ee 100%);
          box-shadow: 0 2px 8px rgba(99,102,241,.35);
        }

        .sb-user-info { flex: 1; min-width: 0; }
        .sb-user-name {
          font-size: 12.5px; font-weight: 700;
          color: #f1f5f9;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .sb-user-id {
          font-size: 10.5px; font-weight: 500;
          color: rgba(255,255,255,.3);
          margin-top: 1px;
        }

        .sb-online-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 6px #22c55e;
          flex-shrink: 0;
        }

        /* logout btn */
        .sb-logout {
          display: flex; align-items: center; gap: 9px;
          width: 100%;
          padding: 9px 12px;
          border: none; cursor: pointer;
          border-radius: 10px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 12.5px; font-weight: 600;
          color: rgba(255,255,255,.35);
          background: transparent;
          transition: all .18s;
          letter-spacing: .01em;
        }
        .sb-logout:hover {
          color: #f87171;
          background: rgba(248,113,113,.08);
          border: 1px solid rgba(248,113,113,.15);
        }

        /* staggered fade-in */
        @keyframes sb-fadein {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .sb-link {
          animation: sb-fadein .25s ease both;
        }
        ${items.map((_, i) => `.sb-link:nth-child(${i + 1}) { animation-delay: ${i * 40}ms; }`).join('\n')}
      `}</style>

      <aside className="sb-root">

        {/* Header */}
        <div className="sb-header">
          <div className="sb-brand">
            <div className="sb-logo-box">C</div>
            <div className="sb-brand-text">
              <div className="sb-brand-name">CDGI NoDues</div>
              <div className="sb-brand-sub">Chameli Devi Group</div>
            </div>
          </div>
          {onClose && (
            <button className="sb-close-btn" onClick={onClose} aria-label="Close sidebar">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Role pill */}
        <div className="sb-role-pill">
          <span
            className="sb-role-indicator"
            style={{ color: meta.color, background: meta.color }}
          />
          <span className="sb-role-label">{meta.label}</span>
          <span
            className="sb-role-badge"
            style={{ color: meta.color, borderColor: `${meta.color}44`, background: `${meta.color}18` }}
          >
            {meta.badge}
          </span>
        </div>

        {/* Section label */}
        <div className="sb-section-label">Navigation</div>

        {/* Nav */}
        <nav className="sb-nav">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) => `sb-link${isActive ? ' active' : ''}`}
            >
              <Icon size={16} strokeWidth={2} className="sb-link-icon" />
              <span>{label}</span>
              <ChevronRight size={13} className="sb-link-arrow" />
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="sb-footer">
          <div className="sb-user-card">
            <div className="sb-avatar">{initials}</div>
            <div className="sb-user-info">
              <div className="sb-user-name">{user?.name}</div>
              <div className="sb-user-id">{user?.empId}</div>
            </div>
            <div className="sb-online-dot" title="Online" />
          </div>

          <button className="sb-logout" onClick={handleLogout}>
            <LogOut size={14} />
            Sign Out
          </button>
        </div>

      </aside>
    </>
  )
}