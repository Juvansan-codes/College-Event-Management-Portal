import React, { useState, useEffect } from 'react'
import { Outlet, useLocation, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import OrganizerSidebar from './OrganizerSidebar'
import ThemeToggle from '../../components/ThemeToggle'
import { EventProvider } from '../../contexts/EventContext'
import '../organizer.css'

/* ─── Breadcrumb Mapping ─── */
const BREADCRUMBS: Record<string, string> = {
  '/organizer': 'Events',
  '/organizer/new-event': 'Create Event',
  '/organizer/dashboard': 'Dashboard',
  '/organizer/certifications': 'Certifications',
  '/organizer/agenda': 'Agenda Planner',
  '/organizer/sponsorships': 'Sponsorships',
  '/organizer/tickets': 'Tickets',
  '/organizer/polls': 'Polls',
  '/organizer/attendance': 'QR Attendance',
  '/organizer/settings': 'Settings',
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

const OrganizerLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const location = useLocation()
  const currentLabel = BREADCRUMBS[location.pathname] || 'Page'
  const isSubPage = location.pathname !== '/organizer'

  useEffect(() => {
    setIsSidebarOpen(false)
  }, [location.pathname])

  return (
    <EventProvider>
      <div className="org-layout">
        <div 
          className={`org-sidebar-overlay ${isSidebarOpen ? 'open' : ''} lg:hidden block`}
          onClick={() => setIsSidebarOpen(false)}
        />
        <OrganizerSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

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
              <Link to="/organizer">Events</Link>
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
    </EventProvider>
  )
}

export default OrganizerLayout
