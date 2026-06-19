import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'
import type { ApiResult, TicketTier, CreateTicketTierPayload } from '../types'

export interface EventRegistration {
  id: string
  event_id: string
  user_id: string
  user_name: string
  user_email: string | null
  phone: string | null
  status: string
  ticket_tier_id: string | null
  created_at: string
  ticket_tier?: TicketTier // Added for joined queries
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
          ticket_tier_id: ticketType || null,
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
          ticket_tier_id,
          created_at,
          ticket_tiers (*),
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
        .select(`
          *,
          ticket_tiers (*)
        `)
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

  /* ─── Ticket Tiers ─── */

  async getTicketTiersByEvent(eventId: string): Promise<ApiResult<TicketTier[]>> {
    if (!isSupabaseConfigured || !supabase) {
      return { data: null, error: 'Database is not configured.' }
    }

    try {
      const { data, error } = await supabase
        .from('ticket_tiers')
        .select('*')
        .eq('event_id', eventId)
        .order('price', { ascending: true })

      if (error) return { data: null, error: error.message }
      return { data: data as TicketTier[], error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Failed to fetch ticket tiers' }
    }
  },

  async createTicketTier(eventId: string, payload: CreateTicketTierPayload): Promise<ApiResult<TicketTier>> {
    if (!isSupabaseConfigured || !supabase) {
      return { data: null, error: 'Database is not configured.' }
    }

    try {
      const { data, error } = await supabase
        .from('ticket_tiers')
        .insert({ ...payload, event_id: eventId })
        .select()
        .single()

      if (error) return { data: null, error: error.message }
      return { data: data as TicketTier, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Failed to create ticket tier' }
    }
  },

  async updateTicketTier(tierId: string, payload: Partial<CreateTicketTierPayload>): Promise<ApiResult<TicketTier>> {
    if (!isSupabaseConfigured || !supabase) {
      return { data: null, error: 'Database is not configured.' }
    }

    try {
      const { data, error } = await supabase
        .from('ticket_tiers')
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq('id', tierId)
        .select()
        .single()

      if (error) return { data: null, error: error.message }
      return { data: data as TicketTier, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Failed to update ticket tier' }
    }
  },

  async deleteTicketTier(tierId: string): Promise<ApiResult<null>> {
    if (!isSupabaseConfigured || !supabase) {
      return { data: null, error: 'Database is not configured.' }
    }

    try {
      const { error } = await supabase
        .from('ticket_tiers')
        .delete()
        .eq('id', tierId)

      if (error) return { data: null, error: error.message }
      return { data: null, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Failed to delete ticket tier' }
    }
  },
}
