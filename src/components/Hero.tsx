import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const Hero: React.FC = () => {
  return (
    <section
      className="min-h-[calc(100vh-60px)] flex flex-col justify-center items-center text-center px-10 pt-[60px] pb-10 md:px-5 md:pt-10 md:pb-[30px]"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Headline */}
      <motion.h1
        className="text-[clamp(2.6rem,7vw,5rem)] leading-[1.08] font-extrabold tracking-[-0.05em] max-w-[780px] mb-5"
        style={{ color: 'var(--text-primary)' }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        FestForge
      </motion.h1>

      {/* Tagline */}
      <motion.p
        className="text-[1.05rem] mb-9 italic"
        style={{ color: 'var(--text-secondary)' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
      >
        "Make your dream college fest come true"
      </motion.p>

      {/* CTA buttons */}
      <motion.div
        className="flex gap-3 mb-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
      >
        <Link
          to="/organizer"
          className="px-[22px] py-2.5 rounded-lg text-[0.9rem] font-semibold cursor-pointer transition-all duration-200 no-underline"
          style={{
            border: '1px solid var(--btn-secondary-border)',
            background: 'var(--bg-card)',
            color: 'var(--btn-secondary-text)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-hover)'
            e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--btn-secondary-border)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          Book an Event
        </Link>
        <Link
          to="/register"
          className="px-[22px] py-2.5 rounded-lg border-none text-[0.9rem] font-semibold cursor-pointer hover:-translate-y-px transition-all duration-200 no-underline"
          style={{
            background: 'var(--btn-primary-bg)',
            color: 'var(--btn-primary-text)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--btn-primary-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--btn-primary-bg)')}
        >
          Register
        </Link>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="scroll-indicator"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.8 }}
      >
        <div className="scroll-indicator__mouse">
          <div className="scroll-indicator__dot" />
        </div>
        <span>Scroll to explore</span>
      </motion.div>
    </section>
  )
}

export default Hero
