import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'
import type { ApiResult } from '../types'

export interface EventRegistration {
  id: string
  event_id: string
  user_id: string
  user_name: string
  user_email: string | null
  phone: string | null
  status: string
  ticket_type: string
  created_at: string
}

export const registrationService = {
  /** Register a user for an event */
  async registerForEvent(
    eventId: string,
    userId: string,
    userName: string,
    userEmail?: string,
    phone?: string,
    ticketType?: string
  ): Promise<ApiResult<EventRegistration>> {
    if (!isSupabaseConfigured || !supabase) {
      return { data: null, error: 'Database is not configured.' }
    }

    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .insert({
          event_id: eventId,
          user_id: userId,
          user_name: userName,
          user_email: userEmail || null,
          phone: phone || null,
          ticket_type: ticketType || 'General Admission',
        })
        .select()
        .single()

      if (error) {
        if (error.code === '23505') {
          return { data: null, error: 'You are already registered for this event!' }
        }
        return { data: null, error: error.message }
      }

      return { data: data as EventRegistration, error: null }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to register',
      }
    }
  },

  /** Check if a user is registered for a specific event */
  async checkRegistration(eventId: string, userId: string): Promise<ApiResult<boolean>> {
    if (!isSupabaseConfigured || !supabase) {
      return { data: null, error: 'Database is not configured.' }
    }

    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        return { data: false, error: null }
      }

      return { data: !!data, error: null }
    } catch (err) {
      return { data: false, error: err instanceof Error ? err.message : 'Failed to check registration' }
    }
  },

  /** Get all event IDs a user is registered for */
  async getMyRegistrations(userId: string): Promise<ApiResult<string[]>> {
    if (!isSupabaseConfigured || !supabase) {
      return { data: null, error: 'Database is not configured.' }
    }

    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .select('event_id')
        .eq('user_id', userId)

      if (error) return { data: null, error: error.message }
      
      const eventIds = data.map(r => r.event_id)
      return { data: eventIds, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Failed to fetch registrations' }
    }
  },

  /** Get full registrations with event details */
  async getMyFullRegistrations(userId: string): Promise<ApiResult<any[]>> {
    if (!isSupabaseConfigured || !supabase) {
      return { data: null, error: 'Database is not configured.' }
    }

    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .select(`
          id,
          status,
          ticket_type,
          created_at,
          events (
            id,
            name,
            start_date,
            end_date,
            venue
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) return { data: null, error: error.message }
      
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Failed to fetch registrations' }
    }
  },

  /** Get all registrations for a specific event (for organizers) */
  async getRegistrationsByEvent(eventId: string): Promise<ApiResult<EventRegistration[]>> {
    if (!isSupabaseConfigured || !supabase) {
      return { data: null, error: 'Database is not configured.' }
    }

    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .select('*')
        .eq('event_id', eventId)
        .order('user_name', { ascending: true })

      if (error) return { data: null, error: error.message }
      return { data: data as EventRegistration[], error: null }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to fetch registrations',
      }
    }
  },
}
