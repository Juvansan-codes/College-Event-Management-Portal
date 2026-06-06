import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'

/* ─── Metric Icons ─── */
const UsersIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
const DollarIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>

/* ─── Types ─── */
interface TicketType {
  id: string
  name: string
  type: 'free' | 'paid' | 'early_bird' | 'vip'
  price: number
  sold: number
  total: number
  color: string
}

interface Registration {
  id: string
  name: string
  email: string
  ticketType: string
  status: 'Confirmed' | 'Checked In' | 'Cancelled'
  date: string
}

/* ─── Mock Data ─── */
const INITIAL_TICKET_TYPES: TicketType[] = [
  { id: '1', name: 'Free Student Pass', type: 'free', price: 0, sold: 320, total: 500, color: '#10B981' },
  { id: '2', name: 'General Admission', type: 'paid', price: 299, sold: 185, total: 300, color: '#3B82F6' },
  { id: '3', name: 'Early Bird discount', type: 'early_bird', price: 199, sold: 150, total: 150, color: '#F59E0B' },
  { id: '4', name: 'VIP All-Access', type: 'vip', price: 999, sold: 42, total: 100, color: '#8B5CF6' },
]

const REGISTRATIONS: Registration[] = [
  { id: '1', name: 'Priya Kumar', email: 'priya@college.edu', ticketType: 'VIP All-Access', status: 'Confirmed', date: 'Jun 5, 2026' },
  { id: '2', name: 'Arjun Mehta', email: 'arjun@college.edu', ticketType: 'General Admission', status: 'Checked In', date: 'Jun 5, 2026' },
  { id: '3', name: 'Sneha Reddy', email: 'sneha@college.edu', ticketType: 'Early Bird discount', status: 'Confirmed', date: 'Jun 4, 2026' },
  { id: '4', name: 'Rahul Sharma', email: 'rahul@college.edu', ticketType: 'Free Student Pass', status: 'Confirmed', date: 'Jun 4, 2026' },
  { id: '5', name: 'Meera Patel', email: 'meera@college.edu', ticketType: 'General Admission', status: 'Cancelled', date: 'Jun 3, 2026' },
  { id: '6', name: 'Vikram Das', email: 'vikram@college.edu', ticketType: 'VIP All-Access', status: 'Checked In', date: 'Jun 3, 2026' },
]

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
  'Checked In': 'info',
  'Cancelled': 'danger',
}

