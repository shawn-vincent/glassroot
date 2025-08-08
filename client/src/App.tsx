import { Link, Outlet, useLocation } from 'react-router-dom'
import ConfigPanel from './components/ConfigPanel'
import OfflineIndicator from './components/OfflineIndicator'
import ErrorToaster from './components/ErrorToaster'
import { useEffect, useState } from 'react'

export default function App() {
  const [showConfig, setShowConfig] = useState(false)
  const { pathname } = useLocation()
  // Apply persisted theme at app mount to avoid mismatch
  useEffect(() => {
    const saved = localStorage.getItem('theme') || 'auto'
    if (saved === 'auto') document.documentElement.removeAttribute('data-theme')
    else document.documentElement.setAttribute('data-theme', saved)
  }, [])
  return (
    <div className="app">
      <header className="topbar">
        <nav className="nav">
          <Link to="/" className={pathname === '/' ? 'active' : ''}>Home</Link>
          <Link to="/documents" className={pathname.startsWith('/documents') ? 'active' : ''}>Documents</Link>
          <Link to="/search" className={pathname.startsWith('/search') ? 'active' : ''}>Search</Link>
        </nav>
        <div className="actions">
          <button type="button" onClick={() => setShowConfig(true)}>Config</button>
          <ThemeToggle />
        </div>
      </header>
      <OfflineIndicator />
      <ErrorToaster />
      <main className={`content ${pathname === '/' ? 'fullbleed' : ''}`}>
        <Outlet />
      </main>
      {showConfig && <ConfigPanel onClose={() => setShowConfig(false)} />}
    </div>
  )
}

function ThemeToggle() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'auto')
  useEffect(() => {
    if (theme === 'auto') document.documentElement.removeAttribute('data-theme')
    else document.documentElement.setAttribute('data-theme', theme)
  }, [theme])
  return (
    <select
      value={theme}
      onChange={(e) => { const next = e.target.value; setTheme(next); localStorage.setItem('theme', next) }}
    >
      <option value="auto">Auto</option>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  )
}
