import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import FestForgeLogo from './FestForgeLogo'
import ThemeToggle from './ThemeToggle'
import { useAuth } from '../contexts/AuthContext'

const Navbar: React.FC = () => {
  const { user, role, signOut } = useAuth()
  const navigate = useNavigate()
  const isLoggedIn = Boolean(user)

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
    <nav
      className="sticky top-0 z-50 flex items-center justify-between px-10 h-[60px]"
      style={{
        background: 'var(--bg-navbar)',
        borderBottom: '1px solid var(--border-color)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      <Link
        to="/"
        className="flex items-center gap-2 text-[1.3rem] font-extrabold tracking-tight no-underline"
        style={{ color: 'var(--text-primary)' }}
      >
        <FestForgeLogo size={22} />
        FestForge
      </Link>

      <ul className="hidden md:flex items-center gap-7 list-none">
        {navLinks.map((link, index) => (
          <motion.li 
            key={link.label}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
          >
            <Link
              to={link.to}
              className="text-[0.88rem] font-medium no-underline transition-all duration-300 relative pb-1"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--text-primary)'
                const underline = e.currentTarget.querySelector('::after')
              }}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
              onClick={(e) => handleScrollLink(e, link.to)}
            >
              {link.label}
              <motion.div
                className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-transparent via-current to-transparent"
                initial={{ width: 0 }}
                whileHover={{ width: '100%' }}
                transition={{ duration: 0.3 }}
              />
            </Link>
          </motion.li>
        ))}
      </ul>

      <div className="flex items-center gap-2.5">
        <ThemeToggle />

        {isLoggedIn ? (
          /* ─── Logged-in state ─── */
          <>
            <Link
              to={dashboardPath}
              className="flex items-center gap-2 px-3 py-[6px] rounded-lg no-underline transition-all duration-200"
              style={{
                background: 'var(--btn-secondary-bg)',
                border: '1px solid var(--btn-secondary-border)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--btn-secondary-hover-bg)'
                e.currentTarget.style.borderColor = 'var(--border-hover)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--btn-secondary-bg)'
                e.currentTarget.style.borderColor = 'var(--btn-secondary-border)'
              }}
            >
              {/* Avatar circle */}
              <span
                className="flex items-center justify-center w-[26px] h-[26px] rounded-full text-[0.65rem] font-bold"
                style={{
                  background: role === 'organizer'
                    ? 'linear-gradient(135deg, #6C5CE7, #A29BFE)'
                    : 'linear-gradient(135deg, #10B981, #34D399)',
                  color: '#fff',
                }}
              >
                {initials}
              </span>
              <span
                className="text-[0.82rem] font-semibold max-w-[100px] truncate"
                style={{ color: 'var(--text-primary)' }}
              >
                {displayName}
              </span>
            </Link>

            <button
              onClick={handleSignOut}
              className="px-[14px] py-[7px] rounded-lg text-[0.82rem] font-semibold cursor-pointer transition-all duration-200"
              style={{
                border: '1px solid var(--btn-secondary-border)',
                background: 'var(--btn-secondary-bg)',
                color: 'var(--btn-secondary-text)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--btn-secondary-hover-bg)'
                e.currentTarget.style.borderColor = 'var(--border-hover)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--btn-secondary-bg)'
                e.currentTarget.style.borderColor = 'var(--btn-secondary-border)'
              }}
            >
              Sign out
            </button>
          </>
        ) : (
          /* ─── Logged-out state ─── */
          <>
            <Link
              to="/signin"
              className="px-[18px] py-[7px] rounded-lg text-[0.85rem] font-semibold cursor-pointer transition-all duration-200"
              style={{
                border: '1px solid var(--btn-secondary-border)',
                background: 'var(--btn-secondary-bg)',
                color: 'var(--btn-secondary-text)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--btn-secondary-hover-bg)'
                e.currentTarget.style.borderColor = 'var(--border-hover)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--btn-secondary-bg)'
                e.currentTarget.style.borderColor = 'var(--btn-secondary-border)'
              }}
            >
              Sign in
            </Link>

            <Link
              to="/register"
              className="px-[18px] py-[7px] rounded-lg border-none text-[0.85rem] font-semibold cursor-pointer hover:-translate-y-px transition-all duration-200"
              style={{
                background: 'var(--btn-primary-bg)',
                color: 'var(--btn-primary-text)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--btn-primary-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--btn-primary-bg)')}
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}

export default Navbar
