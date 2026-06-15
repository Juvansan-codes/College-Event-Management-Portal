import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { registrationService } from '../../services'

/* ─── Metric Icons & SVGs ─── */
const TicketIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
    <path d="M13 5v2" /><path d="M13 17v2" /><path d="M13 11v2" />
  </svg>
)

const QR_PATTERN = [
  [1,1,1,0,1,1,1],
  [1,0,1,0,1,0,1],
  [1,1,1,0,1,1,1],
  [0,0,0,1,0,0,0],
  [1,1,1,0,1,1,1],
  [1,0,1,1,0,0,1],
  [1,1,1,0,1,1,1],
]

const stagger = { animate: { transition: { staggerChildren: 0.1 } } }
const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] } },
}

const TICKET_COLORS: Record<string, string> = {
  'Free Student Pass': '#10B981',
  'General Admission': '#3B82F6',
  'Early Bird discount': '#F59E0B',
  'VIP All-Access': '#8B5CF6'
}

const MyTickets: React.FC = () => {
  const { user } = useAuth()
  const [registrations, setRegistrations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchMyTickets = async () => {
      if (user) {
        const { data } = await registrationService.getMyFullRegistrations(user.id)
        if (data) setRegistrations(data)
      }
      setIsLoading(false)
    }
    fetchMyTickets()
  }, [user])

  const formatDate = (start?: string, end?: string) => {
    if (!start) return 'TBA'
    const s = new Date(start).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    if (end && end !== start) {
      const e = new Date(end).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
      return `${s} - ${e}`
    }
    return s
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', color: 'var(--org-text-secondary)' }}>
        Loading your tickets...
      </div>
    )
  }

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="org-dashboard-container" style={{ padding: '2rem 3rem' }}>
      <motion.div variants={fadeUp} style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--org-text-primary)' }}>My Tickets</h1>
        <p style={{ color: 'var(--org-text-secondary)', fontSize: '1.05rem', marginTop: '0.5rem' }}>
          Your digital entry passes for upcoming events.
        </p>
      </motion.div>

      {registrations.length === 0 ? (
        <motion.div variants={fadeUp} className="org-surface" style={{ padding: '3rem', textAlign: 'center' }}>
          <TicketIcon />
          <h3 style={{ marginTop: '1rem', fontSize: '1.2rem', color: 'var(--org-text-primary)' }}>No Tickets Yet</h3>
          <p style={{ color: 'var(--org-text-secondary)' }}>You haven't registered for any events yet.</p>
        </motion.div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
          {registrations.map((reg) => {
            const ticketColor = TICKET_COLORS[reg.ticket_type] || '#3B82F6'
            return (
              <motion.div
                key={reg.id}
                variants={fadeUp}
                className="org-ticket-pass"
                style={{ '--ticket-theme': ticketColor, margin: '0 auto', width: '100%' } as React.CSSProperties}
              >
                {/* Visual Ticket Body */}
                <div className="org-ticket-pass__main">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                    <span className="org-ticket-pass__logo">FF PASS</span>
                    <span style={{ fontSize: '0.68rem', color: ticketColor, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {reg.ticket_type}
                    </span>
                  </div>
                  
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--org-text-primary)', letterSpacing: '-0.02em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {reg.events?.name || 'Unknown Event'}
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--org-text-secondary)', marginTop: '0.2rem' }}>Date: {formatDate(reg.events?.start_date, reg.events?.end_date)}</p>
                  <p style={{ fontSize: '0.72rem', color: 'var(--org-text-secondary)', marginTop: '0.1rem' }}>Location: {reg.events?.venue || 'TBA'}</p>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem', borderTop: '1px dashed var(--org-border-default)', paddingTop: '1rem' }}>
                    <div>
                      <span style={{ fontSize: '0.6rem', color: 'var(--org-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>Holder</span>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--org-text-primary)' }}>{user?.user_metadata?.full_name || 'Student'}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.6rem', color: 'var(--org-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>Status</span>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--org-text-primary)' }}>{reg.status}</span>
                    </div>
                  </div>

                  <div className="org-ticket-pass__punch-hole-left" />
                  <div className="org-ticket-pass__punch-hole-right" />
                </div>

                <div className="org-ticket-pass__tear-line" />

                <div className="org-ticket-pass__stub">
                  <div className="org-ticket-pass__qr-frame">
                    <div className="org-qr-grid" style={{ width: 68, height: 68, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', background: 'var(--org-text-primary)', padding: '4px', borderRadius: '4px' }}>
                      {QR_PATTERN.flat().map((cell, idx) => (
                        <div key={idx} style={{ background: cell ? 'var(--org-surface-0)' : 'transparent' }} />
                      ))}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.62rem', color: 'var(--org-text-secondary)', marginTop: '0.5rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 650 }}>Admit One</span>
                  
                  <div style={{ height: 20, width: '100%', background: 'repeating-linear-gradient(90deg, var(--org-text-primary), var(--org-text-primary) 1.5px, transparent 1.5px, transparent 4px)', marginTop: '0.4rem', opacity: 0.75 }} />
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}

export default MyTickets
