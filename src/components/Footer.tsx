import React from 'react'
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
  return (
    <footer className="bg-white border-t border-[#e7e7e7] px-10 pt-[60px] pb-10 mt-20">
      <div className="max-w-[1100px] mx-auto grid grid-cols-[200px_1fr_1fr_1fr] gap-10 lg:grid-cols-2 sm:grid-cols-2 xs:grid-cols-1">
        {/* Brand */}
        <div className="lg:col-span-2 sm:col-span-2">
          <div className="flex items-center gap-1.5 text-[1.2rem] font-extrabold tracking-tight mb-5">
            <FestForgeLogo size={18} />
            FestForge
          </div>
          <SocialIcons />
        </div>

        {/* Link columns */}
        {FOOTER_COLUMNS.map((col) => (
          <FooterColumn key={col.heading} heading={col.heading} links={[...col.links]} />
        ))}
      </div>

      {/* Bottom bar */}
      <div className="max-w-[1100px] mx-auto mt-10 pt-6 border-t border-[#e7e7e7] text-[0.78rem] text-[#999]">
        © 2026 FestForge. All rights reserved.
      </div>
    </footer>
  )
}

export default Footer
