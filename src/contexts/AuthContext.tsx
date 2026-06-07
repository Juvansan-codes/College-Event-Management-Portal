import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'
import type { User, Session } from '@supabase/supabase-js'

/* ─── Types ─── */
export type UserRole = 'student' | 'organizer' | null

interface AuthContextValue {
  user: User | null
  session: Session | null
  role: UserRole
  isLoading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  role: null,
  isLoading: true,
  signOut: async () => {},
})

/* ─── Hook ─── */
export const useAuth = () => useContext(AuthContext)

/* ─── Helper: extract role from user metadata ─── */
const extractRole = (user: User | null): UserRole => {
  if (!user) return null
  const meta = user.user_metadata
  if (meta?.role === 'organizer') return 'organizer'
  if (meta?.role === 'student') return 'student'
  return null
}

/* ─── Provider ─── */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setIsLoading(false)
      return
    }

    /* 1. Get current session on mount */
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession)
      setUser(currentSession?.user ?? null)
      setIsLoading(false)
    })

    /* 2. Listen for auth state changes */
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession)
        setUser(newSession?.user ?? null)
      },
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
  }

  const role = extractRole(user)

  return (
    <AuthContext.Provider value={{ user, session, role, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
