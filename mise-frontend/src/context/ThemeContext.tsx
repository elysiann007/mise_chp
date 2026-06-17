import { useEffect, useState, type ReactNode } from 'react'
import { ThemeContext, type Theme } from './theme-context'
export { useTheme } from './useTheme'

const noop = () => undefined

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem('chp-theme') as Theme | null
      if (saved === 'light' || saved === 'dark') return saved
    } catch {
      noop()
    }
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('chp-theme', theme)
  }, [theme])

  const toggle = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'))

  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>
}
