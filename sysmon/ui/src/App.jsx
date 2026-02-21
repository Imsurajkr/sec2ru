import { Component } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout    from './components/Layout'
import Login     from './pages/Login'
import Dashboard from './pages/Dashboard'
import Processes from './pages/Processes'
import Spikes    from './pages/Spikes'
import Info      from './pages/Info'
import Servers   from './pages/Servers'
import Connections from './pages/Connections'
import AppTraffic  from './pages/AppTraffic'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(err) {
    return { error: err }
  }
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-8">
          <div className="bg-red-950/40 border border-red-900/50 rounded-xl p-6 max-w-2xl w-full">
            <p className="text-red-400 font-semibold mb-2">Render error — check the browser console for more details</p>
            <pre className="text-xs text-red-300 whitespace-pre-wrap font-mono">
              {this.state.error.message}
            </pre>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}


function Private({ children }) {
  const { isAuthed } = useAuth()
  return isAuthed ? children : <Navigate to="/login" replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <Private>
            <Layout>
              <Routes>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="processes" element={<Processes />} />
                <Route path="spikes"    element={<Spikes />} />
                <Route path="info"      element={<Info />} />
                <Route path="servers"   element={<Servers />} />
                <Route path="connections" element={<Connections />} />
                <Route path="app-traffic" element={<AppTraffic />}  />
              </Routes>
            </Layout>
          </Private>
        }
      />
    </Routes>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
