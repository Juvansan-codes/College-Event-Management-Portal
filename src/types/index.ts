/* ─── Domain Types ─── */

export interface FestEvent {
  id: string
  organizer_id: string
  name: string
  description: string | null
  start_date: string
  end_date: string
  venue: string | null
  category: string
  max_attendees: number
  status: string
  created_at: string
}

export type CreateEventPayload = Omit<FestEvent, 'id' | 'organizer_id' | 'created_at'>

export type UserRole = 'student' | 'organizer' | null

/* ─── Auth Types ─── */

export interface AuthUser {
  id: string
  email?: string
  user_metadata: Record<string, unknown>
}

export interface AuthSession {
  access_token: string
  user: AuthUser
}

export interface SignUpParams {
  email: string
  password: string
  fullName: string
  role: string
}

export interface SignInParams {
  email: string
  password: string
}

export interface SignUpResult {
  user: AuthUser | null
  session: AuthSession | null
}

export interface SignInResult {
  user: AuthUser | null
  session: AuthSession | null
}

/* ─── API Response Wrapper ─── */

export interface ApiResult<T> {
  data: T | null
  error: string | null
}
