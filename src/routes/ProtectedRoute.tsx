import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useStore } from '../store/useStore'

interface Props {
  children: ReactNode
  requiredRole: 'admin' | 'employee'
}

export default function ProtectedRoute({ children, requiredRole }: Props) {
  const { isAuthenticated, userRole } = useStore()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (userRole !== requiredRole) {
    // Redirect to their own dashboard
    return <Navigate to={userRole === 'admin' ? '/admin' : '/employee'} replace />
  }

  return <>{children}</>
}
