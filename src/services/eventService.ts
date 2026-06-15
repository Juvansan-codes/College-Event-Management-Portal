/**
 * Event Service — abstraction layer over event data operations.
 *
 * All Supabase table queries for "events" are isolated here. When you build
 * a custom backend, swap the implementation to call your REST/GraphQL API
 * without touching any component or context.
 */
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'
import type { ApiResult, FestEvent, CreateEventPayload } from '../types'

/* ─── Public API ─── */

export const eventService = {
  /** Returns whether the data backend is available */
  isConfigured(): boolean {
    return isSupabaseConfigured
  },

  /** Fetch all events for a given organizer */
  async getEventsByOrganizer(organizerId: string): Promise<ApiResult<FestEvent[]>> {
    if (!isSupabaseConfigured || !supabase) {
      return { data: null, error: 'Event service is not configured.' }
    }

    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('organizer_id', organizerId)
        .order('created_at', { ascending: false })

      if (error) return { data: null, error: error.message }
      return { data: data as FestEvent[], error: null }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to fetch events',
      }
    }
  },

  /** Fetch all events (for attendees) */
  async getAllEvents(): Promise<ApiResult<FestEvent[]>> {
    if (!isSupabaseConfigured || !supabase) {
      return { data: null, error: 'Event service is not configured.' }
    }

    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('start_date', { ascending: true })

      if (error) return { data: null, error: error.message }
      return { data: data as FestEvent[], error: null }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to fetch events',
      }
    }
  },

  /** Fetch a single event by ID */
  async getEventById(eventId: string): Promise<ApiResult<FestEvent>> {
    if (!isSupabaseConfigured || !supabase) {
      return { data: null, error: 'Event service is not configured.' }
    }

    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single()

      if (error) return { data: null, error: error.message }
      return { data: data as FestEvent, error: null }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to fetch event',
      }
    }
  },

  /** Create a new event */
  async createEvent(
    payload: CreateEventPayload,
    organizerId: string,
  ): Promise<ApiResult<FestEvent>> {
    if (!isSupabaseConfigured || !supabase) {
      return { data: null, error: 'Event service is not configured.' }
    }

    try {
      const { data, error } = await supabase
        .from('events')
        .insert({
          ...payload,
          organizer_id: organizerId,
        })
        .select()
        .single()

      if (error) return { data: null, error: error.message }
      return { data: data as FestEvent, error: null }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to create event',
      }
    }
  },

  /** Update an existing event */
  async updateEvent(
    eventId: string,
    updates: Partial<CreateEventPayload>,
  ): Promise<ApiResult<FestEvent>> {
    if (!isSupabaseConfigured || !supabase) {
      return { data: null, error: 'Event service is not configured.' }
    }

    try {
      const { data, error } = await supabase
        .from('events')
        .update(updates)
        .eq('id', eventId)
        .select()
        .single()

      if (error) return { data: null, error: error.message }
      return { data: data as FestEvent, error: null }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to update event',
      }
    }
  },

  /** Delete an event */
  async deleteEvent(eventId: string): Promise<ApiResult<null>> {
    if (!isSupabaseConfigured || !supabase) {
      return { data: null, error: 'Event service is not configured.' }
    }

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)

      if (error) return { data: null, error: error.message }
      return { data: null, error: null }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to delete event',
      }
    }
  },
}
