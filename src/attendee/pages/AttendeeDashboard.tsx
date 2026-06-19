import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { eventService, registrationService } from '../../services'
import type { FestEvent } from '../../types'

/* ─── Icons ─── */
const CalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)

const TicketIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
    <path d="M13 5v2" /><path d="M13 17v2" /><path d="M13 11v2" />
  </svg>
)

const CertIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" /><path d="M12 18v-6" /><path d="m9 15 3 3 3-3" />
  </svg>
)

const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

const ArrowIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
)

const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
)

/* ─── Quick Actions Data ─── */
const QUICK_ACTIONS = [
  {
    to: '/attendee/events',
    icon: <SearchIcon />,
    iconColor: 'green',
    title: 'Browse Events',
    description: 'Discover hackathons, fests, and workshops happening on campus.',
  },
  {
    to: '/attendee/my-tickets',
    icon: <TicketIcon />,
    iconColor: 'blue',
    title: 'My Tickets',
    description: 'View your registered events and digital entry passes.',
  },
  {
    to: '/attendee/certificates',
    icon: <CertIcon />,
    iconColor: 'amber',
    title: 'Certificates',
    description: 'Download participation and achievement certificates.',
  },
  {
    to: '/#event-stage',
    icon: <CalendarIcon />,
    iconColor: 'purple',
    title: 'Event Calendar',
    description: 'Check out the full campus events calendar.',
  },
]

/* ─── Animations ─── */
const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
}

const fadeUp = {
  initial: { opacity: 0, y: 30, filter: 'blur(10px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

const cardReveal = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } },
}

/* ─── Modal Styles (inline for simplicity) ─── */
const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  backdropFilter: 'blur(6px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
}

const modalContentStyle: React.CSSProperties = {
  background: 'var(--org-surface)',
  border: '1px solid var(--org-border-default)',
  borderRadius: '0.8rem',
  padding: '2rem',
  width: '90%',
  maxWidth: '450px',
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
}

