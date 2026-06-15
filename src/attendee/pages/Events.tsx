import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { useAuth } from '../../contexts/AuthContext'
import { eventService, registrationService } from '../../services'
import type { FestEvent } from '../../types'

/* ─── Icons ─── */
const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

const FilterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
)

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

/* ─── Animations ─── */
const stagger = { animate: { transition: { staggerChildren: 0.08 } } }
const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

/* ─── Modal Styles ─── */
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

const Events: React.FC = () => {
  const { user } = useAuth()
  const displayName = user?.user_metadata?.full_name || 'Student'
  const displayEmail = user?.email || ''

  const [events, setEvents] = useState<FestEvent[]>([])
  const [registeredEventIds, setRegisteredEventIds] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  
  // Registration Modal State
  const [selectedEventForReg, setSelectedEventForReg] = useState<FestEvent | null>(null)
  const [regPhone, setRegPhone] = useState('')
  const [regTicketType, setRegTicketType] = useState('General Admission')
  const [isRegistering, setIsRegistering] = useState(false)
  const [regError, setRegError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const { data: eventsData } = await eventService.getAllEvents()
      if (eventsData) setEvents(eventsData)

      if (user) {
        const { data: regData } = await registrationService.getMyRegistrations(user.id)
        if (regData) setRegisteredEventIds(new Set(regData))
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
      setRegisteredEventIds((prev) => new Set(prev).add(selectedEventForReg.id))
      setIsRegistering(false)
      setSelectedEventForReg(null)
      setRegPhone('')
      setRegTicketType('General Admission')
    }
  }

  // Extract unique categories
  const categories = ['All', ...Array.from(new Set(events.map(e => e.category).filter(Boolean)))]

  // Filter events
  const filteredEvents = events.filter(evt => {
    const matchesSearch = evt.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (evt.venue && evt.venue.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = selectedCategory === 'All' || evt.category === selectedCategory
    return matchesSearch && matchesCategory
  })

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
    <motion.div variants={stagger} initial="initial" animate="animate" className="org-dashboard-container" style={{ padding: '2rem 3rem' }}>
      
      {/* Registration Modal Overlay */}
      {createPortal(
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
        </AnimatePresence>,
        document.body
      )}

      {/* Header */}
      <motion.div variants={fadeUp} style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--org-text-primary)' }}>Browse Events</h1>
        <p style={{ color: 'var(--org-text-secondary)', fontSize: '1.05rem', marginTop: '0.5rem' }}>
          Discover and register for campus fests, workshops, and hackathons.
        </p>
      </motion.div>

      {/* Toolbar */}
      <motion.div variants={fadeUp} style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--org-surface)', border: '1px solid var(--org-border-default)', borderRadius: '0.6rem', padding: '0 1rem', flex: 1, minWidth: '280px' }}>
          <SearchIcon />
          <input 
            type="text" 
            placeholder="Search events by name or venue..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ border: 'none', background: 'transparent', color: 'var(--org-text-primary)', padding: '0.85rem', width: '100%', outline: 'none' }}
          />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--org-surface)', border: '1px solid var(--org-border-default)', borderRadius: '0.6rem', padding: '0 1rem' }}>
          <FilterIcon />
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ border: 'none', background: 'transparent', color: 'var(--org-text-primary)', padding: '0.85rem 0.5rem', outline: 'none', cursor: 'pointer', fontWeight: 600 }}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Event Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2rem' }}>
        <AnimatePresence>
          {filteredEvents.map(evt => {
            const isRegistered = registeredEventIds.has(evt.id)
            return (
              <motion.div
                key={evt.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="org-surface org-surface--hoverable"
                style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
              >
                {/* Event Image Placeholder */}
                <div style={{ height: '140px', background: 'linear-gradient(135deg, var(--org-surface-0), var(--org-surface))', borderBottom: '1px solid var(--org-border-subtle)', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                    <span className={`org-badge org-badge--${evt.status === 'Live' ? 'success' : evt.status === 'Draft' ? 'neutral' : 'info'}`}>
                      {evt.status || 'Upcoming'}
                    </span>
                  </div>
                </div>

                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <span className="org-badge org-badge--neutral">{evt.category || 'General'}</span>
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--org-text-primary)', marginBottom: '0.5rem' }}>{evt.name}</h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--org-text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      {formatDate(evt.start_date, evt.end_date)}
                    </div>
                    {evt.venue && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        {evt.venue}
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                      {evt.max_attendees ? `${evt.max_attendees} Capacity` : 'Open Event'}
                    </div>
                  </div>

                  <div style={{ marginTop: 'auto' }}>
                    {isRegistered ? (
                      <button disabled className="org-btn" style={{ width: '100%', background: 'var(--org-success)', color: '#fff', opacity: 0.9, cursor: 'default' }}>
                        <CheckIcon /> Registered
                      </button>
                    ) : (
                      <button 
                        className="org-btn org-btn--accent" 
                        style={{ width: '100%' }}
                        onClick={() => setSelectedEventForReg(evt)}
                      >
                        Register Now
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {filteredEvents.length === 0 && (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--org-text-secondary)' }}>
          No events found matching your search.
        </div>
      )}

    </motion.div>
  )
}

export default Events
