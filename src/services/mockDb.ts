import type {
  AuthUser,
  AuthSession,
  FestEvent,
  EventSponsor,
  CertificateBatch,
  EventCertificate,
  SponsorInquiryPayload,
  CreateEventPayload,
  CreateSponsorPayload,
  SponsorPipelineStage,
  SaveCertificateBatchPayload,
  AttendanceSession,
  AttendanceRecord,
  AttendanceLog,
} from '../types'

// Helpers to read/write localStorage with fallback
const getStorageItem = <T>(key: string, defaultValue: T): T => {
  try {
    const val = localStorage.getItem(key)
    return val ? JSON.parse(val) : defaultValue
  } catch (e) {
    console.error(`Error reading key ${key} from localStorage`, e)
    return defaultValue
  }
}

const setStorageItem = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error(`Error writing key ${key} to localStorage`, e)
  }
}

// Generate a simple ID
const generateId = () => Math.random().toString(36).substring(2, 11)

// Seed Data definition
const DEFAULT_ORGANIZER_ID = 'organizer-user-id'
const DEFAULT_STUDENT_ID = 'student-user-id'

const initialUsers = [
  {
    id: DEFAULT_ORGANIZER_ID,
    email: 'organizer@college.edu',
    password: 'password123',
    fullName: 'Prof. Sarah Jenkins',
    role: 'organizer',
  },
  {
    id: DEFAULT_STUDENT_ID,
    email: 'student@college.edu',
    password: 'password123',
    fullName: 'Alex River',
    role: 'student',
  },
]

const initialEvents: FestEvent[] = [
  {
    id: 'event-1',
    organizer_id: DEFAULT_ORGANIZER_ID,
    name: 'HackFest 2026',
    description: 'The ultimate 24-hour college coding hackathon. Build, hack, and pitch your innovative ideas to industry judges.',
    start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
    end_date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    venue: 'Main Auditorium & CS Labs',
    category: 'Technical',
    max_attendees: 300,
    status: 'Upcoming',
    created_at: new Date().toISOString(),
  },
  {
    id: 'event-2',
    organizer_id: DEFAULT_ORGANIZER_ID,
    name: 'Rhythms Cultural Night',
    description: 'An evening celebrating music, dance, and drama. Showcasing talented performances across departments.',
    start_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 15 days from now
    end_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    venue: 'Open Air Theatre',
    category: 'Cultural',
    max_attendees: 1000,
    status: 'Upcoming',
    created_at: new Date().toISOString(),
  },
]

