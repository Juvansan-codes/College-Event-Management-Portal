import React, { useState, useEffect } from 'react'
import { Outlet, useLocation, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import AttendeeSidebar from './AttendeeSidebar'
import ThemeToggle from '../../components/ThemeToggle'
import '../../organizer/organizer.css'
import '../attendee.css'

/* ─── Breadcrumb Mapping ─── */
const BREADCRUMBS: Record<string, string> = {
  '/attendee': 'Dashboard',
  '/attendee/events': 'Browse Events',
  '/attendee/my-tickets': 'My Tickets',
  '/attendee/certificates': 'Certificates',
  '/attendee/check-in': 'Attendance Check-in',
}

/* ─── Page Transition ─── */
const pageVariants = {
  initial: { opacity: 0, scale: 0.98, filter: 'blur(8px)' },
  animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
  exit: { opacity: 0, scale: 0.98, filter: 'blur(8px)' },
}

const pageTransition = {
  duration: 0.45,
  ease: [0.25, 0.1, 0.25, 1],
}

const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
)

const AttendeeLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const location = useLocation()
  const currentLabel = BREADCRUMBS[location.pathname] || 'Page'
  const isSubPage = location.pathname !== '/attendee'

  useEffect(() => {
    setIsSidebarOpen(false)
  }, [location.pathname])

  return (
    <div className="org-layout att-layout">
      <div 
        className={`org-sidebar-overlay ${isSidebarOpen ? 'open' : ''} lg:hidden block`}
        onClick={() => setIsSidebarOpen(false)}
      />
      <AttendeeSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="org-layout__content">
        {/* Top Bar */}
        <header className="org-topbar">
          <div className="org-topbar__breadcrumb">
            <button 
              className="p-1.5 mr-2 -ml-2 rounded-md transition-colors"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.05)',
                display: 'none', // Hidden on desktop via CSS, shown via media query inline
              }}
              onClick={() => setIsSidebarOpen(true)}
            >
              <div className="lg:hidden block"><MenuIcon /></div>
            </button>
            <style>{`
              @media (max-width: 1024px) {
                .org-topbar__breadcrumb > button { display: block !important; }
              }
            `}</style>
            <Link to="/attendee">Dashboard</Link>
            {isSubPage && (
              <>
                <span className="org-topbar__breadcrumb-sep">›</span>
                <span className="org-topbar__breadcrumb-current">{currentLabel}</span>
              </>
            )}
          </div>
          <div className="org-topbar__actions">
            <ThemeToggle />
          </div>
        </header>

        {/* Page Content with Transition */}
        <main className="org-layout__main">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
              style={{ willChange: 'transform, opacity, filter' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

export default AttendeeLayout
