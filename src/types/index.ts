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

export type SponsorTier = 'Platinum' | 'Gold' | 'Silver'
export type SponsorPipelineStage = 'Contacted' | 'Proposal' | 'Negotiating' | 'Confirmed'

export interface EventSponsor {
  id: string
  event_id: string
  name: string
  tier: SponsorTier
  amount: number
  contact_email: string
  pipeline_stage: SponsorPipelineStage
  created_at: string
  updated_at: string
}

export interface CreateSponsorPayload {
  name: string
  tier: SponsorTier
  amount: number
  contact_email: string
}

export interface SponsorInquiryPayload {
  company: string
  contact_name: string | null
  email: string
  interested_tier: string | null
  message: string | null
}

export interface CertificateBatch {
  id: string
  event_id: string
  event_name: string
  conducted_date: string
  template_data_url: string | null
  created_at: string
  updated_at: string
}

export interface EventCertificate {
  id: string
  batch_id: string
  event_id: string
  participant_name: string
  issued_at: string
}

export interface CertificateBatchWithRecipients extends CertificateBatch {
  recipients: EventCertificate[]
}

export interface SaveCertificateBatchPayload {
  event_name: string
  conducted_date: string
  template_data_url: string | null
  participants: string[]
}

export type UserRole = 'student' | 'organizer' | null

/* ─── Auth Types ─── */

export interface AuthUser {
  id: string
  email?: string
  user_metadata: {
    full_name?: string
    role?: string
  } & Record<string, unknown>
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

/* --- QR Attendance Types --- */

export interface AttendanceSession {
  id: string
  event_id: string
  token: string
  latitude: number
  longitude: number
  radius_meters: number
  created_at: string
  expires_at: string
  is_active: boolean
}

export interface AttendanceRecord {
  id: string
  event_id: string
  session_id: string
  user_id: string
  user_name: string
  check_in_time: string
  latitude: number
  longitude: number
  distance_meters: number
  status: string
  device_information: string | null
  ip_address: string | null
}

export interface AttendanceLog {
  id: string
  event_id: string
  user_id: string | null
  status: string
  error_message: string | null
  created_at: string
  latitude: number | null
  longitude: number | null
  device_information: string | null
  ip_address: string | null
}

/* --- Poll Types --- */

export interface PollOption {
  id: string
  text: string
  votes: number
}

export interface Poll {
  id: string
  question: string
  options: PollOption[]
  isLive: boolean
  totalVotes: number
  createdAt: string
  userVotedOptionId?: string
}
