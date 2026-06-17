import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import StatCard from '../components/StatCard'
import { useAuth } from '../../contexts/AuthContext'
import { useEvent } from '../../contexts/EventContext'

/* ─── Event Visual Slides for Cinematic Hero ─── */
const HERO_SLIDES = [
  {
    image: '/organizer/hero-1.png',
    title: 'World-Class Tech Fests',
    category: 'Innovation'
  },
  {
    image: '/organizer/hero-2.png',
    title: 'Spectacular Cultural Evenings',
    category: 'Creative Arts'
  },
  {
    image: '/organizer/hero-3.png',
    title: 'High-Energy Hackathons',
    category: 'Coding Battles'
  }
]

// SVG illustrations removed in favor of premium dashboard module image assets.

/* ─── Metric Icons ─── */
const EventIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)
const UsersIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)
const StarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2 L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2z" />
  </svg>
)
const DollarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
)
const ArrowIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
)

/* ─── Tool Cards Data ─── */
interface ToolItem {
  to: string
  image: string
  title: string
  description: string
  accentColor: string
}

const TOOLS: ToolItem[] = [
  {
    to: '/organizer/certifications',
    image: '/organizer/card-certifications.png',
    title: 'Certification Generator',
    description: 'Design and release customized, secure participation credentials for attendees.',
    accentColor: '#D4B27A'
  },
  {
    to: '/organizer/agenda',
    image: '/organizer/card-agenda.png',
    title: 'Agenda Planner',
    description: 'Plan complex schedules, curate speaker panels, and export print-ready programs.',
    accentColor: '#C5A265'
  },
  {
    to: '/organizer/sponsorships',
    image: '/organizer/card-sponsorships.png',
    title: 'Sponsorship Manager',
    description: 'Structure custom partnership tiers and streamline pipeline revenue management.',
    accentColor: '#A38A67'
  },
  {
    to: '/organizer/tickets',
    image: '/organizer/card-tickets.png',
    title: 'Registration & Tickets',
    description: 'Configure multi-tier tickets, design mock entry passes, and audit check-ins.',
    accentColor: '#B59B73'
  },
  {
    to: '/organizer/polls',
    image: '/organizer/card-polls.png',
    title: 'Polls & Engagement',
    description: 'Launch real-time questions, check audience metrics, and chart feedback live.',
    accentColor: '#8C714C'
  }
]


/* ─── Notion/Linear-Style Recent Activity ─── */
const RECENT_ACTIVITY = [
  { time: '2m ago', user: 'PK', name: 'Priya Kumar', action: 'registered for', target: 'TechFest 2026', badge: 'Checked In', statusType: 'info' },
  { time: '15m ago', user: 'CT', name: 'CloudTech Solutions', action: 'confirmed sponsorship for', target: 'Platinum Tier', badge: 'Revenue', statusType: 'success' },
  { time: '1h ago', user: 'AN', name: 'Aditya Nair', action: 'updated agenda slot', target: 'AI Keynote at 10:00 AM', badge: 'Updated', statusType: 'warning' },
  { time: '3h ago', user: 'SR', name: 'Sneha Reddy', action: 'voted in live poll', target: 'Best Hackathon Tracks', badge: 'Audience', statusType: 'accent' },
  { time: 'Yesterday', user: 'FF', name: 'FestForge Engine', action: 'auto-generated certs for', target: 'Design Sprint Attendees', badge: 'Finished', statusType: 'neutral' }
]

/* ─── Animations ─── */
const stagger = {
  animate: { transition: { staggerChildren: 0.08 } }
}

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } }
}

const cardReveal = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
}

const feedItemReveal = {
  initial: { opacity: 0, x: -10 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.3 } }
}

