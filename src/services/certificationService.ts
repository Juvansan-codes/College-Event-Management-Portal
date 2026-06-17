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
      return { data: null, error: 'Database is not configured.' }
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
      return { data: null, error: 'Database is not configured.' }
    }

    try {
      // 1. Fetch event registrations to map participant names to emails
      const { data: registrations } = await supabase
        .from('event_registrations')
        .select('user_name, user_email')
        .eq('event_id', eventId)

      const emailMap = new Map<string, string>()
      if (registrations) {
        registrations.forEach((r) => {
          if (r.user_name && r.user_email) {
            emailMap.set(r.user_name.trim().toLowerCase(), r.user_email.trim())
          }
        })
      }

      // 2. Upsert the certificate batch
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
      
      // 3. Delete existing certificates for this batch
      const { error: deleteError } = await supabase
        .from('event_certificates')
        .delete()
        .eq('batch_id', typedBatch.id)

      if (deleteError) return { data: null, error: deleteError.message }

      // 4. Construct rows with recipient_email and sent_by_email
      const rows = payload.participants.map((participantName) => {
        const normalized = participantName.trim().toLowerCase()
        const recipientEmail = emailMap.get(normalized) || null
        return {
          batch_id: typedBatch.id,
          event_id: eventId,
          participant_name: participantName,
          recipient_email: recipientEmail,
          sent_by_email: payload.sent_by_email || null,
        }
      })

      if (rows.length === 0) {
        return { data: { ...typedBatch, recipients: [] }, error: null }
      }

      // 5. Insert new certificates
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

  async getMyCertificates(participantName: string, email?: string): Promise<ApiResult<any[]>> {
    if (!isSupabaseConfigured || !supabase) {
      return { data: null, error: 'Database is not configured.' }
    }

    try {
      let query = supabase
        .from('event_certificates')
        .select(`
          id,
          issued_at,
          participant_name,
          recipient_email,
          sent_by_email,
          certificate_batches (
            event_name,
            conducted_date,
            template_data_url
          )
        `)

      if (email) {
        query = query.or(`participant_name.eq."${participantName}",recipient_email.eq."${email}"`)
      } else {
        query = query.eq('participant_name', participantName)
      }

      const { data, error } = await query.order('issued_at', { ascending: false })

      if (error) return { data: null, error: error.message }
      return { data: data || [], error: null }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to fetch certificates',
      }
    }
  },
}
