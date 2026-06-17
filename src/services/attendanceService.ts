import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'
import type {
  ApiResult,
  AttendanceSession,
  AttendanceRecord,
  AttendanceLog,
} from '../types'

const formatAttendanceError = (message: string): string => {
  const referencesAttendanceSchema =
    message.includes('attendance_sessions') ||
    message.includes('attendance_records') ||
    message.includes('attendance_logs') ||
    message.includes('mark_event_attendance')

  if (message.includes('schema cache') && referencesAttendanceSchema) {
    return 'Attendance database is not set up yet. Apply Supabase migrations 003 and 004 in the SQL Editor, then refresh this page.'
  }

  return message
}

/* ─── Haversine Distance Formula ─── */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371e3 // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180
  const phi2 = (lat2 * Math.PI) / 180
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) *
    Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c // distance in meters
}

export const attendanceService = {
  isConfigured(): boolean {
    return isSupabaseConfigured
  },

  /** Start a new attendance session for an event */
  async startSession(
    eventId: string,
    latitude: number,
    longitude: number,
    radiusMeters: number,
    durationMinutes: number
  ): Promise<ApiResult<AttendanceSession>> {
    if (!isSupabaseConfigured || !supabase) {
      return { data: null, error: 'Database is not configured.' }
    }

    try {
      // Deactivate current active sessions for this event
      await supabase
        .from('attendance_sessions')
        .update({ is_active: false })
        .eq('event_id', eventId)
        .eq('is_active', true)

      // Insert new session
      const token = `QR_${crypto.randomUUID().replace(/-/g, '').toUpperCase()}`
      const expiresAt = new Date(Date.now() + durationMinutes * 60 * 1000).toISOString()

      const { data, error } = await supabase
        .from('attendance_sessions')
        .insert({
          event_id: eventId,
          token,
          latitude,
          longitude,
          radius_meters: radiusMeters,
          expires_at: expiresAt,
          is_active: true,
        })
        .select()
        .single()

      if (error) return { data: null, error: formatAttendanceError(error.message) }
      return { data: data as AttendanceSession, error: null }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to start session',
      }
    }
  },

  /** Stop any active attendance session for an event */
  async stopSession(eventId: string): Promise<ApiResult<null>> {
    if (!isSupabaseConfigured || !supabase) {
      return { data: null, error: 'Database is not configured.' }
    }

    try {
      const { error } = await supabase
        .from('attendance_sessions')
        .update({ is_active: false })
        .eq('event_id', eventId)
        .eq('is_active', true)

      if (error) return { data: null, error: formatAttendanceError(error.message) }
      return { data: null, error: null }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to stop session',
      }
    }
  },

  /** Fetch active session for an event */
  async getActiveSession(eventId: string): Promise<ApiResult<AttendanceSession | null>> {
    if (!isSupabaseConfigured || !supabase) {
      return { data: null, error: 'Database is not configured.' }
    }

    try {
      const { data, error } = await supabase
        .from('attendance_sessions')
        .select('*')
        .eq('event_id', eventId)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle()

      if (error) return { data: null, error: formatAttendanceError(error.message) }
      return { data: data as AttendanceSession | null, error: null }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to retrieve active session',
      }
    }
  },

  /** Retrieve live attendees that checked in */
  async getLiveAttendance(eventId: string): Promise<ApiResult<AttendanceRecord[]>> {
    if (!isSupabaseConfigured || !supabase) {
      return { data: null, error: 'Database is not configured.' }
    }

    try {
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('event_id', eventId)
        .order('check_in_time', { ascending: false })

      if (error) return { data: null, error: formatAttendanceError(error.message) }
      return { data: data as AttendanceRecord[], error: null }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to retrieve records',
      }
    }
  },

  /** Retrieve auditing logs */
  async getAttendanceLogs(eventId: string): Promise<ApiResult<AttendanceLog[]>> {
    if (!isSupabaseConfigured || !supabase) {
      return { data: null, error: 'Database is not configured.' }
    }

    try {
      const { data, error } = await supabase
        .from('attendance_logs')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false })

      if (error) return { data: null, error: formatAttendanceError(error.message) }
      return { data: data as AttendanceLog[], error: null }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to retrieve audit logs',
      }
    }
  },

  /** Verify token and check-in attendee using GPS verification */
  async markAttendance(
    token: string,
    latitude: number,
    longitude: number,
    user: { id: string; email?: string; fullName: string },
    deviceInfo: string,
    _ipAddress: string
  ): Promise<ApiResult<{ record: AttendanceRecord; distance: number }>> {
    if (!isSupabaseConfigured || !supabase) {
      return { data: null, error: 'Database is not configured.' }
    }

    try {
      const { data, error } = await supabase.rpc('mark_event_attendance', {
        p_token: token,
        p_latitude: latitude,
        p_longitude: longitude,
        p_user_name: user.fullName,
        p_device_information: deviceInfo,
      })

      if (error) return { data: null, error: formatAttendanceError(error.message) }

      const result = data as {
        success: boolean
        error?: string
        distance?: number
        record?: AttendanceRecord
      }

      if (!result.success || !result.record || result.distance === undefined) {
        return { data: null, error: result.error ?? 'Attendance could not be marked.' }
      }

      return {
        data: {
          record: result.record,
          distance: Number(result.distance),
        },
        error: null,
      }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Attendance could not be marked.',
      }
    }
  },
}
