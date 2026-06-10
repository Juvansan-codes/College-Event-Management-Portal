import React, { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { useEvent } from '../../contexts/EventContext'
import { certificationService } from '../../services'

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
const CertPreview = React.forwardRef<HTMLDivElement, { eventName: string; participantName: string; date: string; templateUrl?: string }>(
  ({ eventName, participantName, date, templateUrl }, ref) => (
    <div ref={ref} className="org-cert-preview org-surface org-surface--elevated" style={{
      padding: '2.5rem',
      position: 'relative',
      overflow: 'hidden',
      background: templateUrl ? `url(${templateUrl}) no-repeat center/cover` : '#ece8e1',
      minHeight: '400px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
    }}>
      {/* Elegant border frames */}
      {!templateUrl && (
        <>
          <div style={{
            position: 'absolute',
            inset: '1.25rem',
            border: '1px solid #b19d85',
            borderRadius: '6px',
            pointerEvents: 'none',
            opacity: 0.85
          }} />
          <div style={{
            position: 'absolute',
            inset: '1.5rem',
            border: '1px solid #b19d85',
            borderRadius: '4px',
            pointerEvents: 'none',
            opacity: 0.6
          }} />
          
          {/* Top Salford box logo */}
          <div style={{
            position: 'absolute',
            top: '1.5rem',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '110px',
            height: '80px',
            background: '#a58f76',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            padding: '0.4rem',
            zIndex: 3
          }}>
            {/* Real Estate Roof SVG */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: '4px' }}>
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <div style={{ fontSize: '0.45rem', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', lineHeight: 1.1 }}>SALFORD&CO.</div>
            <div style={{ fontSize: '0.35rem', fontStyle: 'italic', fontFamily: "'Playfair Display', serif", opacity: 0.85 }}>real estate agency</div>
          </div>
        </>
      )}

      {templateUrl ? (
        /* Overlay dynamic fields only when custom SVG mask is uploaded */
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2,
        }}>
          <div style={{ transform: 'translateY(15px)', width: '100%', textAlign: 'center' }}>
            {/* Cursive Participant Name */}
            <h2 style={{
              fontFamily: "'Alex Brush', cursive",
              fontSize: '3.5rem',
              color: '#383531',
              margin: 0,
              lineHeight: 1
            }}>
              {participantName}
            </h2>
            <div style={{ width: '220px', height: '1px', background: '#a58f76', margin: '0.4rem auto 1rem auto' }} />
            
            {/* Event Name */}
            <h3 style={{
              fontFamily: "'Playfair Display', serif",
              fontStyle: 'italic',
              fontSize: '1rem',
              color: '#4a4743',
              margin: '0.5rem 0',
              fontWeight: 500
            }}>
              {eventName}
            </h3>
            
            {/* Date */}
            <p style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: '0.75rem',
              color: '#787571',
              letterSpacing: '1px',
              margin: 0
            }}>
              {date}
            </p>
          </div>
        </div>
      ) : (
        /* Render Salford & Co template text layouts when default template is active */
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 2, marginTop: '5.5rem' }}>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '2.5rem',
            fontWeight: 500,
            color: '#383531',
            letterSpacing: '5px',
            margin: '0 0 0.1rem 0',
            lineHeight: 1
          }}>
            CERTIFICATE
          </h1>
          <p style={{
            fontFamily: "'Montserrat', sans-serif",
            fontSize: '0.75rem',
            letterSpacing: '4.5px',
            fontWeight: 600,
            color: '#585551',
            margin: '0 0 0.8rem 0'
          }}>
            OF PARTICIPATION
          </p>
          
          <p style={{
            fontFamily: "'Playfair Display', serif",
            fontStyle: 'italic',
            fontSize: '0.82rem',
            color: '#787571',
            margin: '0.4rem 0 1rem 0'
          }}>
            proudly presented to
          </p>

          {/* Cursive Name overlaying line */}
          <div style={{ position: 'relative', margin: '0.5rem auto 1.5rem auto', display: 'inline-block', width: '65%' }}>
            <h2 style={{
              fontFamily: "'Alex Brush', cursive",
              fontSize: '3.6rem',
              fontWeight: 400,
              color: '#2c2925',
              margin: '0 auto -12px auto',
              lineHeight: 1,
              textAlign: 'center'
            }}>
              {participantName || 'Juliana Silva'}
            </h2>
            <div style={{ width: '100%', height: '1px', background: '#a58f76' }} />
          </div>
          
          <p style={{
            fontFamily: "'Playfair Display', serif",
            fontStyle: 'italic',
            fontSize: '0.8rem',
            color: '#4a4743',
            margin: '0.2rem auto 2.2rem auto',
            maxWidth: '440px',
            lineHeight: 1.5
          }}>
            for completing the course <span style={{ fontWeight: 600, fontStyle: 'normal', color: '#2c2925' }}>{eventName}</span> conducted on <span style={{ fontWeight: 600, fontStyle: 'normal', color: '#2c2925' }}>{date}</span>
          </p>

          {/* Bottom Layout with Signatures and Seal */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 1.5rem' }}>
            {/* Left signature */}
            <div style={{ textAlign: 'center', width: '135px' }}>
              <div style={{ borderBottom: '1px solid #c8bbae', marginBottom: '6px' }} />
              <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#383531', letterSpacing: '1px', fontFamily: "'Montserrat', sans-serif" }}>OLIVIA WILSON</div>
              <div style={{ fontSize: '0.58rem', fontStyle: 'italic', fontFamily: "'Playfair Display', serif", color: '#787571' }}>director</div>
            </div>

            {/* Seal */}
            <div style={{ margin: '0 0.5rem' }}>
              <svg width="64" height="64" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="#a58f76" stroke="#8c7760" strokeWidth="1.5" />
                <circle cx="50" cy="50" r="39" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" strokeDasharray="3 2" />
                <circle cx="50" cy="50" r="36" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1" />
                <polygon points="50,38 53,45 61,45 54,49 57,56 50,52 43,56 46,49 39,45 47,45" fill="#fff" />
                <path id="sealCurveTop" d="M 24 50 A 26 26 0 0 1 76 50" fill="none" />
                <path id="sealCurveBottom" d="M 76 50 A 26 26 0 0 1 24 50" fill="none" />
                <text fontSize="7.5" fontWeight="bold" fill="#fff" letterSpacing="0.8" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  <textPath href="#sealCurveTop" startOffset="50%" textAnchor="middle">
                    REAL ESTATE
                  </textPath>
                </text>
                <text fontSize="7.5" fontWeight="bold" fill="#fff" letterSpacing="0.8" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  <textPath href="#sealCurveBottom" startOffset="50%" textAnchor="middle">
                    COURSE
                  </textPath>
                </text>
              </svg>
            </div>

            {/* Right signature */}
            <div style={{ textAlign: 'center', width: '135px' }}>
              <div style={{ borderBottom: '1px solid #c8bbae', marginBottom: '6px' }} />
              <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#383531', letterSpacing: '1px', fontFamily: "'Montserrat', sans-serif" }}>ISABEL MERCADO</div>
              <div style={{ fontSize: '0.58rem', fontStyle: 'italic', fontFamily: "'Playfair Display', serif", color: '#787571' }}>manager</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
)
CertPreview.displayName = 'CertPreview'