const Tickets: React.FC = () => {
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>(INITIAL_TICKET_TYPES)
  const [showModal, setShowModal] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(INITIAL_TICKET_TYPES[3]) // default VIP for preview
  const [newTicket, setNewTicket] = useState({ name: '', type: 'paid', price: 0, total: 100 })

  const handleCreateTicket = () => {
    if (!newTicket.name) return
    const ticketColor = newTicket.type === 'free' ? '#10B981' : newTicket.type === 'vip' ? '#8B5CF6' : newTicket.type === 'early_bird' ? '#F59E0B' : '#3B82F6'
    const created: TicketType = {
      id: Date.now().toString(),
      name: newTicket.name,
      type: newTicket.type as TicketType['type'],
      price: newTicket.price,
      sold: 0,
      total: newTicket.total,
      color: ticketColor
    }
    setTicketTypes((prev) => [...prev, created])
    setNewTicket({ name: '', type: 'paid', price: 0, total: 100 })
    setShowModal(false)
  }

  const totalRevenue = ticketTypes.reduce((s, t) => s + t.sold * t.price, 0)
  const checkedIn = REGISTRATIONS.filter((r) => r.status === 'Checked In').length

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="org-tickets-container">
      <PageHeader
        eyebrow="Console"
        title="Registration & Ticketing"
        subtitle="Manage multi-tier event passes, inspect attendee receipts, and audit QR codes."
        actions={
          <button className="org-btn org-btn--accent" onClick={() => setShowModal(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.2rem' }}>
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Create Pass
          </button>
        }
      />

      {/* Analytics Dashboard Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', marginBottom: '2rem', alignItems: 'stretch' }}>
        
        {/* SVG Registration Analytics Area Chart */}
        <motion.div className="org-surface org-surface--elevated" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }} variants={fadeUp}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--org-text-tertiary)', fontWeight: 700 }}>Registration Analytics</span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--org-text-primary)', marginTop: '0.1rem' }}>Daily Registrations Trend</h3>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--org-success)', fontWeight: 700 }}>↑ +24% vs yesterday</span>
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
              {/* Background Grid Lines */}
              <line x1="0" y1="20" x2="400" y2="20" stroke="var(--org-border-subtle)" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="50" x2="400" y2="50" stroke="var(--org-border-subtle)" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="80" x2="400" y2="80" stroke="var(--org-border-subtle)" strokeWidth="1" strokeDasharray="4 4" />

              {/* Area path */}
              <path d="M 0 90 Q 50 60 100 70 T 200 40 T 300 30 T 400 10 L 400 100 L 0 100 Z" fill="url(#chart-area-grad)" />
              {/* Line path */}
              <path d="M 0 90 Q 50 60 100 70 T 200 40 T 300 30 T 400 10" fill="none" stroke="#8B5CF6" strokeWidth="3.5" strokeLinecap="round" />

              {/* Dot Indicators */}
              <circle cx="400" cy="10" r="4.5" fill="#8B5CF6" stroke="#fff" strokeWidth="1.5" />
              <circle cx="200" cy="40" r="3" fill="#8B5CF6" />
            </svg>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--org-text-tertiary)', marginTop: '0.4rem', fontWeight: 600 }}>
            <span>Monday</span>
            <span>Wednesday</span>
            <span>Friday</span>
            <span>Today</span>
          </div>
        </motion.div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <StatCard icon={<UsersIcon />} label="Checked In" value={checkedIn} colorClass="info" index={0} />
          <StatCard icon={<DollarIcon />} label="Gross Revenue" value={totalRevenue} prefix="₹" colorClass="success" index={1} />
        </div>
      </div>

      {/* Ticket Categories - Graphic Ticket Style */}
      <motion.div variants={fadeUp}>
        <div className="org-section__header">
          <div>
            <h2 className="org-section__title">Ticket Tier Categories</h2>
            <p className="org-section__subtitle">Click a ticket to preview its corresponding design and print layout.</p>
          </div>
        </div>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2.5rem' }}>
        {ticketTypes.map((ticket, i) => {
          const pct = Math.round((ticket.sold / ticket.total) * 100)
          const isSelected = selectedTicket?.id === ticket.id
          
          return (
            <motion.div
              key={ticket.id}
              className={`org-ticket-card-tier org-surface ${isSelected ? 'org-surface--glow' : 'org-surface--hoverable'}`}
              style={{
                padding: '1.25rem',
                borderLeft: `3.5px solid ${ticket.color}`,
                cursor: 'pointer',
                borderColor: isSelected ? ticket.color : 'var(--org-border-default)'
              }}
              onClick={() => setSelectedTicket(ticket)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.07 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span className="org-badge" style={{ background: `${ticket.color}20`, color: ticket.color, fontSize: '0.65rem', fontWeight: 700 }}>
                  {ticket.type.toUpperCase()}
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--org-text-secondary)', fontWeight: 600 }}>{ticket.sold}/{ticket.total} sold</span>
              </div>
              <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--org-text-primary)' }}>{ticket.name}</h4>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--org-text-primary)', marginTop: '0.4rem', marginBottom: '0.75rem' }}>
                {ticket.price === 0 ? 'FREE' : `₹${ticket.price}`}
              </h3>
              
              {/* mini progress */}
              <div style={{ height: 4, background: 'var(--org-progress-track)', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: ticket.color }} />
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Ticket Preview Mock & Registrations Roster */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Attendee Registrations */}
        <motion.div variants={fadeUp}>
          <div className="org-section__header">
            <div>
              <h2 className="org-section__title">Registrations Roster</h2>
              <p className="org-section__subtitle">Live feed of confirmed attendee bookings and checked-in passes.</p>
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
                {REGISTRATIONS.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--org-accent-soft)', color: 'var(--org-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
                          {r.name.split(' ').map(n=>n[0]).join('')}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{r.name}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--org-text-secondary)' }}>{r.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="org-badge org-badge--accent" style={{ fontSize: '0.68rem', fontWeight: 700 }}>{r.ticketType}</span>
                    </td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--org-text-secondary)' }}>{r.date}</td>
                    <td>
                      <span className={`org-badge org-badge--${STATUS_BADGE[r.status]}`} style={{ fontSize: '0.68rem', fontWeight: 700 }}>{r.status}</span>
                    </td>
                  </tr>
                ))}
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
            {selectedTicket && (
              <motion.div
                key={selectedTicket.id}
                className="org-ticket-pass"
                style={{ '--ticket-theme': selectedTicket.color } as React.CSSProperties}
                initial={{ opacity: 0, scale: 0.96, rotateY: 15 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                exit={{ opacity: 0, scale: 0.96, rotateY: -15 }}
                transition={{ duration: 0.4 }}
              >
                {/* Visual Ticket Body */}
                <div className="org-ticket-pass__main">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                    <span className="org-ticket-pass__logo">FF PASS</span>
                    <span style={{ fontSize: '0.68rem', color: selectedTicket.color, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {selectedTicket.type} tier
                    </span>
                  </div>
                  
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--org-text-primary)', letterSpacing: '-0.02em' }}>FestForge Summit 2026</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--org-text-secondary)', marginTop: '0.2rem' }}>Date: Jun 15 - 17, 2026</p>
                  <p style={{ fontSize: '0.72rem', color: 'var(--org-text-secondary)', marginTop: '0.1rem' }}>Location: Main Tech Auditorium</p>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem', borderTop: '1px dashed var(--org-border-default)', paddingTop: '1rem' }}>
                    <div>
                      <span style={{ fontSize: '0.6rem', color: 'var(--org-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>Holder</span>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--org-text-primary)' }}>Priya Kumar</span>
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
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Create Ticket Modal */}
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
                  <h2 className="org-modal__title">Create Event Ticket Category</h2>
                  <button className="org-modal__close" onClick={() => setShowModal(false)}>×</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <label className="org-label">
                    Pass Name
                    <input className="org-input" placeholder="e.g. VIP All-Access Key" value={newTicket.name} onChange={(e) => setNewTicket((p) => ({ ...p, name: e.target.value }))} />
                  </label>
                  <div className="org-form-grid">
                    <label className="org-label">
                      Category Tier
                      <select className="org-select" value={newTicket.type} onChange={(e) => setNewTicket((p) => ({ ...p, type: e.target.value }))}>
                        <option value="free">Free Pass</option>
                        <option value="paid">Paid General</option>
                        <option value="early_bird">Early Bird Discount</option>
                        <option value="vip">VIP Executive</option>
                      </select>
                    </label>
                    <label className="org-label">
                      Pricing (₹)
                      <input className="org-input" type="number" value={newTicket.price} onChange={(e) => setNewTicket((p) => ({ ...p, price: parseInt(e.target.value) || 0 }))} />
                    </label>
                  </div>
                  <label className="org-label">
                    Fulfillment Allocation Size
                    <input className="org-input" type="number" value={newTicket.total} onChange={(e) => setNewTicket((p) => ({ ...p, total: parseInt(e.target.value) || 0 }))} />
                  </label>
                </div>

                <div className="org-modal__footer">
                  <button className="org-btn org-btn--secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button className="org-btn org-btn--accent" onClick={handleCreateTicket}>Create Ticket</button>
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
