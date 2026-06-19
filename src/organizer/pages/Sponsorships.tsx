import React, { useEffect, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import { useEvent } from '../../contexts/EventContext'
import { sponsorshipService } from '../../services'
import type { EventSponsor, SponsorPipelineStage, SponsorPackage } from '../../types'

const StarIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2 L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2z" /></svg>
const TrendIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>

interface Sponsor {
  id: string
  name: string
  package_id: string | null
  amount: number
  contact: string
  pipelineStage: SponsorPipelineStage
}

const PIPELINE_COLUMNS: Array<{ id: SponsorPipelineStage; label: string; color: string }> = [
  { id: 'Contacted', label: 'Lead Contacted', color: '#94A3B8' },
  { id: 'Proposal', label: 'Proposal Sent', color: '#60A5FA' },
  { id: 'Negotiating', label: 'Negotiating', color: '#F59E0B' },
  { id: 'Confirmed', label: 'Confirmed Booking', color: '#10B981' },
]

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] } },
}

const stagger = { animate: { transition: { staggerChildren: 0.06 } } }

const toSponsor = (row: EventSponsor): Sponsor => ({
  id: row.id,
  name: row.name,
  package_id: row.package_id,
  amount: row.amount,
  contact: row.contact_email,
  pipelineStage: row.pipeline_stage,
})

