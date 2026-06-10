import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'
import type {
  ApiResult,
  CreateSponsorPayload,
  EventSponsor,
  SponsorInquiryPayload,
  SponsorPipelineStage,
} from '../types'

export const sponsorshipService = {
  isConfigured(): boolean {
    return isSupabaseConfigured
  },

  async getSponsorsByEvent(eventId: string): Promise<ApiResult<EventSponsor[]>> {
    if (!isSupabaseConfigured || !supabase) {
      return { data: null, error: 'Sponsorship service is not configured.' }
    }

    try {
      const { data, error } = await supabase
        .from('event_sponsors')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: true })

      if (error) return { data: null, error: error.message }
      return { data: data as EventSponsor[], error: null }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to fetch sponsors',
      }
    }
  },

  async createSponsor(eventId: string, payload: CreateSponsorPayload): Promise<ApiResult<EventSponsor>> {
    if (!isSupabaseConfigured || !supabase) {
      return { data: null, error: 'Sponsorship service is not configured.' }
    }

    try {
      const { data, error } = await supabase
        .from('event_sponsors')
        .insert({
          ...payload,
          event_id: eventId,
          pipeline_stage: 'Contacted',
        })
        .select()
        .single()

      if (error) return { data: null, error: error.message }
      return { data: data as EventSponsor, error: null }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to create sponsor',
      }
    }
  },

  async updateSponsorStage(
    sponsorId: string,
    pipelineStage: SponsorPipelineStage,
  ): Promise<ApiResult<EventSponsor>> {
    if (!isSupabaseConfigured || !supabase) {
      return { data: null, error: 'Sponsorship service is not configured.' }
    }

    try {
      const { data, error } = await supabase
        .from('event_sponsors')
        .update({ pipeline_stage: pipelineStage })
        .eq('id', sponsorId)
        .select()
        .single()

      if (error) return { data: null, error: error.message }
      return { data: data as EventSponsor, error: null }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to update sponsor',
      }
    }
  },

  async createInquiry(payload: SponsorInquiryPayload): Promise<ApiResult<null>> {
    if (!isSupabaseConfigured || !supabase) {
      return { data: null, error: 'Sponsorship service is not configured.' }
    }

    try {
      const { error } = await supabase.from('sponsor_inquiries').insert(payload)
      if (error) return { data: null, error: error.message }
      return { data: null, error: null }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to submit sponsor inquiry',
      }
    }
  },
}
