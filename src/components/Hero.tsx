import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import LiquidBackground from './LiquidBackground'

/* ─── Animation Variants ─── */
const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 25 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] },
})

const Hero: React.FC = () => {
  return (
    <section
      className="min-h-screen flex flex-col items-center justify-center text-center px-6"
      style={{ background: 'var(--bg-primary)', position: 'relative', overflow: 'hidden' }}
    >
      {/* WebGL Liquid Metal Background */}
      <LiquidBackground />

      {/* ─── Content Stack ─── */}
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 820 }}>

        {/* Headline — thin Outfit font like the reference */}
        <motion.h1
          {...fadeUp(0.12)}
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 300,
            fontSize: 'clamp(2.2rem, 8vw, 4.8rem)',
            lineHeight: 1.1,
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
            fontSize: 'clamp(0.88rem, 1.2vw, 1rem)',
            lineHeight: 1.65,
            color: 'var(--text-secondary)',
            maxWidth: 520,
            margin: '0 auto 2.2rem',
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
            gap: '0.75rem',
            justifyContent: 'center',
            marginBottom: '3.5rem',
          }}
        >
          <Link
            to="/organizer"
            className="hero-btn hero-btn--outline"
          >
            Book an Event
          </Link>
          <Link
            to="/register"
            className="hero-btn hero-btn--outline"
          >
            Get Started
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

export default Hero
