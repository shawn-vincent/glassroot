import { Moon, Sun, Monitor } from 'lucide-react'
import { useEffect, useState } from 'react'
import { applyAccentColor, type AccentColor } from '@/lib/theme-colors'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

type Theme = 'light' | 'dark' | 'auto'

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('auto')
  
  useEffect(() => {
    // Load saved theme preference
    const stored = localStorage.getItem('theme') as Theme | null
    if (stored) {
      setTheme(stored)
      applyTheme(stored)
    } else {
      // Default to auto
      setTheme('auto')
      applyTheme('auto')
    }
  }, [])
  
  const applyTheme = (selectedTheme: Theme) => {
    let isDark = false
    
    if (selectedTheme === 'auto') {
      // Use system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      isDark = prefersDark
      if (prefersDark) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      // Listen for system preference changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = (e: MediaQueryListEvent) => {
        if (localStorage.getItem('theme') === 'auto') {
          if (e.matches) {
            document.documentElement.classList.add('dark')
          } else {
            document.documentElement.classList.remove('dark')
          }
          // Reapply accent color
          const savedAccent = (localStorage.getItem('user_accent_color') || 'blue') as AccentColor
          applyAccentColor(savedAccent, e.matches)
        }
      }
      mediaQuery.addEventListener('change', handleChange)
      // Store cleanup function
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
    
    if (selectedTheme === 'dark') {
      document.documentElement.classList.add('dark')
      isDark = true
    } else {
      // selectedTheme === 'light'
      document.documentElement.classList.remove('dark')
      isDark = false
    }
    
    // Reapply the accent color for the new theme
    const savedAccent = (localStorage.getItem('user_accent_color') || 'blue') as AccentColor
    applyAccentColor(savedAccent, isDark)
  }
  
  const handleThemeChange = (value: Theme) => {
    setTheme(value)
    localStorage.setItem('theme', value)
    applyTheme(value)
  }
  
  return (
    <Select value={theme} onValueChange={handleThemeChange}>
      <SelectTrigger className="w-[140px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="auto">
          <div className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            <span>Auto</span>
          </div>
        </SelectItem>
        <SelectItem value="light">
          <div className="flex items-center gap-2">
            <Sun className="h-4 w-4" />
            <span>Light</span>
          </div>
        </SelectItem>
        <SelectItem value="dark">
          <div className="flex items-center gap-2">
            <Moon className="h-4 w-4" />
            <span>Dark</span>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  )
}