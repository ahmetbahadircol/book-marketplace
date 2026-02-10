import { Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  return (
    <div className="min-h-screen">
      <Routes>
        <Route
          path="/auth"
          element={
            isAuthenticated ?
              <Navigate to="/dashboard" replace /> :
              <Auth onAuthSuccess={() => setIsAuthenticated(true)} />
          }
        />
        <Route
          path="/dashboard"
          element={
            isAuthenticated ?
              <Dashboard onLogout={() => setIsAuthenticated(false)} /> :
              <Navigate to="/auth" replace />
          }
        />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    </div>
  )
}

export default App
