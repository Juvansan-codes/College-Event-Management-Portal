import React, { useEffect, useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { certificationService } from '../../services'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

/* ─── Icons ─── */
const CertIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="M12 18v-6" />
    <path d="m9 15 3 3 3-3" />
  </svg>
)

const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
)

/* ─── Animations ─── */
const stagger = { animate: { transition: { staggerChildren: 0.1 } } }
const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] } },
}

/* ─── Offscreen Certificate Renderer ─── */
interface OffscreenCertProps {
  eventName: string
  participantName: string
  date: string
  svgContent?: string
}

const OffscreenCertificate = React.forwardRef<HTMLDivElement, OffscreenCertProps>(
  ({ eventName, participantName, date, svgContent }, ref) => {
    if (svgContent) {
      return (
        <div ref={ref} style={{
          position: 'relative', overflow: 'hidden', height: '636px', width: '900px',
          display: 'flex', flexDirection: 'column', background: '#ece8e1',
        }}>
          <div style={{ width: '100%', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', zIndex: 2, pointerEvents: 'none',
          }}>
            <div style={{ transform: 'translateY(15px)', width: '100%', textAlign: 'center' }}>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '2.2rem',
                fontWeight: 600,
                color: '#383531',
                margin: 0,
                lineHeight: 1.2,
                letterSpacing: '1px',
                textTransform: 'uppercase',
              }}>{participantName}</h2>
              <div style={{ width: '280px', height: '1px', background: '#a58f76', margin: '0.4rem auto 1rem auto' }} />
              <h3 style={{
                fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: '1.2rem',
                color: '#4a4743', margin: '0.5rem 0', fontWeight: 500,
              }}>{eventName}</h3>
              <p style={{
                fontFamily: "'Montserrat', sans-serif", fontSize: '0.85rem', color: '#787571',
                letterSpacing: '1px', margin: 0,
              }}>{date}</p>
            </div>
          </div>
        </div>
      )
    }

    /* Default certificate template */
    return (
      <div ref={ref} style={{
        padding: '3rem', position: 'relative', overflow: 'hidden', background: '#ece8e1',
        height: '636px', width: '900px', display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', boxSizing: 'border-box'
      }}>
        {/* Elegant double border frame */}
        <div style={{ position: 'absolute', inset: '1.5rem', border: '1px solid #b19d85', borderRadius: '8px', pointerEvents: 'none', opacity: 0.85 }} />
        <div style={{ position: 'absolute', inset: '1.8rem', border: '1px solid #b19d85', borderRadius: '6px', pointerEvents: 'none', opacity: 0.6 }} />

        {/* Top logo */}
        <div style={{
          position: 'absolute', top: '1.8rem', left: '50%', transform: 'translateX(-50%)',
          width: '120px', height: '85px', background: '#a58f76',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          color: '#fff', padding: '0.4rem', zIndex: 3, borderRadius: '2px'
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: '4px' }}>
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
          <div style={{ fontSize: '0.5rem', fontWeight: 800, letterSpacing: '1.2px', textTransform: 'uppercase', lineHeight: 1.1 }}>FESTFORGE</div>
          <div style={{ fontSize: '0.38rem', fontStyle: 'italic', fontFamily: "'Playfair Display', serif", opacity: 0.85 }}>event platform</div>
        </div>

        {/* Main certificate text layout */}
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 2, marginTop: '6.5rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h1 style={{
            fontFamily: "'Playfair Display', serif", fontSize: '2.8rem', fontWeight: 500,
            color: '#383531', letterSpacing: '6px', margin: '0 0 0.4rem 0', lineHeight: 1.2,
          }}>CERTIFICATE</h1>
          <p style={{
            fontFamily: "'Montserrat', sans-serif", fontSize: '0.8rem', letterSpacing: '5px',
            fontWeight: 600, color: '#585551', margin: '0 0 1rem 0',
          }}>OF PARTICIPATION</p>

          <p style={{
            fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: '0.9rem',
            color: '#787571', margin: '0.4rem 0 1rem 0',
          }}>proudly presented to</p>

          {/* Underlined name container */}
          <div style={{
            borderBottom: '1px solid #a58f76',
            paddingBottom: '6px',
            margin: '0 auto 1.5rem auto',
            width: '65%',
            textAlign: 'center'
          }}>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '2.2rem',
              fontWeight: 600,
              color: '#2c2925',
              margin: 0,
              lineHeight: 1.2,
              letterSpacing: '1px',
              display: 'inline-block',
              textTransform: 'uppercase',
            }}>{participantName}</h2>
          </div>

          <p style={{
            fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: '0.9rem',
            color: '#4a4743', margin: '0 auto 2rem auto', maxWidth: '500px', lineHeight: 1.6,
          }}>
            for completing the course <span style={{ fontWeight: 600, fontStyle: 'normal', color: '#2c2925' }}>{eventName}</span> conducted on <span style={{ fontWeight: 600, fontStyle: 'normal', color: '#2c2925' }}>{date}</span>
          </p>
        </div>

        {/* Bottom Layout with Seal Only */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', paddingBottom: '1.25rem', position: 'relative', zIndex: 2 }}>
          {/* Seal */}
          <div style={{ margin: '0 auto' }}>
            <svg width="72" height="72" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="#a58f76" stroke="#8c7760" strokeWidth="1.5" />
              <circle cx="50" cy="50" r="39" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" strokeDasharray="3 2" />
              <circle cx="50" cy="50" r="36" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1" />
              <polygon points="50,38 53,45 61,45 54,49 57,56 50,52 43,56 46,49 39,45 47,45" fill="#fff" />
              <path id="sealCurveTop-att" d="M 24 50 A 26 26 0 0 1 76 50" fill="none" />
              <path id="sealCurveBottom-att" d="M 76 50 A 26 26 0 0 1 24 50" fill="none" />
              <text fontSize="7.5" fontWeight="bold" fill="#fff" letterSpacing="0.8" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                <textPath href="#sealCurveTop-att" startOffset="50%" textAnchor="middle">
                  FESTFORGE
                </textPath>
              </text>
              <text fontSize="7.5" fontWeight="bold" fill="#fff" letterSpacing="0.8" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                <textPath href="#sealCurveBottom-att" startOffset="50%" textAnchor="middle">
                  VERIFIED
                </textPath>
              </text>
            </svg>
          </div>
        </div>
      </div>
    )
  }
)
OffscreenCertificate.displayName = 'OffscreenCertificate'

