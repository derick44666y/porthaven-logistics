import { useState, useCallback } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { getCurrentUser, type User } from '@/api'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import HomePage from '@/pages/HomePage'
import TrackPage from '@/pages/TrackPage'
import AuthPage from '@/pages/AuthPage'
import DashboardPage from '@/pages/DashboardPage'
import AdminPage from '@/pages/AdminPage'

export default function App() {
  const [user, setUser] = useState<User | null>(getCurrentUser())

  const refreshUser = useCallback(() => {
    setUser(getCurrentUser())
  }, [])

  function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode; requiredRole?: 'CUSTOMER' | 'ADMIN' }) {
    if (!user) return <Navigate to="/login" replace />
    if (requiredRole && user.role !== requiredRole) {
      return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/dashboard'} replace />
    }
    return <>{children}</>
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user} onAuthChange={refreshUser} />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/track" element={<TrackPage />} />
          <Route path="/track/:trackingNumber" element={<TrackPage />} />
          {/* Login is internal/admin only — no public signup */}
          <Route path="/login" element={
            user ? <Navigate to={user.role === 'ADMIN' ? '/admin' : '/dashboard'} replace /> : <AuthPage mode="login" />
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute requiredRole="CUSTOMER">
              {user && <DashboardPage user={user} />}
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminPage />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
