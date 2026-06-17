import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import FestForgeLogo from './FestForgeLogo'

const FOOTER_COLUMNS = [
  {
    heading: 'Use cases',
    links: [
      'Student events',
      'Faculty seminars',
      'Club activities',
      'Cultural fests',
      'Hackathons',
      'Sports events',
      'Team collaboration',
    ],
  },
  {
    heading: 'Explore',
    links: [
      'Event calendar',
      'Registration',
      'Speakers',
      'Sponsors',
      'Venue guide',
      'Campus map',
      'Event archive',
    ],
  },
  {
    heading: 'Resources',
    links: [
      'Blog',
      'Best practices',
      'Help center',
      'Guidelines',
      'Support',
      'Developers',
      'Resource library',
    ],
  },
] as const

const LINK_ROUTES: Record<string, string> = {
  'Registration': '/register',
  'Event calendar': '/#event-stage',
  'Student events': '/#event-stage',
  'Hackathons': '/#event-stage',
  'Sports events': '/#event-stage',
  'Cultural fests': '/#event-stage',
  'Club activities': '/#event-stage',
  'Faculty seminars': '/#event-stage',
  'Team collaboration': '/#event-stage',
  'Speakers': '/#event-stage',
  'Sponsors': '/organizer/sponsorships',
}

const XIcon: React.FC = () => (
  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.736-8.857L1.254 2.25H8.08l4.256 5.626Zm-1.161 17.52h1.833L7.084 4.126H5.117Z" />
  </svg>
)

const InstagramIcon: React.FC = () => (
  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069Zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073Zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881Z" />
  </svg>
)

const YouTubeIcon: React.FC = () => (
  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814ZM9.545 15.568V8.432L15.818 12l-6.273 3.568Z" />
  </svg>
)

const LinkedInIcon: React.FC = () => (
  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065Zm1.782 13.019H3.555V9h3.564v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003Z" />
  </svg>
)

