import React, { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import StatCard from '../components/StatCard'
import { useAuth } from '../../contexts/AuthContext'
import { useEvent } from '../../contexts/EventContext'
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient'

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
  visual: React.ReactNode
  title: string
  description: string
  accentColor: string
}

const TOOLS: ToolItem[] = [
  {
    to: '/organizer/certifications',
    visual: (
      <div className="mock-ui-container mock-cert">
        <div className="mock-cert-card">
          <div className="mock-cert-badge" />
          <div className="mock-line mock-line--title" />
          <div className="mock-line" />
          <div className="mock-line mock-line--short" />
        </div>
      </div>
    ),
    title: 'Certification Generator',
    description: 'Design and release customized, secure participation credentials for attendees.',
    accentColor: '#D4B27A'
  },
  {
    to: '/organizer/agenda',
    visual: (
      <div className="mock-ui-container mock-agenda">
        <div className="mock-agenda-sidebar" />
        <div className="mock-agenda-grid">
          <div className="mock-agenda-block mock-agenda-block--1" />
          <div className="mock-agenda-block mock-agenda-block--2" />
          <div className="mock-agenda-block mock-agenda-block--3" />
        </div>
      </div>
    ),
    title: 'Agenda Planner',
    description: 'Plan complex schedules, curate speaker panels, and export print-ready programs.',
    accentColor: '#C5A265'
  },
  {
    to: '/organizer/sponsorships',
    visual: (
      <div className="mock-ui-container mock-kanban">
        <div className="mock-kanban-col">
          <div className="mock-kanban-card" />
          <div className="mock-kanban-card" />
        </div>
        <div className="mock-kanban-col">
          <div className="mock-kanban-card mock-kanban-card--accent" />
        </div>
        <div className="mock-kanban-col">
          <div className="mock-kanban-card" />
        </div>
      </div>
    ),
    title: 'Sponsorship Manager',
    description: 'Structure custom partnership tiers and streamline pipeline revenue management.',
    accentColor: '#A38A67'
  },
  {
    to: '/organizer/tickets',
    visual: (
      <div className="mock-ui-container mock-ticket-wrap">
        <div className="mock-ticket">
          <div className="mock-ticket-hole mock-ticket-hole--top" />
          <div className="mock-ticket-hole mock-ticket-hole--bottom" />
          <div className="mock-ticket-barcode">
            <div className="mock-barcode-line" /><div className="mock-barcode-line" /><div className="mock-barcode-line" />
          </div>
          <div className="mock-laser-scanner" />
        </div>
      </div>
    ),
    title: 'Registration & Tickets',
    description: 'Configure multi-tier tickets, design mock entry passes, and audit check-ins.',
    accentColor: '#B59B73'
  },
  {
    to: '/organizer/polls',
    visual: (
      <div className="mock-ui-container mock-chart">
        <div className="mock-chart-bg">
          <div className="mock-chart-bar mock-chart-bar--1" />
          <div className="mock-chart-bar mock-chart-bar--2" />
          <div className="mock-chart-bar mock-chart-bar--3" />
          <div className="mock-chart-bar mock-chart-bar--4" />
          <div className="mock-chart-pulse-node" />
        </div>
      </div>
    ),
    title: 'Polls & Engagement',
    description: 'Launch real-time questions, check audience metrics, and chart feedback live.',
    accentColor: '#8C714C'
  }
]

/* ─── Activity Item Type ─── */
interface ActivityItem {
  time: string
  timestamp: number
  user: string
  name: string
  action: string
  target: string
  badge: string
  statusType: string
}

/* ─── Relative Time Helper ─── */
function relativeTime(dateStr: string): { label: string; ts: number } {
  const date = new Date(dateStr)
  const ts = date.getTime()
  const now = Date.now()
  const diffMs = now - ts
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)

  if (diffSec < 60) return { label: 'Just now', ts }
  if (diffMin < 60) return { label: `${diffMin}m ago`, ts }
  if (diffHr < 24) return { label: `${diffHr}h ago`, ts }
  if (diffDay === 1) return { label: 'Yesterday', ts }
  if (diffDay < 7) return { label: `${diffDay}d ago`, ts }
  return { label: date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }), ts }
}

