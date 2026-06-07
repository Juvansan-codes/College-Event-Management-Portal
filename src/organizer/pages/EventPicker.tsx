import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useEvent, type FestEvent } from '../../contexts/EventContext'
import { useAuth } from '../../contexts/AuthContext'

/* ─── Icons ─── */
const PlusIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)

const MapPinIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
)

const UsersIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)

/* ─── Status config ─── */
const STATUS_CONFIG: Record<string, { color: string; bg: string; border: string }> = {
  Draft: { color: 'var(--org-text-tertiary)', bg: 'var(--org-sidebar-item-hover)', border: 'var(--org-border-default)' },
  Active: { color: 'var(--org-success)', bg: 'var(--org-success-soft)', border: 'rgba(var(--org-success-rgb), 0.25)' },
  Completed: { color: 'var(--org-info)', bg: 'var(--org-info-soft)', border: 'rgba(var(--org-info-rgb), 0.25)' },
}

/* ─── Animations ─── */
const stagger = { animate: { transition: { staggerChildren: 0.07 } } }
const fadeUp = {
  initial: { opacity: 0, y: 25, filter: 'blur(8px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
}

const EventPicker: React.FC = () => {
  const navigate = useNavigate()
  const { events, isLoading, setActiveEvent } = useEvent()
  const { user } = useAuth()

  const displayName = user?.user_metadata?.full_name || 'Organizer'

  const handleSelectEvent = (event: FestEvent) => {
    setActiveEvent(event)
    navigate('/organizer/dashboard')
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: 'var(--org-text-tertiary)', fontSize: '0.9rem' }}>
        Loading your events…
      </div>
    )
  }

  return (
    <motion.div variants={stagger} initial="initial" animate="animate">
      {/* Page Header */}
      <motion.div variants={fadeUp} style={{ marginBottom: '2.5rem' }}>
        <p style={{ fontSize: '0.68rem', fontWeight: 650, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--org-accent-text)', marginBottom: '0.35rem' }}>
          Welcome back, {displayName}
        </p>
        <h1 style={{ fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)', fontWeight: 780, letterSpacing: '-0.04em', color: 'var(--org-text-primary)', lineHeight: 1.15, marginBottom: '0.4rem' }}>
          Your Events
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--org-text-secondary)', lineHeight: 1.55, maxWidth: '500px' }}>
          Select an event to manage, or create a new one to get started.
        </p>
      </motion.div>

      {/* Events Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.15rem' }}>
        {/* Existing Event Cards */}
        {events.map((event) => {
          const statusStyle = STATUS_CONFIG[event.status] || STATUS_CONFIG.Draft
          return (
            <motion.div
              key={event.id}
              variants={fadeUp}
              className="org-surface org-surface--hoverable org-surface--interactive"
              style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
              onClick={() => handleSelectEvent(event)}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3 }}
            >
              {/* Top row: category + status */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 650, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--org-text-tertiary)' }}>
                  {event.category}
                </span>
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.6rem',
                  borderRadius: '999px',
                  color: statusStyle.color,
                  background: statusStyle.bg,
                  border: `1px solid ${statusStyle.border}`,
                }}>
                  {event.status}
                </span>
              </div>

              {/* Event name */}
              <h3 style={{ fontSize: '1.15rem', fontWeight: 750, color: 'var(--org-text-primary)', letterSpacing: '-0.02em', lineHeight: 1.25 }}>
                {event.name}
              </h3>

              {/* Description */}
              {event.description && (
                <p style={{ fontSize: '0.82rem', color: 'var(--org-text-secondary)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {event.description}
                </p>
              )}

              {/* Meta row */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid var(--org-border-subtle)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--org-text-tertiary)' }}>
                  <CalendarIcon />
                  {formatDate(event.start_date)} – {formatDate(event.end_date)}
                </span>
                {event.venue && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--org-text-tertiary)' }}>
                    <MapPinIcon />
                    {event.venue}
                  </span>
                )}
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--org-text-tertiary)' }}>
                  <UsersIcon />
                  {event.max_attendees} max
                </span>
              </div>

              {/* CTA */}
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', fontWeight: 600, color: 'var(--org-accent-text)', marginTop: '0.25rem' }}>
                Manage Event
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
              </span>
            </motion.div>
          )
        })}

        {/* Create New Event Card */}
        <motion.div
          variants={fadeUp}
          className="org-surface org-surface--hoverable org-surface--interactive"
          style={{
            padding: '2rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            textAlign: 'center',
            minHeight: events.length > 0 ? 'auto' : '280px',
            border: '2px dashed var(--org-border-default)',
            background: 'transparent',
            cursor: 'pointer',
          }}
          onClick={() => navigate('/organizer/new-event')}
          whileHover={{ y: -4, borderColor: 'var(--org-accent)' }}
          transition={{ duration: 0.3 }}
        >
          <div style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'var(--org-accent-soft)',
            color: 'var(--org-accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <PlusIcon />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--org-text-primary)', marginBottom: '0.25rem' }}>
              Create New Event
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--org-text-secondary)', maxWidth: '240px' }}>
              Set up a new college fest, hackathon, or workshop from scratch.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Empty State */}
      {events.length === 0 && (
        <motion.p variants={fadeUp} style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--org-text-tertiary)', marginTop: '1.5rem' }}>
          You haven't created any events yet. Click "Create New Event" to begin!
        </motion.p>
      )}
    </motion.div>
  )
}

export default EventPicker
