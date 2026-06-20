/**
 * Auth Service — abstraction layer over authentication.
 *
 * All Supabase auth calls are isolated here. When you add a custom backend,
 * swap the implementation (e.g. call your REST API) without touching any
 * component or context.
 */
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'
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
  /** Returns whether the auth backend is available */
  isConfigured(): boolean {
    return isSupabaseConfigured
  },

  /** Sign up a new user */
  async signUp(params: SignUpParams): Promise<ApiResult<SignUpResult>> {
    if (!isSupabaseConfigured || !supabase) {
      return { data: null, error: 'Auth service is not configured.' }
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
      return { data: null, error: 'Auth service is not configured.' }
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

  /** Update the user's role in their metadata */
  async updateRole(newRole: 'student' | 'organizer'): Promise<ApiResult<AuthUser>> {
    if (!isSupabaseConfigured || !supabase) {
      return { data: null, error: 'Auth service is not configured.' }
    }

    try {
      const { data, error } = await supabase.auth.updateUser({
        data: { role: newRole }
      })

      if (error) return { data: null, error: error.message }
      return { data: mapUser(data.user), error: null }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to update role',
      }
    }
  },

  /** Sign out the current user */
  async signOut(): Promise<ApiResult<null>> {
    if (!isSupabaseConfigured || !supabase) {
      return { data: null, error: 'Auth service is not configured.' }
    }

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
      return { data: null, error: 'Auth service is not configured.' }
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
