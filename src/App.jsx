import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import Insights from './pages/Insights'
import Landing from './pages/Landing'
import Login from './pages/Login'
import EditSession from './pages/EditSession'
import NewSession from './pages/NewSession'
import SessionDetail from './pages/SessionDetail'
import SessionHistory from './pages/SessionHistory'
import SessionPrep from './pages/SessionPrep'
import Settings from './pages/Settings'
import Signup from './pages/Signup'

const NAVBAR_HIDDEN_PATHS = ['/', '/login', '/signup']

function App() {
  const location = useLocation()
  const showNavbar = !NAVBAR_HIDDEN_PATHS.includes(location.pathname)

  return (
    <div className="app-shell">
      {showNavbar && <Navbar />}
      <main className="page-wrapper">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sessions"
            element={
              <ProtectedRoute>
                <SessionHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sessions/prep"
            element={
              <ProtectedRoute>
                <SessionPrep />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sessions/new"
            element={
              <ProtectedRoute>
                <NewSession />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sessions/:id/edit"
            element={
              <ProtectedRoute>
                <EditSession />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sessions/:id"
            element={
              <ProtectedRoute>
                <SessionDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/insights"
            element={
              <ProtectedRoute>
                <Insights />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
