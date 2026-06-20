import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import LiquidBackground from './LiquidBackground'
import { useAuth } from '../contexts/AuthContext'

/* ─── Animation Variants ─── */
const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 25 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] },
})

const Hero: React.FC = () => {
  const { user, role } = useAuth()

  let primaryBtnText = "Book an Event"
  let primaryBtnLink = "/attendee/events"
  let secondaryBtnText = "Get Started"
  let secondaryBtnLink = "/register"

  if (user) {
    if (role === 'organizer') {
      primaryBtnText = "Create Event"
      primaryBtnLink = "/organizer/new-event"
      secondaryBtnText = "Dashboard"
      secondaryBtnLink = "/organizer"
    } else {
      primaryBtnText = "Browse Events"
      primaryBtnLink = "/attendee/events"
      secondaryBtnText = "My Tickets"
      secondaryBtnLink = "/attendee/my-tickets"
    }
  }

  return (
    <section
      className="min-h-[100dvh] flex flex-col items-center pt-[24vh] md:pt-0 md:justify-center text-center px-6 pb-12 md:pb-0"
      style={{ background: 'var(--bg-primary)', position: 'relative', overflow: 'hidden' }}
    >
      {/* WebGL Liquid Metal Background */}
      <LiquidBackground />

      {/* Ambient overlay to ensure contrast/readability of text over dynamic WebGL blobs */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 38%, var(--bg-primary) 0%, transparent 65%)',
          opacity: 0.65,
          zIndex: 1,
        }}
      />

      {/* ─── Content Stack ─── */}
      <div style={{ position: 'relative', zIndex: 2, maxWidth: 820, width: '100%' }}>

        {/* Headline — thin Outfit font like the reference */}
        <motion.h1
          {...fadeUp(0.12)}
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 300,
            fontSize: 'clamp(2.8rem, 8vw, 5rem)',
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            color: 'var(--text-primary)',
            marginBottom: '1.5rem',
          }}
        >
          Events that you<br />
          forge Together
        </motion.h1>

        {/* Sub-description */}
        <motion.p
          {...fadeUp(0.24)}
          style={{
            fontSize: 'clamp(1rem, 1.5vw, 1.15rem)',
            lineHeight: 1.6,
            color: 'var(--text-secondary)',
            maxWidth: 520,
            margin: '0 auto clamp(3.5rem, 15vh, 10rem)', // Significantly increased to push buttons down
          }}
        >
          Plan, manage, and experience unforgettable college festivals.
          Showcase your story through bold events and strategic organization.
        </motion.p>

        {/* CTA Buttons — both outlined like the reference */}
        <motion.div
          {...fadeUp(0.36)}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            justifyContent: 'center',
            marginBottom: '3.5rem',
          }}
        >
          <Link
            to={primaryBtnLink}
            className="hero-btn hero-btn--outline"
          >
            {primaryBtnText}
          </Link>
          <Link
            to={secondaryBtnLink}
            className="hero-btn hero-btn--outline"
          >
            {secondaryBtnText}
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

export default Hero
