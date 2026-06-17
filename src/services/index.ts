/**
 * Services barrel export.
 *
 * All data access goes through these service objects.
/**
 * Services barrel export.
 *
 * All data access goes through these service objects.
 * Components & contexts import from here — never from lib/supabaseClient.
 */
export { authService } from './authService'
export { eventService } from './eventService'
export { attendanceService } from './attendanceService'
export { sponsorshipService } from './sponsorshipService'
export { pollService } from './pollService'
export { registrationService } from './registrationService'
export { certificationService } from './certificationService'
export { emailService } from './emailService'

