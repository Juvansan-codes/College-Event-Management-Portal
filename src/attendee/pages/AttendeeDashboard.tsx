import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'

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

/* ─── Upcoming Events ─── */
const UPCOMING_EVENTS = [
  {
    name: 'TechFest 2026',
    date: 'Jun 15 – 17, 2026',
    category: 'Technology',
    attendees: 847,
    status: 'Open',
  },
  {
    name: 'UI/UX Design Sprint',
    date: 'Jun 22, 2026',
    category: 'Design',
    attendees: 124,
    status: 'Open',
  },
  {
    name: 'Hackathon Fall',
    date: 'Jul 05 – 07, 2026',
    category: 'Coding',
    attendees: 412,
    status: 'Upcoming',
  },
  {
    name: 'Cultural Night',
    date: 'Jul 12, 2026',
    category: 'Cultural',
    attendees: 650,
    status: 'Upcoming',
  },
  {
    name: 'Mega Concert Night',
    date: 'Jul 18, 2026',
    category: 'Entertainment',
    attendees: 1250,
    status: 'Coming Soon',
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

const AttendeeDashboard: React.FC = () => {
  const { user } = useAuth()
  const displayName = user?.user_metadata?.full_name || 'Student'

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 17) return 'Good Afternoon'
    return 'Good Evening'
  }

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="org-dashboard-container">

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

        {/* Decorative gradient panel (no carousel image needed) */}
        <div className="org-hero__carousel" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(59,130,246,0.1), rgba(108,92,231,0.08))' }}>
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
                fontSize: '3.5rem',
                fontWeight: 800,
                letterSpacing: '-0.04em',
                lineHeight: 1,
                marginBottom: '0.5rem',
                background: 'linear-gradient(135deg, #10B981, #3B82F6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                {UPCOMING_EVENTS.length}
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
                <th style={{ padding: '0.85rem 1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 650, color: 'var(--org-text-tertiary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Attendees</th>
                <th style={{ padding: '0.85rem 1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 650, color: 'var(--org-text-tertiary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: 650, color: 'var(--org-text-tertiary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}></th>
              </tr>
            </thead>
            <tbody>
              {UPCOMING_EVENTS.map((evt, idx) => (
                <motion.tr
                  key={evt.name}
                  variants={cardReveal}
                  style={{
                    borderBottom: idx < UPCOMING_EVENTS.length - 1 ? '1px solid var(--org-border-subtle)' : 'none',
                    transition: 'background 0.2s ease',
                    cursor: 'pointer',
                  }}
                  whileHover={{ backgroundColor: 'var(--org-table-row-hover)' }}
                >
                  <td style={{ padding: '0.9rem 1.25rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--org-text-primary)', fontSize: '0.88rem' }}>{evt.name}</span>
                  </td>
                  <td style={{ padding: '0.9rem 1.25rem', fontSize: '0.84rem', color: 'var(--org-text-secondary)' }}>{evt.date}</td>
                  <td style={{ padding: '0.9rem 1.25rem' }}>
                    <span className="org-badge org-badge--neutral">{evt.category}</span>
                  </td>
                  <td style={{ padding: '0.9rem 1.25rem', fontSize: '0.84rem', color: 'var(--org-text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
                    {evt.attendees.toLocaleString()}
                  </td>
                  <td style={{ padding: '0.9rem 1.25rem' }}>
                    <span className={`org-badge org-badge--${evt.status === 'Open' ? 'success' : evt.status === 'Upcoming' ? 'info' : 'neutral'}`}>
                      {evt.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.9rem 1.25rem', textAlign: 'right' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', fontWeight: 600, color: 'var(--org-accent-text)' }}>
                      Register <ArrowIcon />
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

export default AttendeeDashboard
