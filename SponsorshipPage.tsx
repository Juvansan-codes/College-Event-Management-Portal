/**
 * FestForge — Sponsorship Page
 * Public-facing page for potential sponsors.
 * Drop into: src/pages/SponsorshipPage.tsx
 * Route:     <Route path="/sponsor" element={<SponsorshipPage />} />
 * Deps:      framer-motion (already in project), react-router-dom
 */

import React, { useState, useEffect, useRef } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { sponsorshipService } from './src/services'

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */
interface Tier {
  id: string
  name: string
  price: string
  priceNum: number
  tag: string
  slots: number
  slotsLeft: number
  perks: string[]
  highlight: boolean
}

interface Stat {
  value: string
  label: string
  suffix?: string
}

interface FAQ {
  q: string
  a: string
}

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */
const TIERS: Tier[] = [
  {
    id: 'bronze',
    name: 'Bronze',
    price: '₹5,000',
    priceNum: 5000,
    tag: 'Entry',
    slots: 10,
    slotsLeft: 7,
    highlight: false,
    perks: [
      'Logo in digital event brochure',
      '2 General Admission passes',
      'Social media mention (1×)',
      'Certificate of partnership',
    ],
  },
  {
    id: 'silver',
    name: 'Silver',
    price: '₹10,000',
    priceNum: 10000,
    tag: 'Popular',
    slots: 8,
    slotsLeft: 5,
    highlight: false,
    perks: [
      'Logo on event website footer',
      'Official brochure placement',
      '4 General Admission passes',
      'Social media feature (3×)',
      'On-site banner slot (shared)',
    ],
  },
  {
    id: 'gold',
    name: 'Gold',
    price: '₹25,000',
    priceNum: 25000,
    tag: 'Best Value',
    slots: 5,
    slotsLeft: 3,
    highlight: true,
    perks: [
      'Logo on homepage hero banner',
      'Dedicated exhibit booth',
      '6 VIP passes',
      'Featured in newsletter (2×)',
      'Stage shoutout during event',
      'Exclusive branded giveaway slot',
    ],
  },
  {
    id: 'platinum',
    name: 'Platinum',
    price: '₹50,000',
    priceNum: 50000,
    tag: 'Flagship',
    slots: 3,
    slotsLeft: 1,
    highlight: false,
    perks: [
      'Title sponsor naming rights',
      'Main stage LED banner rotation',
      '12 VIP passes + green room access',
      'Keynote panel seat',
      'Press release co-authored with FestForge',
      'Priority exhibit booth (double)',
      'Post-event analytics report',
    ],
  },
]

const STATS: Stat[] = [
  { value: '4,200', label: 'Registered attendees across events' },
  { value: '18', label: 'Events hosted this academic year' },
  { value: '92', label: 'Brand recall rate among attendees', suffix: '%' },
  { value: '3.4×', label: 'Average ROI reported by sponsors' },
]

const FAQS: FAQ[] = [
  {
    q: 'Who attends FestForge events?',
    a: 'Our audience is primarily undergraduate and postgraduate students aged 18–26, with a strong tilt toward engineering, design, and business disciplines. Each event draws 200–800 verified college attendees.',
  },
  {
    q: 'How is sponsorship visibility measured?',
    a: 'We provide a post-event analytics report covering logo impressions, social media reach, QR scan counts from your booth, and pass utilisation data — available to Gold and Platinum partners.',
  },
  {
    q: 'Can I sponsor a single event rather than the full fest?',
    a: 'Yes. Sponsorship can be scoped to a single named event (hackathon, cultural night, etc.) or applied across the full festival run. Mention your preference in the interest form and we will tailor a package.',
  },
  {
    q: 'What is the payment and confirmation timeline?',
    a: 'We reach out within 3 working days of receiving your interest form. Slots are confirmed upon receipt of 50% advance payment. Full payment is due 7 days before the event.',
  },
  {
    q: 'Can we customise a package beyond the listed tiers?',
    a: 'Absolutely. Bespoke arrangements — product launches, live demos, prize sponsorship, scholarship announcements — are welcome. Reach out directly and we will scope it together.',
  },
]

const REACH_ITEMS = [
  { icon: '◉', label: 'Campus Footfall', value: '8,000+ students' },
  { icon: '◈', label: 'Social Followers', value: '12K across platforms' },
  { icon: '◎', label: 'Event Duration', value: '3-day festival format' },
  { icon: '◆', label: 'Press Coverage', value: 'Campus & regional media' },
]

