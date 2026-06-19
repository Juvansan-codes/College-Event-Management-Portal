import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'
import type { ApiResult } from '../types'

/* ─── Types ─── */

export interface AgendaItem {
  id: string
  event_id: string
  day_number: number
  time_label: string
  hour: number
  title: string
  speaker: string
  venue: string
  category: string
  description: string
  created_at: string
  updated_at: string
}

export interface CreateAgendaItemPayload {
  day_number: number
  time_label: string
  hour: number
  title: string
  speaker?: string
  venue?: string
  category?: string
  description?: string
}

export interface UpdateAgendaItemPayload {
  time_label?: string
  hour?: number
  title?: string
  speaker?: string
  venue?: string
  category?: string
  description?: string
  day_number?: number
}

/* ─── Service ─── */

export const agendaService = {
  isConfigured(): boolean {
    return isSupabaseConfigured
  },

  /** Fetch all agenda items for an event, ordered by day then hour */
  async getAgendaByEvent(eventId: string): Promise<ApiResult<AgendaItem[]>> {
    if (!isSupabaseConfigured || !supabase) {
      return { data: null, error: 'Database is not configured.' }
    }

    try {
      const { data, error } = await supabase
        .from('agenda_items')
        .select('*')
        .eq('event_id', eventId)
        .order('day_number', { ascending: true })
        .order('hour', { ascending: true })

      if (error) return { data: null, error: error.message }
      return { data: data as AgendaItem[], error: null }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to fetch agenda items',
      }
    }
  },

  /** Create a new agenda item for an event */
  async createAgendaItem(
    eventId: string,
    payload: CreateAgendaItemPayload,
  ): Promise<ApiResult<AgendaItem>> {
    if (!isSupabaseConfigured || !supabase) {
      return { data: null, error: 'Database is not configured.' }
    }

    try {
      const { data, error } = await supabase
        .from('agenda_items')
        .insert({
          event_id: eventId,
          day_number: payload.day_number,
          time_label: payload.time_label,
          hour: payload.hour,
          title: payload.title,
          speaker: payload.speaker || '',
          venue: payload.venue || '',
          category: payload.category || 'Talk',
          description: payload.description || '',
        })
        .select()
        .single()

      if (error) return { data: null, error: error.message }
      return { data: data as AgendaItem, error: null }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to create agenda item',
      }
    }
  },

  /** Update an existing agenda item */
  async updateAgendaItem(
    itemId: string,
    payload: UpdateAgendaItemPayload,
  ): Promise<ApiResult<AgendaItem>> {
    if (!isSupabaseConfigured || !supabase) {
      return { data: null, error: 'Database is not configured.' }
    }

    try {
      const { data, error } = await supabase
        .from('agenda_items')
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq('id', itemId)
        .select()
        .single()

      if (error) return { data: null, error: error.message }
      return { data: data as AgendaItem, error: null }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to update agenda item',
      }
    }
  },

  /** Delete an agenda item */
  async deleteAgendaItem(itemId: string): Promise<ApiResult<null>> {
    if (!isSupabaseConfigured || !supabase) {
      return { data: null, error: 'Database is not configured.' }
    }

    try {
      const { error } = await supabase
        .from('agenda_items')
        .delete()
        .eq('id', itemId)

      if (error) return { data: null, error: error.message }
      return { data: null, error: null }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to delete agenda item',
      }
    }
  },

  /** Get distinct day numbers for an event (to render tabs) */
  async getDayNumbers(eventId: string): Promise<ApiResult<number[]>> {
    if (!isSupabaseConfigured || !supabase) {
      return { data: null, error: 'Database is not configured.' }
    }

    try {
      const { data, error } = await supabase
        .from('agenda_items')
        .select('day_number')
        .eq('event_id', eventId)
        .order('day_number', { ascending: true })

      if (error) return { data: null, error: error.message }

      const unique = [...new Set((data || []).map((d: any) => d.day_number))]
      return { data: unique, error: null }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to fetch day numbers',
      }
    }
  },
}
