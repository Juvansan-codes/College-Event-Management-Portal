import React, { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import StageCard from './StageCard'
import stageBg from '../assets/stage-bg.png'

/* ─── Icons ─── */
const ClipboardIcon: React.FC = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    <line x1="9" y1="12" x2="15" y2="12" />
    <line x1="9" y1="16" x2="15" y2="16" />
  </svg>
)

const TicketIcon: React.FC = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
    <path d="M13 5v2" />
    <path d="M13 17v2" />
    <path d="M13 11v2" />
  </svg>
)

const EventStage: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })

  /* ═══ Card Animation Transforms ═══
     The stage background is STATIC.
     Only the cards animate — they zoom in from distant to full size,
     as if the content is being projected onto the stage screen. */

  // Cards zoom in
  const cardScale = useTransform(scrollYProgress, [0.1, 0.5], [0.5, 1.0])
  const cardOpacity = useTransform(scrollYProgress, [0.1, 0.45], [0, 1.0])
  const blurValue = useTransform(scrollYProgress, [0.1, 0.5], [12, 0])
  const cardY = useTransform(scrollYProgress, [0.1, 0.5], [60, 0])

  // Header fades in ahead of cards
  const headerOpacity = useTransform(scrollYProgress, [0.06, 0.3], [0, 1])
  const headerY = useTransform(scrollYProgress, [0.06, 0.3], [30, 0])

  // Blur filter string
  const blurFilter = useTransform(blurValue, (v: number) => `blur(${v}px)`)

  return (
    <section
      ref={sectionRef}
      className="event-stage-section"
      style={{ height: '200vh' }}
      id="event-stage"
    >
      <div className="event-stage-sticky">
        {/* ═══ Static Stage Background Image ═══
            This is the real event stage photo — it stays fixed and
            fills the entire viewport. No animation on the image. */}
        <div className="stage-bg-wrapper" aria-hidden="true">
          <img
            src={stageBg}
            alt=""
            className="stage-bg-image"
          />
          {/* Dark overlay for text readability */}
          <div className="stage-bg-overlay" />
        </div>

        {/* Section header */}
        <motion.div
          className="stage-header"
          style={{ opacity: headerOpacity, y: headerY }}
        >
          <p className="stage-header__eyebrow">Choose your role</p>
          <h2 className="stage-header__heading">Step onto the Stage</h2>
        </motion.div>

        {/* ═══ Animated Cards ═══
            These cards zoom in ON TOP of the stage image,
            positioned over the white screen area of the photo. */}
        <motion.div
          className="stage-cards-container"
          style={{
            scale: cardScale,
            opacity: cardOpacity,
            filter: blurFilter,
            y: cardY,
          }}
        >
          <div className="stage-cards-row">
            <StageCard
              label="For"
              title="Organizers"
              description="Plan, manage, and execute unforgettable college events with powerful tools designed for organizers."
              icon={<ClipboardIcon />}
              to="/organizer"
            />
            <StageCard
              label="For"
              title="Attendees"
              description="Discover exciting events, register instantly, and never miss out on what's happening on campus."
              icon={<TicketIcon />}
              to="/register"
            />
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default EventStage
