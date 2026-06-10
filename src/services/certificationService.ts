import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'
import type {
  ApiResult,
  CertificateBatch,
  CertificateBatchWithRecipients,
  EventCertificate,
  SaveCertificateBatchPayload,
} from '../types'

export const certificationService = {
  isConfigured(): boolean {
    return isSupabaseConfigured
  },

  async getBatchByEvent(eventId: string): Promise<ApiResult<CertificateBatchWithRecipients | null>> {
    if (!isSupabaseConfigured || !supabase) {
      return { data: null, error: 'Certification service is not configured.' }
    }

    try {
      const { data: batch, error: batchError } = await supabase
        .from('certificate_batches')
        .select('*')
        .eq('event_id', eventId)
        .maybeSingle()

      if (batchError) return { data: null, error: batchError.message }
      if (!batch) return { data: null, error: null }

      const { data: recipients, error: recipientsError } = await supabase
        .from('event_certificates')
        .select('*')
        .eq('batch_id', batch.id)
        .order('participant_name', { ascending: true })

      if (recipientsError) return { data: null, error: recipientsError.message }

      return {
        data: {
          ...(batch as CertificateBatch),
          recipients: (recipients ?? []) as EventCertificate[],
        },
        error: null,
      }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to fetch certificate batch',
      }
    }
  },

  async saveBatch(
    eventId: string,
    payload: SaveCertificateBatchPayload,
  ): Promise<ApiResult<CertificateBatchWithRecipients>> {
    if (!isSupabaseConfigured || !supabase) {
      return { data: null, error: 'Certification service is not configured.' }
    }

    try {
      const { data: batch, error: batchError } = await supabase
        .from('certificate_batches')
        .upsert(
          {
            event_id: eventId,
            event_name: payload.event_name,
            conducted_date: payload.conducted_date,
            template_data_url: payload.template_data_url,
          },
          { onConflict: 'event_id' },
        )
        .select()
        .single()

      if (batchError) return { data: null, error: batchError.message }

      const typedBatch = batch as CertificateBatch
      const { error: deleteError } = await supabase
        .from('event_certificates')
        .delete()
        .eq('batch_id', typedBatch.id)

      if (deleteError) return { data: null, error: deleteError.message }

      const rows = payload.participants.map((participantName) => ({
        batch_id: typedBatch.id,
        event_id: eventId,
        participant_name: participantName,
      }))

      if (rows.length === 0) {
        return { data: { ...typedBatch, recipients: [] }, error: null }
      }

      const { data: recipients, error: recipientsError } = await supabase
        .from('event_certificates')
        .insert(rows)
        .select()
        .order('participant_name', { ascending: true })

      if (recipientsError) return { data: null, error: recipientsError.message }

      return {
        data: {
          ...typedBatch,
          recipients: (recipients ?? []) as EventCertificate[],
        },
        error: null,
      }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to save certificate batch',
      }
    }
  },
}