const AttendeeDashboard: React.FC = () => {
  const { user } = useAuth()
  const displayName = user?.user_metadata?.full_name || 'Student'
  const displayEmail = user?.email || ''
  
  const [upcomingEvents, setUpcomingEvents] = useState<FestEvent[]>([])
  const [registeredEventIds, setRegisteredEventIds] = useState<Set<string>>(new Set())

  // Registration Modal State
  const [selectedEventForReg, setSelectedEventForReg] = useState<FestEvent | null>(null)
  const [regPhone, setRegPhone] = useState('')
  const [regTicketType, setRegTicketType] = useState('General Admission')
  const [isRegistering, setIsRegistering] = useState(false)
  const [regError, setRegError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      // Fetch events
      const { data: eventsData } = await eventService.getAllEvents()
      if (eventsData) {
        setUpcomingEvents(eventsData)
      }

      // Fetch user's registrations
      if (user) {
        const { data: regData } = await registrationService.getMyRegistrations(user.id)
        if (regData) {
          setRegisteredEventIds(new Set(regData))
        }
      }
    }
    fetchData()
  }, [user])

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEventForReg || !user) return

    setIsRegistering(true)
    setRegError(null)

    const result = await registrationService.registerForEvent(
      selectedEventForReg.id,
      user.id,
      displayName,
      displayEmail,
      regPhone,
      regTicketType
    )

    if (result.error) {
      setRegError(result.error)
      setIsRegistering(false)
    } else {
      // Success!
      setRegisteredEventIds((prev) => new Set(prev).add(selectedEventForReg.id))
      setIsRegistering(false)
      setSelectedEventForReg(null) // Close modal
      setRegPhone('')
      setRegTicketType('General Admission')
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 17) return 'Good Afternoon'
    return 'Good Evening'
  }

  const formatDate = (start?: string, end?: string) => {
    if (!start) return 'TBA'
    const s = new Date(start).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    if (end && end !== start) {
      const e = new Date(end).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
      return `${s} – ${e}`
    }
    return s
  }

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="org-dashboard-container">

      {/* Registration Modal Overlay */}
      <AnimatePresence>
        {selectedEventForReg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={modalOverlayStyle}
          >
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              style={modalContentStyle}
            >
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--org-text-primary)' }}>
                Register for Event
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--org-text-secondary)', marginBottom: '1.5rem' }}>
                You are registering for <strong>{selectedEventForReg.name}</strong>. Please confirm your details.
              </p>

              <form onSubmit={handleRegisterSubmit}>
                {regError && (
                  <div style={{ background: 'var(--org-danger-soft)', color: 'var(--org-danger)', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.85rem', marginBottom: '1rem', border: '1px solid rgba(var(--org-danger-rgb), 0.2)' }}>
                    {regError}
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <label className="org-label">
                    Full Name
                    <input className="org-input" type="text" value={displayName} disabled style={{ opacity: 0.7 }} />
                  </label>
                  <label className="org-label">
                    Email Address
                    <input className="org-input" type="email" value={displayEmail} disabled style={{ opacity: 0.7 }} />
                  </label>
                  <label className="org-label">
                    Ticket Tier
                    <select className="org-select" value={regTicketType} onChange={(e) => setRegTicketType(e.target.value)}>
                      <option value="Free Student Pass">Free Student Pass</option>
                      <option value="General Admission">General Admission</option>
                      <option value="Early Bird discount">Early Bird discount</option>
                      <option value="VIP All-Access">VIP All-Access</option>
                    </select>
                  </label>
                  <label className="org-label">
                    Phone Number (Optional)
                    <input 
                      className="org-input" 
                      type="tel" 
                      placeholder="+1 234 567 8900" 
                      value={regPhone} 
                      onChange={(e) => setRegPhone(e.target.value)} 
                    />
                  </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '2rem' }}>
                  <button type="button" className="org-btn org-btn--secondary" onClick={() => setSelectedEventForReg(null)} disabled={isRegistering}>
                    Cancel
                  </button>
                  <button type="submit" className="org-btn org-btn--accent" disabled={isRegistering}>
                    {isRegistering ? 'Registering...' : 'Confirm Registration'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Welcome Hero */}
      <motion.div className="org-hero" variants={fadeUp}>
        <div className="org-hero__content">
          <h1 className="org-hero__title">{getGreeting()}, {displayName}</h1>
          <p className="org-hero__desc">
            Welcome to your student portal. Discover exciting campus events, register instantly, and track your participation journey.
          </p>
          <div className="org-hero__actions">
            <Link to="/attendee/events" className="org-btn org-btn--primary">
              Browse Events
            </Link>
            <Link to="/attendee/my-tickets" className="org-btn org-btn--secondary">
              My Tickets
            </Link>
          </div>
        </div>

        {/* Decorative gradient panel */}
        <div className="org-hero__carousel att-hero-gradient">
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3,
          }}>
            <div style={{
              textAlign: 'center',
              color: 'var(--org-text-primary)',
            }}>
              <div style={{
                fontSize: '3.8rem',
                fontWeight: 800,
                letterSpacing: '-0.04em',
                lineHeight: 1,
                marginBottom: '0.5rem',
                background: 'linear-gradient(135deg, #C8AE73, #B89B5E)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontFamily: "'General Sans', 'Satoshi', 'Geist', sans-serif",
              }}>
                {upcomingEvents.length}
              </div>
              <div style={{
                fontSize: '0.85rem',
                fontWeight: 500,
                color: 'var(--org-text-secondary)',
              }}>
                Events Available
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions Grid */}
      <motion.div
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: '-50px' }}
        variants={staggerContainer}
      >
        <motion.div variants={cardReveal} className="org-section__header">
          <div>
            <h2 className="org-section__title">Quick Actions</h2>
            <p className="org-section__subtitle">Jump right into what matters.</p>
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        className="att-quick-grid"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: '-50px' }}
        variants={staggerContainer}
      >
        {QUICK_ACTIONS.map((action) => (
          <motion.div key={action.to} variants={cardReveal}>
            <Link to={action.to} className="att-quick-card">
              <div className={`att-quick-card__icon att-quick-card__icon--${action.iconColor}`}>
                {action.icon}
              </div>
              <div className="att-quick-card__text">
                <h3>{action.title}</h3>
                <p>{action.description}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Upcoming Events */}
      <motion.div
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: '-50px' }}
        variants={staggerContainer}
      >
        <motion.div variants={cardReveal} className="org-section__header">
          <div>
            <h2 className="org-section__title">Upcoming Events</h2>
            <p className="org-section__subtitle">Register now — seats fill fast!</p>
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: '-50px' }}
        variants={staggerContainer}
      >
        <motion.div variants={cardReveal} className="org-surface org-surface--elevated" style={{ padding: '0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{
                background: 'var(--org-table-header-bg)',
                borderBottom: '1px solid var(--org-border-default)',
              }}>
                <th style={{ padding: '0.85rem 1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 650, color: 'var(--org-text-tertiary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Event</th>
                <th style={{ padding: '0.85rem 1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 650, color: 'var(--org-text-tertiary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Date</th>
                <th style={{ padding: '0.85rem 1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 650, color: 'var(--org-text-tertiary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Category</th>
                <th style={{ padding: '0.85rem 1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 650, color: 'var(--org-text-tertiary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Capacity</th>
                <th style={{ padding: '0.85rem 1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 650, color: 'var(--org-text-tertiary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: 650, color: 'var(--org-text-tertiary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}></th>
              </tr>
            </thead>
            <tbody>
              {upcomingEvents.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--org-text-tertiary)' }}>
                    No upcoming events found. Check back later!
                  </td>
                </tr>
              ) : upcomingEvents.map((evt, idx) => {
                const isRegistered = registeredEventIds.has(evt.id)
                
                return (
                  <tr
                    key={evt.id}
                    style={{
                      borderBottom: idx < upcomingEvents.length - 1 ? '1px solid var(--org-border-subtle)' : 'none',
                      transition: 'background 0.2s ease',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--org-table-row-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    onClick={() => !isRegistered && setSelectedEventForReg(evt)}
                  >
                    <td style={{ padding: '0.9rem 1.25rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--org-text-primary)', fontSize: '0.88rem' }}>{evt.name}</span>
                    </td>
                    <td style={{ padding: '0.9rem 1.25rem', fontSize: '0.84rem', color: 'var(--org-text-secondary)' }}>
                      {formatDate(evt.start_date, evt.end_date)}
                    </td>
                    <td style={{ padding: '0.9rem 1.25rem' }}>
                      <span className="org-badge org-badge--neutral">{evt.category || 'General'}</span>
                    </td>
                    <td style={{ padding: '0.9rem 1.25rem', fontSize: '0.84rem', color: 'var(--org-text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
                      {evt.max_attendees ? evt.max_attendees.toLocaleString() : 'Open'}
                    </td>
                    <td style={{ padding: '0.9rem 1.25rem' }}>
                      <span className={`org-badge org-badge--${evt.status === 'Live' ? 'success' : evt.status === 'Draft' ? 'neutral' : 'info'}`}>
                        {evt.status || 'Upcoming'}
                      </span>
                    </td>
                    <td style={{ padding: '0.9rem 1.25rem', textAlign: 'right' }}>
                      {isRegistered ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', fontWeight: 600, color: 'var(--org-success)' }}>
                          <CheckIcon /> Registered
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', fontWeight: 600, color: 'var(--org-accent-text)' }}>
                          Register <ArrowIcon />
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

export default AttendeeDashboard

