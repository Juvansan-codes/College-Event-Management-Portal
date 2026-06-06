import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'

/* ─── Metric Icons ─── */
const StarIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2 L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2z" /></svg>
const TrendIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>

/* ─── Types ─── */
interface Sponsor {
  id: string
  name: string
  tier: 'Platinum' | 'Gold' | 'Silver'
  amount: number
  contact: string
  pipelineStage: 'Contacted' | 'Proposal' | 'Negotiating' | 'Confirmed'
}

/* ─── Mock Data ─── */
const INITIAL_SPONSORS: Sponsor[] = [
  { id: '1', name: 'CloudTech Solutions', tier: 'Platinum', amount: 50000, contact: 'sponsor@cloudtech.com', pipelineStage: 'Confirmed' },
  { id: '2', name: 'DevStack Inc.', tier: 'Gold', amount: 25000, contact: 'partnership@devstack.io', pipelineStage: 'Confirmed' },
  { id: '3', name: 'ByteForge Labs', tier: 'Gold', amount: 25000, contact: 'events@byteforge.dev', pipelineStage: 'Negotiating' },
  { id: '4', name: 'PixelCraft Studio', tier: 'Silver', amount: 10000, contact: 'hello@pixelcraft.co', pipelineStage: 'Proposal' },
  { id: '5', name: 'DataWave Analytics', tier: 'Silver', amount: 10000, contact: 'bd@datawave.ai', pipelineStage: 'Contacted' },
]

const TIERS = [
  { 
    name: 'Platinum', 
    price: '₹50,000', 
    color: '#8B5CF6', 
    features: ['Main Stage LED Banner Rotation', 'Double Exhibit Booth Slot', 'Inaugural Keynote Panel seat', '12 VIP passes', 'Global Press Release placement'], 
    slots: '2 of 3 Booked',
    pct: 66
  },
  { 
    name: 'Gold', 
    price: '₹25,000', 
    color: '#F59E0B', 
    features: ['Logo placement on official site', 'Single Shared Booth Slot', 'E-Newsletter feature block', '6 VIP Event passes'], 
    slots: '2 of 5 Booked',
    pct: 40
  },
  { 
    name: 'Silver', 
    price: '₹10,000', 
    color: '#94A3B8', 
    features: ['Logo in site footer listings', 'Official Event brochure log', '3 General Entry passes'], 
    slots: '1 of 8 Booked',
    pct: 12
  },
]

const PIPELINE_COLUMNS = [
  { id: 'Contacted', label: 'Lead Contacted', color: '#94A3B8' },
  { id: 'Proposal', label: 'Proposal Sent', color: '#60A5FA' },
  { id: 'Negotiating', label: 'Negotiating', color: '#F59E0B' },
  { id: 'Confirmed', label: 'Confirmed Booking', color: '#10B981' }
]

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] } },
}

const stagger = { animate: { transition: { staggerChildren: 0.06 } } }

