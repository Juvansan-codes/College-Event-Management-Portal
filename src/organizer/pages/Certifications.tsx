import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PageHeader from '../components/PageHeader'

/* ─── Types ─── */
interface CertData {
  eventName: string
  participantName: string
  date: string
  participants: string[]
}

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] } },
}

const stagger = {
  animate: { transition: { staggerChildren: 0.06 } },
}

/* ─── Premium Certificate Preview Component ─── */
const CertPreview: React.FC<{ eventName: string; participantName: string; date: string }> = ({
  eventName,
  participantName,
  date,
}) => (
  <div className="org-cert-preview org-surface org-surface--elevated" style={{ padding: '2.5rem', position: 'relative', overflow: 'hidden' }}>
    {/* Elegant Gold/Purple border frames */}
    <div style={{ position: 'absolute', inset: '1rem', border: '2px solid rgba(162,155,254,0.15)', pointerEvents: 'none' }} />
    <div style={{ position: 'absolute', inset: '1.25rem', border: '1px solid rgba(162,155,254,0.35)', pointerEvents: 'none' }} />
    
    <div style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
      <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '2.5px', color: 'var(--org-accent-text)', fontWeight: 800, marginBottom: '0.75rem' }}>
        FESTFORGE CREDENTIAL SYSTEM
      </div>
      <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '1.25rem', color: 'var(--org-text-secondary)', margin: '1rem 0 0.5rem 0' }}>
        Certificate of Participation
      </p>
      
      <div style={{ width: 40, height: 1, background: 'var(--org-border-default)', margin: '1rem auto' }} />

      <p style={{ fontSize: '0.78rem', color: 'var(--org-text-tertiary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
        This is proudly presented to
      </p>
      
      <h2 style={{ fontFamily: 'Georgia, serif', fontStyle: 'normal', fontSize: '1.8rem', fontWeight: 500, color: 'var(--org-text-primary)', margin: '0.65rem 0 1rem 0', letterSpacing: '-0.5px' }}>
        {participantName || 'Priya Kumar'}
      </h2>
      
      <p style={{ fontSize: '0.8rem', color: 'var(--org-text-secondary)', maxWidth: '340px', margin: '0.5rem auto 1.25rem auto', lineHeight: 1.6 }}>
        for successfully registering, attending, and engaging in multiple key sessions of the official event
      </p>
      
      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--org-accent-text)', margin: '0.5rem 0 1rem 0' }}>
        {eventName || 'FestForge College Summit 2026'}
      </h3>
      
      <p style={{ fontSize: '0.75rem', color: 'var(--org-text-tertiary)' }}>
        conducted on <span style={{ fontWeight: 650, color: 'var(--org-text-secondary)' }}>{date || 'June 16, 2026'}</span>
      </p>

      {/* Certificate Signatures / Seal */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2.5rem', padding: '0 1rem' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 85, borderBottom: '1px solid var(--org-border-default)', marginBottom: 4, opacity: 0.6 }} />
          <span style={{ fontSize: '0.68rem', color: 'var(--org-text-tertiary)' }}>Dean / HOD</span>
        </div>

        {/* Vector Seal Badge */}
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--org-accent-soft)', border: '2px double var(--org-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', fontWeight: 900, color: 'var(--org-accent-text)' }}>
          SEAL
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 85, borderBottom: '1px solid var(--org-border-default)', marginBottom: 4, opacity: 0.6 }} />
          <span style={{ fontSize: '0.68rem', color: 'var(--org-text-tertiary)' }}>Event Chair</span>
        </div>
      </div>
    </div>
  </div>
)

