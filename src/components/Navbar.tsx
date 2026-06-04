import React from 'react'
import FestForgeLogo from './FestForgeLogo'
import ThemeToggle from './ThemeToggle'

const NAV_LINKS = [
  'Students Events',
  'Faculty',
  'Collaborators',
  'Event Partnerships',
  'Pricing',
  'Contact',
] as const

const Navbar: React.FC = () => {
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
      {/* Logo */}
      <a
        href="#"
        className="flex items-center gap-2 text-[1.3rem] font-extrabold tracking-tight no-underline"
        style={{ color: 'var(--text-primary)' }}
      >
        <FestForgeLogo size={22} />
        FestForge
      </a>

      {/* Nav links — hidden on mobile */}
      <ul className="hidden md:flex items-center gap-7 list-none">
        {NAV_LINKS.map((link) => (
          <li key={link}>
            <a
              href="#"
              className="text-[0.88rem] font-medium no-underline transition-colors duration-200"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >
              {link}
            </a>
          </li>
        ))}
      </ul>

      {/* Actions */}
      <div className="flex items-center gap-2.5">
        <ThemeToggle />
        <button
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
        </button>
        <button
          className="px-[18px] py-[7px] rounded-lg border-none text-[0.85rem] font-semibold cursor-pointer hover:-translate-y-px transition-all duration-200"
          style={{
            background: 'var(--btn-primary-bg)',
            color: 'var(--btn-primary-text)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--btn-primary-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--btn-primary-bg)')}
        >
          Register
        </button>
      </div>
    </nav>
  )
}

export default Navbar