const Certificates: React.FC = () => {
  const { user } = useAuth()
  const [certificates, setCertificates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [exportCert, setExportCert] = useState<OffscreenCertProps | null>(null)
  const exportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchCertificates = async () => {
      const name = user?.user_metadata?.full_name || ''
      const email = user?.email || ''
      if (name || email) {
        const { data } = await certificationService.getMyCertificates(name, email)
        if (data) setCertificates(data)
      }
      setIsLoading(false)
    }
    fetchCertificates()
  }, [user])

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  }

  /** Decode stored SVG data URL into raw SVG markup */
  const decodeSvgTemplate = useCallback((templateDataUrl?: string | null): string | undefined => {
    if (!templateDataUrl || !templateDataUrl.startsWith('data:image/svg+xml')) return undefined
    try {
      if (templateDataUrl.includes(';base64,')) {
        return atob(templateDataUrl.split(';base64,')[1])
      }
      return decodeURIComponent(templateDataUrl.split(',')[1])
    } catch {
      return undefined
    }
  }, [])

  const handleDownload = useCallback(async (cert: any) => {
    const certId = cert.id
    const eventName = cert.certificate_batches?.event_name || 'Event Certificate'
    const participantName = cert.participant_name || 'Participant'
    const date = formatDate(cert.certificate_batches?.conducted_date)
    const svgContent = decodeSvgTemplate(cert.certificate_batches?.template_data_url)

    setDownloadingId(certId)
    setExportCert({ eventName, participantName, date, svgContent })

    // Wait for React to render the offscreen certificate and fonts to be ready
    await new Promise((resolve) => setTimeout(resolve, 300))
    if (typeof document !== 'undefined' && document.fonts) {
      await document.fonts.ready
    }

    try {
      if (!exportRef.current) {
        throw new Error('Certificate renderer not available')
      }

      const canvas = await html2canvas(exportRef.current, {
        scale: 2.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
      })

      const imgData = canvas.toDataURL('image/png')
      const width = canvas.width / 2.5
      const height = canvas.height / 2.5

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [width, height],
      })

      pdf.addImage(imgData, 'PNG', 0, 0, width, height)
      pdf.save(`Certificate_${participantName.replace(/\s+/g, '_')}_${eventName.replace(/\s+/g, '_')}.pdf`)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate certificate PDF. Please try again.')
    } finally {
      setDownloadingId(null)
      setExportCert(null)
    }
  }, [decodeSvgTemplate])

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', color: 'var(--org-text-secondary)' }}>
        Loading certificates...
      </div>
    )
  }

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="org-dashboard-container" style={{ padding: '2rem 3rem' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Alex+Brush&family=Montserrat:wght@400;600;800&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap');
      `}</style>

      <motion.div variants={fadeUp} style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--org-text-primary)' }}>My Certificates</h1>
        <p style={{ color: 'var(--org-text-secondary)', fontSize: '1.05rem', marginTop: '0.5rem' }}>
          View and download your participation and achievement certificates.
        </p>
      </motion.div>

      {certificates.length === 0 ? (
        <motion.div variants={fadeUp} className="org-surface" style={{ padding: '3rem', textAlign: 'center' }}>
          <CertIcon />
          <h3 style={{ marginTop: '1rem', fontSize: '1.2rem', color: 'var(--org-text-primary)' }}>No Certificates Yet</h3>
          <p style={{ color: 'var(--org-text-secondary)' }}>You haven't been issued any certificates yet. Attend events to earn them!</p>
        </motion.div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
          {certificates.map((cert) => (
            <motion.div
              key={cert.id}
              variants={fadeUp}
              className="org-surface org-surface--hoverable"
              style={{
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'hidden',
                borderTop: '4px solid var(--org-accent)',
                padding: '0'
              }}
            >
              {/* Certificate Ribbon */}
              <div style={{ position: 'absolute', top: '1rem', right: '-2rem', background: 'var(--org-accent)', color: '#fff', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', padding: '0.3rem 2.5rem', transform: 'rotate(45deg)', zIndex: 10, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                VERIFIED
              </div>

              <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ marginBottom: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span className="org-badge org-badge--info">
                    Issued: {formatDate(cert.issued_at)}
                  </span>
                  {cert.sent_by_email && (
                    <span className="org-badge org-badge--success" style={{ textTransform: 'none', letterSpacing: 'normal' }}>
                      Organizer: {cert.sent_by_email}
                    </span>
                  )}
                </div>
                
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--org-text-primary)', marginBottom: '0.4rem', lineHeight: 1.3 }}>
                  {cert.certificate_batches?.event_name || 'Event Certificate'}
                </h3>
                
                <p style={{ fontSize: '0.85rem', color: 'var(--org-text-secondary)', marginBottom: '1.5rem' }}>
                  Awarded for participation on {formatDate(cert.certificate_batches?.conducted_date)}.
                </p>

                <div style={{ marginTop: 'auto', background: 'var(--org-surface-0)', padding: '1rem', borderRadius: '0.5rem', border: '1px dashed var(--org-border-default)', marginBottom: '1.5rem', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--org-text-tertiary)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '0.3rem' }}>
                    Awarded To
                  </span>
                  <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--org-text-primary)' }}>
                    {cert.participant_name}
                  </span>
                </div>

                <button 
                  className="org-btn org-btn--secondary" 
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => handleDownload(cert)}
                  disabled={downloadingId === cert.id}
                >
                  {downloadingId === cert.id ? (
                    <>Generating PDF...</>
                  ) : (
                    <><DownloadIcon /> Download PDF</>
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Offscreen certificate renderer for PDF export */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', pointerEvents: 'none' }}>
        <OffscreenCertificate
          ref={exportRef}
          eventName={exportCert?.eventName || 'Event Certificate'}
          participantName={exportCert?.participantName || 'Participant'}
          date={exportCert?.date || 'N/A'}
          svgContent={exportCert?.svgContent}
        />
      </div>
    </motion.div>
  )
}

export default Certificates

