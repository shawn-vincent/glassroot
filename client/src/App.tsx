import { Link, Outlet, useLocation } from 'react-router-dom'
import ConfigPanel from './components/ConfigPanel'
import OfflineIndicator from './components/OfflineIndicator'
import ErrorToaster from './components/ErrorToaster'
import { useEffect, useState } from 'react'
import { Sun, Moon, Monitor, Settings } from 'lucide-react'

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
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'auto')
  
  useEffect(() => {
    if (theme === 'auto') {
      document.documentElement.removeAttribute('data-theme')
    } else {
      document.documentElement.setAttribute('data-theme', theme)
    }
    localStorage.setItem('theme', theme)
  }, [theme])
  
  const cycleTheme = () => {
    const themes = ['auto', 'light', 'dark']
    const currentIndex = themes.indexOf(theme)
    const nextTheme = themes[(currentIndex + 1) % themes.length]
    setTheme(nextTheme)
  }
  
  const getThemeIcon = () => {
    switch (theme) {
      case 'light': return <Sun size={18} />
      case 'dark': return <Moon size={18} />
      default: return <Monitor size={18} />
    }
  }
  
  return (
    <button 
      type="button" 
      onClick={cycleTheme}
      className="icon-button theme-toggle"
      title={`Theme: ${theme}`}
    >
      {getThemeIcon()}
    </button>
  )
}
