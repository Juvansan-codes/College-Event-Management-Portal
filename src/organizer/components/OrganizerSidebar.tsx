import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import FestForgeLogo from '../../components/FestForgeLogo'
import { useEvent } from '../../contexts/EventContext'

/* ─── SVG Icon Components ─── */
const DashboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="9" rx="1" />
    <rect x="14" y="3" width="7" height="5" rx="1" />
    <rect x="14" y="12" width="7" height="9" rx="1" />
    <rect x="3" y="16" width="7" height="5" rx="1" />
  </svg>
)

const CertIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="M12 18v-6" />
    <path d="m9 15 3 3 3-3" />
  </svg>
)

const AgendaIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <path d="m9 16 2 2 4-4" />
  </svg>
)

const SponsorIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2 L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2z" />
  </svg>
)

const TicketIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
    <path d="M13 5v2" />
    <path d="M13 17v2" />
    <path d="M13 11v2" />
  </svg>
)

const PollIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
)

const QrIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <path d="M14 14h3v3h-3zM18 18h3v3h-3zM18 14h3M14 18v3" />
  </svg>
)

const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
)

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
)

const SwitchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" />
    <polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
  </svg>
)

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
)

interface NavItem {
  to: string
  label: string
  icon: React.ReactNode
  exact?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { to: '/organizer/dashboard', label: 'Dashboard', icon: <DashboardIcon />, exact: true },
  { to: '/organizer/certifications', label: 'Certifications', icon: <CertIcon /> },
  { to: '/organizer/agenda', label: 'Agenda Planner', icon: <AgendaIcon /> },
  { to: '/organizer/sponsorships', label: 'Sponsorships', icon: <SponsorIcon /> },
  { to: '/organizer/tickets', label: 'Tickets', icon: <TicketIcon /> },
  { to: '/organizer/attendance', label: 'QR Attendance', icon: <QrIcon /> },
  { to: '/organizer/polls', label: 'Polls', icon: <PollIcon /> },
]

interface OrganizerSidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

const OrganizerSidebar: React.FC<OrganizerSidebarProps> = ({ isOpen = false, onClose }) => {
  const location = useLocation()
  const { activeEvent } = useEvent()

  const isActive = (item: NavItem) => {
    if (item.exact) return location.pathname === item.to
    return location.pathname.startsWith(item.to)
  }

  /* Hide tool nav items when no event is selected (on event picker / create event pages) */
  const isEventSelected = Boolean(activeEvent)

  return (
    <aside className={`org-sidebar ${isOpen ? 'open' : ''}`}>
      {/* Brand */}
      <div className="flex items-center justify-between px-5 pt-6 pb-4">
        <Link to="/organizer" className="flex items-center gap-2.5 text-[1.15rem] font-bold tracking-tight text-[var(--org-text-primary)] no-underline" style={{ fontFamily: "'General Sans', sans-serif" }}>
          <FestForgeLogo size={20} />
          FestForge
        </Link>
        <button 
          className="lg:hidden p-1.5 -mr-1 rounded-md text-[var(--org-text-secondary)] hover:text-[var(--org-text-primary)] transition-colors hover:bg-white/5"
          onClick={onClose}
        >
          <CloseIcon />
        </button>
      </div>

      {/* Active Event Display */}
      {isEventSelected && (
        <>
          <div className="org-sidebar__label">Active Event</div>
          <div className="org-sidebar__active-event">
            <div className="org-sidebar__active-event-name">
              {activeEvent!.name}
            </div>
            <div className="org-sidebar__active-event-meta">
              {activeEvent!.status} · {activeEvent!.category}
            </div>
          </div>

          {/* Switch Event Link */}
          <div style={{ padding: '0 0.6rem', marginBottom: '0.25rem' }}>
            <Link
              to="/organizer"
              className="org-sidebar__item"
              style={{ fontSize: '0.78rem' }}
            >
              <span className="org-sidebar__item-icon"><SwitchIcon /></span>
              Switch Event
            </Link>
          </div>

          <div className="org-sidebar__divider" />
        </>
      )}

      {/* Tool Navigation — only when an event is selected */}
      {isEventSelected && (
        <>
          <div className="org-sidebar__label">Organizer Tools</div>
          <nav className="org-sidebar__nav">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`org-sidebar__item ${isActive(item) ? 'active' : ''}`}
              >
                <span className="org-sidebar__item-icon">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </>
      )}

      {/* Footer */}
      <div className="org-sidebar__footer">
        <Link to="/organizer/settings" className={`org-sidebar__item ${location.pathname.startsWith('/organizer/settings') ? 'active' : ''}`}>
          <span className="org-sidebar__item-icon"><SettingsIcon /></span>
          Settings
        </Link>
        <Link to="/" className="org-sidebar__item">
          <span className="org-sidebar__item-icon"><HomeIcon /></span>
          Back to Home
        </Link>
      </div>
    </aside>
  )
}

export default OrganizerSidebar