const fadeUp = {
  initial: { opacity: 0, y: 30, filter: 'blur(10px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
}

const Dashboard: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const { user } = useAuth()
  const { activeEvent, events } = useEvent()
  const navigate = useNavigate()

  const displayName = user?.user_metadata?.full_name || 'Organizer'

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 17) return 'Good Afternoon'
    return 'Good Evening'
  }

  /* Redirect to event picker if no event selected */
  useEffect(() => {
    if (!activeEvent) {
      navigate('/organizer', { replace: true })
    }
  }, [activeEvent, navigate])

  // Autoplay cinematic event visual carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)
    }, 4500)
    return () => clearInterval(timer)
  }, [])

  if (!activeEvent) return null

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })

  const eventDateRange = `${formatDate(activeEvent.start_date)} – ${formatDate(activeEvent.end_date)}`

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="org-dashboard-container">
      {/* Cinematic Welcome Hero */}
      <motion.div className="org-hero" variants={fadeUp}>
        <div className="org-hero__content">
          <h1 className="org-hero__title">{getGreeting()}, {displayName}</h1>
          <p className="org-hero__desc">
            Managing <strong>{activeEvent.name}</strong> ({eventDateRange}).
            {activeEvent.venue && <> at {activeEvent.venue}.</>}
            {' '}Command all credentials, ticket registrations, and agenda timelines from this control center.
          </p>
          <div className="org-hero__actions">
            <Link to="/organizer/agenda" className="org-btn org-btn--primary">
              Manage Schedule
            </Link>
            <Link to="/organizer/tickets" className="org-btn org-btn--secondary">
              View Tickets
            </Link>
          </div>
        </div>

        {/* Cinematic Media Slider */}
        <div className="org-hero__carousel">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              className="org-hero__slide"
              style={{ backgroundImage: `url(${HERO_SLIDES[currentSlide].image})` }}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            />
          </AnimatePresence>
          <div className="org-hero__carousel-overlay">
            <span className="org-badge org-badge--accent" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>
              {activeEvent.category}
            </span>
            <h4 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 700, marginTop: '0.4rem', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
              {activeEvent.name}
            </h4>
          </div>

          {/* Autoplay Slide Indicators */}
          <div className="org-hero__indicators">
            {HERO_SLIDES.map((_, i) => (
              <span
                key={i}
                className={`org-hero__dot ${currentSlide === i ? 'org-hero__dot--active' : ''}`}
                onClick={() => setCurrentSlide(i)}
                style={{ cursor: 'pointer' }}
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Floating Glass Stats Row — dynamic from active event */}
      <div className="org-stats-grid">
        <StatCard icon={<EventIcon />} label="Your Events" value={events.length} colorClass="accent" trend={`${activeEvent.status}`} trendUp index={0} />
        <StatCard icon={<UsersIcon />} label="Max Capacity" value={activeEvent.max_attendees} colorClass="success" trend={activeEvent.category} trendUp index={1} />
        <StatCard icon={<StarIcon />} label="Event Status" value={0} colorClass="warning" trend={activeEvent.status} trendUp index={2} />
        <StatCard icon={<DollarIcon />} label="Days Until" value={Math.max(0, Math.ceil((new Date(activeEvent.start_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} colorClass="info" trend={eventDateRange} trendUp index={3} />
      </div>

      {/* Organizer Premium Feature Showcases */}
      <motion.div
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: "-50px" }}
        variants={staggerContainer}
        style={{ marginTop: '0.5rem' }}
      >
        <motion.div variants={cardReveal} className="org-section__header">
          <div>
            <h2 className="org-section__title">SaaS Workspace Modules</h2>
            <p className="org-section__subtitle">Handcrafted modules designed for maximum administrative control.</p>
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        className="org-modules-grid"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: "-50px" }}
        variants={staggerContainer}
      >
        {TOOLS.map((tool) => (
          <motion.div
            key={tool.to}
            variants={cardReveal}
          >
            <Link to={tool.to} className="org-module-card">
              <div className="org-module-card__visual">
                <img src={tool.image} className="org-module-card__img" alt={tool.title} />
                {/* Radial Glow follow hover effect via CSS border mask */}
                <div className="org-module-glow-overlay" style={{ '--tool-accent': tool.accentColor } as React.CSSProperties} />
              </div>
              <div className="org-module-card__body">
                <h3 className="org-module-card__title">{tool.title}</h3>
                <p className="org-module-card__desc">{tool.description}</p>
                <span className="org-module-card__cta" style={{ color: tool.accentColor }}>
                  Open Dashboard <ArrowIcon />
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Horizontal Event Timeline scroll + Linear activity feed */}
      <div className="org-split-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', marginTop: '0.5rem' }}>
        
        {/* Horizontal Event Scroll */}
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
          style={{ overflow: 'hidden' }}
        >
          <motion.div variants={cardReveal} className="org-section__header">
            <div>
              <h2 className="org-section__title">Upcoming Timeline</h2>
              <p className="org-section__subtitle">Horizontal card scroller for chronological events tracking.</p>
            </div>
          </motion.div>
          <div className="org-events-scroll">
            {events.map((evt) => (
              <motion.div
                key={evt.id}
                className="org-event-card"
                variants={cardReveal}
                whileHover={{ y: -4, scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                style={{ cursor: 'pointer' }}
              >
                <div className="org-event-card__banner" style={{ background: 'linear-gradient(135deg, rgba(108,92,231,0.15), rgba(59,130,246,0.1))' }}>
                  <div className="org-event-card__date-badge">{formatDate(evt.start_date)} – {formatDate(evt.end_date)}</div>
                  <div className="org-event-card__status">
                    <span className={`org-badge org-badge--${evt.status === 'Active' ? 'success' : evt.status === 'Draft' ? 'neutral' : 'info'}`}>
                      {evt.status}
                    </span>
                  </div>
                </div>
                <div className="org-event-card__body">
                  <h3 className="org-event-card__name">{evt.name}</h3>
                  <div className="org-event-card__meta">
                    <span>{evt.category} · {evt.max_attendees} capacity</span>
                  </div>
                </div>
              </motion.div>
            ))}
            {events.length === 0 && (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--org-text-tertiary)', fontSize: '0.85rem' }}>
                No other events. <Link to="/organizer/new-event" style={{ color: 'var(--org-accent-text)', fontWeight: 600, textDecoration: 'underline' }}>Create one</Link>
              </div>
            )}
          </div>
        </motion.div>

        {/* Linear/Notion Style Activity Feed */}
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
        >
          <motion.div variants={cardReveal} className="org-section__header">
            <div>
              <h2 className="org-section__title">Recent Operations</h2>
              <p className="org-section__subtitle">Live operational activity and administrative updates.</p>
            </div>
          </motion.div>
          <motion.div variants={cardReveal} className="org-surface org-surface--elevated" style={{ padding: '1.25rem' }}>
            <motion.div variants={staggerContainer} className="org-activity-feed">
              {RECENT_ACTIVITY.map((item, idx) => (
                <motion.div key={idx} variants={feedItemReveal} className="org-activity-item">
                  <div className="org-activity__avatar" style={{ background: `var(--org-${item.statusType})` }}>
                    {item.user}
                  </div>
                  <div className="org-activity__content">
                    <div className="org-activity__text">
                      <strong>{item.name}</strong> {item.action} <strong>{item.target}</strong>
                    </div>
                    <div className="org-activity__time">{item.time}</div>
                  </div>
                  <div className="org-activity__type">
                    <span className={`org-badge org-badge--${item.statusType}`}>
                      {item.badge}
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default Dashboard
