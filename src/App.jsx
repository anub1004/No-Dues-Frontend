// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { PrivateRoute, PublicOnlyRoute } from './routes/AppRouter'

// Auth
import LoginPage from './pages/auth/LoginPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'

// Profile
import ProfilePage from './pages/profile/ProfilePage'
import SettingsPage from './pages/profile/SettingsPage'

// Employee
import EmployeeDashboard from './pages/employee/EmployeeDashboard'
import NewRequestPage from './pages/employee/NewRequestPage'
import RequestsPage from './pages/employee/RequestsPage'
import RequestTrackerPage from './pages/employee/RequestTrackerPage'
import CertificatesPage from './pages/employee/CertificatesPage'

// Approver / HOD
import ApproverDashboard from './pages/approver/ApproverDashboard'
import PendingRequestsPage from './pages/approver/PendingRequestsPage'
import RequestDetailPage from './pages/approver/RequestDetailPage'
import ApproverHistoryPage from './pages/approver/ApproverHistoryPage'

// Admin
import AdminDashboard from './pages/admin/AdminDashboard'
import ManageEmployeesPage from './pages/admin/ManageEmployeesPage'
import ManageDepartmentsPage from './pages/admin/ManageDepartmentsPage'
import ReportsPage from './pages/admin/ReportsPage'
import AuditPage from './pages/admin/AuditPage'
import AdminRequestDetailPage from './pages/admin/AdminRequestDetailPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public routes (redirect if already logged in) */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        {/* Profile routes (all authenticated roles) */}
        <Route element={<PrivateRoute allowedRoles={['EMPLOYEE', 'HOD', 'ADMIN']} />}>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Employee routes */}
        <Route element={<PrivateRoute allowedRoles={['EMPLOYEE']} />}>
          <Route path="/employee/dashboard"    element={<EmployeeDashboard />} />
          <Route path="/employee/new-request"  element={<NewRequestPage />} />
          <Route path="/employee/requests"     element={<RequestsPage />} />
          <Route path="/employee/requests/:id" element={<RequestTrackerPage />} />
          <Route path="/employee/certificates" element={<CertificatesPage />} />
        </Route>

        {/* HOD / Approver routes */}
        <Route element={<PrivateRoute allowedRoles={['HOD']} />}>
          <Route path="/approver/dashboard"      element={<ApproverDashboard />} />
          <Route path="/approver/pending"        element={<PendingRequestsPage />} />
          <Route path="/approver/requests/:id"   element={<RequestDetailPage />} />
          <Route path="/approver/history"        element={<ApproverHistoryPage />} />
        </Route>

        {/* Admin routes */}
        <Route element={<PrivateRoute allowedRoles={['ADMIN']} />}>
          <Route path="/admin/dashboard"        element={<AdminDashboard />} />
          <Route path="/admin/employees"        element={<ManageEmployeesPage />} />
          <Route path="/admin/departments"      element={<ManageDepartmentsPage />} />
          <Route path="/admin/reports"          element={<ReportsPage />} />
          <Route path="/admin/audit"            element={<AuditPage />} />
          <Route path="/admin/requests/:id"     element={<AdminRequestDetailPage />} />
          <Route path="/admin/workflow"         element={<AdminDashboard />} />
        </Route>

        {/* 404 fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

