import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import FestForgeLogo from './FestForgeLogo'
import ThemeToggle from './ThemeToggle'
import { useAuth } from '../contexts/AuthContext'

const Navbar: React.FC = () => {
  const { user, role, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const isLoggedIn = Boolean(user)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const dashboardPath = role === 'organizer' ? '/organizer' : '/attendee'
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'
  const initials = displayName
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const handleSignOut = async () => {
    await signOut()
    setMobileMenuOpen(false)
    navigate('/')
  }

  const handleScrollLink = (e: React.MouseEvent<HTMLAnchorElement>, to: string) => {
    if (to.startsWith('/#')) {
      const sectionId = to.slice(2)
      const el = document.getElementById(sectionId)
      if (el) {
        e.preventDefault()
        el.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    e.currentTarget.style.setProperty('--mouse-x', `${x}px`)
    e.currentTarget.style.setProperty('--mouse-y', `${y}px`)
  }

  const isActive = (to: string) => {
    if (to.startsWith('/#')) {
      const sectionId = to.slice(2)
      return (
        location.pathname === '/' &&
        (location.hash === `#${sectionId}` || (!location.hash && sectionId === 'event-stage'))
      )
    }
    return location.pathname === to || location.pathname.startsWith(to)
  }

  /* Navigation links change based on auth state */
  const navLinks = isLoggedIn
    ? [
        { label: 'Events', to: '/#event-stage' },
        { label: 'Dashboard', to: dashboardPath },
      ]
    : [
        { label: 'Events', to: '/#event-stage' },
        { label: 'Organizer Portal', to: '/organizer' },
      ]

  return (
    <nav className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex flex-col w-[calc(100%-2.5rem)] max-w-[1200px] pointer-events-none select-none">
      <div className="flex items-center justify-between gap-4 w-full">
        {/* ─── Brand Module (Left) ─── */}
        <div
          className="hud-panel pointer-events-auto flex items-center px-5 h-[52px] rounded-[14px]"
          onMouseMove={handleMouseMove}
        >
          <div className="hud-panel-sheen" />
          <div className="hud-corner hud-corner-tl" />
          <div className="hud-corner hud-corner-tr" />
          <div className="hud-corner hud-corner-bl" />
          <div className="hud-corner hud-corner-br" />

          <Link
            to="/"
            className="flex items-center gap-2 text-[1.12rem] font-extrabold tracking-tight no-underline z-10"
            style={{ color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif' }}
          >
            <FestForgeLogo size={20} />
            <span style={{ fontWeight: 400, letterSpacing: '-0.02em' }}>
              Fest<span style={{ fontWeight: 700 }}>Forge</span>
            </span>
          </Link>
        </div>

        {/* ─── Navigation links Module (Center) ─── */}
        <div
          className="hud-panel pointer-events-auto hidden md:flex items-center gap-2 px-3 h-[52px] rounded-[14px]"
          onMouseMove={handleMouseMove}
        >
          <div className="hud-panel-sheen" />
          <div className="hud-corner hud-corner-tl" />
          <div className="hud-corner hud-corner-tr" />
          <div className="hud-corner hud-corner-bl" />
          <div className="hud-corner hud-corner-br" />

          {navLinks.map((col) => {
            const active = isActive(col.to)
            return (
              <Link
                key={col.label}
                to={col.to}
                className="relative px-4 py-1.5 rounded-lg text-[0.82rem] font-medium no-underline transition-all duration-300 z-10"
                style={{
                  color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontFamily: 'Outfit, sans-serif',
                  letterSpacing: '0.04em',
                }}
                onMouseEnter={(e) => {
                  if (!active) e.currentTarget.style.color = 'var(--text-primary)'
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.color = 'var(--text-secondary)'
                }}
                onClick={(e) => handleScrollLink(e, col.to)}
              >
                <span className="relative z-10">{col.label}</span>
                {active && (
                  <motion.div
                    layoutId="activeNavTab"
                    className="absolute inset-0 rounded-[8px] -z-10"
                    style={{
                      background: 'var(--bg-active-tab)',
                      border: '1px solid var(--border-active-tab)',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                    }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            )
          })}
        </div>

        {/* ─── Action/Auth Module (Right) ─── */}
        <div
          className="hud-panel pointer-events-auto flex items-center gap-3 px-3 h-[52px] rounded-[14px]"
          onMouseMove={handleMouseMove}
        >
          <div className="hud-panel-sheen" />
          <div className="hud-corner hud-corner-tl" />
          <div className="hud-corner hud-corner-tr" />
          <div className="hud-corner hud-corner-bl" />
          <div className="hud-corner hud-corner-br" />

          <div className="flex items-center gap-2 z-10">
            <ThemeToggle />

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg border border-white/5 dark:border-white/5 border-black/5 bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/[0.18] text-current cursor-pointer transition-all duration-200"
            >
              {mobileMenuOpen ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              )}
            </button>

            {isLoggedIn ? (
              <>
                <Link
                  to={dashboardPath}
                  className="flex items-center gap-2 px-2.5 py-[5px] rounded-lg no-underline transition-all duration-200 border border-white/5 dark:border-white/5 border-black/5 bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/[0.18]"
                >
                  <span
                    className="flex items-center justify-center w-[22px] h-[22px] rounded-full text-[0.62rem] font-bold"
                    style={{
                      background:
                        role === 'organizer'
                          ? 'linear-gradient(135deg, #2a2b36, #16171f)'
                          : 'linear-gradient(135deg, #132d3e, #0a1b26)',
                      color: '#fff',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    {initials}
                  </span>
                  <span
                    className="text-[0.78rem] font-medium max-w-[80px] truncate"
                    style={{ color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif' }}
                  >
                    {displayName}
                  </span>
                </Link>

                <button
                  onClick={handleSignOut}
                  className="px-[12px] py-[5px] rounded-lg text-[0.78rem] font-semibold cursor-pointer transition-all duration-200 border border-white/5 dark:border-white/5 border-black/5 bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/[0.18] hover:text-white"
                  style={{
                    color: 'var(--text-secondary)',
                    fontFamily: 'Outfit, sans-serif',
                  }}
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/signin"
                  className="px-3 py-[5px] rounded-lg text-[0.78rem] font-semibold cursor-pointer transition-all duration-200 border border-white/5 dark:border-white/5 border-black/5 bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/[0.18] hover:text-white"
                  style={{
                    color: 'var(--text-secondary)',
                    fontFamily: 'Outfit, sans-serif',
                  }}
                >
                  Sign in
                </Link>

                <Link
                  to="/register"
                  className="px-3.5 py-[5px] rounded-lg text-[0.78rem] font-semibold cursor-pointer hover:-translate-y-px transition-all duration-200 border"
                  style={{
                    background: 'var(--text-primary)',
                    color: 'var(--bg-primary)',
                    borderColor: 'transparent',
                    fontFamily: 'Outfit, sans-serif',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.9'
                    e.currentTarget.style.boxShadow = '0 0 12px rgba(255, 255, 255, 0.15)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ─── Mobile Menu Dropdown Panel (Below) ─── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="w-full mt-3 hud-panel pointer-events-auto flex flex-col gap-2 p-3 rounded-[14px] md:hidden z-40"
            onMouseMove={handleMouseMove}
          >
            <div className="hud-panel-sheen" />
            <div className="hud-corner hud-corner-tl" />
            <div className="hud-corner hud-corner-tr" />
            <div className="hud-corner hud-corner-bl" />
            <div className="hud-corner hud-corner-br" />

            {navLinks.map((col) => {
              const active = isActive(col.to)
              return (
                <Link
                  key={col.label}
                  to={col.to}
                  className="px-4 py-2.5 rounded-lg text-[0.84rem] font-semibold no-underline transition-all duration-200 z-10 text-left border border-transparent"
                  style={{
                    color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                    background: active ? 'var(--bg-active-tab)' : 'transparent',
                    borderColor: active ? 'var(--border-active-tab)' : 'transparent',
                    fontFamily: 'Outfit, sans-serif',
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'
                      e.currentTarget.style.color = 'var(--text-primary)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = 'var(--text-secondary)'
                    }
                  }}
                  onClick={(e) => {
                    setMobileMenuOpen(false)
                    handleScrollLink(e, col.to)
                  }}
                >
                  {col.label}
                </Link>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

export default Navbar
