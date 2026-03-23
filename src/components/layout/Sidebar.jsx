import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import {
  LayoutDashboard, FilePlus, FileText, Award,
  Users, Building2, GitBranch, BarChart3, Shield,
  ClipboardList, CheckSquare, LogOut, X, ChevronLeft, Menu,
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

export default function Sidebar({ onClose }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const items = NAV[user?.role] || []

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : 'U'

  return (
    <>
      <style>{`
        .sidebar {
          font-family: 'DM Sans', system-ui, sans-serif;
          height: 100%;
          display: flex;
          flex-direction: column;
          background: #f8fafc;
          border-right: 1px solid #e2e8f0;
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow-y: auto;
          overflow-x: hidden;
        }

        .sidebar.collapsed {
          width: 72px;
        }

        .sidebar.expanded {
          width: 260px;
        }

        .sidebar::-webkit-scrollbar {
          width: 6px;
        }
        .sidebar::-webkit-scrollbar-track {
          background: transparent;
        }
        .sidebar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        .sidebar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        .sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 12px;
          border-bottom: 1px solid #e2e8f0;
          gap: 12px;
        }

        .sidebar-logo {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: linear-gradient(135deg, #1e3a5f 0%, #0d9488 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-weight: 700;
          font-size: 16px;
          flex-shrink: 0;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 2px 8px rgba(30, 58, 95, 0.15);
          border: none;
          padding: 0;
        }

        .sidebar-logo:hover {
          transform: scale(1.05);
        }

        .sidebar-brand-text {
          flex: 1;
          min-width: 0;
          opacity: 1;
          transition: opacity 0.3s;
          overflow: hidden;
        }

        .sidebar.collapsed .sidebar-brand-text {
          opacity: 0;
          width: 0;
        }

        .sidebar-brand-name {
          font-size: 13px;
          font-weight: 700;
          color: #1e293b;
          line-height: 1;
          white-space: nowrap;
        }

        .sidebar-brand-sub {
          font-size: 10px;
          color: #64748b;
          margin-top: 2px;
          white-space: nowrap;
        }

        .sidebar-toggle {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          background: #e2e8f0;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
          transition: all 0.2s;
          flex-shrink: 0;
          padding: 0;
        }

        .sidebar-toggle:hover {
          background: #cbd5e1;
          color: #475569;
        }

        .sidebar-nav {
          flex: 1;
          padding: 12px;
          overflow-y: auto;
          overflow-x: hidden;
        }

        .sidebar-section-title {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: #94a3b8;
          padding: 12px 12px 6px;
          opacity: 1;
          transition: opacity 0.3s;
          white-space: nowrap;
          margin: 12px 0 6px 0;
        }

        .sidebar.collapsed .sidebar-section-title {
          opacity: 0;
          width: 0;
          padding: 0;
          margin: 0;
          height: 0;
          overflow: hidden;
        }

        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          margin-bottom: 6px;
          border-radius: 8px;
          text-decoration: none;
          font-size: 13px;
          font-weight: 500;
          color: #64748b;
          transition: all 0.2s;
          border: 1px solid transparent;
          position: relative;
          cursor: pointer;
        }

        .sidebar-link:hover {
          color: #0d9488;
          background: #f1f5f9;
          border-color: #e2e8f0;
        }

        .sidebar-link.active {
          color: #fff;
          background: linear-gradient(135deg, #1e3a5f 0%, #0d9488 100%);
          border-color: #0d9488;
          box-shadow: 0 2px 8px rgba(13, 148, 136, 0.25);
          font-weight: 600;
        }

        .sidebar-link-icon {
          width: 18px;
          height: 18px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .sidebar-link-label {
          flex: 1;
          min-width: 0;
          opacity: 1;
          transition: opacity 0.3s;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sidebar.collapsed .sidebar-link-label {
          opacity: 0;
          position: absolute;
          width: 0;
          height: 0;
          overflow: hidden;
        }

        .sidebar-footer {
          padding: 12px;
          border-top: 1px solid #e2e8f0;
        }

        .sidebar-user {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 8px;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          background: transparent;
          width: 100%;
          text-align: left;
          font-family: 'DM Sans', system-ui, sans-serif;
        }

        .sidebar-user:hover {
          background: #f1f5f9;
        }

        .sidebar-avatar {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: linear-gradient(135deg, #1e3a5f 0%, #0d9488 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-weight: 700;
          font-size: 14px;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(30, 58, 95, 0.15);
        }

        .sidebar-user-info {
          flex: 1;
          min-width: 0;
          opacity: 1;
          transition: opacity 0.3s;
          overflow: hidden;
        }

        .sidebar.collapsed .sidebar-user-info {
          opacity: 0;
          width: 0;
        }

        .sidebar-user-name {
          font-size: 12px;
          font-weight: 600;
          color: #1e293b;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sidebar-user-role {
          font-size: 10px;
          color: #64748b;
          margin-top: 1px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sidebar-logout {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 8px;
          border: none;
          background: #fee2e2;
          color: #dc2626;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'DM Sans', system-ui, sans-serif;
        }

        .sidebar-logout:hover {
          background: #fecaca;
          color: #b91c1c;
        }

        .sidebar-logout-icon {
          width: 18px;
          height: 18px;
          flex-shrink: 0;
        }

        .sidebar-logout-label {
          flex: 1;
          opacity: 1;
          transition: opacity 0.3s;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sidebar.collapsed .sidebar-logout-label {
          opacity: 0;
          position: absolute;
          width: 0;
          height: 0;
          overflow: hidden;
        }

        .sidebar-close-mobile {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 32px;
          height: 32px;
          background: #e2e8f0;
          border: none;
          cursor: pointer;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
          transition: all 0.2s;
          z-index: 100;
          padding: 0;
        }

        .sidebar-close-mobile:hover {
          background: #cbd5e1;
          color: #475569;
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .sidebar-link {
          animation: fade-in 0.3s ease forwards;
        }

        ${items.map((_, i) => `.sidebar-link:nth-child(${i + 1}) { animation-delay: ${i * 40}ms; }`).join('\n')}
      `}</style>

      <aside className={`sidebar ${isCollapsed ? 'collapsed' : 'expanded'}`}>
        {/* Header */}
        <div className="sidebar-header">
          <button
            className="sidebar-logo"
            title="Home"
            onClick={() => navigate('/')}
          >
            C
          </button>
          <div className="sidebar-brand-text">
            <div className="sidebar-brand-name">CDGI NoDues</div>
            <div className="sidebar-brand-sub">Chameli Devi Group</div>
          </div>
          <button
            className="sidebar-toggle"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? 'Expand' : 'Collapse'}
          >
            {isCollapsed ? <Menu size={16} /> : <ChevronLeft size={16} />}
          </button>
          {onClose && (
            <button
              className="sidebar-close-mobile md:hidden"
              onClick={onClose}
              aria-label="Close sidebar"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
      
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              title={label}
            >
              <Icon size={18} strokeWidth={2} className="sidebar-link-icon" />
              <span className="sidebar-link-label">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <button
            className="sidebar-user"
            title={`${user?.name} (${user?.empId})`}
            onClick={() => navigate('/profile')}
          >
            <div className="sidebar-avatar">{initials}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name}</div>
              <div className="sidebar-user-role">{user?.role}</div>
            </div>
          </button>

          <button
            className="sidebar-logout"
            onClick={handleLogout}
            title="Sign out"
          >
            <LogOut size={18} className="sidebar-logout-icon" />
            <span className="sidebar-logout-label">Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  )
}
