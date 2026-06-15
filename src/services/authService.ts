/**
 * Auth Service — abstraction layer over authentication.
 *
 * All Supabase auth calls are isolated here. When you add a custom backend,
 * swap the implementation (e.g. call your REST API) without touching any
 * component or context.
 */
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'
import { mockDb } from './mockDb'
import type {
  ApiResult,
  SignUpParams,
  SignInParams,
  SignUpResult,
  SignInResult,
  AuthUser,
  AuthSession,
} from '../types'

/* ─── Helpers ─── */

const mapUser = (raw: any): AuthUser | null => {
  if (!raw) return null
  return {
    id: raw.id,
    email: raw.email,
    user_metadata: raw.user_metadata ?? {},
  }
}

const mapSession = (raw: any): AuthSession | null => {
  if (!raw) return null
  return {
    access_token: raw.access_token,
    user: mapUser(raw.user)!,
  }
}

/* ─── Public API ─── */

export const authService = {
  /** Returns whether the auth backend is available (mockDb is always available) */
  isConfigured(): boolean {
    return true
  },

  /** Sign up a new user */
  async signUp(params: SignUpParams): Promise<ApiResult<SignUpResult>> {
    if (!isSupabaseConfigured || !supabase) {
      // Use mock database for development
      try {
        const user = mockDb.signUp({
          email: params.email,
          passwordHash: params.password,
          fullName: params.fullName,
          role: params.role || 'student',
        })
        if (user) {
          const session: AuthSession = {
            access_token: 'mock-token-' + user.id,
            user: user,
          }
          mockDb.setSession(session)
          return {
            data: {
              user: user,
              session: session,
            },
            error: null,
          }
        } else {
          return { data: null, error: 'Sign up failed' }
        }
      } catch (err) {
        return {
          data: null,
          error: err instanceof Error ? err.message : 'Registration failed',
        }
      }
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: params.email,
        password: params.password,
        options: {
          data: {
            full_name: params.fullName,
            role: params.role,
          },
        },
      })

      if (error) return { data: null, error: error.message }

      return {
        data: {
          user: mapUser(data.user),
          session: mapSession(data.session),
        },
        error: null,
      }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Registration failed',
      }
    }
  },

  /** Sign in an existing user */
  async signIn(params: SignInParams): Promise<ApiResult<SignInResult>> {
    if (!isSupabaseConfigured || !supabase) {
      // Use mock database for development
      try {
        const session = mockDb.signIn(params.email, params.password)
        if (session) {
          return {
            data: {
              user: mapUser(session.user),
              session: mapSession(session),
            },
            error: null,
          }
        } else {
          return { data: null, error: 'Invalid email or password' }
        }
      } catch (err) {
        return {
          data: null,
          error: err instanceof Error ? err.message : 'Sign in failed',
        }
      }
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: params.email,
        password: params.password,
      })

      if (error) return { data: null, error: error.message }

      return {
        data: {
          user: mapUser(data.user),
          session: mapSession(data.session),
        },
        error: null,
      }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Sign in failed',
      }
    }
  },

  /** Sign out the current user */
  async signOut(): Promise<ApiResult<null>> {
    if (!supabase) return { data: null, error: 'Auth service is not configured.' }

    try {
      const { error } = await supabase.auth.signOut()
      if (error) return { data: null, error: error.message }
      return { data: null, error: null }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Sign out failed',
      }
    }
  },

  /** Get the current session (used on app mount) */
  async getSession(): Promise<ApiResult<AuthSession>> {
    if (!isSupabaseConfigured || !supabase) {
      // Use mock database for development
      const session = mockDb.getSession()
      return { data: mapSession(session), error: null }
    }

    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) return { data: null, error: error.message }
      return { data: mapSession(session), error: null }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to get session',
      }
    }
  },

  /**
   * Subscribe to auth state changes.
   * Returns an unsubscribe function.
   *
   * NOTE: When you move to a custom backend, replace this with a
   * token-refresh polling approach or WebSocket listener.
   */
  onAuthStateChange(
    callback: (user: AuthUser | null, session: AuthSession | null) => void,
  ): () => void {
    if (!isSupabaseConfigured || !supabase) {
      return () => {} // noop
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        callback(
          mapUser(newSession?.user ?? null),
          mapSession(newSession),
        )
      },
    )

    return () => subscription.unsubscribe()
  },
}
