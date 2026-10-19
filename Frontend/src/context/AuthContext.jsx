import { createContext, useContext, useState } from 'react'

const AuthContext = createContext()
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('ap_user')) || null)
  const [role, setRole] = useState(() => localStorage.getItem('ap_role') || null)
  const [token, setToken] = useState(() => localStorage.getItem('ap_token') || null)

  const login = (userData, userRole, userToken) => {
    setUser(userData)
    setRole(userRole)
    if (userToken) {
      setToken(userToken)
      localStorage.setItem('ap_token', userToken)
    }
    localStorage.setItem('ap_user', JSON.stringify(userData))
    localStorage.setItem('ap_role', userRole)
  }

  const logout = () => {
    setUser(null)
    setRole(null)
    setToken(null)
    localStorage.removeItem('ap_user')
    localStorage.removeItem('ap_role')
    localStorage.removeItem('ap_token')
  }

  return (
    <AuthContext.Provider value={{ user, role, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}