const Sponsorships: React.FC = () => {
  const navigate = useNavigate()
  const { activeEvent, isLoading: isEventLoading } = useEvent()
  
  const [packages, setPackages] = useState<SponsorPackage[]>([])
  const [sponsors, setSponsors] = useState<Sponsor[]>([])
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Modals state
  const [showSponsorModal, setShowSponsorModal] = useState(false)
  const [newSponsor, setNewSponsor] = useState({ name: '', package_id: '', contact: '', amount: 0 })

  const [showPackageModal, setShowPackageModal] = useState(false)
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null)
  const [packageForm, setPackageForm] = useState({ name: '', price: 0, slots: 1, color_hex: '#6C5CE7', features: '' })

  useEffect(() => {
    if (!isEventLoading && !activeEvent) navigate('/organizer')
  }, [activeEvent, isEventLoading, navigate])

  const loadData = useCallback(async () => {
    if (!activeEvent) return
    setIsLoading(true)
    setError(null)

    const [pkgRes, sponsorRes] = await Promise.all([
      sponsorshipService.getPackagesByEvent(activeEvent.id),
      sponsorshipService.getSponsorsByEvent(activeEvent.id)
    ])

    if (pkgRes.error || sponsorRes.error) {
      setError(pkgRes.error || sponsorRes.error)
    } else {
      setPackages(pkgRes.data || [])
      setSponsors((sponsorRes.data || []).map(toSponsor))
    }
    
    setIsLoading(false)
  }, [activeEvent])

  useEffect(() => {
    loadData()
  }, [loadData])

  /* ─── Package Operations ─── */
  const handleOpenPackageModal = (pkg?: SponsorPackage) => {
    if (pkg) {
      setEditingPackageId(pkg.id)
      setPackageForm({
        name: pkg.name,
        price: pkg.price,
        slots: pkg.slots,
        color_hex: pkg.color_hex,
        features: pkg.features.join(', ')
      })
    } else {
      setEditingPackageId(null)
      setPackageForm({ name: '', price: 10000, slots: 5, color_hex: '#3B82F6', features: 'Logo placement, Social media shoutout' })
    }
    setShowPackageModal(true)
  }

  const handleSavePackage = async () => {
    if (!activeEvent || !packageForm.name) return
    setIsSaving(true)
    setError(null)

    const featuresArray = packageForm.features.split(',').map(f => f.trim()).filter(Boolean)
    
    const payload = {
      name: packageForm.name,
      price: packageForm.price,
      slots: packageForm.slots,
      color_hex: packageForm.color_hex,
      features: featuresArray
    }

    let err
    if (editingPackageId) {
      const res = await sponsorshipService.updatePackage(editingPackageId, payload)
      err = res.error
    } else {
      const res = await sponsorshipService.createPackage(activeEvent.id, payload)
      err = res.error
    }

    setIsSaving(false)
    if (err) {
      setError(err)
      return
    }

    setShowPackageModal(false)
    await loadData()
  }

  const handleDeletePackage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this package? Associated sponsors will remain but lose their package link.')) return
    setIsSaving(true)
    const { error: err } = await sponsorshipService.deletePackage(id)
    setIsSaving(false)
    if (err) {
      setError(err)
      return
    }
    await loadData()
  }

  /* ─── Sponsor Operations ─── */
  const handleOpenSponsorModal = () => {
    if (packages.length === 0) {
      setError('Please create at least one sponsorship package first.')
      return
    }
    setNewSponsor({ name: '', package_id: packages[0].id, contact: '', amount: packages[0].price })
    setShowSponsorModal(true)
  }

  const handleAddSponsor = async () => {
    if (!activeEvent || !newSponsor.name || !newSponsor.contact || !newSponsor.package_id) return
    setIsSaving(true)
    setError(null)

    const { data, error: saveError } = await sponsorshipService.createSponsor(activeEvent.id, {
      name: newSponsor.name,
      package_id: newSponsor.package_id,
      amount: newSponsor.amount,
      contact_email: newSponsor.contact,
    })

    setIsSaving(false)
    if (saveError || !data) {
      setError(saveError ?? 'Unable to add sponsor.')
      return
    }

    setSponsors((prev) => [...prev, toSponsor(data)])
    setShowSponsorModal(false)
  }

  const updateStage = async (id: string, pipelineStage: SponsorPipelineStage) => {
    const previous = sponsors
    setSponsors((prev) => prev.map((s) => (s.id === id ? { ...s, pipelineStage } : s)))
    setError(null)

    const { data, error: updateError } = await sponsorshipService.updateSponsorStage(id, pipelineStage)
    if (updateError || !data) {
      setSponsors(previous)
      setError(updateError ?? 'Unable to update sponsor stage.')
      return
    }

    setSponsors((prev) => prev.map((s) => (s.id === id ? toSponsor(data) : s)))
  }

  const handleAdvanceStage = (id: string) => {
    const sponsor = sponsors.find((s) => s.id === id)
    if (!sponsor) return

    let nextStage = sponsor.pipelineStage
    if (sponsor.pipelineStage === 'Contacted') nextStage = 'Proposal'
    else if (sponsor.pipelineStage === 'Proposal') nextStage = 'Negotiating'
    else if (sponsor.pipelineStage === 'Negotiating') nextStage = 'Confirmed'

    updateStage(id, nextStage)
  }

  const handleDemoteStage = (id: string) => {
    const sponsor = sponsors.find((s) => s.id === id)
    if (!sponsor) return

    let prevStage = sponsor.pipelineStage
    if (sponsor.pipelineStage === 'Confirmed') prevStage = 'Negotiating'
    else if (sponsor.pipelineStage === 'Negotiating') prevStage = 'Proposal'
    else if (sponsor.pipelineStage === 'Proposal') prevStage = 'Contacted'

    updateStage(id, prevStage)
  }

  if (!activeEvent) return null

  // Calculate Metrics dynamically
  const confirmedSponsors = sponsors.filter((s) => s.pipelineStage === 'Confirmed')
  const totalRevenue = confirmedSponsors.reduce((sum, s) => sum + s.amount, 0)
  
  // Target revenue is dynamically derived from packages: sum(price * slots)
  const targetRevenue = packages.reduce((sum, p) => sum + (p.price * p.slots), 0)
  const targetPct = targetRevenue > 0 ? Math.round((totalRevenue / targetRevenue) * 100) : 0
  const conversionRate = sponsors.length ? Math.round((confirmedSponsors.length / sponsors.length) * 100) : 0

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="org-sponsorship-container">
      <PageHeader
        eyebrow="Console"
        title="Sponsorship Manager"
        subtitle={`Track sponsor revenue and pipeline status for ${activeEvent.name}.`}
        actions={
          <button className="org-btn org-btn--accent" onClick={handleOpenSponsorModal}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.2rem' }}>
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Lead
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
          Loading sponsor records...
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', marginBottom: '2rem', alignItems: 'stretch' }}>
        <motion.div className="org-surface org-surface--elevated" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }} variants={fadeUp}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div>
              <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--org-text-tertiary)', fontWeight: 700 }}>Revenue Target Booking</span>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--org-text-primary)', marginTop: '0.1rem' }}>
                Rs {totalRevenue.toLocaleString()} <span style={{ color: 'var(--org-text-tertiary)', fontSize: '0.9rem', fontWeight: 500 }}>of Rs {targetRevenue.toLocaleString()}</span>
              </h3>
            </div>
            <span className="org-badge org-badge--success" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', fontWeight: 700 }}>
              {targetPct}% Goal
            </span>
          </div>
          <div style={{ position: 'relative', width: '100%', height: '14px', background: 'var(--org-progress-track)', borderRadius: '999px', overflow: 'hidden', marginBottom: '0.5rem' }}>
            <motion.div
              style={{ position: 'absolute', top: 0, left: 0, bottom: 0, background: 'linear-gradient(90deg, #10B981, #34D399)', borderRadius: '999px' }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(targetPct, 100)}%` }}
              transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--org-text-secondary)', fontWeight: 500 }}>
            <span>Rs 0</span>
            <span>Target: Rs {targetRevenue.toLocaleString()}</span>
          </div>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <StatCard icon={<StarIcon />} label="Total Sponsors" value={sponsors.length} colorClass="accent" index={0} />
          <StatCard icon={<TrendIcon />} label="Conversion Rate" value={conversionRate} suffix="%" colorClass="info" index={1} />
        </div>
      </div>

      <motion.div variants={fadeUp}>
        <div className="org-section__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 className="org-section__title">Sponsorship Packages</h2>
            <p className="org-section__subtitle">Create and configure dynamic tier pricing and benefits.</p>
          </div>
          <button className="org-btn org-btn--secondary" onClick={() => handleOpenPackageModal()}>
            + Add Package
          </button>
        </div>
      </motion.div>

      {packages.length === 0 && !isLoading ? (
        <div className="org-surface org-surface--elevated" style={{ padding: '3rem', textAlign: 'center', marginBottom: '2.5rem', border: '2px dashed var(--org-border-default)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--org-text-primary)' }}>No Packages Configured</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--org-text-secondary)', marginTop: '0.5rem', marginBottom: '1.5rem' }}>Create your first sponsorship package to set revenue goals and start tracking leads.</p>
          <button className="org-btn org-btn--accent" onClick={() => handleOpenPackageModal()}>Create Package</button>
        </div>
      ) : (
        <div className="org-tiers-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
          {packages.map((pkg, i) => {
            const booked = confirmedSponsors.filter((s) => s.package_id === pkg.id).length
            const pct = pkg.slots > 0 ? Math.round((booked / pkg.slots) * 100) : 0

            return (
              <motion.div
                key={pkg.id}
                className="org-tier-card org-surface org-surface--hoverable"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 + i * 0.08 }}
                style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', borderTop: `4px solid ${pkg.color_hex}` }}
                onClick={() => handleOpenPackageModal(pkg)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ color: pkg.color_hex, fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{pkg.name}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--org-text-tertiary)', fontWeight: 500 }}>{booked} of {pkg.slots} Booked</span>
                </div>
                <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--org-text-primary)', marginBottom: '1rem' }}>
                  Rs {pkg.price.toLocaleString()}
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem 0', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {pkg.features.map((feat, idx) => (
                    <li key={idx} style={{ fontSize: '0.78rem', color: 'var(--org-text-secondary)', display: 'flex', gap: '0.4rem', alignItems: 'flex-start' }}>
                      <span style={{ color: pkg.color_hex, fontWeight: 800 }}>✓</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
                <div style={{ height: 4, background: 'var(--org-progress-track)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: pkg.color_hex }} />
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      <motion.div variants={fadeUp}>
        <div className="org-section__header">
          <div>
            <h2 className="org-section__title">Deal Negotiation Pipeline</h2>
            <p className="org-section__subtitle">Move deals through the pipeline. Changes are saved immediately.</p>
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
                <span className="org-badge" style={{ background: 'var(--org-sidebar-item-hover)', fontSize: '0.7rem' }}>{colSponsors.length}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', flex: 1, overflowY: 'auto' }}>
                <AnimatePresence>
                  {colSponsors.map((s) => {
                    const pkg = packages.find(p => p.id === s.package_id)
                    const pkgColor = pkg?.color_hex || '#94A3B8'
                    const pkgName = pkg?.name || 'Custom / Unassigned'

                    return (
                      <motion.div
                        key={s.id}
                        className="org-surface org-surface--elevated"
                        style={{ padding: '0.75rem', borderLeft: `3px solid ${pkgColor}`, cursor: 'default' }}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.25 }}
                      >
                        <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--org-text-primary)' }}>{s.name}</h4>
                        <p style={{ fontSize: '0.72rem', color: 'var(--org-text-secondary)', marginTop: '0.2rem' }}>
                          Package: <span style={{ fontWeight: 600, color: pkgColor }}>{pkgName}</span>
                        </p>
                        <p style={{ fontSize: '0.72rem', color: 'var(--org-text-secondary)' }}>
                          Rs {s.amount.toLocaleString()}
                        </p>
                        <p style={{ fontSize: '0.7rem', color: 'var(--org-text-tertiary)', marginTop: '0.15rem' }}>{s.contact}</p>
                        
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.3rem', marginTop: '0.5rem', borderTop: '1px solid var(--org-border-subtle)', paddingTop: '0.4rem' }}>
                          {col.id !== 'Contacted' && (
                            <button className="org-btn org-btn--ghost" onClick={() => handleDemoteStage(s.id)} style={{ padding: '0.2rem', fontSize: '0.65rem' }}>
                              Back
                            </button>
                          )}
                          {col.id !== 'Confirmed' && (
                            <button className="org-btn org-btn--ghost" onClick={() => handleAdvanceStage(s.id)} style={{ padding: '0.2rem', fontSize: '0.65rem', color: 'var(--org-accent-text)', fontWeight: 700 }}>
                              Advance
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
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

      {/* ─── Add/Edit Package Modal ─── */}
      {createPortal(
        <AnimatePresence>
          {showPackageModal && (
            <motion.div className="org-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPackageModal(false)}>
              <motion.div
                className="org-modal"
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.98 }}
                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="org-modal__header">
                  <h2 className="org-modal__title">{editingPackageId ? 'Edit Sponsorship Package' : 'Create Sponsorship Package'}</h2>
                  <button className="org-modal__close" onClick={() => setShowPackageModal(false)}>×</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="org-form-grid">
                    <label className="org-label">
                      Package Name
                      <input className="org-input" placeholder="e.g. Diamond, Platinum" value={packageForm.name} onChange={(e) => setPackageForm((p) => ({ ...p, name: e.target.value }))} />
                    </label>
                    <label className="org-label">
                      Brand Color (Hex)
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <input type="color" value={packageForm.color_hex} onChange={(e) => setPackageForm(p => ({ ...p, color_hex: e.target.value }))} style={{ width: 40, height: 40, padding: 0, border: 'none', borderRadius: 4, cursor: 'pointer' }} />
                        <input className="org-input" value={packageForm.color_hex} onChange={(e) => setPackageForm(p => ({ ...p, color_hex: e.target.value }))} style={{ flex: 1 }} />
                      </div>
                    </label>
                  </div>
                  <div className="org-form-grid">
                    <label className="org-label">
                      Price (Rs)
                      <input className="org-input" type="number" min="0" value={packageForm.price} onChange={(e) => setPackageForm((p) => ({ ...p, price: parseInt(e.target.value) || 0 }))} />
                    </label>
                    <label className="org-label">
                      Total Available Slots
                      <input className="org-input" type="number" min="1" value={packageForm.slots} onChange={(e) => setPackageForm((p) => ({ ...p, slots: parseInt(e.target.value) || 1 }))} />
                    </label>
                  </div>
                  <label className="org-label">
                    Features / Benefits (comma separated)
                    <textarea className="org-textarea" placeholder="Logo placement, 10 VIP tickets, Main stage mention..." rows={3} value={packageForm.features} onChange={(e) => setPackageForm((p) => ({ ...p, features: e.target.value }))} />
                  </label>
                </div>

                <div className="org-modal__footer" style={{ justifyContent: editingPackageId ? 'space-between' : 'flex-end' }}>
                  {editingPackageId && (
                    <button className="org-btn org-btn--ghost" onClick={() => { setShowPackageModal(false); handleDeletePackage(editingPackageId); }} style={{ color: 'var(--org-danger)' }}>
                      Delete Package
                    </button>
                  )}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="org-btn org-btn--secondary" onClick={() => setShowPackageModal(false)}>Cancel</button>
                    <button className="org-btn org-btn--accent" onClick={handleSavePackage} disabled={isSaving || !packageForm.name}>
                      {isSaving ? 'Saving...' : 'Save Package'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}

      {/* ─── Add Sponsor Lead Modal ─── */}
      {createPortal(
        <AnimatePresence>
          {showSponsorModal && (
            <motion.div className="org-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSponsorModal(false)}>
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
                  <button className="org-modal__close" onClick={() => setShowSponsorModal(false)}>×</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <label className="org-label">
                    Company / Brand Name
                    <input className="org-input" placeholder="e.g. Google Cloud" value={newSponsor.name} onChange={(e) => setNewSponsor((p) => ({ ...p, name: e.target.value }))} />
                  </label>
                  <div className="org-form-grid">
                    <label className="org-label">
                      Target Package
                      <select className="org-select" value={newSponsor.package_id} onChange={(e) => {
                        const pkg = packages.find(p => p.id === e.target.value)
                        setNewSponsor((p) => ({ ...p, package_id: e.target.value, amount: pkg ? pkg.price : p.amount }))
                      }}>
                        {packages.map(pkg => (
                          <option key={pkg.id} value={pkg.id}>{pkg.name} (Rs {pkg.price.toLocaleString()})</option>
                        ))}
                      </select>
                    </label>
                    <label className="org-label">
                      Negotiated Amount (Rs)
                      <input className="org-input" type="number" value={newSponsor.amount} onChange={(e) => setNewSponsor((p) => ({ ...p, amount: parseInt(e.target.value) || 0 }))} />
                    </label>
                  </div>
                  <label className="org-label">
                    Partner Contact Email
                    <input className="org-input" type="email" placeholder="partnership@company.com" value={newSponsor.contact} onChange={(e) => setNewSponsor((p) => ({ ...p, contact: e.target.value }))} />
                  </label>
                </div>

                <div className="org-modal__footer">
                  <button className="org-btn org-btn--secondary" onClick={() => setShowSponsorModal(false)}>Cancel</button>
                  <button className="org-btn org-btn--accent" onClick={handleAddSponsor} disabled={isSaving || !newSponsor.name || !newSponsor.contact || !newSponsor.package_id}>
                    {isSaving ? 'Adding...' : 'Add Partner Lead'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </motion.div>
  )
}

export default Sponsorships
