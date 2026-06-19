import React, { useEffect, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import { useEvent } from '../../contexts/EventContext'
import { registrationService } from '../../services/registrationService'
import type { TicketTier, TicketTierType } from '../../types'
import type { EventRegistration } from '../../services/registrationService'

/* ─── Metric Icons ─── */
const UsersIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
const DollarIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>

const QR_PATTERN = [
  [1,1,1,0,1,1,1],
  [1,0,1,0,1,0,1],
  [1,1,1,0,1,1,1],
  [0,0,0,1,0,0,0],
  [1,1,1,0,1,1,1],
  [1,0,1,1,0,0,1],
  [1,1,1,0,1,1,1],
]

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] } },
}

const stagger = { animate: { transition: { staggerChildren: 0.06 } } }

const STATUS_BADGE: Record<string, string> = {
  'Confirmed': 'success',
  'Registered': 'success',
  'Checked In': 'info',
  'Cancelled': 'danger',
}

const Tickets: React.FC = () => {
  const navigate = useNavigate()
  const { activeEvent, isLoading: isEventLoading } = useEvent()

  const [ticketTiers, setTicketTiers] = useState<TicketTier[]>([])
  const [registrations, setRegistrations] = useState<EventRegistration[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [showModal, setShowModal] = useState(false)
  const [editingTierId, setEditingTierId] = useState<string | null>(null)
  const [selectedTicket, setSelectedTicket] = useState<TicketTier | null>(null)
  
  const [ticketForm, setTicketForm] = useState({
    name: '',
    type: 'paid' as TicketTierType,
    price: 0,
    capacity: 100,
    color_hex: '#3B82F6'
  })

  useEffect(() => {
    if (!isEventLoading && !activeEvent) navigate('/organizer')
  }, [activeEvent, isEventLoading, navigate])

  const loadData = useCallback(async () => {
    if (!activeEvent) return
    setIsLoading(true)
    setError(null)

    const [tiersRes, regsRes] = await Promise.all([
      registrationService.getTicketTiersByEvent(activeEvent.id),
      registrationService.getRegistrationsByEvent(activeEvent.id)
    ])

    if (tiersRes.error || regsRes.error) {
      setError(tiersRes.error || regsRes.error)
    } else {
      const tiers = tiersRes.data || []
      setTicketTiers(tiers)
      setRegistrations(regsRes.data || [])
      
      // Auto select the first ticket for preview if none selected
      if (tiers.length > 0 && !selectedTicket) {
        setSelectedTicket(tiers[0])
      }
    }
    
    setIsLoading(false)
  }, [activeEvent, selectedTicket])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleOpenModal = (tier?: TicketTier) => {
    if (tier) {
      setEditingTierId(tier.id)
      setTicketForm({
        name: tier.name,
        type: tier.type,
        price: tier.price,
        capacity: tier.capacity,
        color_hex: tier.color_hex,
      })
    } else {
      setEditingTierId(null)
      setTicketForm({ name: '', type: 'paid', price: 0, capacity: 100, color_hex: '#3B82F6' })
    }
    setShowModal(true)
  }

  const handleSaveTicket = async () => {
    if (!activeEvent || !ticketForm.name) return
    setIsSaving(true)
    setError(null)

    let err
    if (editingTierId) {
      const { error } = await registrationService.updateTicketTier(editingTierId, ticketForm)
      err = error
    } else {
      const { error } = await registrationService.createTicketTier(activeEvent.id, ticketForm)
      err = error
    }

    setIsSaving(false)
    if (err) {
      setError(err)
      return
    }

    setShowModal(false)
    await loadData()
  }

  const handleDeleteTicket = async (id: string) => {
    if (!confirm('Are you sure you want to delete this ticket tier? Linked registrations will lose their specific tier reference.')) return
    setIsSaving(true)
    const { error: err } = await registrationService.deleteTicketTier(id)
    setIsSaving(false)
    
    if (err) {
      setError(err)
      return
    }
    
    if (selectedTicket?.id === id) setSelectedTicket(null)
    await loadData()
  }

  // Handle color change preset
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value as TicketTierType
    let defaultColor = ticketForm.color_hex
    if (type === 'free') defaultColor = '#10B981'
    if (type === 'vip') defaultColor = '#8B5CF6'
    if (type === 'early_bird') defaultColor = '#F59E0B'
    if (type === 'paid') defaultColor = '#3B82F6'
    setTicketForm(p => ({ ...p, type, color_hex: defaultColor }))
  }

  if (!activeEvent) return null

  // Calculate Metrics
  const totalRevenue = registrations.reduce((sum, r) => {
    const tier = ticketTiers.find(t => t.id === r.ticket_tier_id)
    return sum + (tier ? tier.price : 0)
  }, 0)

  // Map to get sold counts efficiently
  const soldCounts = registrations.reduce((acc, r) => {
    if (r.ticket_tier_id) {
      acc[r.ticket_tier_id] = (acc[r.ticket_tier_id] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  // Calculate dynamic trend line (last 5 days)
  const last5DaysCounts = [0, 0, 0, 0, 0]
  const todayDate = new Date()
  todayDate.setHours(23, 59, 59, 999)
  
  registrations.forEach(r => {
    const rDate = new Date(r.created_at)
    const diffTime = todayDate.getTime() - rDate.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    if (diffDays >= 0 && diffDays < 5) {
      last5DaysCounts[4 - diffDays]++
    }
  })

  const maxCount = Math.max(...last5DaysCounts, 1)
  const trendPoints = last5DaysCounts.map((count, i) => ({
    x: i * 100,
    y: 90 - (count / maxCount) * 80
  }))
  const dLine = `M ${trendPoints[0].x} ${trendPoints[0].y} ` + trendPoints.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
  const dArea = dLine + ` L 400 100 L 0 100 Z`

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="org-tickets-container">
      <PageHeader
        eyebrow="Console"
        title="Registration & Ticketing"
        subtitle="Manage dynamic ticket tiers, set pricing, and monitor real-time attendee bookings."
        actions={
          <button className="org-btn org-btn--accent" onClick={() => handleOpenModal()}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.2rem' }}>
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Create Tier
          </button>
        }
      />

      {error && (
        <div className="org-surface" style={{ padding: '0.85rem 1rem', marginBottom: '1rem', borderColor: 'var(--org-danger)', color: 'var(--org-danger)', fontSize: '0.82rem', fontWeight: 700 }}>
          {error}
        </div>
      )}

      {isLoading && (
        <div className="org-surface org-surface--elevated" style={{ padding: '1rem', marginBottom: '1rem', color: 'var(--org-text-secondary)', fontSize: '0.85rem' }}>
          Loading ticketing data...
        </div>
      )}

      {/* Analytics Dashboard Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', marginBottom: '2rem', alignItems: 'stretch' }}>
        
        {/* SVG Registration Analytics Area Chart */}
        <motion.div className="org-surface org-surface--elevated" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }} variants={fadeUp}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--org-text-tertiary)', fontWeight: 700 }}>Registration Analytics</span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--org-text-primary)', marginTop: '0.1rem' }}>Daily Registrations Trend</h3>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--org-success)', fontWeight: 700 }}>Live Feed Connected</span>
          </div>

          {/* SVG Sparkline Area Chart */}
          <div style={{ width: '100%', height: 110 }}>
            <svg viewBox="0 0 400 100" width="100%" height="100%" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
              <defs>
                <linearGradient id="chart-area-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.25"/>
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.00"/>
                </linearGradient>
              </defs>
              <line x1="0" y1="20" x2="400" y2="20" stroke="var(--org-border-subtle)" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="50" x2="400" y2="50" stroke="var(--org-border-subtle)" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="80" x2="400" y2="80" stroke="var(--org-border-subtle)" strokeWidth="1" strokeDasharray="4 4" />

              <path d={dArea} fill="url(#chart-area-grad)" />
              <path d={dLine} fill="none" stroke="#8B5CF6" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
              {trendPoints.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r={i === 4 ? 4.5 : 3} fill="#8B5CF6" stroke={i === 4 ? "#fff" : "none"} strokeWidth={i === 4 ? 1.5 : 0} />
              ))}
            </svg>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--org-text-tertiary)', marginTop: '0.4rem', fontWeight: 600 }}>
            <span>{new Date(Date.now() - 4*86400000).toLocaleDateString(undefined, {weekday:'short'})}</span>
            <span>{new Date(Date.now() - 2*86400000).toLocaleDateString(undefined, {weekday:'short'})}</span>
            <span>Today</span>
          </div>
        </motion.div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <StatCard icon={<UsersIcon />} label="Total Registrations" value={registrations.length} colorClass="info" index={0} />
          <StatCard icon={<DollarIcon />} label="Gross Revenue" value={totalRevenue} prefix="₹" colorClass="success" index={1} />
        </div>
      </div>

      {/* Ticket Categories - Graphic Ticket Style */}
      <motion.div variants={fadeUp}>
        <div className="org-section__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h2 className="org-section__title">Ticket Tier Categories</h2>
            <p className="org-section__subtitle">Click a ticket to preview its design or edit its properties.</p>
          </div>
          <button className="org-btn org-btn--secondary" onClick={() => handleOpenModal()} style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>
            + Create Tier
          </button>
        </div>
      </motion.div>

      {ticketTiers.length === 0 && !isLoading ? (
        <div className="org-surface org-surface--elevated" style={{ padding: '3rem', textAlign: 'center', marginBottom: '2.5rem', border: '2px dashed var(--org-border-default)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--org-text-primary)' }}>No Ticket Tiers Configured</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--org-text-secondary)', marginTop: '0.5rem', marginBottom: '1.5rem' }}>Create ticket tiers to allow attendees to register for your event.</p>
          <button className="org-btn org-btn--accent" onClick={() => handleOpenModal()}>Create First Ticket</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
          {ticketTiers.map((ticket, i) => {
            const sold = soldCounts[ticket.id] || 0
            const pct = ticket.capacity > 0 ? Math.round((sold / ticket.capacity) * 100) : 0
            const isSelected = selectedTicket?.id === ticket.id
            
            return (
              <motion.div
                key={ticket.id}
                className={`org-ticket-card-tier org-surface ${isSelected ? 'org-surface--glow' : 'org-surface--hoverable'}`}
                style={{
                  padding: '1.25rem',
                  borderLeft: `3.5px solid ${ticket.color_hex}`,
                  cursor: 'pointer',
                  borderColor: isSelected ? ticket.color_hex : 'var(--org-border-default)'
                }}
                onClick={() => setSelectedTicket(ticket)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.07 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span className="org-badge" style={{ background: `${ticket.color_hex}20`, color: ticket.color_hex, fontSize: '0.65rem', fontWeight: 700 }}>
                    {ticket.type.toUpperCase()}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--org-text-secondary)', fontWeight: 600 }}>{sold}/{ticket.capacity} sold</span>
                </div>
                <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--org-text-primary)' }}>{ticket.name}</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '0.4rem', marginBottom: '0.75rem' }}>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--org-text-primary)', lineHeight: 1 }}>
                    {ticket.price === 0 ? 'FREE' : `₹${ticket.price}`}
                  </h3>
                  <button 
                    className="org-btn org-btn--ghost" 
                    onClick={(e) => { e.stopPropagation(); handleOpenModal(ticket); }}
                    style={{ padding: '0.2rem', fontSize: '0.7rem', color: 'var(--org-text-tertiary)' }}
                  >
                    Edit
                  </button>
                </div>
                
                {/* mini progress */}
                <div style={{ height: 4, background: 'var(--org-progress-track)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: ticket.color_hex }} />
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Ticket Preview Mock & Registrations Roster */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Attendee Registrations */}
        <motion.div variants={fadeUp}>
          <div className="org-section__header">
            <div>
              <h2 className="org-section__title">Registrations Roster</h2>
              <p className="org-section__subtitle">Live feed of confirmed attendee bookings.</p>
            </div>
          </div>
          <div className="org-table-wrapper">
            <table className="org-table">
              <thead>
                <tr>
                  <th>Attendee</th>
                  <th>Ticket Tier</th>
                  <th>Registered</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {registrations.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--org-text-tertiary)' }}>
                      No registrations found for this event.
                    </td>
                  </tr>
                ) : (
                  registrations.map((r) => {
                    const tier = ticketTiers.find(t => t.id === r.ticket_tier_id) || r.ticket_tier
                    const tierName = tier?.name || 'Unknown Tier'
                    const tierColor = tier?.color_hex || 'var(--org-accent)'
                    
                    return (
                      <tr key={r.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--org-accent-soft)', color: 'var(--org-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
                              {r.user_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{r.user_name}</div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--org-text-secondary)' }}>{r.user_email || 'No email provided'}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="org-badge" style={{ fontSize: '0.68rem', fontWeight: 700, background: `${tierColor}15`, color: tierColor, borderColor: `${tierColor}30` }}>
                            {tierName}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.78rem', color: 'var(--org-text-secondary)' }}>
                          {new Date(r.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td>
                          <span className={`org-badge org-badge--${STATUS_BADGE[r.status] || 'default'}`} style={{ fontSize: '0.68rem', fontWeight: 700 }}>
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Realistic Ticket Pass Preview */}
        <motion.div variants={fadeUp}>
          <div className="org-section__header">
            <div>
              <h2 className="org-section__title">Ticket Visual Pass</h2>
              <p className="org-section__subtitle">Realistic virtual ticket rendering generated dynamically.</p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {selectedTicket ? (
              <motion.div
                key={selectedTicket.id}
                className="org-ticket-pass"
                style={{ '--ticket-theme': selectedTicket.color_hex } as React.CSSProperties}
                initial={{ opacity: 0, scale: 0.96, rotateY: 15 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                exit={{ opacity: 0, scale: 0.96, rotateY: -15 }}
                transition={{ duration: 0.4 }}
              >
                {/* Visual Ticket Body */}
                <div className="org-ticket-pass__main">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                    <span className="org-ticket-pass__logo">FF PASS</span>
                    <span style={{ fontSize: '0.68rem', color: selectedTicket.color_hex, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {selectedTicket.type} tier
                    </span>
                  </div>
                  
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--org-text-primary)', letterSpacing: '-0.02em' }}>{activeEvent.name}</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--org-text-secondary)', marginTop: '0.2rem' }}>Date: {new Date(activeEvent.start_date).toLocaleDateString()}</p>
                  <p style={{ fontSize: '0.72rem', color: 'var(--org-text-secondary)', marginTop: '0.1rem' }}>Location: {activeEvent.venue || 'TBA'}</p>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem', borderTop: '1px dashed var(--org-border-default)', paddingTop: '1rem' }}>
                    <div>
                      <span style={{ fontSize: '0.6rem', color: 'var(--org-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>Holder</span>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--org-text-primary)' }}>Dynamic Stub</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.6rem', color: 'var(--org-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>Receipt Value</span>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--org-text-primary)' }}>{selectedTicket.price === 0 ? 'FREE' : `₹${selectedTicket.price}`}</span>
                    </div>
                  </div>

                  {/* Perforated separator circles inside card */}
                  <div className="org-ticket-pass__punch-hole-left" />
                  <div className="org-ticket-pass__punch-hole-right" />
                </div>

                {/* Perforated tear line */}
                <div className="org-ticket-pass__tear-line" />

                {/* Tear-Off Ticket Stub */}
                <div className="org-ticket-pass__stub">
                  <div className="org-ticket-pass__qr-frame">
                    <div className="org-qr-grid" style={{ width: 68, height: 68, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', background: 'var(--org-text-primary)', padding: '4px', borderRadius: '4px' }}>
                      {QR_PATTERN.flat().map((cell, i) => (
                        <div key={i} style={{ background: cell ? 'var(--org-surface-0)' : 'transparent' }} />
                      ))}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.62rem', color: 'var(--org-text-secondary)', marginTop: '0.5rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 650 }}>Stub Scan</span>
                  
                  {/* barcode lines */}
                  <div style={{ height: 20, width: '100%', background: 'repeating-linear-gradient(90deg, var(--org-text-primary), var(--org-text-primary) 1.5px, transparent 1.5px, transparent 4px)', marginTop: '0.4rem', opacity: 0.75 }} />
                </div>
              </motion.div>
            ) : (
              <div className="org-surface" style={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--org-text-tertiary)' }}>
                Select a ticket to preview
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Create/Edit Ticket Modal */}
      {createPortal(
        <AnimatePresence>
          {showModal && (
            <motion.div
              className="org-modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
            >
              <motion.div
                className="org-modal"
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.98 }}
                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="org-modal__header">
                  <h2 className="org-modal__title">{editingTierId ? 'Edit Ticket Category' : 'Create Ticket Category'}</h2>
                  <button className="org-modal__close" onClick={() => setShowModal(false)}>×</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <label className="org-label">
                    Pass Name
                    <input className="org-input" placeholder="e.g. VIP All-Access Key" value={ticketForm.name} onChange={(e) => setTicketForm((p) => ({ ...p, name: e.target.value }))} />
                  </label>
                  <div className="org-form-grid">
                    <label className="org-label">
                      Category Tier
                      <select className="org-select" value={ticketForm.type} onChange={handleTypeChange}>
                        <option value="free">Free Pass</option>
                        <option value="paid">Paid General</option>
                        <option value="early_bird">Early Bird Discount</option>
                        <option value="vip">VIP Executive</option>
                      </select>
                    </label>
                    <label className="org-label">
                      Color Hex
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <input type="color" value={ticketForm.color_hex} onChange={(e) => setTicketForm(p => ({ ...p, color_hex: e.target.value }))} style={{ width: 36, height: 36, padding: 0, border: 'none', cursor: 'pointer', borderRadius: 4 }} />
                        <input className="org-input" value={ticketForm.color_hex} onChange={(e) => setTicketForm((p) => ({ ...p, color_hex: e.target.value }))} />
                      </div>
                    </label>
                  </div>
                  <div className="org-form-grid">
                    <label className="org-label">
                      Pricing (₹)
                      <input className="org-input" type="number" value={ticketForm.price} onChange={(e) => setTicketForm((p) => ({ ...p, price: parseInt(e.target.value) || 0 }))} />
                    </label>
                    <label className="org-label">
                      Capacity Allocation
                      <input className="org-input" type="number" min="1" value={ticketForm.capacity} onChange={(e) => setTicketForm((p) => ({ ...p, capacity: parseInt(e.target.value) || 1 }))} />
                    </label>
                  </div>
                </div>

                <div className="org-modal__footer" style={{ justifyContent: editingTierId ? 'space-between' : 'flex-end' }}>
                  {editingTierId && (
                    <button className="org-btn org-btn--ghost" onClick={() => { setShowModal(false); handleDeleteTicket(editingTierId); }} style={{ color: 'var(--org-danger)' }}>
                      Delete
                    </button>
                  )}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="org-btn org-btn--secondary" onClick={() => setShowModal(false)}>Cancel</button>
                    <button className="org-btn org-btn--accent" onClick={handleSaveTicket} disabled={isSaving || !ticketForm.name}>
                      {isSaving ? 'Saving...' : 'Save Ticket'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </motion.div>
  )
}

export default Tickets
