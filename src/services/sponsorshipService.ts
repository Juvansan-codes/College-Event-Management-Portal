import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'
import type {
  ApiResult,
  CreateSponsorPayload,
  EventSponsor,
  SponsorInquiryPayload,
  SponsorPipelineStage,
  SponsorPackage,
  CreateSponsorPackagePayload,
} from '../types'

export const sponsorshipService = {
  isConfigured(): boolean {
    return isSupabaseConfigured
  },

  /* ─── Packages ─── */

  async getPackagesByEvent(eventId: string): Promise<ApiResult<SponsorPackage[]>> {
    if (!isSupabaseConfigured || !supabase) {
      return { data: null, error: 'Sponsorship service is not configured.' }
    }

    try {
      const { data, error } = await supabase
        .from('sponsor_packages')
        .select('*')
        .eq('event_id', eventId)
        .order('price', { ascending: false })

      if (error) return { data: null, error: error.message }
      return { data: data as SponsorPackage[], error: null }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to fetch sponsor packages',
      }
    }
  },

  async createPackage(eventId: string, payload: CreateSponsorPackagePayload): Promise<ApiResult<SponsorPackage>> {
    if (!isSupabaseConfigured || !supabase) {
      return { data: null, error: 'Sponsorship service is not configured.' }
    }

    try {
      const { data, error } = await supabase
        .from('sponsor_packages')
        .insert({ ...payload, event_id: eventId })
        .select()
        .single()

      if (error) return { data: null, error: error.message }
      return { data: data as SponsorPackage, error: null }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to create sponsor package',
      }
    }
  },

  async updatePackage(packageId: string, payload: Partial<CreateSponsorPackagePayload>): Promise<ApiResult<SponsorPackage>> {
    if (!isSupabaseConfigured || !supabase) {
      return { data: null, error: 'Sponsorship service is not configured.' }
    }

    try {
      const { data, error } = await supabase
        .from('sponsor_packages')
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq('id', packageId)
        .select()
        .single()

      if (error) return { data: null, error: error.message }
      return { data: data as SponsorPackage, error: null }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to update sponsor package',
      }
    }
  },

  async deletePackage(packageId: string): Promise<ApiResult<null>> {
    if (!isSupabaseConfigured || !supabase) {
      return { data: null, error: 'Sponsorship service is not configured.' }
    }

    try {
      const { error } = await supabase
        .from('sponsor_packages')
        .delete()
        .eq('id', packageId)

      if (error) return { data: null, error: error.message }
      return { data: null, error: null }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to delete sponsor package',
      }
    }
  },

  /* ─── Sponsors ─── */

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