const Footer: React.FC = () => {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setSubscribed(true)
    setEmail('')
    setTimeout(() => setSubscribed(false), 5000)
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
    },
  }

  return (
    <motion.footer
      className="relative w-full px-8 pt-20 pb-10 mt-32 overflow-hidden border-t"
      style={{
        background: 'linear-gradient(to bottom, #07070c, #030305)',
        borderColor: 'rgba(255, 255, 255, 0.04)',
      }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      variants={containerVariants}
    >
      {/* Background Mesh Glowing Orbs */}
      <div
        className="absolute top-0 left-1/4 -translate-y-1/2 w-[450px] h-[300px] rounded-full blur-[140px] pointer-events-none opacity-10"
        style={{
          background: 'radial-gradient(circle, #ffffff 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute bottom-0 right-1/4 translate-y-1/3 w-[400px] h-[300px] rounded-full blur-[140px] pointer-events-none opacity-15"
        style={{
          background: 'radial-gradient(circle, #06B6D4 0%, transparent 70%)',
        }}
      />

      {/* Decorative Top Glow Line */}
      <div
        className="absolute top-0 left-0 right-0 h-[1px]"
        style={{
          background: 'linear-gradient(to right, transparent, rgba(255, 255, 255, 0.1), rgba(6, 182, 212, 0.15), transparent)',
        }}
      />

      <div className="max-w-[1200px] mx-auto grid grid-cols-12 gap-y-12 gap-x-8">
        
        {/* Brand Block */}
        <motion.div className="col-span-4 lg:col-span-6 md:col-span-12 flex flex-col items-start" variants={itemVariants}>
          <div className="flex items-center gap-2.5 text-[1.35rem] font-extrabold tracking-tight mb-4 text-[#f0f0f5] font-sans">
            <FestForgeLogo size={22} />
            <span style={{ fontFamily: 'Outfit, sans-serif' }}>FestForge</span>
          </div>
          <p className="text-[0.88rem] leading-relaxed text-[#808095] mb-6 max-w-[320px]">
            Empowering college fests with next-generation event planning, fast registrations, live dashboard analytics, and secure verification systems.
          </p>

          {/* Network Connection Status */}
          <div
            className="flex items-center gap-2 px-3 py-1 rounded-full border mb-6 text-[0.62rem] font-mono tracking-wider"
            style={{
              background: 'rgba(16, 185, 129, 0.05)',
              borderColor: 'rgba(16, 185, 129, 0.15)',
              color: '#10b981',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
            FF_NET // ONLINE
          </div>

          {/* Social Icons */}
          <div className="flex gap-3">
            {[
              { Icon: XIcon, title: 'X', href: '#' },
              { Icon: InstagramIcon, title: 'Instagram', href: '#' },
              { Icon: LinkedInIcon, title: 'LinkedIn', href: '#' },
              { Icon: YouTubeIcon, title: 'YouTube', href: '#' },
            ].map(({ Icon, title, href }) => (
              <a
                key={title}
                href={href}
                title={title}
                className="w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-300 text-[#808095] hover:text-white"
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderColor: 'rgba(255, 255, 255, 0.06)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)'
                  e.currentTarget.style.boxShadow = '0 0 12px rgba(255, 255, 255, 0.08)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <Icon />
              </a>
            ))}
          </div>
        </motion.div>

        {/* Link Columns */}
        {FOOTER_COLUMNS.map((col) => (
          <motion.div key={col.heading} className="col-span-2 lg:col-span-3 md:col-span-4 sm:col-span-6 xs:col-span-12" variants={itemVariants}>
            <h4
              className="text-[0.78rem] font-bold mb-5 uppercase tracking-wider text-[#a0a0b5]"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              {col.heading}
            </h4>
            <ul className="list-none flex flex-col gap-3">
              {col.links.map((link) => (
                <li key={link}>
                  <Link
                    to={LINK_ROUTES[link] || '/'}
                    className="text-[0.84rem] no-underline transition-all duration-200 inline-block text-[#707085] hover:text-[#f0f0f5] hover:translate-x-1"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}

        {/* Newsletter/Stay Connected Column */}
        <motion.div className="col-span-4 lg:col-span-6 md:col-span-12 flex flex-col items-start" variants={itemVariants}>
          <h4
            className="text-[0.78rem] font-bold mb-4 uppercase tracking-wider text-[#a0a0b5]"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            Stay Connected
          </h4>
          <p className="text-[0.85rem] leading-relaxed text-[#808095] mb-5">
            Get the latest event toolkits, volunteering opportunities, and platform updates sent to your inbox.
          </p>

          <form onSubmit={handleSubscribe} className="relative w-full max-w-[340px]">
            <div
              className="flex p-[3px] rounded-xl border transition-all duration-300"
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                borderColor: isFocused ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.06)',
                boxShadow: isFocused ? '0 0 16px rgba(255, 255, 255, 0.05)' : 'none',
              }}
            >
              <input
                type="email"
                required
                placeholder="Enter campus email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="flex-grow bg-transparent px-3 py-2 text-[0.82rem] text-[#f0f0f5] outline-none border-none placeholder-[#505065]"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-[0.78rem] font-bold text-[#08080e] transition-all duration-300 active:scale-95 shadow-lg"
                style={{
                  background: '#f3f4f6',
                  boxShadow: '0 4px 12px rgba(255, 255, 255, 0.05)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#ffffff'
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(255, 255, 255, 0.15)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f3f4f6'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 255, 255, 0.05)'
                }}
              >
                Join
              </button>
            </div>
            
            <AnimatePresence>
              {subscribed && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute left-0 top-full mt-2 text-[0.75rem] text-[#10b981] font-medium"
                >
                  ✓ Subscribed! Thank you for joining the forge.
                </motion.p>
              )}
            </AnimatePresence>
          </form>
        </motion.div>

      </div>

      {/* Bottom bar */}
      <motion.div
        className="max-w-[1200px] mx-auto mt-20 pt-8 flex items-center justify-between text-[0.78rem] text-[#505065] border-t"
        style={{
          borderColor: 'rgba(255, 255, 255, 0.04)',
        }}
        variants={itemVariants}
      >
        <div className="flex flex-col sm:items-start gap-1">
          <span>© 2026 FestForge. All rights reserved.</span>
          <span className="text-[0.7rem] text-[#404055]">Built with high-fidelity WebGL & React.</span>
        </div>

        {/* Footer Bottom Links & Back to Top */}
        <div className="flex items-center gap-6">
          <div className="flex gap-4 md:hidden">
            <a href="#" className="hover:text-[#808095] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[#808095] transition-colors">Terms</a>
            <a href="#" className="hover:text-[#808095] transition-colors">Cookies</a>
          </div>
          
          {/* Back to top button */}
          <button
            onClick={scrollToTop}
            title="Back to top"
            className="p-2.5 rounded-lg border transition-all duration-300 flex items-center justify-center text-[#606075] hover:text-[#f0f0f5]"
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              borderColor: 'rgba(255, 255, 255, 0.06)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)'
            }}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
              <path d="m18 15-6-6-6 6"/>
            </svg>
          </button>
        </div>
      </motion.div>
    </motion.footer>
  )
}

export default Footer
