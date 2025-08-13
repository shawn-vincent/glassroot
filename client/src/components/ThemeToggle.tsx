import { Moon, Sun } from 'lucide-react'
import { IconButton } from './ui/icon-button'
import { useEffect, useState } from 'react'
import { applyAccentColor, type AccentColor } from '@/lib/theme-colors'

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  
  useEffect(() => {
    // Check local storage and system preference
    const stored = localStorage.getItem('theme')
    if (stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setTheme('dark')
      document.documentElement.classList.add('dark')
    } else {
      setTheme('light')
      document.documentElement.classList.remove('dark')
    }
  }, [])
  
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    
    // Reapply the accent color for the new theme
    const savedAccent = (localStorage.getItem('user_accent_color') || 'blue') as AccentColor
    applyAccentColor(savedAccent, newTheme === 'dark')
  }
  
  return (
    <IconButton
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="relative overflow-hidden group"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent/10 to-accent/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
      <Sun className="h-6 w-6 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-6 w-6 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" />
    </IconButton>
  )
}