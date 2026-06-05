import React, { useRef, useState } from 'react'
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion'

/* ═══════════════════════════════════════════════════════════════
   FEATURE DATA & WORKFLOWS
   ═══════════════════════════════════════════════════════════════ */

interface FeatureStep {
  title: string
  description: string
  image: string
}

const ORGANIZER_STEPS: FeatureStep[] = [
  {
    title: 'Create Events',
    description: 'Launch stunning event pages in minutes. Set schedules, add speakers, customize branding, and publish your college fest instantly.',
    image: '/showcase/org_1_create_events_1780658224529.png',
  },
  {
    title: 'Manage Registrations',
    description: 'Handle thousands of registrations effortlessly. Auto-confirm attendees, manage waitlists, and keep your participant data organized.',
    image: '/showcase/org_2_registrations_1780658237807.png',
  },
  {
    title: 'Sponsor Management',
    description: 'Build sponsor packages, showcase brand visibility tiers, and manage relationships with dedicated tracking portals.',
    image: '/showcase/org_3_sponsors_1780658250231.png',
  },
  {
    title: 'Volunteer Management',
    description: 'Recruit and assign volunteers. Create shift schedules, send task notifications, and track attendance seamlessly.',
    image: '/showcase/org_4_volunteers_1780658270374.png',
  },
  {
    title: 'Event Analytics',
    description: 'Get deep insights into performance. Track attendance rates, engagement metrics, revenue trends, and generate reports.',
    image: '/showcase/org_5_analytics_1780658282947.png',
  },
  {
    title: 'Communication Center',
    description: 'Send targeted emails and push notifications. Keep your participants informed about schedule changes and important updates.',
    image: '/showcase/org_6_communication_1780658296955.png',
  },
]

const ATTENDEE_STEPS: FeatureStep[] = [
  {
    title: 'Discover Events',
    description: 'Browse a curated feed of upcoming campus events. Never miss out on hackathons, cultural fests, workshops, or tournaments.',
    image: '/showcase/att_1_discover_1780658331816.png',
  },
  {
    title: 'Quick Registration',
    description: 'One-tap registration with smart form auto-fill. Select ticket types and get instant confirmation in under 30 seconds.',
    image: '/showcase/att_2_register_1780658343346.png',
  },
  {
    title: 'Digital Pass',
    description: 'Get your event pass delivered as a QR code. Scan at entry for fast check-in and access your ticket details anytime.',
    image: '/showcase/att_3_pass_1780658356006.png',
  },
  {
    title: 'Event Schedule',
    description: 'Access detailed timelines and speaker lineups. Add sessions to your personal schedule and receive reminders.',
    image: '/showcase/att_4_schedule_1780658373064.png',
  },
  {
    title: 'Networking',
    description: 'Connect with fellow attendees and speakers. Exchange profiles and build your campus network during and after events.',
    image: '/showcase/att_5_networking_1780658383673.png',
  },
  {
    title: 'Live Updates',
    description: 'Stay informed with real-time push notifications for venue changes, announcements, and live event highlights.',
    image: '/showcase/att_6_live_updates_1780658397880.png',
  },
]

/* ═══════════════════════════════════════════════════════════════
   MAIN SHOWCASE COMPONENT
   ═══════════════════════════════════════════════════════════════ */

const ExperienceShowcase: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null)
  
  // Independent Workflows State
  const [activeTab, setActiveTab] = useState<'organizers' | 'attendees'>('organizers')
  const [activeIndex, setActiveIndex] = useState(0)

  // Track scroll progress over the 600vh section
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })

  // Map scroll progress (0 - 1) to an integer step (0 - 5) for the active tab only
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    // 6 steps total per workflow
    const stepsCount = 6
    let idx = Math.floor(latest * stepsCount)
    if (idx >= stepsCount) idx = stepsCount - 1
    if (idx < 0) idx = 0
    
    if (idx !== activeIndex) {
      setActiveIndex(idx)
    }
  })

  // Handle manual tab switching
  const handleTabSwitch = (tab: 'organizers' | 'attendees') => {
    if (activeTab === tab) return
    setActiveTab(tab)
    setActiveIndex(0) // Reset to step 1
    
    // Smoothly snap scroll back to the start of this section
    if (sectionRef.current) {
      const top = sectionRef.current.offsetTop
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  const activeSteps = activeTab === 'organizers' ? ORGANIZER_STEPS : ATTENDEE_STEPS
  const activeStepData = activeSteps[activeIndex]

  /* 
   The transition defined in the requirements:
   Current: Opacity 1 -> 0, Scale 1 -> 0.98
   New: Opacity 0 -> 1, Scale 0.98 -> 1
   No horizontal movement, no bouncing.
  */
  const transitionSpec = {
    duration: 0.7,
    ease: [0.25, 0.1, 0.25, 1], // Smooth elegant curve
  }

  const variants = {
    initial: { opacity: 0, scale: 0.98 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.98 },
  }

  return (
    <section 
      ref={sectionRef} 
      className="exp-showcase-container"
    >
      <div className="exp-showcase-sticky">
        
        {/* Background Base */}
        <div className="exp-showcase-bg" />

        <div className="exp-showcase-inner">
          
          {/* Top Segment Control */}
          <div className="exp-segment-container">
            <div className="exp-segment-track">
              <div 
                className="exp-segment-indicator" 
                style={{ transform: `translateX(${activeTab === 'attendees' ? '100%' : '0%'})` }} 
              />
              <button 
                className={`exp-segment-btn ${activeTab === 'organizers' ? 'active' : ''}`}
                onClick={() => handleTabSwitch('organizers')}
              >
                Organizers
              </button>
              <button 
                className={`exp-segment-btn ${activeTab === 'attendees' ? 'active' : ''}`}
                onClick={() => handleTabSwitch('attendees')}
              >
                Attendees
              </button>
            </div>
          </div>

          {/* 3-Column Layout: Photo | Step Number | Content */}
          <div className="exp-three-col-layout">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeTab}-${activeIndex}`}
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={transitionSpec}
                className="exp-three-col-row"
              >
                {/* LEFT — Hero Image */}
                <div className="exp-col-left">
                  <div className="exp-hero-image-wrapper">
                    <img 
                      src={activeStepData.image} 
                      alt={activeStepData.title}
                      className="exp-hero-image"
                    />
                    <div className="exp-hero-glow" />
                  </div>
                </div>

                {/* CENTER — Step Number & Vertical Line */}
                <div className="exp-col-center">
                  <div className="exp-center-line" />
                  <div className="exp-step-number">
                    {String(activeIndex + 1).padStart(2, '0')}
                  </div>
                  <div className="exp-center-line" />
                </div>

                {/* RIGHT — Title & Description */}
                <div className="exp-col-right">
                  <span className="exp-step-label">Step {activeIndex + 1} of {activeSteps.length}</span>
                  <h3 className="exp-right-title">{activeStepData.title}</h3>
                  <p className="exp-right-desc">{activeStepData.description}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  )
}

export default ExperienceShowcase