const initialSponsors: EventSponsor[] = [
  {
    id: 'sponsor-1',
    event_id: 'event-1',
    name: 'TechCorp Solutions',
    tier: 'Platinum',
    amount: 5000,
    contact_email: 'sponsorship@techcorp.com',
    pipeline_stage: 'Confirmed',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'sponsor-2',
    event_id: 'event-1',
    name: 'Innovate Labs',
    tier: 'Gold',
    amount: 2500,
    contact_email: 'contact@innovatelabs.io',
    pipeline_stage: 'Negotiating',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

// Preseed active session expiring 30 mins from now
const initialSessions: AttendanceSession[] = [
  {
    id: 'session-active',
    event_id: 'event-1',
    token: 'HACKFEST2026_TOKEN',
    latitude: 12.9716, // Bangalore center
    longitude: 77.5946,
    radius_meters: 1000,
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    is_active: true,
  },
]

// Preseed one check-in
const initialRecords: AttendanceRecord[] = [
  {
    id: 'record-1',
    event_id: 'event-1',
    session_id: 'session-active',
    user_id: DEFAULT_STUDENT_ID,
    user_name: 'Alex River',
    check_in_time: new Date().toISOString(),
    latitude: 12.972,
    longitude: 77.595,
    distance_meters: 62.5,
    status: 'Present',
    device_information: 'Mobile Chrome (iPhone)',
    ip_address: '192.168.10.42',
  },
]

export const mockDb = {
  // --- Initialize Storage ---
  init() {
    if (!localStorage.getItem('festforge_users')) {
      setStorageItem('festforge_users', initialUsers)
    }
    if (!localStorage.getItem('festforge_events')) {
      setStorageItem('festforge_events', initialEvents)
    }
    if (!localStorage.getItem('festforge_sponsors')) {
      setStorageItem('festforge_sponsors', initialSponsors)
    }
    if (!localStorage.getItem('festforge_inquiries')) {
      setStorageItem('festforge_inquiries', [])
    }
    if (!localStorage.getItem('festforge_certificate_batches')) {
      setStorageItem('festforge_certificate_batches', [])
    }
    if (!localStorage.getItem('festforge_event_certificates')) {
      setStorageItem('festforge_event_certificates', [])
    }
    // QR Attendance Module Tables
    if (!localStorage.getItem('festforge_attendance_sessions')) {
      setStorageItem('festforge_attendance_sessions', initialSessions)
    }
    if (!localStorage.getItem('festforge_attendance_records')) {
      setStorageItem('festforge_attendance_records', initialRecords)
    }
    if (!localStorage.getItem('festforge_attendance_logs')) {
      setStorageItem('festforge_attendance_logs', [])
    }

    // Validate stored session: if the session's user ID no longer exists
    // in the users table (e.g. after localStorage was partially cleared),
    // remove the stale session so users are redirected to login.
    const storedSession = getStorageItem<{ user?: { id?: string } } | null>('festforge_session', null)
    if (storedSession?.user?.id) {
      const users = getStorageItem<{ id: string }[]>('festforge_users', [])
      const sessionUserExists = users.some((u) => u.id === storedSession.user!.id)
      if (!sessionUserExists) {
        localStorage.removeItem('festforge_session')
        console.warn('⚠️ Stale session cleared — the stored user no longer exists. Please log in again.')
      }
    }
  },

  // --- Auth & Session Operations ---
  getUsers() {
    this.init()
    return getStorageItem<any[]>('festforge_users', [])
  },

  getSession(): AuthSession | null {
    this.init()
    return getStorageItem<AuthSession | null>('festforge_session', null)
  },

  setSession(session: AuthSession | null) {
    setStorageItem('festforge_session', session)
    // Dispatch custom event to notify listeners
    window.dispatchEvent(new Event('auth_state_change'))
  },

  signUp(params: { email: string; passwordHash: string; fullName: string; role: string }): AuthUser {
    const users = this.getUsers()
    
    // Check if user already exists
    const existing = users.find((u) => u.email.toLowerCase() === params.email.toLowerCase())
    if (existing) {
      throw new Error('User already registered')
    }

    const newUser = {
      id: generateId(),
      email: params.email,
      password: params.passwordHash, // simple plain text mock
      fullName: params.fullName,
      role: params.role,
    }

    users.push(newUser)
    setStorageItem('festforge_users', users)

    return {
      id: newUser.id,
      email: newUser.email,
      user_metadata: {
        full_name: newUser.fullName,
        role: newUser.role,
      },
    }
  },

  signIn(email: string, passwordHash: string): AuthUser {
    const users = this.getUsers()
    const user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === passwordHash
    )
    if (!user) {
      throw new Error('Invalid login credentials')
    }

    return {
      id: user.id,
      email: user.email,
      user_metadata: {
        full_name: user.fullName,
        role: user.role,
      },
    }
  },

  // --- Events Operations ---
  getEvents(): FestEvent[] {
    this.init()
    return getStorageItem<FestEvent[]>('festforge_events', [])
  },

  getEventsByOrganizer(organizerId: string): FestEvent[] {
    return this.getEvents().filter((e) => e.organizer_id === organizerId)
  },

  getEventById(eventId: string): FestEvent | null {
    return this.getEvents().find((e) => e.id === eventId) ?? null
  },

  createEvent(payload: CreateEventPayload, organizerId: string): FestEvent {
    const events = this.getEvents()
    const newEvent: FestEvent = {
      ...payload,
      id: generateId(),
      organizer_id: organizerId,
      created_at: new Date().toISOString(),
    }
    events.push(newEvent)
    setStorageItem('festforge_events', events)
    return newEvent
  },

  updateEvent(eventId: string, updates: Partial<CreateEventPayload>): FestEvent {
    const events = this.getEvents()
    const index = events.findIndex((e) => e.id === eventId)
    if (index === -1) {
      throw new Error('Event not found')
    }
    const updated = { ...events[index], ...updates }
    events[index] = updated
    setStorageItem('festforge_events', events)
    return updated
  },

  deleteEvent(eventId: string): void {
    const events = this.getEvents()
    const filtered = events.filter((e) => e.id !== eventId)
    setStorageItem('festforge_events', filtered)

    // Cascade delete sponsors and certificates
    const sponsors = getStorageItem<EventSponsor[]>('festforge_sponsors', [])
    setStorageItem('festforge_sponsors', sponsors.filter((s) => s.event_id !== eventId))

    const batches = getStorageItem<CertificateBatch[]>('festforge_certificate_batches', [])
    setStorageItem('festforge_certificate_batches', batches.filter((b) => b.event_id !== eventId))

    const certs = getStorageItem<EventCertificate[]>('festforge_event_certificates', [])
    setStorageItem('festforge_event_certificates', certs.filter((c) => c.event_id !== eventId))
  },

  // --- Sponsors Operations ---
  getSponsors(): EventSponsor[] {
    this.init()
    return getStorageItem<EventSponsor[]>('festforge_sponsors', [])
  },

  getSponsorsByEvent(eventId: string): EventSponsor[] {
    return this.getSponsors().filter((s) => s.event_id === eventId)
  },

  createSponsor(eventId: string, payload: CreateSponsorPayload): EventSponsor {
    const sponsors = this.getSponsors()
    const newSponsor: EventSponsor = {
      ...payload,
      id: generateId(),
      event_id: eventId,
      pipeline_stage: 'Contacted',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    sponsors.push(newSponsor)
    setStorageItem('festforge_sponsors', sponsors)
    return newSponsor
  },

  updateSponsorStage(sponsorId: string, stage: SponsorPipelineStage): EventSponsor {
    const sponsors = this.getSponsors()
    const index = sponsors.findIndex((s) => s.id === sponsorId)
    if (index === -1) {
      throw new Error('Sponsor not found')
    }
    const updated = {
      ...sponsors[index],
      pipeline_stage: stage,
      updated_at: new Date().toISOString(),
    }
    sponsors[index] = updated
    setStorageItem('festforge_sponsors', sponsors)
    return updated
  },

  createInquiry(payload: SponsorInquiryPayload): void {
    this.init()
    const inquiries = getStorageItem<any[]>('festforge_inquiries', [])
    inquiries.push({
      id: generateId(),
      ...payload,
      created_at: new Date().toISOString(),
    })
    setStorageItem('festforge_inquiries', inquiries)
  },

  // --- Certificates Operations ---
  getBatches(): CertificateBatch[] {
    this.init()
    return getStorageItem<CertificateBatch[]>('festforge_certificate_batches', [])
  },

  getCertificates(): EventCertificate[] {
    this.init()
    return getStorageItem<EventCertificate[]>('festforge_event_certificates', [])
  },

  getBatchByEvent(eventId: string): { batch: CertificateBatch | null; recipients: EventCertificate[] } {
    const batches = this.getBatches()
    const batch = batches.find((b) => b.event_id === eventId) ?? null
    if (!batch) {
      return { batch: null, recipients: [] }
    }
    const certs = this.getCertificates().filter((c) => c.batch_id === batch.id)
    return { batch, recipients: certs }
  },

  saveBatch(eventId: string, payload: SaveCertificateBatchPayload): { batch: CertificateBatch; recipients: EventCertificate[] } {
    const batches = this.getBatches()
    const existingIndex = batches.findIndex((b) => b.event_id === eventId)
    
    let batch: CertificateBatch
    if (existingIndex !== -1) {
      batch = {
        ...batches[existingIndex],
        event_name: payload.event_name,
        conducted_date: payload.conducted_date,
        template_data_url: payload.template_data_url,
        updated_at: new Date().toISOString(),
      }
      batches[existingIndex] = batch
    } else {
      batch = {
        id: generateId(),
        event_id: eventId,
        event_name: payload.event_name,
        conducted_date: payload.conducted_date,
        template_data_url: payload.template_data_url,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      batches.push(batch)
    }
    setStorageItem('festforge_certificate_batches', batches)

    // Clear old certificates for this batch
    let certs = this.getCertificates().filter((c) => c.batch_id !== batch.id)

    // Insert new certificates
    const newCerts = payload.participants.map((name) => ({
      id: generateId(),
      batch_id: batch.id,
      event_id: eventId,
      participant_name: name,
      issued_at: new Date().toISOString(),
    }))

    certs = [...certs, ...newCerts]
    setStorageItem('festforge_event_certificates', certs)

    return {
      batch,
      recipients: newCerts,
    }
  },

  // --- QR Attendance Module Operations ---
  getAttendanceSessions(): AttendanceSession[] {
    this.init()
    return getStorageItem<AttendanceSession[]>('festforge_attendance_sessions', [])
  },

  getAttendanceRecords(): AttendanceRecord[] {
    this.init()
    return getStorageItem<AttendanceRecord[]>('festforge_attendance_records', [])
  },

  getAttendanceLogs(): AttendanceLog[] {
    this.init()
    return getStorageItem<AttendanceLog[]>('festforge_attendance_logs', [])
  },

  startAttendanceSession(
    eventId: string,
    latitude: number,
    longitude: number,
    radiusMeters: number,
    durationMinutes: number
  ): AttendanceSession {
    const sessions = this.getAttendanceSessions()
    
    // Deactivate previous active sessions for this event
    const updatedSessions = sessions.map((s) => {
      if (s.event_id === eventId && s.is_active) {
        return { ...s, is_active: false }
      }
      return s
    })

    const token = `QR_${eventId.substring(0, 4)}_${generateId().toUpperCase()}`
    const newSession: AttendanceSession = {
      id: generateId(),
      event_id: eventId,
      token,
      latitude,
      longitude,
      radius_meters: radiusMeters,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + durationMinutes * 60 * 1000).toISOString(),
      is_active: true,
    }

    updatedSessions.push(newSession)
    setStorageItem('festforge_attendance_sessions', updatedSessions)
    
    // Dispatch session start event
    window.dispatchEvent(new CustomEvent('attendance_session_change', { detail: { eventId, status: 'started' } }))
    return newSession
  },

  stopAttendanceSession(eventId: string): void {
    const sessions = this.getAttendanceSessions()
    const updated = sessions.map((s) => {
      if (s.event_id === eventId && s.is_active) {
        return { ...s, is_active: false }
      }
      return s
    })
    setStorageItem('festforge_attendance_sessions', updated)
    
    window.dispatchEvent(new CustomEvent('attendance_session_change', { detail: { eventId, status: 'stopped' } }))
  },

  getActiveSession(eventId: string): AttendanceSession | null {
    const sessions = this.getAttendanceSessions()
    const active = sessions.find(
      (s) => s.event_id === eventId && s.is_active && new Date(s.expires_at) > new Date()
    )
    return active ?? null
  },

  verifyToken(token: string): AttendanceSession | null {
    const sessions = this.getAttendanceSessions()
    const active = sessions.find(
      (s) => s.token === token && s.is_active && new Date(s.expires_at) > new Date()
    )
    return active ?? null
  },

  markAttendance(record: Omit<AttendanceRecord, 'id' | 'check_in_time'>): AttendanceRecord {
    const records = this.getAttendanceRecords()
    
    // Check duplication
    const duplicate = records.find(
      (r) => r.event_id === record.event_id && r.user_id === record.user_id
    )
    if (duplicate) {
      throw new Error('Attendance has already been marked for this event.')
    }

    const newRecord: AttendanceRecord = {
      ...record,
      id: generateId(),
      check_in_time: new Date().toISOString(),
    }

    records.push(newRecord)
    setStorageItem('festforge_attendance_records', records)
    
    // Dispatch record update event
    window.dispatchEvent(new CustomEvent('attendance_record_added', { detail: newRecord }))
    return newRecord
  },

  logAttendanceAttempt(log: Omit<AttendanceLog, 'id' | 'created_at'>): AttendanceLog {
    const logs = this.getAttendanceLogs()
    const newLog: AttendanceLog = {
      ...log,
      id: generateId(),
      created_at: new Date().toISOString(),
    }
    logs.push(newLog)
    setStorageItem('festforge_attendance_logs', logs)
    return newLog
  },

  getAttendanceRecordsByEvent(eventId: string): AttendanceRecord[] {
    return this.getAttendanceRecords().filter((r) => r.event_id === eventId)
  },

  getAttendanceLogsByEvent(eventId: string): AttendanceLog[] {
    return this.getAttendanceLogs().filter((l) => l.event_id === eventId)
  },
}
