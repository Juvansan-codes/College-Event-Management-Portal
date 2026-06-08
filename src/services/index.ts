/**
 * Services barrel export.
 *
 * All data access goes through these service objects.
 * Components & contexts import from here — never from lib/supabaseClient.
 */
export { authService } from './authService'
export { eventService } from './eventService'
