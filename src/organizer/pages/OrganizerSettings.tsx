import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

const OrganizerSettings: React.FC = () => {
  const { user, role, updateRole } = useAuth()
  const navigate = useNavigate()
  const [isSwitching, setIsSwitching] = useState(false)

  const handleSwitchRole = async () => {
    setIsSwitching(true)
    await updateRole('student')
    setIsSwitching(false)
    navigate('/attendee')
  }

  const stagger = {
    animate: { transition: { staggerChildren: 0.08 } },
  }

  const fadeUp = {
    initial: { opacity: 0, y: 30, filter: 'blur(10px)' },
    animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  }

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="org-dashboard-container">
      <motion.div variants={fadeUp} className="org-section__header" style={{ marginBottom: '2rem' }}>
        <div>
          <h2 className="org-section__title">Settings</h2>
          <p className="org-section__subtitle">Manage your profile and platform role.</p>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="org-surface org-surface--elevated" style={{ padding: '2rem', maxWidth: '800px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {/* Profile Section */}
          <section>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--org-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--org-border-default)' }}>
              Profile
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <p style={{ color: 'var(--org-text-primary)', fontWeight: 600, fontSize: '1.2rem' }}>{user?.user_metadata?.full_name || 'Organizer'}</p>
              <p style={{ color: 'var(--org-text-secondary)', fontSize: '0.95rem' }}>{user?.email}</p>
              <div style={{ marginTop: '0.5rem' }}>
                <span className="org-badge org-badge--info">Active as Organizer</span>
              </div>
            </div>
          </section>

          {/* Role Switching Section */}
          <section>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--org-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--org-border-default)' }}>
              Platform Role
            </h3>
            <p style={{ color: 'var(--org-text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem', maxWidth: '600px' }}>
              You are currently using the FestForge Organizer Portal. If you also want to browse events, register for fests, and view your tickets, you can switch to the Student Portal.
            </p>
            
            <button
              onClick={handleSwitchRole}
              disabled={isSwitching}
              className="org-btn org-btn--primary"
              style={{ width: 'auto' }}
            >
              {isSwitching ? 'Switching Role...' : 'Switch to Student Portal'}
            </button>
          </section>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default OrganizerSettings