/* ─── Main Component ─── */
const Certifications: React.FC = () => {
  const navigate = useNavigate()
  const { activeEvent, isLoading: isEventLoading } = useEvent()
  const [cert, setCert] = useState<CertData>({
    eventName: 'FestForge Summit 2026',
    participantName: 'Priya Kumar',
    date: '2026-06-16',
    participants: ['Priya Kumar', 'Arjun Mehta', 'Sneha Reddy', 'Rahul Sharma'],
  })
  const [bulkText, setBulkText] = useState('Priya Kumar\nArjun Mehta\nSneha Reddy\nRahul Sharma')
  const [generated, setGenerated] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)

  const certRef = useRef<HTMLDivElement>(null)
  const exportRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState<{ current: number; total: number } | null>(null)
  const [exportName, setExportName] = useState('')
  const [showRosterModal, setShowRosterModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [templateUrl, setTemplateUrl] = useState<string | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [syncMessage, setSyncMessage] = useState<string | null>(null)
  const [syncError, setSyncError] = useState<string | null>(null)

  useEffect(() => {
    if (!isEventLoading && !activeEvent) {
      navigate('/organizer')
    }
  }, [activeEvent, isEventLoading, navigate])

  useEffect(() => {
    if (!activeEvent) return

    let cancelled = false
    const loadBatch = async () => {
      setIsLoading(true)
      setSyncError(null)

      const { data, error } = await certificationService.getBatchByEvent(activeEvent.id)
      if (cancelled) return

      if (error) {
        setSyncError(error)
      } else if (data) {
        const participants = data.recipients.map((recipient) => recipient.participant_name)
        setCert({
          eventName: data.event_name,
          participantName: participants[0] ?? '',
          date: data.conducted_date,
          participants,
        })
        setBulkText(participants.join('\n'))
        setTemplateUrl(data.template_data_url ?? undefined)
      } else {
        const defaults = ['Priya Kumar', 'Arjun Mehta', 'Sneha Reddy', 'Rahul Sharma']
        setCert({
          eventName: activeEvent.name,
          participantName: defaults[0],
          date: activeEvent.end_date,
          participants: defaults,
        })
        setBulkText(defaults.join('\n'))
        setTemplateUrl(undefined)
      }

      setIsLoading(false)
    }

    loadBatch()
    return () => {
      cancelled = true
    }
  }, [activeEvent])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]
      if (file.type !== 'image/svg+xml' && !file.name.toLowerCase().endsWith('.svg')) {
        alert('Please upload an SVG template file.')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit.')
        return
      }
      const reader = new FileReader()
      reader.onload = (event) => {
        setTemplateUrl(event.target?.result as string)
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      const file = files[0]
      if (file.type !== 'image/svg+xml' && !file.name.toLowerCase().endsWith('.svg')) {
        alert('Please upload an SVG template file.')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit.')
        return
      }
      const reader = new FileReader()
      reader.onload = (event) => {
        setTemplateUrl(event.target?.result as string)
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
      reader.readAsDataURL(file)
    }
  }

  const handleGenerate = async () => {
    if (!activeEvent) return
    const names = bulkText
      .split('\n')
      .map((n) => n.trim())
      .filter(Boolean)

    setCert((prev) => ({ ...prev, participants: names, participantName: prev.participantName || names[0] || '' }))
    setIsSaving(true)
    setSyncError(null)
    setSyncMessage(null)

    const { data, error } = await certificationService.saveBatch(activeEvent.id, {
      event_name: cert.eventName,
      conducted_date: cert.date,
      template_data_url: templateUrl ?? null,
      participants: names,
    })

    setIsSaving(false)
    if (error || !data) {
      setSyncError(error ?? 'Unable to save certificate batch.')
      return
    }

    const savedNames = data.recipients.map((recipient) => recipient.participant_name)
    setCert((prev) => ({
      ...prev,
      participants: savedNames,
      participantName: prev.participantName || savedNames[0] || '',
    }))
    setGenerated(true)
    setSyncMessage(`${savedNames.length} credentials saved to the database.`)
    setTimeout(() => {
      setGenerated(false)
      setSyncMessage(null)
    }, 3000)
  }

  const exportNamesList = async (names: string[]) => {
    if (names.length === 0) return
    setIsDownloading(true)
    setDownloadProgress({ current: 0, total: names.length })

    try {
      let pdf: any = null
      const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

      for (let i = 0; i < names.length; i++) {
        const name = names[i]
        setExportName(name)
        // Wait for React to render the name offscreen
        await sleep(180)

        if (!exportRef.current) continue

        const canvas = await html2canvas(exportRef.current, {
          scale: 2.5,
          useCORS: true,
          allowTaint: true,
          backgroundColor: null,
        })

        const imgData = canvas.toDataURL('image/png')
        const width = canvas.width / 2.5
        const height = canvas.height / 2.5

        if (i === 0) {
          pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'px',
            format: [width, height],
          })
        } else {
          pdf.addPage([width, height], 'landscape')
        }

        pdf.addImage(imgData, 'PNG', 0, 0, width, height)
        setDownloadProgress({ current: i + 1, total: names.length })
      }

      if (pdf) {
        const fileName = names.length === 1
          ? `Certificate_${names[0].replace(/\s+/g, '_')}.pdf`
          : `Certificates_Batch_${cert.eventName.replace(/\s+/g, '_')}.pdf`
        pdf.save(fileName)
      }
    } catch (error) {
      console.error('Error compiling PDF:', error)
    } finally {
      setIsDownloading(false)
      setDownloadProgress(null)
      setExportName('')
    }
  }

  const filteredParticipants = cert.participants.filter((name) =>
    name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!activeEvent) return null

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="org-certs-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Alex+Brush&family=Montserrat:wght@400;600;800&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap');
      `}</style>
      <PageHeader
        eyebrow="Console"
        title="Certification Generator"
        subtitle={`Design participation credentials and persist recipient rosters for ${activeEvent.name}.`}
      />

      {syncError && (
        <div className="org-surface" style={{ padding: '0.85rem 1rem', marginBottom: '1rem', borderColor: 'var(--org-danger)', color: 'var(--org-danger)', fontSize: '0.82rem', fontWeight: 700 }}>
          {syncError}
        </div>
      )}

      {isLoading && (
        <div className="org-surface org-surface--elevated" style={{ padding: '1rem', marginBottom: '1rem', color: 'var(--org-text-secondary)', fontSize: '0.85rem' }}>
          Loading certificate batch...
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* Left: Settings */}
        <motion.div variants={fadeUp} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Upload template file dropzone */}
          <div
            className={`org-upload-zone ${isDragOver ? 'org-upload-zone--active' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
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
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".svg, image/svg+xml"
              style={{ display: 'none' }}
            />
            {templateUrl ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <img src={templateUrl} style={{ maxWidth: '150px', maxHeight: '80px', borderRadius: '4px', border: '1px solid var(--org-border-default)' }} alt="Custom mask" />
                <p style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--org-text-primary)' }}>Custom Mask Active</p>
                <p style={{ fontSize: '0.7rem', color: 'var(--org-accent-text)' }}>Click or drag to replace template</p>
                <button
                  className="org-btn org-btn--danger"
                  style={{ marginTop: '0.4rem', padding: '0.2rem 0.6rem', fontSize: '0.7rem', borderRadius: '0.3rem' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setTemplateUrl(undefined);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                >
                  Remove Template
                </button>
              </div>
            ) : (
              <>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--org-accent-soft)', color: 'var(--org-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem auto' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--org-text-primary)' }}>Import Custom Certificate Mask</p>
                <p style={{ fontSize: '0.72rem', color: 'var(--org-text-tertiary)', marginTop: '0.2rem' }}>SVG template file only. Max size 5MB.</p>
              </>
            )}
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
              <button className="org-btn org-btn--accent" onClick={handleGenerate} disabled={isSaving || isLoading}>
                {isSaving ? 'Saving passes...' : 'Deploy all passes'}
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
                ref={certRef}
                eventName={cert.eventName}
                participantName={cert.participantName}
                date={cert.date}
                templateUrl={templateUrl}
              />
            </motion.div>
          </AnimatePresence>

          <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1rem' }}>
            <button
              className="org-btn org-btn--primary"
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={() => exportNamesList([cert.participantName])}
              disabled={isDownloading}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '0.2rem' }}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download PDF
            </button>
            <button
              className="org-btn org-btn--secondary"
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={() => setShowRosterModal(true)}
            >
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
                ✓ {syncMessage ?? `${bulkText.split('\n').filter((l) => l.trim()).length} credentials saved to the database.`}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Offscreen Staging for PDF generation */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', pointerEvents: 'none' }}>
        <CertPreview
          ref={exportRef}
          eventName={cert.eventName}
          participantName={exportName}
          date={cert.date}
          templateUrl={templateUrl}
        />
      </div>

      {/* Roster Modal */}
      <AnimatePresence>
        {showRosterModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'var(--org-modal-overlay)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '2rem',
            }}
            onClick={() => setShowRosterModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="org-surface org-surface--elevated"
              style={{
                width: '100%',
                maxWidth: '640px',
                maxHeight: '80vh',
                display: 'flex',
                flexDirection: 'column',
                background: 'var(--org-surface-0)',
                overflow: 'hidden',
                position: 'relative',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--org-border-default)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--org-text-primary)' }}>Roster Inspector</h2>
                    <p style={{ fontSize: '0.8rem', color: 'var(--org-text-secondary)', marginTop: '0.2rem' }}>
                      Manage {cert.participants.length} attendee credentials for this event.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowRosterModal(false)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--org-text-tertiary)',
                      cursor: 'pointer',
                      padding: '0.4rem',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'background 0.2s, color 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--org-border-subtle)'
                      e.currentTarget.style.color = 'var(--org-text-primary)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'none'
                      e.currentTarget.style.color = 'var(--org-text-tertiary)'
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
                
                {/* Search Input */}
                <div style={{ marginTop: '1rem', position: 'relative' }}>
                  <input
                    className="org-input"
                    placeholder="Search attendee by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ paddingLeft: '2.2rem', width: '100%' }}
                  />
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--org-text-tertiary)' }}
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
              </div>
              
              {/* Modal Body (Roster List) */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem' }}>
                {filteredParticipants.length === 0 ? (
                  <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--org-text-tertiary)' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginBottom: '0.5rem', opacity: 0.5 }}>
                      <circle cx="12" cy="12" r="10" />
                      <line x1="8" y1="12" x2="16" y2="12" />
                    </svg>
                    <p style={{ fontSize: '0.85rem' }}>No attendees match your search</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {filteredParticipants.map((name, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.65rem 0.85rem',
                          background: 'var(--org-surface-1)',
                          border: '1px solid var(--org-border-default)',
                          borderRadius: '0.6rem',
                        }}
                      >
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--org-text-primary)' }}>
                          {name}
                        </span>
                        
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button
                            className="org-btn org-btn--secondary"
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                            onClick={() => {
                              setCert((prev) => ({ ...prev, participantName: name }))
                              setShowRosterModal(false)
                            }}
                          >
                            Preview
                          </button>
                          <button
                            className="org-btn org-btn--primary"
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                            onClick={() => exportNamesList([name])}
                            disabled={isDownloading}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                              <polyline points="7 10 12 15 17 10" />
                              <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Modal Footer */}
              <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid var(--org-border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--org-surface-1)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--org-text-secondary)', fontWeight: 500 }}>
                  Showing {filteredParticipants.length} of {cert.participants.length}
                </span>
                
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="org-btn org-btn--secondary"
                    onClick={() => setShowRosterModal(false)}
                    style={{ fontSize: '0.8rem' }}
                  >
                    Close
                  </button>
                  <button
                    className="org-btn org-btn--accent"
                    onClick={() => {
                      setShowRosterModal(false)
                      exportNamesList(cert.participants)
                    }}
                    disabled={isDownloading || cert.participants.length === 0}
                    style={{ fontSize: '0.8rem' }}
                  >
                    Export Batch ({cert.participants.length})
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Download Progress Overlay */}
      <AnimatePresence>
        {isDownloading && downloadProgress && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(9, 9, 15, 0.75)',
              backdropFilter: 'blur(5px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2000,
            }}
          >
            <div
              className="org-surface org-surface--elevated"
              style={{
                padding: '2rem',
                width: '320px',
                textAlign: 'center',
                background: 'var(--org-surface-0)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    border: '3px solid var(--org-border-default)',
                    borderTopColor: 'var(--org-accent)',
                    animation: 'spin 1s linear infinite',
                  }}
                />
                <style>{`
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                `}</style>
              </div>
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--org-text-primary)' }}>
                  Generating Credentials
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--org-text-secondary)', marginTop: '0.2rem' }}>
                  Please do not close this tab...
                </p>
              </div>
              
              <div style={{ width: '100%', background: 'var(--org-border-default)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    background: 'var(--org-accent)',
                    width: `${(downloadProgress.current / downloadProgress.total) * 100}%`,
                    transition: 'width 0.15s ease',
                  }}
                />
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 650, color: 'var(--org-accent-text)' }}>
                {downloadProgress.current} of {downloadProgress.total} compiled
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default Certifications
