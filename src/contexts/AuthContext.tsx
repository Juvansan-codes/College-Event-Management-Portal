import React, { createContext, useContext, useEffect, useState } from 'react'
import { authService } from '../services'
import type { AuthUser, UserRole } from '../types'

/* ─── Types ─── */
export type { UserRole } from '../types'

interface AuthContextValue {
  user: AuthUser | null
  role: UserRole
  isLoading: boolean
  signOut: () => Promise<void>
  updateRole: (newRole: 'student' | 'organizer') => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  role: null,
  isLoading: true,
  signOut: async () => {},
  updateRole: async () => {},
})

/* ─── Hook ─── */
export const useAuth = () => useContext(AuthContext)

/* ─── Helper: extract role from user metadata ─── */
const extractRole = (user: AuthUser | null): UserRole => {
  if (!user) return null
  const meta = user.user_metadata
  if (meta?.role === 'organizer') return 'organizer'
  if (meta?.role === 'student') return 'student'
  return null
}

/* ─── Provider ─── */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!authService.isConfigured()) {
      setIsLoading(false)
      return
    }

    /* 1. Get current session on mount */
    authService.getSession().then(({ data }) => {
      setUser(data?.user ?? null)
      setIsLoading(false)
    })

    /* 2. Listen for auth state changes */
    const unsubscribe = authService.onAuthStateChange((newUser) => {
      setUser(newUser)
    })

    return unsubscribe
  }, [])

  const signOut = async () => {
    await authService.signOut()
    setUser(null)
  }

  const updateRole = async (newRole: 'student' | 'organizer') => {
    const { data } = await authService.updateRole(newRole)
    if (data) {
      setUser(data)
    }
  }

  const role = extractRole(user)

  return (
    <AuthContext.Provider value={{ user, role, isLoading, signOut, updateRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
