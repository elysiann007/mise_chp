import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import type { StaffRole } from '../store/authStore'

interface Props {
  roles?: StaffRole[]
  children: React.ReactNode
}

export default function ProtectedRoute({ roles, children }: Props) {
  const { accessToken, role } = useAuthStore()

  if (!accessToken) return <Navigate to="/login" replace />
  if (roles && role && !roles.includes(role)) return <Navigate to="/login" replace />

  return <>{children}</>
}
