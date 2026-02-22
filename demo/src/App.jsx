import { useState } from 'react'
import Landing  from './pages/Landing'
import Dashboard from './pages/Dashboard'

// HashRouter-free approach: simple state routing
// Works perfectly on GitHub Pages with no 404 issues
export default function App() {
  const [page, setPage] = useState(
    // Read initial hash e.g. /#dashboard
    window.location.hash === '#dashboard' ? 'dashboard' : 'landing'
  )

  const navigate = (target) => {
    window.location.hash = target === 'dashboard' ? '#dashboard' : ''
    setPage(target)
  }

  if (page === 'dashboard') {
    return <Dashboard onBack={() => navigate('landing')} />
  }

  return <Landing onEnterDemo={() => navigate('dashboard')} />
}
