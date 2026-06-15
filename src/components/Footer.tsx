import React from 'react'
import { motion } from 'framer-motion'
import FestForgeLogo from './FestForgeLogo'
import SocialIcons from './SocialIcons'
import FooterColumn from './FooterColumn'

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

const Footer: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  return (
    <motion.footer
      className="px-10 pt-[60px] pb-10 mt-20"
      style={{
        background: 'var(--bg-card)',
        borderTop: '1px solid var(--border-color)',
      }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      variants={containerVariants}
    >
      <div className="max-w-[1100px] mx-auto grid grid-cols-[200px_1fr_1fr_1fr] gap-10 lg:grid-cols-2 sm:grid-cols-2 xs:grid-cols-1">
        {/* Brand */}
        <motion.div className="lg:col-span-2 sm:col-span-2" variants={itemVariants}>
          <div
            className="flex items-center gap-1.5 text-[1.2rem] font-extrabold tracking-tight mb-5"
            style={{ color: 'var(--text-primary)' }}
          >
            <FestForgeLogo size={18} />
            FestForge
          </div>
          <SocialIcons />
        </motion.div>

        {/* Link columns */}
        {FOOTER_COLUMNS.map((col) => (
          <motion.div key={col.heading} variants={itemVariants}>
            <FooterColumn heading={col.heading} links={[...col.links]} />
          </motion.div>
        ))}
      </div>

      {/* Bottom bar */}
      <motion.div
        className="max-w-[1100px] mx-auto mt-10 pt-6 text-[0.78rem]"
        style={{
          borderTop: '1px solid var(--border-color)',
          color: 'var(--footer-bottom)',
        }}
        variants={itemVariants}
      >
        © 2026 FestForge. All rights reserved.
      </motion.div>
    </motion.footer>
  )
}

export default Footer
