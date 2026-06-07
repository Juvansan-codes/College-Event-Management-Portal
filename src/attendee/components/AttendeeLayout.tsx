import React from 'react'
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

const AttendeeLayout: React.FC = () => {
  const location = useLocation()
  const currentLabel = BREADCRUMBS[location.pathname] || 'Page'
  const isSubPage = location.pathname !== '/attendee'

  return (
    <div className="org-layout att-layout">
      <AttendeeSidebar />

      <div className="org-layout__content">
        {/* Top Bar */}
        <header className="org-topbar">
          <div className="org-topbar__breadcrumb">
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