const Sponsorships: React.FC = () => {
  const [sponsors, setSponsors] = useState<Sponsor[]>(INITIAL_SPONSORS)
  const [showModal, setShowModal] = useState(false)
  const [newSponsor, setNewSponsor] = useState({ name: '', tier: 'Gold' as Sponsor['tier'], contact: '', amount: 25000 })

  const handleAdd = () => {
    if (!newSponsor.name) return
    setSponsors((prev) => [
      ...prev,
      { ...newSponsor, id: Date.now().toString(), pipelineStage: 'Contacted' },
    ])
    setNewSponsor({ name: '', tier: 'Gold', contact: '', amount: 25000 })
    setShowModal(false)
  }

  const handleAdvanceStage = (id: string) => {
    setSponsors((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s
        let nextStage: Sponsor['pipelineStage'] = s.pipelineStage
        if (s.pipelineStage === 'Contacted') nextStage = 'Proposal'
        else if (s.pipelineStage === 'Proposal') nextStage = 'Negotiating'
        else if (s.pipelineStage === 'Negotiating') nextStage = 'Confirmed'
        return { ...s, pipelineStage: nextStage }
      })
    )
  }

  const handleDemoteStage = (id: string) => {
    setSponsors((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s
        let prevStage: Sponsor['pipelineStage'] = s.pipelineStage
        if (s.pipelineStage === 'Confirmed') prevStage = 'Negotiating'
        else if (s.pipelineStage === 'Negotiating') prevStage = 'Proposal'
        else if (s.pipelineStage === 'Proposal') prevStage = 'Contacted'
        return { ...s, pipelineStage: prevStage }
      })
    )
  }

  // Confirmed calculations
  const confirmedSponsors = sponsors.filter((s) => s.pipelineStage === 'Confirmed')
  const totalRevenue = confirmedSponsors.reduce((sum, s) => sum + s.amount, 0)
  const targetRevenue = 150000 // Target budget of ₹1.5L
  const targetPct = Math.round((totalRevenue / targetRevenue) * 100)

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="org-sponsorship-container">
      <PageHeader
        eyebrow="Console"
        title="Sponsorship Manager"
        subtitle="Business-class partnership tracking, tier metrics, and revenue booking workspace."
        actions={
          <button className="org-btn org-btn--accent" onClick={() => setShowModal(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.2rem' }}>
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Sponsor
          </button>
        }
      />

      {/* Target Revenue Progress Header & Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', marginBottom: '2rem', alignItems: 'stretch' }}>
        
        {/* Interactive Budget Target Meter */}
        <motion.div className="org-surface org-surface--elevated" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }} variants={fadeUp}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div>
              <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--org-text-tertiary)', fontWeight: 700 }}>Revenue Target Booking</span>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--org-text-primary)', marginTop: '0.1rem' }}>
                ₹{totalRevenue.toLocaleString()} <span style={{ color: 'var(--org-text-tertiary)', fontSize: '0.9rem', fontWeight: 500 }}>of ₹{targetRevenue.toLocaleString()}</span>
              </h3>
            </div>
            <span className="org-badge org-badge--success" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', fontWeight: 700 }}>
              {targetPct}% Goal
            </span>
          </div>

          {/* SVG Progress Target Chart */}
          <div style={{ position: 'relative', width: '100%', height: '14px', background: 'var(--org-progress-track)', borderRadius: '999px', overflow: 'hidden', marginBottom: '0.5rem' }}>
            <motion.div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                background: 'linear-gradient(90deg, #10B981, #34D399)',
                borderRadius: '999px'
              }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(targetPct, 100)}%` }}
              transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--org-text-secondary)', fontWeight: 500 }}>
            <span>₹0 (Starting)</span>
            <span>Target: ₹1,50,000</span>
          </div>
        </motion.div>

        {/* mini stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <StatCard icon={<StarIcon />} label="Total Sponsors" value={sponsors.length} colorClass="accent" index={0} />
          <StatCard icon={<TrendIcon />} label="Conversion Rate" value={Math.round((confirmedSponsors.length / sponsors.length) * 100)} suffix="%" colorClass="info" index={1} />
        </div>
      </div>

      {/* Sponsor Tiers Showcase */}
      <motion.div variants={fadeUp}>
        <div className="org-section__header">
          <div>
            <h2 className="org-section__title">Sponsorship Packages</h2>
            <p className="org-section__subtitle">Core tier pricing, features, and slot fulfillment progress.</p>
          </div>
        </div>
      </motion.div>

      <div className="org-tiers-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '2.5rem' }}>
        {TIERS.map((tier, i) => (
          <motion.div
            key={tier.name}
            className="org-tier-card org-surface org-surface--hoverable"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 + i * 0.08 }}
            style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', borderTop: `4px solid ${tier.color}` }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ color: tier.color, fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{tier.name}</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--org-text-tertiary)', fontWeight: 500 }}>{tier.slots}</span>
            </div>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--org-text-primary)', marginBottom: '1rem' }}>
              {tier.price}
            </h3>
            
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem 0', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {tier.features.map((feat, idx) => (
                <li key={idx} style={{ fontSize: '0.78rem', color: 'var(--org-text-secondary)', display: 'flex', gap: '0.4rem', alignItems: 'flex-start' }}>
                  <span style={{ color: tier.color, fontWeight: 800 }}>✓</span>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>

            {/* micro progress inside tier */}
            <div style={{ height: 4, background: 'var(--org-progress-track)', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${tier.pct}%`, background: tier.color }} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Partnership Pipeline Visualizer */}
      <motion.div variants={fadeUp}>
        <div className="org-section__header">
          <div>
            <h2 className="org-section__title">Deal Negotiation Pipeline</h2>
            <p className="org-section__subtitle">Command panel board depicting deals from lead contacted to booking confirmation.</p>
          </div>
        </div>
      </motion.div>

      <div className="org-pipeline-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {PIPELINE_COLUMNS.map((col) => {
          const colSponsors = sponsors.filter((s) => s.pipelineStage === col.id)
          return (
            <div key={col.id} className="org-pipeline-column org-surface" style={{ background: 'var(--org-surface-2)', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', minHeight: 300 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--org-border-subtle)', paddingBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: col.color }} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--org-text-primary)' }}>{col.label}</span>
                </div>
                <span className="org-badge" style={{ background: 'var(--org-sidebar-item-hover)', fontSize: '0.7rem' }}>
                  {colSponsors.length}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', flex: 1, overflowY: 'auto' }}>
                <AnimatePresence>
                  {colSponsors.map((s) => (
                    <motion.div
                      key={s.id}
                      className="org-surface org-surface--elevated"
                      style={{ padding: '0.75rem', borderLeft: `3px solid ${col.color}`, cursor: 'default' }}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.25 }}
                    >
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--org-text-primary)' }}>{s.name}</h4>
                      <p style={{ fontSize: '0.72rem', color: 'var(--org-text-secondary)', marginTop: '0.2rem' }}>
                        Tier: <span style={{ fontWeight: 600 }}>{s.tier}</span> — ₹{s.amount.toLocaleString()}
                      </p>
                      
                      {/* Action buttons inside pipeline card */}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.3rem', marginTop: '0.5rem', borderTop: '1px solid var(--org-border-subtle)', paddingTop: '0.4rem' }}>
                        {col.id !== 'Contacted' && (
                          <button
                            className="org-btn org-btn--ghost"
                            onClick={() => handleDemoteStage(s.id)}
                            style={{ padding: '0.2rem', fontSize: '0.65rem' }}
                            title="Move back"
                          >
                            ← Back
                          </button>
                        )}
                        {col.id !== 'Confirmed' && (
                          <button
                            className="org-btn org-btn--ghost"
                            onClick={() => handleAdvanceStage(s.id)}
                            style={{ padding: '0.2rem', fontSize: '0.65rem', color: 'var(--org-accent-text)', fontWeight: 700 }}
                            title="Move forward"
                          >
                            Advance →
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {colSponsors.length === 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, border: '2px dashed var(--org-border-default)', borderRadius: '0.5rem', color: 'var(--org-text-tertiary)', fontSize: '0.75rem', minHeight: 80 }}>
                    Empty Column
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Add Sponsor Modal */}
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
                  <h2 className="org-modal__title">Add New Partner Lead</h2>
                  <button className="org-modal__close" onClick={() => setShowModal(false)}>×</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <label className="org-label">
                    Company / Brand Name
                    <input className="org-input" placeholder="e.g. Google Cloud" value={newSponsor.name} onChange={(e) => setNewSponsor((p) => ({ ...p, name: e.target.value }))} />
                  </label>
                  <div className="org-form-grid">
                    <label className="org-label">
                      Target Tier
                      <select className="org-select" value={newSponsor.tier} onChange={(e) => {
                        const selectedTier = e.target.value as Sponsor['tier']
                        const amt = selectedTier === 'Platinum' ? 50000 : selectedTier === 'Gold' ? 25000 : 10000
                        setNewSponsor((p) => ({ ...p, tier: selectedTier, amount: amt }))
                      }}>
                        <option value="Platinum">Platinum</option>
                        <option value="Gold">Gold</option>
                        <option value="Silver">Silver</option>
                      </select>
                    </label>
                    <label className="org-label">
                      Amount (₹)
                      <input className="org-input" type="number" value={newSponsor.amount} onChange={(e) => setNewSponsor((p) => ({ ...p, amount: parseInt(e.target.value) || 0 }))} />
                    </label>
                  </div>
                  <label className="org-label">
                    Partner Contact Email
                    <input className="org-input" type="email" placeholder="partnership@company.com" value={newSponsor.contact} onChange={(e) => setNewSponsor((p) => ({ ...p, contact: e.target.value }))} />
                  </label>
                </div>

                <div className="org-modal__footer">
                  <button className="org-btn org-btn--secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button className="org-btn org-btn--accent" onClick={handleAdd}>Add Partner</button>
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

export default Sponsorships
