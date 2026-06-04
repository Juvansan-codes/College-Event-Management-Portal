import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from './ThemeProvider'

const SunIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
)

const MoonIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
)

const MonitorIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
)

const CYCLE: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system']

const LABELS: Record<string, string> = {
  light: 'Light mode',
  dark: 'Dark mode',
  system: 'System mode',
}

const ICONS: Record<string, React.FC> = {
  light: SunIcon,
  dark: MoonIcon,
  system: MonitorIcon,
}

const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme()

  const handleClick = () => {
    const currentIndex = CYCLE.indexOf(theme)
    const nextIndex = (currentIndex + 1) % CYCLE.length
    setTheme(CYCLE[nextIndex])
  }

  const Icon = ICONS[theme]

  return (
    <button
      className="theme-toggle"
      onClick={handleClick}
      aria-label={LABELS[theme]}
      title={LABELS[theme]}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={theme}
          initial={{ scale: 0.5, opacity: 0, rotate: -30 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          exit={{ scale: 0.5, opacity: 0, rotate: 30 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Icon />
        </motion.span>
      </AnimatePresence>
    </button>
  )
}

export default ThemeToggle