/* ─── Main Component ─── */
const Certifications: React.FC = () => {
  const [cert, setCert] = useState<CertData>({
    eventName: 'FestForge Summit 2026',
    participantName: 'Priya Kumar',
    date: '2026-06-16',
    participants: [],
  })
  const [bulkText, setBulkText] = useState('Priya Kumar\nArjun Mehta\nSneha Reddy\nRahul Sharma')
  const [generated, setGenerated] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)

  const handleBulkParse = () => {
    const names = bulkText
      .split('\n')
      .map((n) => n.trim())
      .filter(Boolean)
    setCert((prev) => ({ ...prev, participants: names }))
  }

  const handleGenerate = () => {
    handleBulkParse()
    setGenerated(true)
    setTimeout(() => setGenerated(false), 3000)
  }

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="org-certs-page">
      <PageHeader
        eyebrow="Console"
        title="Certification Generator"
        subtitle="Design corporate participation passes and distribute secure credentials to attendees."
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* Left: Settings */}
        <motion.div variants={fadeUp} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Upload template file dropzone */}
          <div
            className={`org-upload-zone ${isDragOver ? 'org-upload-zone--active' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragOver(false) }}
            style={{
              border: '2px dashed var(--org-border-default)',
              borderRadius: '0.85rem',
              padding: '2.5rem 1.5rem',
              textAlign: 'center',
              background: 'var(--org-surface-1)',
              cursor: 'pointer',
              transition: 'border-color 0.2s ease, background 0.2s ease'
            }}
          >
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--org-accent-soft)', color: 'var(--org-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem auto' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--org-text-primary)' }}>Import Custom Certificate Mask</p>
            <p style={{ fontSize: '0.72rem', color: 'var(--org-text-tertiary)', marginTop: '0.2rem' }}>PNG, JPG or SVG template file. Max size 5MB.</p>
          </div>

          {/* Form details input */}
          <div className="org-surface org-surface--elevated" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--org-text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Credential Meta</h3>
            
            <label className="org-label">
              Event Title
              <input
                className="org-input"
                placeholder="e.g. FestForge Summit 2026"
                value={cert.eventName}
                onChange={(e) => setCert((p) => ({ ...p, eventName: e.target.value }))}
              />
            </label>

            <div className="org-form-grid">
              <label className="org-label">
                Preview Holder
                <input
                  className="org-input"
                  placeholder="e.g. Priya Kumar"
                  value={cert.participantName}
                  onChange={(e) => setCert((p) => ({ ...p, participantName: e.target.value }))}
                />
              </label>

              <label className="org-label">
                Conducted Date
                <input
                  className="org-input"
                  type="date"
                  value={cert.date}
                  onChange={(e) => setCert((p) => ({ ...p, date: e.target.value }))}
                />
              </label>
            </div>
          </div>

          {/* Bulk roster text */}
          <div className="org-surface org-surface--elevated" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--org-text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Attendee Roster Ranks</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--org-text-secondary)', marginTop: '-0.3rem' }}>
              Pluck lists of names manually or paste row columns from Excel sheets.
            </p>
            <textarea
              className="org-textarea"
              placeholder="Priya Kumar&#10;Arjun Mehta&#10;Sneha Reddy&#10;..."
              rows={5}
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              style={{ minHeight: 90 }}
            />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.2rem' }}>
              <button className="org-btn org-btn--accent" onClick={handleGenerate}>
                Deploy all passes
              </button>
              <span style={{ fontSize: '0.75rem', color: 'var(--org-text-tertiary)', fontWeight: 600 }}>
                {bulkText.split('\n').filter((l) => l.trim()).length} names loaded
              </span>
            </div>
          </div>
        </motion.div>

        {/* Right: Realtime Preview display */}
        <motion.div variants={fadeUp} style={{ position: 'sticky', top: '5.5rem' }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--org-text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.75rem' }}>Credential Preview</h3>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={`${cert.eventName}-${cert.participantName}-${cert.date}`}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
            >
              <CertPreview
                eventName={cert.eventName}
                participantName={cert.participantName}
                date={cert.date}
              />
            </motion.div>
          </AnimatePresence>

          <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1rem' }}>
            <button className="org-btn org-btn--primary" style={{ flex: 1, justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '0.2rem' }}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download PDF
            </button>
            <button className="org-btn org-btn--secondary" style={{ flex: 1, justifyContent: 'center' }}>
              Inspect Details
            </button>
          </div>

          <AnimatePresence>
            {generated && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                style={{
                  marginTop: '1rem',
                  padding: '0.8rem 1rem',
                  background: 'var(--org-success-soft)',
                  color: 'var(--org-success)',
                  borderRadius: '0.6rem',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                ✓ {bulkText.split('\n').filter((l) => l.trim()).length} Credentials generated and synced to database!
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default Certifications