/* ─── Initials from name ─── */
function getInitials(name: string): string {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

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

const heroContainer = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
}

const heroChildFade = {
  initial: { opacity: 0, y: 15, filter: 'blur(4px)' },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] }
  }
}

const Dashboard: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const { user } = useAuth()
  const { activeEvent, events } = useEvent()
  const navigate = useNavigate()

  /* ─── Real data state ─── */
  const [registrationCount, setRegistrationCount] = useState(0)
  const [sponsorRevenue, setSponsorRevenue] = useState(0)
  const [certsIssued, setCertsIssued] = useState(0)
  const [checkedInCount, setCheckedInCount] = useState(0)
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([])
  const [isLoadingActivity, setIsLoadingActivity] = useState(true)

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

  /* ─── Fetch real dashboard data ─── */
  const fetchDashboardData = useCallback(async () => {
    if (!activeEvent || !isSupabaseConfigured || !supabase) {
      setIsLoadingActivity(false)
      return
    }

    const eventId = activeEvent.id

    try {
      // Fetch all data sources in parallel
      const [
        registrationsRes,
        sponsorsRes,
        certificatesRes,
        attendanceRes,
      ] = await Promise.all([
        supabase
          .from('event_registrations')
          .select('id, user_name, user_email, status, ticket_tier_id, ticket_tiers(name), created_at')
          .eq('event_id', eventId)
          .order('created_at', { ascending: false }),
        supabase
          .from('event_sponsors')
          .select('id, name, package_id, sponsor_packages(name), amount, pipeline_stage, contact_email, created_at, updated_at')
          .eq('event_id', eventId)
          .order('created_at', { ascending: false }),
        supabase
          .from('event_certificates')
          .select('id, participant_name, issued_at, event_id')
          .eq('event_id', eventId)
          .order('issued_at', { ascending: false }),
        supabase
          .from('attendance_records')
          .select('id, user_name, check_in_time, status')
          .eq('event_id', eventId)
          .order('check_in_time', { ascending: false }),
      ])

      // ── Stat card values ──
      const registrations = registrationsRes.data || []
      const sponsors = sponsorsRes.data || []
      const certificates = certificatesRes.data || []
      const attendanceRecords = attendanceRes.data || []

      setRegistrationCount(registrations.length)
      setSponsorRevenue(sponsors.reduce((sum: number, s: any) => sum + (s.amount || 0), 0))
      setCertsIssued(certificates.length)
      setCheckedInCount(attendanceRecords.filter((r: any) => r.status === 'verified').length)

      // ── Build unified activity feed from real data ──
      const activities: ActivityItem[] = []

      // Registrations → activity items
      for (const reg of registrations.slice(0, 5)) {
        const { label, ts } = relativeTime(reg.created_at)
        const tierData: any = reg.ticket_tiers
        const tierName = (Array.isArray(tierData) ? tierData[0]?.name : tierData?.name) || 'General'
        activities.push({
          time: label,
          timestamp: ts,
          user: getInitials(reg.user_name || 'U'),
          name: reg.user_name || 'Unknown User',
          action: 'purchased a ticket for',
          target: `${activeEvent.name} (${tierName})`,
          badge: reg.status === 'confirmed' ? 'Confirmed' : 'Registered',
          statusType: reg.status === 'confirmed' ? 'success' : 'info',
        })
      }

      // Sponsors → activity items
      for (const sponsor of sponsors.slice(0, 5)) {
        const { label, ts } = relativeTime(sponsor.created_at)
        const packageData: any = sponsor.sponsor_packages
        const packageName = (Array.isArray(packageData) ? packageData[0]?.name : packageData?.name) || 'Custom'
        activities.push({
          time: label,
          timestamp: ts,
          user: getInitials(sponsor.name),
          name: sponsor.name,
          action: `joined as ${packageName} sponsor for`,
          target: `₹${(sponsor.amount || 0).toLocaleString('en-IN')}`,
          badge: sponsor.pipeline_stage || 'Contacted',
          statusType: sponsor.pipeline_stage === 'Confirmed' ? 'success' : 'warning',
        })
      }

      // Certificates → activity items
      for (const cert of certificates.slice(0, 5)) {
        const { label, ts } = relativeTime(cert.issued_at)
        activities.push({
          time: label,
          timestamp: ts,
          user: getInitials(cert.participant_name),
          name: cert.participant_name,
          action: 'was issued a certificate for',
          target: activeEvent.name,
          badge: 'Certificate',
          statusType: 'accent',
        })
      }

      // Attendance → activity items
      for (const record of attendanceRecords.slice(0, 5)) {
        const { label, ts } = relativeTime(record.check_in_time)
        activities.push({
          time: label,
          timestamp: ts,
          user: getInitials(record.user_name),
          name: record.user_name,
          action: 'checked in to',
          target: activeEvent.name,
          badge: record.status === 'verified' ? 'Verified' : 'Check-In',
          statusType: record.status === 'verified' ? 'success' : 'info',
        })
      }

      // Sort by most recent and take top 8
      activities.sort((a, b) => b.timestamp - a.timestamp)
      setRecentActivity(activities.slice(0, 8))
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
    } finally {
      setIsLoadingActivity(false)
    }
  }, [activeEvent])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  /* ─── Real-time subscription for live updates ─── */
  useEffect(() => {
    if (!activeEvent || !isSupabaseConfigured || !supabase) return

    const eventId = activeEvent.id

    // Subscribe to new registrations
    const registrationChannel = supabase
      .channel(`dashboard-registrations-${eventId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'event_registrations',
          filter: `event_id=eq.${eventId}`,
        },
        () => {
          // Refetch all data to keep stats + activity in sync
          fetchDashboardData()
        }
      )
      .subscribe()

    // Subscribe to sponsor changes
    const sponsorChannel = supabase
      .channel(`dashboard-sponsors-${eventId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'event_sponsors',
          filter: `event_id=eq.${eventId}`,
        },
        () => {
          fetchDashboardData()
        }
      )
      .subscribe()

    // Subscribe to attendance changes
    const attendanceChannel = supabase
      .channel(`dashboard-attendance-${eventId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'attendance_records',
          filter: `event_id=eq.${eventId}`,
        },
        () => {
          fetchDashboardData()
        }
      )
      .subscribe()

    // Subscribe to certificate changes
    const certChannel = supabase
      .channel(`dashboard-certs-${eventId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'event_certificates',
          filter: `event_id=eq.${eventId}`,
        },
        () => {
          fetchDashboardData()
        }
      )
      .subscribe()

    return () => {
      if (supabase) {
        supabase.removeChannel(registrationChannel)
        supabase.removeChannel(sponsorChannel)
        supabase.removeChannel(attendanceChannel)
        supabase.removeChannel(certChannel)
      }
    }
  }, [activeEvent, fetchDashboardData])

  if (!activeEvent) return null

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })

  const eventDateRange = `${formatDate(activeEvent.start_date)} – ${formatDate(activeEvent.end_date)}`

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="org-dashboard-container org-dashboard-page">
      {/* Cinematic Welcome Hero */}
      <motion.div className="org-hero org-hero--immersive" variants={heroContainer} initial="initial" animate="animate">
        {/* Cinematic Media Slider */}
        <div className="org-hero__carousel">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              className="org-hero__slide"
              style={{ backgroundImage: `url(${HERO_SLIDES[currentSlide].image})` }}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1.08 }}
              exit={{ opacity: 0 }}
              transition={{
                opacity: { duration: 0.8, ease: "easeInOut" },
                scale: { duration: 4.5, ease: "linear" }
              }}
            />
          </AnimatePresence>
        </div>

        {/* Ambient Dark Gradient Overlay */}
        <div className="org-hero__overlay" />

        {/* Floating Text Content */}
        <div className="org-hero__content">
          <motion.h1 className="org-hero__title" variants={heroChildFade}>
            <span className="org-hero__greeting">{getGreeting()},</span>
            <span className="org-hero__name">{displayName}</span>
          </motion.h1>
          <motion.p className="org-hero__desc" variants={heroChildFade}>
            Managing <strong className="org-hero__event-brand">{activeEvent.name}</strong> <span className="org-hero__event-dates">({eventDateRange})</span>
            {activeEvent.venue && <span className="org-hero__event-venue"> at {activeEvent.venue}</span>}.
            <span className="org-hero__desc-text">Command all credentials, ticket registrations, and agenda timelines from this control center.</span>
          </motion.p>
          <motion.div className="org-hero__actions" variants={heroChildFade}>
            <Link to="/organizer/agenda" className="org-btn org-btn--primary">
              Manage Schedule
            </Link>
            <Link to="/organizer/tickets" className="org-btn org-btn--secondary">
              View Tickets
            </Link>
          </motion.div>
        </div>

        {/* Floating Event Info Overlay in bottom right */}
        <motion.div className="org-hero__info-overlay" variants={heroChildFade}>
          <span className="org-badge org-badge--accent" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>
            {activeEvent.category}
          </span>
          <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: 700, marginTop: '0.4rem', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
            {activeEvent.name}
          </h4>
        </motion.div>

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
      </motion.div>

      {/* Floating Glass Stats Row — real data from active event */}
      <div className="org-stats-grid">
        <StatCard icon={<EventIcon />} label="Registrations" value={registrationCount} colorClass="accent" trend={`of ${activeEvent.max_attendees} capacity`} trendUp={registrationCount > 0} index={0} />
        <StatCard icon={<UsersIcon />} label="Checked In" value={checkedInCount} colorClass="success" trend={registrationCount > 0 ? `${Math.round((checkedInCount / registrationCount) * 100)}% attendance` : 'No registrations'} trendUp={checkedInCount > 0} index={1} />
        <StatCard icon={<DollarIcon />} label="Sponsor Revenue" value={sponsorRevenue} prefix="₹" colorClass="warning" trend={activeEvent.status} trendUp={sponsorRevenue > 0} index={2} />
        <StatCard icon={<StarIcon />} label="Certs Issued" value={certsIssued} colorClass="info" trend={`${Math.max(0, Math.ceil((new Date(activeEvent.start_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} days until event`} trendUp={certsIssued > 0} index={3} />
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
                {tool.visual}
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
      <div className="org-split-grid" style={{ marginTop: '0.5rem' }}>
        
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

        {/* Linear/Notion Style Activity Feed — REAL DATA */}
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
            {isLoadingActivity ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem' }}>
                {[1, 2, 3, 4].map(i => (
                  <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'center', opacity: 1 - i * 0.15 }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--org-surface-2)' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ height: '10px', width: '60%', background: 'var(--org-surface-2)', borderRadius: '4px', marginBottom: '8px' }} />
                      <div style={{ height: '8px', width: '40%', background: 'var(--org-surface-2)', borderRadius: '4px' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentActivity.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--org-text-tertiary)', fontSize: '0.85rem' }}>
                No recent activity yet. Operations will appear here as registrations, sponsorships, check-ins, and certificates are created.
              </div>
            ) : (
              <motion.div variants={staggerContainer} className="org-activity-feed">
                {recentActivity.map((item, idx) => (
                  <motion.div key={`${item.statusType}-${item.timestamp}-${idx}`} variants={feedItemReveal} className="org-activity-item">
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
            )}
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default Dashboard
