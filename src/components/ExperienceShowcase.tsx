import React, { useRef, useState, useEffect } from 'react'
import { motion, useScroll, useMotionValueEvent, AnimatePresence, useSpring, useTransform } from 'framer-motion'
import ConstellationCanvas from './showcase3d/ConstellationCanvas'

const hexToRgb = (hex: string): string => {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r}, ${g}, ${b}`
}

/* ═══════════════════════════════════════════════════════════════
   FEATURE DATA & WORKFLOWS
   ═══════════════════════════════════════════════════════════════ */

interface FeatureStep {
  title: string
  description: string
  iconPath: string
  accentColor: string
}

const ORGANIZER_STEPS: FeatureStep[] = [
  {
    title: 'Create Events',
    description: 'Launch stunning event pages in minutes. Set schedules, add speakers, customize branding, and publish your college fest instantly.',
    iconPath: 'M12 5v14M5 12h14',
    accentColor: '#d1d5db',
  },
  {
    title: 'Manage Registrations',
    description: 'Handle thousands of registrations effortlessly. Auto-confirm attendees, manage waitlists, and keep your participant data organized.',
    iconPath: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',
    accentColor: '#00d2ff',
  },
  {
    title: 'Sponsor Management',
    description: 'Build sponsor packages, showcase brand visibility tiers, and manage relationships with dedicated tracking portals.',
    iconPath: 'M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
    accentColor: '#a1a1aa',
  },
  {
    title: 'Volunteer Management',
    description: 'Recruit and assign volunteers. Create shift schedules, send task notifications, and track attendance seamlessly.',
    iconPath: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M22 12h-6 M19 9v6',
    accentColor: '#00ff88',
  },
  {
    title: 'Event Analytics',
    description: 'Get deep insights into performance. Track attendance rates, engagement metrics, revenue trends, and generate reports.',
    iconPath: 'M18 20V10 M12 20V4 M6 20v-6',
    accentColor: '#ffd200',
  },
  {
    title: 'Communication Center',
    description: 'Send targeted emails and push notifications. Keep your participants informed about schedule changes and important updates.',
    iconPath: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6',
    accentColor: '#ff5050',
  },
]

const ATTENDEE_STEPS: FeatureStep[] = [
  {
    title: 'Discover Events',
    description: 'Browse a curated feed of upcoming campus events. Never miss out on hackathons, cultural fests, workshops, or tournaments.',
    iconPath: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z M21 21l-4.35-4.35',
    accentColor: '#d1d5db',
  },
  {
    title: 'Quick Registration',
    description: 'One-tap registration with smart form auto-fill. Select ticket types and get instant confirmation in under 30 seconds.',
    iconPath: 'M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11',
    accentColor: '#00d2ff',
  },
  {
    title: 'Digital Pass',
    description: 'Get your event pass delivered as a QR code. Scan at entry for fast check-in and access your ticket details anytime.',
    iconPath: 'M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z M13 5v2 M13 17v2 M13 11v2',
    accentColor: '#a1a1aa',
  },
  {
    title: 'Event Schedule',
    description: 'Access detailed timelines and speaker lineups. Add sessions to your personal schedule and receive reminders.',
    iconPath: 'M3 4h18v18H3z M16 2v4 M8 2v4 M3 10h18',
    accentColor: '#00ff88',
  },
  {
    title: 'Networking',
    description: 'Connect with fellow attendees and speakers. Exchange profiles and build your campus network during and after events.',
    iconPath: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',
    accentColor: '#ffd200',
  },
  {
    title: 'Live Updates',
    description: 'Stay informed with real-time push notifications for venue changes, announcements, and live event highlights.',
    iconPath: 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0',
    accentColor: '#ff5050',
  },
]

/* ═══════════════════════════════════════════════════════════════
   MAIN SHOWCASE COMPONENT
   ═══════════════════════════════════════════════════════════════ */

const ExperienceShowcase: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null)

  const [activeTab, setActiveTab] = useState<'organizers' | 'attendees'>('organizers')
  const [activeIndex, setActiveIndex] = useState(0)
  const [isClient, setIsClient] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => { 
    setIsClient(true) 
    const checkMobile = () => setIsMobile(window.innerWidth <= 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const stepsCount = 6
    let idx = Math.floor(latest * stepsCount)
    if (idx >= stepsCount) idx = stepsCount - 1
    if (idx < 0) idx = 0
    if (idx !== activeIndex) setActiveIndex(idx)
  })

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 80, damping: 25, restDelta: 0.001 })
  const cometTop = useTransform(smoothProgress, [0, 1], ['4%', '96%'])

  const handleTabSwitch = (tab: 'organizers' | 'attendees') => {
    if (activeTab === tab) return
    setActiveTab(tab)
    setActiveIndex(0)
    if (sectionRef.current) {
      window.scrollTo({ top: sectionRef.current.offsetTop, behavior: 'smooth' })
    }
  }

  const activeSteps = activeTab === 'organizers' ? ORGANIZER_STEPS : ATTENDEE_STEPS
  const activeStepData = activeSteps[activeIndex]
  const activeTopPercent = 4 + ((activeIndex + 0.5) / activeSteps.length) * 92

  return (
    <section
      ref={sectionRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '600vh',
        backgroundColor: '#050508',
      }}
    >
      <div style={{
        position: 'sticky',
        top: 0,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}>

        {/* Futuristic cyber dot grid background overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.015) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          pointerEvents: 'none',
          zIndex: 1,
        }} />

        {/* Subtle radial gradient overlay for depth */}
        <div style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          background: 'radial-gradient(ellipse at 60% 40%, rgba(120, 80, 255, 0.06) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />

        {/* 3D Canvas Background */}
        {isClient && <ConstellationCanvas activeIndex={activeIndex} />}

        {/* HTML Overlay */}
        <div style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: '1200px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '5rem 2rem 3rem',
        }}>

          {/* ── Segment Control ── */}
          <div style={{ marginBottom: '3.5rem', zIndex: 20 }}>
            <div style={{
              position: 'relative',
              display: 'flex',
              background: 'rgba(8, 8, 14, 0.65)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              padding: '4px',
              width: '100%',
              maxWidth: '350px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.03)',
            }}>
              <div style={{ display: 'flex', width: '100%', position: 'relative', zIndex: 1 }}>
                {(['organizers', 'attendees'] as const).map((tab) => {
                  const isActive = activeTab === tab
                  const activeColor = tab === 'organizers' ? '#FFFFFF' : '#06B6D4'
                  return (
                    <button
                      key={tab}
                      onClick={() => handleTabSwitch(tab)}
                      style={{
                        flex: 1,
                        padding: '0.8rem 1rem',
                        background: 'transparent',
                        border: 'none',
                        color: isActive ? '#f0f0f5' : '#505065',
                        fontWeight: 600,
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                        position: 'relative',
                        zIndex: 2,
                        letterSpacing: '0.15em',
                        textTransform: 'uppercase',
                        fontFamily: 'Outfit, sans-serif',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                      }}
                    >
                      {/* Connection indicator dot for active tab */}
                      {isActive && (
                        <motion.span
                          layoutId="activeDot"
                          className="w-1.5 h-1.5 rounded-full"
                          style={{
                            background: activeColor,
                            boxShadow: `0 0 8px ${activeColor}`,
                          }}
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                      {tab}
                    </button>
                  )
                })}
              </div>

              {/* Slider Panel Indicator */}
              <motion.div
                initial={false}
                animate={{ x: activeTab === 'attendees' ? '100%' : '0%' }}
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                style={{
                  position: 'absolute',
                  top: '4px',
                  left: '4px',
                  width: 'calc(50% - 4px)',
                  height: 'calc(100% - 8px)',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                  zIndex: 0,
                  display: 'flex',
                  alignItems: 'flex-end',
                }}
              >
                {/* Micro tech line on active tab bottom border */}
                <div
                  style={{
                    width: '100%',
                    height: '2px',
                    background: `linear-gradient(to right, transparent, ${activeTab === 'organizers' ? '#FFFFFF' : '#06B6D4'}, transparent)`,
                  }}
                />
              </motion.div>
            </div>
          </div>

          {/* ── Main Content Area ── */}
          <div style={{
            position: 'relative',
            flex: 1,
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>

            {/* ── Circuit Connector Lines ── */}
            {!isMobile && (
            <AnimatePresence mode="wait">
              <motion.svg
                key={`connector-${activeTab}-${activeIndex}`}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none',
                  zIndex: 2,
                }}
              >
                {/* Line 1 (Horizontal from dot) - Glow & Sharp */}
                <motion.line
                  x1="50%"
                  y1={`${activeTopPercent}%`}
                  x2="calc(50% - 30px)"
                  y2={`${activeTopPercent}%`}
                  stroke={activeStepData.accentColor}
                  strokeWidth="5"
                  strokeLinecap="round"
                  opacity="0.3"
                  style={{ filter: 'blur(3px)' }}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                />
                <motion.line
                  x1="50%"
                  y1={`${activeTopPercent}%`}
                  x2="calc(50% - 30px)"
                  y2={`${activeTopPercent}%`}
                  stroke={activeStepData.accentColor}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                />

                {/* Line 2 (Vertical to Center level) - Glow & Sharp */}
                <motion.line
                  x1="calc(50% - 30px)"
                  y1={`${activeTopPercent}%`}
                  x2="calc(50% - 30px)"
                  y2="50%"
                  stroke={activeStepData.accentColor}
                  strokeWidth="5"
                  strokeLinecap="round"
                  opacity="0.3"
                  style={{ filter: 'blur(3px)' }}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut", delay: 0.15 }}
                />
                <motion.line
                  x1="calc(50% - 30px)"
                  y1={`${activeTopPercent}%`}
                  x2="calc(50% - 30px)"
                  y2="50%"
                  stroke={activeStepData.accentColor}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut", delay: 0.15 }}
                />

                {/* Line 3 (Horizontal to Card edge) - Glow & Sharp */}
                <motion.line
                  x1="calc(50% - 30px)"
                  y1="50%"
                  x2="calc(46% - 40px)"
                  y2="50%"
                  stroke={activeStepData.accentColor}
                  strokeWidth="5"
                  strokeLinecap="round"
                  opacity="0.3"
                  style={{ filter: 'blur(3px)' }}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut", delay: 0.4 }}
                />
                <motion.line
                  x1="calc(50% - 30px)"
                  y1="50%"
                  x2="calc(46% - 40px)"
                  y2="50%"
                  stroke={activeStepData.accentColor}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut", delay: 0.4 }}
                />

                {/* Contact glow dot */}
                <motion.circle
                  cx="calc(46% - 40px)"
                  cy="50%"
                  r="3.5"
                  fill="#fff"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.2, delay: 0.6 }}
                  style={{
                    filter: `drop-shadow(0 0 6px ${activeStepData.accentColor})`,
                  }}
                />
              </motion.svg>
            </AnimatePresence>
            )}

            {/* ── Comet Timeline ── */}
            <div className="hidden md:block" style={{
              position: 'absolute',
              top: '0',
              bottom: '0',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '60px',
              zIndex: 3,
              pointerEvents: 'none',
            }}>
              {/* Soft glow background strip */}
              <div style={{
                position: 'absolute',
                top: '4%',
                bottom: '4%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '6px',
                background: 'linear-gradient(to bottom, rgba(120, 80, 255, 0.03), rgba(0, 210, 255, 0.03))',
                borderRadius: '3px',
                filter: 'blur(1px)',
              }} />

              {/* Faint vertical dashed track line */}
              <div style={{
                position: 'absolute',
                top: '4%',
                bottom: '4%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '0px',
                borderLeft: '1px dashed rgba(255, 255, 255, 0.12)',
              }} />

              {/* Technical ruler tick marks along the track */}
              {Array.from({ length: 9 }).map((_, i) => {
                const pct = 10 + i * 10
                const topVal = 4 + (pct / 100) * 92
                return (
                  <div
                    key={`tick-${i}`}
                    style={{
                      position: 'absolute',
                      top: `${topVal}%`,
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '8px',
                      height: '1px',
                      background: 'rgba(255, 255, 255, 0.15)',
                    }}
                  />
                )
              })}

              {/* Glowing trail left behind by the comet */}
              <motion.div
                style={{
                  position: 'absolute',
                  top: '4%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '2px',
                  height: '92%',
                  background: 'linear-gradient(to bottom, #7850ff, #00d2ff)',
                  borderRadius: '1px',
                  scaleY: smoothProgress,
                  transformOrigin: 'top center',
                  opacity: 0.4,
                }}
              />
              <motion.div
                style={{
                  position: 'absolute',
                  top: '4%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '4px',
                  height: '92%',
                  background: 'linear-gradient(to bottom, #7850ff, #00d2ff)',
                  borderRadius: '2px',
                  scaleY: smoothProgress,
                  transformOrigin: 'top center',
                  opacity: 0.15,
                  filter: 'blur(2px)',
                }}
              />

              {/* ── THE COMET ── */}
              <motion.div
                style={{
                  position: 'absolute',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  top: cometTop,
                }}
              >
                {/* Vertical pulsing comet tail */}
                <motion.div
                  animate={{ height: [30, 45, 30], opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    position: 'absolute',
                    bottom: '50%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '3px',
                    borderRadius: '99px',
                    background: `linear-gradient(to top, rgba(255, 255, 255, 0.8), ${activeStepData.accentColor} 50%, transparent)`,
                  }}
                />

                {/* Outer glow halo */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: `radial-gradient(circle, rgba(120, 80, 255, 0.35) 0%, ${activeStepData.accentColor}15 40%, transparent 70%)`,
                  filter: 'blur(4px)',
                }} />

                {/* Mid glow ring */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: `radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, transparent 70%)`,
                  boxShadow: `0 0 20px ${activeStepData.accentColor}, 0 0 40px rgba(0, 210, 255, 0.4)`,
                }} />

                {/* Bright core */}
                <div style={{
                  position: 'relative',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: '#fff',
                  boxShadow: `0 0 8px #fff, 0 0 16px ${activeStepData.accentColor}`,
                }} />
              </motion.div>

              {/* Timeline Dots along the straight track */}
              {activeSteps.map((step, idx) => {
                const topPercent = 4 + ((idx + 0.5) / activeSteps.length) * 92
                const isActive = idx === activeIndex
                return (
                  <div
                    key={idx}
                    style={{
                      position: 'absolute',
                      top: `${topPercent}%`,
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 5,
                    }}
                  >
                    {/* Active Ripple Rings */}
                    {isActive && (
                      <>
                        <motion.div
                          initial={{ scale: 1, opacity: 0.5 }}
                          animate={{ scale: 2.2, opacity: 0 }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                          style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            borderRadius: '50%',
                            border: `1px solid ${step.accentColor}`,
                            opacity: 0.5,
                          }}
                        />
                        <motion.div
                          initial={{ scale: 1, opacity: 0.3 }}
                          animate={{ scale: 1.6, opacity: 0 }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 0.6 }}
                          style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            borderRadius: '50%',
                            border: `1px solid ${step.accentColor}`,
                            opacity: 0.3,
                          }}
                        />
                      </>
                    )}

                    {/* The Glass Node */}
                    <motion.div
                      animate={{
                        width: isActive ? 34 : 14,
                        height: isActive ? 34 : 14,
                        borderColor: isActive ? step.accentColor : 'rgba(255, 255, 255, 0.12)',
                        backgroundColor: isActive ? 'rgba(8, 8, 16, 0.95)' : 'rgba(6, 6, 12, 0.8)',
                        boxShadow: isActive
                          ? `0 0 16px ${step.accentColor}50, inset 0 0 8px ${step.accentColor}30`
                          : '0 0 0px rgba(0,0,0,0)',
                      }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      style={{
                        borderRadius: '50%',
                        borderStyle: 'solid',
                        borderWidth: isActive ? '2px' : '1px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {/* Monospace number inside node */}
                      <motion.span
                        animate={{
                          opacity: isActive ? 1 : 0,
                          scale: isActive ? 1 : 0.5,
                        }}
                        transition={{ duration: 0.3 }}
                        style={{
                          fontSize: '0.65rem',
                          fontFamily: 'monospace',
                          fontWeight: 'bold',
                          color: step.accentColor,
                        }}
                      >
                        {`0${idx + 1}`}
                      </motion.span>

                      {/* Small inner dot when inactive */}
                      {!isActive && (
                        <div style={{
                          width: '4px',
                          height: '4px',
                          borderRadius: '50%',
                          background: 'rgba(255, 255, 255, 0.4)',
                        }} />
                      )}
                    </motion.div>
                  </div>
                )
              })}
            </div>

          <div className="exp-card-positioner">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeTab}-${activeIndex}`}
                initial={{
                  opacity: 0,
                  x: isMobile ? 0 : -60,
                  rotateY: 25,
                  scale: 0.88,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                  rotateY: 0,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  x: isMobile ? 0 : 40,
                  rotateY: -15,
                  scale: 0.92,
                }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  width: '100%',
                  transformStyle: 'preserve-3d' as const,
                  perspective: '1200px',
                  background: `radial-gradient(circle at top right, rgba(${hexToRgb(activeStepData.accentColor)}, 0.15) 0%, rgba(8, 8, 14, 0.85) 60%)`,
                  border: `1px solid rgba(${hexToRgb(activeStepData.accentColor)}, 0.22)`,
                  borderRadius: '1.25rem',
                  padding: isMobile ? '1.8rem 1.5rem 1.5rem' : '3rem 2.5rem 2.5rem',
                  backdropFilter: 'blur(28px)',
                  WebkitBackdropFilter: 'blur(28px)',
                  boxShadow: `0 30px 60px rgba(0,0,0,0.7), 0 0 50px rgba(${hexToRgb(activeStepData.accentColor)}, 0.08), inset 0 1px 0 rgba(255,255,255,0.06)`,
                  zIndex: 5,
                  overflow: 'hidden',
                }}
              >
                {/* Large Watermark Number in background */}
                <div style={{
                  position: 'absolute',
                  bottom: isMobile ? '-0.8rem' : '-1.2rem',
                  right: isMobile ? '-0.2rem' : '0.8rem',
                  fontSize: isMobile ? '6.5rem' : '9.5rem',
                  fontWeight: 900,
                  color: activeStepData.accentColor,
                  opacity: 0.15,
                  fontFamily: 'Outfit, sans-serif',
                  userSelect: 'none',
                  pointerEvents: 'none',
                  lineHeight: 1,
                  letterSpacing: '-0.05em',
                }}>
                  {`0${activeIndex + 1}`}
                </div>

                {/* Technical status tags */}
                <div style={{
                  position: 'absolute',
                  top: '20px',
                  left: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.6rem',
                  fontFamily: 'monospace',
                  color: 'rgba(255,255,255,0.25)',
                  letterSpacing: '1px',
                  userSelect: 'none',
                }}>
                  <span style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: activeStepData.accentColor,
                    boxShadow: `0 0 8px ${activeStepData.accentColor}`,
                  }} />
                  FF // NODE_LIVE
                </div>

                <div style={{
                  position: 'absolute',
                  top: '20px',
                  right: '24px',
                  fontSize: '0.6rem',
                  fontFamily: 'monospace',
                  color: 'rgba(255,255,255,0.2)',
                  letterSpacing: '2px',
                  userSelect: 'none',
                }}>
                  SYS_V2.0
                </div>

                {/* Diagonal Sheen Sweep Effect */}
                <motion.div
                  key={`sheen-${activeTab}-${activeIndex}`}
                  initial={{ x: '-100%', opacity: 0.6 }}
                  animate={{ x: '250%', opacity: 0 }}
                  transition={{ duration: 1.4, ease: 'easeInOut', delay: 0.1 }}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '40%',
                    height: '100%',
                    background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.08), transparent)',
                    transform: 'skewX(-20deg)',
                    pointerEvents: 'none',
                    zIndex: 6,
                    opacity: 0.6,
                  }}
                />

                {/* Corner HUD Brackets */}
                <div style={{ position: 'absolute', top: '10px', left: '10px', width: '12px', height: '12px', borderTop: `2px solid ${activeStepData.accentColor}`, borderLeft: `2px solid ${activeStepData.accentColor}`, opacity: 0.4 }} />
                <div style={{ position: 'absolute', top: '10px', right: '10px', width: '12px', height: '12px', borderTop: `2px solid ${activeStepData.accentColor}`, borderRight: `2px solid ${activeStepData.accentColor}`, opacity: 0.4 }} />
                <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '12px', height: '12px', borderBottom: `2px solid ${activeStepData.accentColor}`, borderLeft: `2px solid ${activeStepData.accentColor}`, opacity: 0.4 }} />
                <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '12px', height: '12px', borderBottom: `2px solid ${activeStepData.accentColor}`, borderRight: `2px solid ${activeStepData.accentColor}`, opacity: 0.4 }} />
                
                {/* Icon Badge — floats continuously after drawing */}
                <motion.div
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    width: '52px',
                    height: '52px',
                    marginBottom: '1.25rem',
                    borderRadius: '14px',
                    background: `rgba(${hexToRgb(activeStepData.accentColor)}, 0.12)`,
                    border: `1px solid rgba(${hexToRgb(activeStepData.accentColor)}, 0.25)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 4px 20px rgba(${hexToRgb(activeStepData.accentColor)}, 0.15)`,
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={activeStepData.accentColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <motion.path
                      key={`icon-${activeTab}-${activeIndex}`}
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 1.2, ease: 'easeInOut', delay: 0.2 }}
                      d={activeStepData.iconPath}
                    />
                  </svg>
                </motion.div>



                {/* Title */}
                <motion.h3
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.5 }}
                  style={{
                    fontSize: isMobile ? '1.5rem' : '1.85rem',
                    fontWeight: 800,
                    color: '#f9f9fb',
                    letterSpacing: '-0.03em',
                    lineHeight: 1.2,
                    marginBottom: '0.8rem',
                    fontFamily: 'Outfit, sans-serif',
                  }}
                >
                  {activeStepData.title}
                </motion.h3>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.5 }}
                  style={{
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: isMobile ? '0.82rem' : '0.9rem',
                    lineHeight: 1.675,
                    fontFamily: "'Outfit', sans-serif",
                    fontWeight: 300,
                  }}
                >
                  {activeStepData.description}
                </motion.p>
              </motion.div>
            </AnimatePresence>
          </div>

          </div>
        </div>
      </div>
    </section>
  )
}

export default ExperienceShowcase
