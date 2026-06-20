import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'
import type { ApiResult } from '../types'

export const newsletterService = {
  /**
   * Subscribe an email to the newsletter
   */
  async subscribe(email: string): Promise<ApiResult<boolean>> {
    if (!isSupabaseConfigured || !supabase) {
      return { data: null, error: 'Database is not configured.' }
    }

    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert({ email })

      if (error) {
        // 23505 is the PostgreSQL error code for unique violation
        if (error.code === '23505') {
          return { data: true, error: null } // Treat as success if already subscribed
        }
        return { data: null, error: error.message }
      }
      return { data: true, error: null }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to subscribe',
      }
    }
  },
}