/* ─────────────────────────────────────────────
   ANIMATION HELPERS
───────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] },
  }),
}

const staggerParent = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
}

/* ─────────────────────────────────────────────
   ANIMATED COUNTER
───────────────────────────────────────────── */
const AnimatedCounter: React.FC<{ target: string; suffix?: string }> = ({ target, suffix }) => {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const [display, setDisplay] = useState('0')

  useEffect(() => {
    if (!inView) return
    const num = parseFloat(target.replace(/[^0-9.]/g, ''))
    const isFloat = target.includes('.')
    const hasX = target.includes('×')
    const prefix = target.match(/^[^0-9]*/)?.[0] ?? ''
    const duration = 1400
    const steps = 50
    let step = 0
    const interval = setInterval(() => {
      step++
      const progress = step / steps
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = num * eased
      const formatted = isFloat ? current.toFixed(1) : Math.round(current).toLocaleString()
      setDisplay(`${prefix}${formatted}${hasX ? '×' : ''}`)
      if (step >= steps) {
        setDisplay(target)
        clearInterval(interval)
      }
    }, duration / steps)
    return () => clearInterval(interval)
  }, [inView, target])

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  )
}

/* ─────────────────────────────────────────────
   SECTION WRAPPER
───────────────────────────────────────────── */
const Section: React.FC<{
  children: React.ReactNode
  id?: string
  className?: string
  style?: React.CSSProperties
}> = ({ children, id, className = '', style }) => {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={staggerParent}
      id={id}
      className={className}
      style={style}
    >
      {children}
    </motion.section>
  )
}

