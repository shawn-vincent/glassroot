import { Link, Outlet, useLocation } from 'react-router-dom'
import ConfigPanel from './components/ConfigPanel'
import OfflineIndicator from './components/OfflineIndicator'
import ErrorToaster from './components/ErrorToaster'
import { useEffect, useState } from 'react'
import { Sun, Moon, Settings } from 'lucide-react'

export default function App() {
  const [showConfig, setShowConfig] = useState(false)
  const { pathname } = useLocation()
  // Apply persisted theme at app mount to avoid mismatch
  useEffect(() => {
    const saved = localStorage.getItem('theme')
    const theme = saved === 'dark' ? 'dark' : 'light'
    document.documentElement.setAttribute('data-theme', theme)
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
          <button type="button" onClick={() => setShowConfig(true)} className="icon-button">
            <Settings size={18} />
            Config
          </button>
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
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme')
    return saved === 'dark' ? 'dark' : 'light'
  })
  
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])
  
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }
  
  return (
    <button 
      type="button" 
      onClick={toggleTheme}
      className="icon-button theme-toggle"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
    >
      {theme === 'light' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}
