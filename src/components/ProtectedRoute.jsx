import { Navigate } from 'react-router-dom'
import { getToken } from '../lib/auth'

/**
 * Renders children only when a token exists; otherwise redirects to login.
 */
function ProtectedRoute({ children }) {
  if (!getToken()) {
    return <Navigate to="/login" replace />
  }
  return children
}

export default ProtectedRoute