/* ─────────────────────────────────────────────
   FAQ ITEM
───────────────────────────────────────────── */
const FAQItem: React.FC<{ faq: FAQ; index: number }> = ({ faq, index }) => {
  const [open, setOpen] = useState(false)
  return (
    <motion.div
      variants={fadeUp}
      custom={index * 0.05}
      style={{
        borderBottom: '1px solid #1e1e1e',
        overflow: 'hidden',
      }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.25rem 0',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          gap: '1rem',
        }}
      >
        <span
          style={{
            fontFamily: "'Outfit', 'Inter', sans-serif",
            fontSize: '0.95rem',
            fontWeight: 500,
            color: '#e8e8e8',
            lineHeight: 1.4,
          }}
        >
          {faq.q}
        </span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.25 }}
          style={{
            flexShrink: 0,
            width: 22,
            height: 22,
            display: 'grid',
            placeItems: 'center',
            border: '1px solid #333',
            borderRadius: '50%',
            color: '#888',
            fontSize: '1rem',
            lineHeight: 1,
          }}
        >
          +
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <p
              style={{
                padding: '0 0 1.25rem 0',
                fontSize: '0.875rem',
                lineHeight: 1.7,
                color: '#888',
                maxWidth: 680,
              }}
            >
              {faq.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────
   INTEREST FORM
───────────────────────────────────────────── */
const InterestForm: React.FC = () => {
  const [form, setForm] = useState({
    company: '',
    contact: '',
    email: '',
    tier: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!form.company || !form.email) return
    setIsSubmitting(true)
    setError(null)

    const { error: submitError } = await sponsorshipService.createInquiry({
      company: form.company,
      contact_name: form.contact || null,
      email: form.email,
      interested_tier: form.tier || null,
      message: form.message || null,
    })

    setIsSubmitting(false)
    if (submitError) {
      setError(submitError)
      return
    }

    setSubmitted(true)
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          border: '1px solid #222',
          borderRadius: '1rem',
          background: '#0d0d0d',
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            border: '2px solid #fff',
            display: 'grid',
            placeItems: 'center',
            margin: '0 auto 1.5rem',
            fontSize: '1.4rem',
          }}
        >
          ✓
        </div>
        <h3
          style={{
            fontFamily: "'Outfit', 'Inter', sans-serif",
            fontSize: '1.3rem',
            fontWeight: 600,
            color: '#fff',
            marginBottom: '0.5rem',
          }}
        >
          Interest received
        </h3>
        <p style={{ color: '#666', fontSize: '0.875rem', lineHeight: 1.6 }}>
          Our partnerships team will reach out to {form.email} within 3 working days.
        </p>
      </motion.div>
    )
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: '#0d0d0d',
    border: '1px solid #222',
    borderRadius: '0.5rem',
    padding: '0.75rem 1rem',
    color: '#e8e8e8',
    fontSize: '0.875rem',
    outline: 'none',
    fontFamily: "'Inter', sans-serif",
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
    fontSize: '0.75rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: '#555',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <label style={labelStyle}>
          Company / Brand
          <input
            style={inputStyle}
            placeholder="Acme Corp"
            value={form.company}
            onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))}
            onFocus={(e) => (e.target.style.borderColor = '#555')}
            onBlur={(e) => (e.target.style.borderColor = '#222')}
          />
        </label>
        <label style={labelStyle}>
          Contact Name
          <input
            style={inputStyle}
            placeholder="Priya Sharma"
            value={form.contact}
            onChange={(e) => setForm((p) => ({ ...p, contact: e.target.value }))}
            onFocus={(e) => (e.target.style.borderColor = '#555')}
            onBlur={(e) => (e.target.style.borderColor = '#222')}
          />
        </label>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <label style={labelStyle}>
          Work Email *
          <input
            style={inputStyle}
            type="email"
            placeholder="partnerships@acme.com"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            onFocus={(e) => (e.target.style.borderColor = '#555')}
            onBlur={(e) => (e.target.style.borderColor = '#222')}
          />
        </label>
        <label style={labelStyle}>
          Interested Tier
          <select
            style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
            value={form.tier}
            onChange={(e) => setForm((p) => ({ ...p, tier: e.target.value }))}
            onFocus={(e) => (e.target.style.borderColor = '#555')}
            onBlur={(e) => (e.target.style.borderColor = '#222')}
          >
            <option value="">Select a tier…</option>
            <option value="Bronze">Bronze — ₹5,000</option>
            <option value="Silver">Silver — ₹10,000</option>
            <option value="Gold">Gold — ₹25,000</option>
            <option value="Platinum">Platinum — ₹50,000</option>
            <option value="Custom">Custom Package</option>
          </select>
        </label>
      </div>

      <label style={labelStyle}>
        Anything specific in mind?
        <textarea
          style={{ ...inputStyle, minHeight: 90, resize: 'vertical' }}
          placeholder="Product launch, scholarship, live demo, or just general interest…"
          value={form.message}
          onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
          onFocus={(e) => (e.target.style.borderColor = '#555')}
          onBlur={(e) => (e.target.style.borderColor = '#222')}
        />
      </label>

      <button
        onClick={handleSubmit}
        disabled={!form.company || !form.email || isSubmitting}
        style={{
          padding: '0.875rem 2rem',
          background: form.company && form.email && !isSubmitting ? '#fff' : '#1a1a1a',
          color: form.company && form.email && !isSubmitting ? '#000' : '#444',
          border: 'none',
          borderRadius: '0.5rem',
          fontFamily: "'Outfit', 'Inter', sans-serif",
          fontWeight: 600,
          fontSize: '0.9rem',
          letterSpacing: '0.02em',
          cursor: form.company && form.email && !isSubmitting ? 'pointer' : 'not-allowed',
          transition: 'all 0.2s',
          alignSelf: 'flex-start',
        }}
        onMouseEnter={(e) => {
          if (form.company && form.email && !isSubmitting) {
            ;(e.target as HTMLButtonElement).style.background = '#e0e0e0'
          }
        }}
        onMouseLeave={(e) => {
          if (form.company && form.email && !isSubmitting) {
            ;(e.target as HTMLButtonElement).style.background = '#fff'
          }
        }}
      >
        Submit Interest →
      </button>

      {error && (
        <p style={{ color: '#ef4444', fontSize: '0.78rem', lineHeight: 1.5 }}>
          {error}
        </p>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
const SponsorshipPage: React.FC = () => {
  const [activeTier, setActiveTier] = useState<string | null>(null)

  // ── Inline global styles (self-contained, no external CSS needed)
  const globalStyle = `
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@200;300;400;500;600;700;800;900&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body { background: #080808; }

    .sp-grid-bg {
      background-image:
        linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
      background-size: 48px 48px;
    }

    .sp-tier-card:hover { border-color: #444 !important; }
    .sp-tier-card.sp-tier-gold { border-color: #fff !important; }

    .sp-perk-check {
      display: inline-flex; align-items: center; justify-content: center;
      width: 16px; height: 16px; border-radius: 50%;
      background: rgba(255,255,255,0.06);
      flex-shrink: 0; margin-top: 1px;
      font-size: 9px; color: #aaa;
    }
    .sp-tier-gold .sp-perk-check { background: rgba(255,255,255,0.12); color: #fff; }

    @media (max-width: 768px) {
      .sp-tiers-grid { grid-template-columns: 1fr 1fr !important; }
      .sp-stats-grid { grid-template-columns: 1fr 1fr !important; }
      .sp-reach-grid { grid-template-columns: 1fr 1fr !important; }
      .sp-hero-headline { font-size: clamp(2.4rem, 10vw, 4rem) !important; }
    }
    @media (max-width: 520px) {
      .sp-tiers-grid { grid-template-columns: 1fr !important; }
      .sp-stats-grid { grid-template-columns: 1fr !important; }
    }
  `

  return (
    <>
      <style>{globalStyle}</style>

      <div
        style={{
          minHeight: '100vh',
          background: '#080808',
          color: '#e8e8e8',
          fontFamily: "'Inter', 'Outfit', system-ui, sans-serif",
          overflowX: 'hidden',
        }}
      >

        {/* ── NAV ── */}
        <nav
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            borderBottom: '1px solid #141414',
            background: 'rgba(8,8,8,0.92)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            padding: '0 clamp(1.5rem, 5vw, 4rem)',
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Link
            to="/"
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 700,
              fontSize: '1rem',
              color: '#fff',
              textDecoration: 'none',
              letterSpacing: '-0.02em',
            }}
          >
            FestForge
          </Link>
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <a
              href="#tiers"
              style={{ fontSize: '0.8rem', color: '#666', textDecoration: 'none', fontWeight: 500 }}
            >
              Packages
            </a>
            <a
              href="#reach"
              style={{ fontSize: '0.8rem', color: '#666', textDecoration: 'none', fontWeight: 500 }}
            >
              Reach
            </a>
            <a
              href="#apply"
              style={{
                fontSize: '0.8rem',
                color: '#000',
                background: '#fff',
                textDecoration: 'none',
                fontWeight: 600,
                padding: '0.35rem 0.9rem',
                borderRadius: '0.35rem',
                letterSpacing: '0.01em',
              }}
            >
              Apply Now
            </a>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section
          className="sp-grid-bg"
          style={{
            minHeight: '88vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '6rem clamp(1.5rem, 5vw, 4rem) 4rem',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Radial spotlight */}
          <div
            style={{
              position: 'absolute',
              top: '30%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 700,
              height: 700,
              borderRadius: '50%',
              background:
                'radial-gradient(ellipse, rgba(255,255,255,0.04) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              border: '1px solid #222',
              borderRadius: '999px',
              padding: '0.3rem 1rem',
              marginBottom: '2rem',
              fontSize: '0.72rem',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#666',
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#fff',
                display: 'inline-block',
              }}
            />
            Partnership Opportunities · 2024–25
          </motion.div>

          {/* Headline */}
          <motion.h1
            className="sp-hero-headline"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 800,
              fontSize: 'clamp(2.8rem, 6vw, 5.5rem)',
              lineHeight: 1.0,
              letterSpacing: '-0.04em',
              color: '#fff',
              marginBottom: '1.5rem',
              maxWidth: 820,
            }}
          >
            Put your brand<br />
            <span
              style={{
                WebkitTextStroke: '1.5px #fff',
                color: 'transparent',
              }}
            >
              in front of campus.
            </span>
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            style={{
              fontSize: 'clamp(0.9rem, 1.4vw, 1.05rem)',
              lineHeight: 1.7,
              color: '#666',
              maxWidth: 520,
              marginBottom: '2.5rem',
            }}
          >
            FestForge powers college festivals across campuses. Sponsor an event and connect
            your brand directly with thousands of students, creators, and future professionals.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.42 }}
            style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}
          >
            <a
              href="#apply"
              style={{
                padding: '0.8rem 2rem',
                background: '#fff',
                color: '#000',
                borderRadius: '0.5rem',
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 700,
                fontSize: '0.9rem',
                textDecoration: 'none',
                letterSpacing: '0.01em',
              }}
            >
              Express Interest
            </a>
            <a
              href="#tiers"
              style={{
                padding: '0.8rem 2rem',
                background: 'transparent',
                color: '#fff',
                border: '1px solid #2a2a2a',
                borderRadius: '0.5rem',
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 500,
                fontSize: '0.9rem',
                textDecoration: 'none',
              }}
            >
              View Packages ↓
            </a>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            style={{
              position: 'absolute',
              bottom: '2.5rem',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <span style={{ fontSize: '0.65rem', color: '#333', letterSpacing: '0.1em' }}>
              SCROLL
            </span>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
              style={{ width: 1, height: 32, background: 'linear-gradient(#333, transparent)' }}
            />
          </motion.div>
        </section>

        {/* ── STATS BELT ── */}
        <Section>
          <div
            style={{
              borderTop: '1px solid #141414',
              borderBottom: '1px solid #141414',
              padding: '3rem clamp(1.5rem, 5vw, 4rem)',
              background: '#0d0d0d',
            }}
          >
            <div
              className="sp-stats-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '2rem',
                maxWidth: 1000,
                margin: '0 auto',
              }}
            >
              {STATS.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  variants={fadeUp}
                  custom={i * 0.08}
                  style={{ textAlign: 'center' }}
                >
                  <div
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      fontWeight: 800,
                      fontSize: 'clamp(1.8rem, 3vw, 2.4rem)',
                      letterSpacing: '-0.04em',
                      color: '#fff',
                      lineHeight: 1,
                      marginBottom: '0.4rem',
                    }}
                  >
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  </div>
                  <p
                    style={{
                      fontSize: '0.78rem',
                      color: '#555',
                      lineHeight: 1.4,
                      fontWeight: 500,
                    }}
                  >
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </Section>

        {/* ── WHY FESTFORGE ── */}
        <Section
          style={{
            padding: '6rem clamp(1.5rem, 5vw, 4rem)',
            maxWidth: 1100,
            margin: '0 auto',
          }}
        >
          <motion.div variants={fadeUp} style={{ marginBottom: '3.5rem' }}>
            <p
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#444',
                marginBottom: '0.75rem',
              }}
            >
              Why sponsor
            </p>
            <h2
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 700,
                fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
                letterSpacing: '-0.03em',
                color: '#fff',
                maxWidth: 600,
                lineHeight: 1.2,
              }}
            >
              Campus is where brand loyalty is built.
            </h2>
          </motion.div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1.5px',
              background: '#141414',
              border: '1px solid #141414',
              borderRadius: '0.75rem',
              overflow: 'hidden',
            }}
          >
            {[
              {
                icon: '◎',
                title: 'Verified student audience',
                body: 'Every attendee is a registered student, verified at check-in via QR. No bots. No inflated reach.',
              },
              {
                icon: '◈',
                title: 'Multi-touchpoint visibility',
                body: 'From pre-event social posts to on-stage banners and post-event certificates — your brand appears at every moment.',
              },
              {
                icon: '◆',
                title: 'Direct talent pipeline',
                body: 'Meet your next hire before they graduate. Many sponsors use FestForge events as informal campus recruitment drives.',
              },
              {
                icon: '◉',
                title: 'Measurable outcomes',
                body: 'Gold and Platinum sponsors receive an analytics report: impressions, QR engagements, and brand recall data.',
              },
              {
                icon: '◇',
                title: 'Flexible package scope',
                body: 'Sponsor a single event or the full festival. Packages adapt to your campaign calendar and budget cycle.',
              },
              {
                icon: '●',
                title: 'Co-branded press coverage',
                body: 'Platinum sponsors are co-authored into our campus and regional media press releases, extending reach beyond the event day.',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                custom={i * 0.06}
                style={{
                  padding: '2rem',
                  background: '#080808',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <span style={{ fontSize: '1.1rem', color: '#444' }}>{item.icon}</span>
                <h3
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    color: '#e0e0e0',
                    lineHeight: 1.3,
                  }}
                >
                  {item.title}
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#555', lineHeight: 1.65 }}>{item.body}</p>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* ── TIER CARDS ── */}
        <Section
          id="tiers"
          style={{ padding: '6rem clamp(1.5rem, 5vw, 4rem)', background: '#0a0a0a' }}
        >
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <motion.div variants={fadeUp} style={{ marginBottom: '3.5rem' }}>
              <p
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: '#444',
                  marginBottom: '0.75rem',
                }}
              >
                Sponsorship Tiers
              </p>
              <h2
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 700,
                  fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
                  letterSpacing: '-0.03em',
                  color: '#fff',
                  lineHeight: 1.2,
                }}
              >
                Choose your partnership level.
              </h2>
            </motion.div>

            <div
              className="sp-tiers-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '1rem',
                alignItems: 'start',
              }}
            >
              {TIERS.map((tier, i) => {
                const booked = tier.slots - tier.slotsLeft
                const pct = Math.round((booked / tier.slots) * 100)
                const isGold = tier.highlight
                const isActive = activeTier === tier.id
                return (
                  <motion.div
                    key={tier.id}
                    className={`sp-tier-card${isGold ? ' sp-tier-gold' : ''}`}
                    variants={fadeUp}
                    custom={i * 0.08}
                    onClick={() => setActiveTier(isActive ? null : tier.id)}
                    style={{
                      border: `1px solid ${isGold ? '#fff' : '#1c1c1c'}`,
                      borderRadius: '0.75rem',
                      padding: '1.75rem',
                      background: isGold ? '#0f0f0f' : '#080808',
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'border-color 0.2s, transform 0.2s',
                      transform: isActive ? 'scale(1.01)' : 'scale(1)',
                    }}
                  >
                    {/* Tag */}
                    <div
                      style={{
                        display: 'inline-block',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: isGold ? '#fff' : '#444',
                        border: `1px solid ${isGold ? '#fff' : '#222'}`,
                        borderRadius: '999px',
                        padding: '0.2rem 0.65rem',
                        marginBottom: '1.25rem',
                      }}
                    >
                      {tier.tag}
                    </div>

                    <h3
                      style={{
                        fontFamily: "'Outfit', sans-serif",
                        fontWeight: 800,
                        fontSize: '1.05rem',
                        color: isGold ? '#fff' : '#aaa',
                        letterSpacing: '-0.01em',
                        marginBottom: '0.25rem',
                      }}
                    >
                      {tier.name}
                    </h3>

                    <div
                      style={{
                        fontFamily: "'Outfit', sans-serif",
                        fontWeight: 800,
                        fontSize: '2rem',
                        letterSpacing: '-0.04em',
                        color: '#fff',
                        lineHeight: 1.1,
                        marginBottom: '1.5rem',
                      }}
                    >
                      {tier.price}
                    </div>

                    {/* Perks */}
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
                      {tier.perks.map((perk, pi) => (
                        <li
                          key={pi}
                          style={{
                            display: 'flex',
                            gap: '0.5rem',
                            alignItems: 'flex-start',
                            fontSize: '0.8rem',
                            color: '#666',
                            lineHeight: 1.4,
                          }}
                        >
                          <span className="sp-perk-check">✓</span>
                          {perk}
                        </li>
                      ))}
                    </ul>

                    {/* Slots progress */}
                    <div style={{ marginBottom: '1.25rem' }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '0.68rem',
                          color: '#444',
                          marginBottom: '0.4rem',
                          fontWeight: 500,
                        }}
                      >
                        <span>{booked} of {tier.slots} slots booked</span>
                        <span>{pct}%</span>
                      </div>
                      <div
                        style={{
                          height: 3,
                          background: '#1a1a1a',
                          borderRadius: '999px',
                          overflow: 'hidden',
                        }}
                      >
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${pct}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.2 + i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
                          style={{
                            height: '100%',
                            background: isGold ? '#fff' : '#333',
                            borderRadius: '999px',
                          }}
                        />
                      </div>
                    </div>

                    <a
                      href="#apply"
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        display: 'block',
                        textAlign: 'center',
                        padding: '0.65rem',
                        background: isGold ? '#fff' : 'transparent',
                        color: isGold ? '#000' : '#555',
                        border: `1px solid ${isGold ? '#fff' : '#222'}`,
                        borderRadius: '0.4rem',
                        fontFamily: "'Outfit', sans-serif",
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        textDecoration: 'none',
                        letterSpacing: '0.01em',
                        transition: 'all 0.2s',
                      }}
                    >
                      Apply for {tier.name}
                    </a>

                    {/* Sold-out overlay if needed */}
                    {tier.slotsLeft === 0 && (
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'rgba(8,8,8,0.85)',
                          display: 'grid',
                          placeItems: 'center',
                          borderRadius: '0.75rem',
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "'Outfit', sans-serif",
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            color: '#555',
                            border: '1px solid #222',
                            padding: '0.4rem 1rem',
                            borderRadius: '999px',
                          }}
                        >
                          Sold Out
                        </span>
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>

            {/* Custom package nudge */}
            <motion.div
              variants={fadeUp}
              custom={0.4}
              style={{
                marginTop: '1.5rem',
                border: '1px dashed #1e1e1e',
                borderRadius: '0.75rem',
                padding: '1.5rem 2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1.5rem',
                flexWrap: 'wrap',
              }}
            >
              <div>
                <h4
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    color: '#aaa',
                    marginBottom: '0.25rem',
                  }}
                >
                  Need something bespoke?
                </h4>
                <p style={{ fontSize: '0.8rem', color: '#555' }}>
                  Product launches, prize sponsorships, scholarship announcements, or live demos — we can scope it together.
                </p>
              </div>
              <a
                href="#apply"
                style={{
                  flexShrink: 0,
                  padding: '0.7rem 1.5rem',
                  border: '1px solid #2a2a2a',
                  borderRadius: '0.4rem',
                  color: '#aaa',
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                Talk Custom →
              </a>
            </motion.div>
          </div>
        </Section>

        {/* ── REACH & AUDIENCE ── */}
        <Section
          id="reach"
          style={{ padding: '6rem clamp(1.5rem, 5vw, 4rem)' }}
        >
          <div
            style={{
              maxWidth: 1100,
              margin: '0 auto',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '5rem',
              alignItems: 'center',
            }}
          >
            <div>
              <motion.p
                variants={fadeUp}
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: '#444',
                  marginBottom: '0.75rem',
                }}
              >
                Our reach
              </motion.p>
              <motion.h2
                variants={fadeUp}
                custom={0.05}
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 700,
                  fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
                  letterSpacing: '-0.03em',
                  color: '#fff',
                  lineHeight: 1.2,
                  marginBottom: '1.5rem',
                }}
              >
                Students are your most loyal future customers.
              </motion.h2>
              <motion.p
                variants={fadeUp}
                custom={0.1}
                style={{ fontSize: '0.88rem', color: '#555', lineHeight: 1.75, marginBottom: '2rem' }}
              >
                FestForge events attract undergrads and postgrads from engineering, design, management,
                and arts disciplines. Your brand reaches them during a formative stage — before spending
                habits are fixed and brand affinities are set.
              </motion.p>

              {/* Audience breakdown */}
              <motion.div variants={fadeUp} custom={0.15} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  { label: 'Engineering & Tech', pct: 48 },
                  { label: 'Business & Management', pct: 27 },
                  { label: 'Design & Arts', pct: 16 },
                  { label: 'Sciences & Other', pct: 9 },
                ].map((item) => (
                  <div key={item.label}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.75rem',
                        color: '#555',
                        marginBottom: '0.3rem',
                        fontWeight: 500,
                      }}
                    >
                      <span>{item.label}</span>
                      <span>{item.pct}%</span>
                    </div>
                    <div
                      style={{ height: 2, background: '#141414', borderRadius: '999px', overflow: 'hidden' }}
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${item.pct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
                        style={{ height: '100%', background: '#444', borderRadius: '999px' }}
                      />
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right: reach grid */}
            <motion.div
              variants={fadeUp}
              custom={0.1}
              className="sp-reach-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1px',
                background: '#141414',
                border: '1px solid #141414',
                borderRadius: '0.75rem',
                overflow: 'hidden',
              }}
            >
              {REACH_ITEMS.map((item) => (
                <div
                  key={item.label}
                  style={{
                    padding: '2rem 1.5rem',
                    background: '#080808',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}
                >
                  <span style={{ fontSize: '1.2rem', color: '#333' }}>{item.icon}</span>
                  <div
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      fontWeight: 700,
                      fontSize: '1.15rem',
                      color: '#fff',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {item.value}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#555', fontWeight: 500 }}>
                    {item.label}
                  </div>
                </div>
              ))}

              {/* Age breakdown cell */}
              <div
                style={{
                  gridColumn: '1 / -1',
                  padding: '1.5rem',
                  background: '#080808',
                  borderTop: '1px solid #141414',
                }}
              >
                <p style={{ fontSize: '0.7rem', color: '#444', marginBottom: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Age Distribution
                </p>
                <div style={{ display: 'flex', gap: '2px', height: 40, alignItems: 'flex-end' }}>
                  {[
                    { age: '18', h: 30 },
                    { age: '19', h: 60 },
                    { age: '20', h: 90 },
                    { age: '21', h: 100 },
                    { age: '22', h: 80 },
                    { age: '23', h: 55 },
                    { age: '24', h: 35 },
                    { age: '25', h: 20 },
                    { age: '26+', h: 10 },
                  ].map((bar) => (
                    <div key={bar.age} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <motion.div
                        initial={{ height: 0 }}
                        whileInView={{ height: `${bar.h}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
                        style={{
                          width: '100%',
                          background: '#222',
                          borderRadius: '2px 2px 0 0',
                          minHeight: 2,
                        }}
                      />
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '2px', marginTop: 4 }}>
                  {['18', '19', '20', '21', '22', '23', '24', '25', '26+'].map((a) => (
                    <div key={a} style={{ flex: 1, fontSize: '0.55rem', color: '#333', textAlign: 'center' }}>
                      {a}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </Section>

        {/* ── PAST SPONSORS MARQUEE ── */}
        <Section style={{ borderTop: '1px solid #0f0f0f', borderBottom: '1px solid #0f0f0f', background: '#060606', overflow: 'hidden' }}>
          <div style={{ padding: '2.5rem 0' }}>
            <p style={{ textAlign: 'center', fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#2a2a2a', marginBottom: '1.75rem' }}>
              Previous partners
            </p>
            <div style={{ display: 'flex', gap: '4rem', overflow: 'hidden' }}>
              <motion.div
                animate={{ x: ['0%', '-50%'] }}
                transition={{ duration: 20, ease: 'linear', repeat: Infinity }}
                style={{ display: 'flex', gap: '4rem', flexShrink: 0 }}
              >
                {[
                  'CloudTech Solutions',
                  'DevStack Inc.',
                  'ByteForge Labs',
                  'PixelCraft Studio',
                  'DataWave Analytics',
                  'Nexus Ventures',
                  'Orbit Media',
                  'Sigma Systems',
                  'CloudTech Solutions',
                  'DevStack Inc.',
                  'ByteForge Labs',
                  'PixelCraft Studio',
                  'DataWave Analytics',
                  'Nexus Ventures',
                  'Orbit Media',
                  'Sigma Systems',
                ].map((name, i) => (
                  <span
                    key={i}
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      color: '#2a2a2a',
                      whiteSpace: 'nowrap',
                      letterSpacing: '0.02em',
                    }}
                  >
                    {name}
                  </span>
                ))}
              </motion.div>
            </div>
          </div>
        </Section>

        {/* ── FAQ ── */}
        <Section style={{ padding: '6rem clamp(1.5rem, 5vw, 4rem)' }}>
          <div
            style={{
              maxWidth: 780,
              margin: '0 auto',
            }}
          >
            <motion.div variants={fadeUp} style={{ marginBottom: '3.5rem' }}>
              <p
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: '#444',
                  marginBottom: '0.75rem',
                }}
              >
                FAQ
              </p>
              <h2
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 700,
                  fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
                  letterSpacing: '-0.03em',
                  color: '#fff',
                }}
              >
                Common questions.
              </h2>
            </motion.div>

            <div style={{ borderTop: '1px solid #1e1e1e' }}>
              {FAQS.map((faq, i) => (
                <FAQItem key={i} faq={faq} index={i} />
              ))}
            </div>
          </div>
        </Section>

        {/* ── APPLY FORM ── */}
        <Section
          id="apply"
          style={{ padding: '6rem clamp(1.5rem, 5vw, 4rem)', background: '#0a0a0a', borderTop: '1px solid #0f0f0f' }}
        >
          <div style={{ maxWidth: 780, margin: '0 auto' }}>
            <motion.div variants={fadeUp} style={{ marginBottom: '3rem' }}>
              <p
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: '#444',
                  marginBottom: '0.75rem',
                }}
              >
                Get started
              </p>
              <h2
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 700,
                  fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
                  letterSpacing: '-0.03em',
                  color: '#fff',
                  marginBottom: '0.5rem',
                }}
              >
                Express your interest.
              </h2>
              <p style={{ fontSize: '0.875rem', color: '#555', lineHeight: 1.65 }}>
                Fill in the form and our partnerships team will get back to you within 3 working days. No commitment required at this stage.
              </p>
            </motion.div>

            <motion.div variants={fadeUp} custom={0.1}>
              <InterestForm />
            </motion.div>
          </div>
        </Section>

        {/* ── FOOTER ── */}
        <footer
          style={{
            borderTop: '1px solid #0f0f0f',
            padding: '2.5rem clamp(1.5rem, 5vw, 4rem)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <span
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 700,
                fontSize: '0.9rem',
                color: '#fff',
                letterSpacing: '-0.02em',
              }}
            >
              FestForge
            </span>
            <span
              style={{
                fontSize: '0.75rem',
                color: '#333',
                marginLeft: '0.75rem',
              }}
            >
              College Event Management Platform
            </span>
          </div>
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <Link
              to="/"
              style={{ fontSize: '0.75rem', color: '#333', textDecoration: 'none' }}
            >
              Home
            </Link>
            <Link
              to="/organizer"
              style={{ fontSize: '0.75rem', color: '#333', textDecoration: 'none' }}
            >
              For Organizers
            </Link>
            <a
              href="mailto:partnerships@festforge.dev"
              style={{ fontSize: '0.75rem', color: '#333', textDecoration: 'none' }}
            >
              partnerships@festforge.dev
            </a>
          </div>
        </footer>
      </div>
    </>
  )
}

export default SponsorshipPage
