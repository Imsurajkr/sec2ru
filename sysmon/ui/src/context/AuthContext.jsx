import { createContext, useContext, useState } from 'react'
import client from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('sec2ru_token'))

  async function login(username, password) {
    const res = await client.post('/login', { username, password })
    const t = res.data.token
    localStorage.setItem('sec2ru_token', t)
    setToken(t)
  }

  function logout() {
    localStorage.removeItem('sec2ru_token')
    setToken(null)
  }

  return (
    <AuthContext.Provider value={{ token, login, logout, isAuthed: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
