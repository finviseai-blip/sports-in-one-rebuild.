import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

function getKey(role) { return `theme_${role}` }

export function ThemeProvider({ children, role = 'student' }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem(getKey(role)) || 'dark'
  })

  useEffect(() => {
    const saved = localStorage.getItem(getKey(role)) || 'dark'
    setTheme(saved)
  }, [role])

  useEffect(() => {
    const root = document.documentElement
    root.removeAttribute('data-student-theme')
    root.removeAttribute('data-admin-theme')
    root.removeAttribute('data-turf-theme')
    root.setAttribute(`data-${role}-theme`, theme)
    root.classList.remove('theme-dark','theme-light','theme-default')
    root.classList.add(`theme-${theme}`)
    localStorage.setItem(getKey(role), theme)
  }, [theme, role])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, role }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() { return useContext(ThemeContext) }
