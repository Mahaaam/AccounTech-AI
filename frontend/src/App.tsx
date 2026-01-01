import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Accounts from './pages/Accounts'
import Journal from './pages/Journal'
import Reports from './pages/Reports'
import VoiceEntry from './pages/VoiceEntry'
import OCREntry from './pages/OCREntry'
import Login from './pages/Login'
import Settings from './pages/Settings'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = localStorage.getItem('authenticated') === 'true'
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="accounts" element={<Accounts />} />
        <Route path="journal" element={<Journal />} />
        <Route path="reports" element={<Reports />} />
        <Route path="voice" element={<VoiceEntry />} />
        <Route path="ocr" element={<OCREntry />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}
