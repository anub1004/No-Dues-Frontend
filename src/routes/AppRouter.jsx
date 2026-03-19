// src/routes/AppRouter.jsx
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export function PrivateRoute({ allowedRoles }) {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) return <Navigate to="/login" replace />

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redirect to appropriate dashboard
    const redirects = { EMPLOYEE: '/employee/dashboard', HOD: '/approver/dashboard', ADMIN: '/admin/dashboard' }
    return <Navigate to={redirects[user?.role] || '/login'} replace />
  }

  return <Outlet />
}

export function PublicOnlyRoute() {
  const { isAuthenticated, user } = useAuthStore()
  if (isAuthenticated) {
    const redirects = { EMPLOYEE: '/employee/dashboard', HOD: '/approver/dashboard', ADMIN: '/admin/dashboard' }
    return <Navigate to={redirects[user?.role] || '/login'} replace />
  }
  return <Outlet />
}
