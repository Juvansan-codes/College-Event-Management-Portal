import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { certificationService } from '../../services'

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

const Certificates: React.FC = () => {
  const { user } = useAuth()
  const [certificates, setCertificates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCertificates = async () => {
      if (user?.user_metadata?.full_name) {
        const { data } = await certificationService.getMyCertificates(user.user_metadata.full_name)
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

  const handleDownload = (cert: any) => {
    // In a real app, this would generate a PDF or image based on template_data_url.
    // For this mockup, we just open a placeholder or alert.
    alert(`Downloading certificate for ${cert.certificate_batches?.event_name}...\n(In production, this generates a PDF using ${cert.certificate_batches?.template_data_url || 'default template'})`)
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', color: 'var(--org-text-secondary)' }}>
        Loading certificates...
      </div>
    )
  }

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="org-dashboard-container" style={{ padding: '2rem 3rem' }}>
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
                <div style={{ marginBottom: '0.75rem' }}>
                  <span className="org-badge org-badge--info">
                    Issued: {formatDate(cert.issued_at)}
                  </span>
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
                >
                  <DownloadIcon /> Download PDF
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

export default Certificates
