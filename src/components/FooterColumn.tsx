import React from 'react'
import { Link } from 'react-router-dom'

interface FooterColumnProps {
  heading: string
  links: string[]
}

/** Map certain footer link labels to actual routes */
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

const FooterColumn: React.FC<FooterColumnProps> = ({ heading, links }) => (
  <div>
    <h4
      className="text-[0.82rem] font-bold mb-[18px] uppercase tracking-wide"
      style={{ color: 'var(--footer-heading)' }}
    >
      {heading}
    </h4>
    <ul className="list-none flex flex-col gap-[11px]">
      {links.map((link) => (
        <li key={link}>
          <Link
            to={LINK_ROUTES[link] || '/'}
            className="text-[0.85rem] no-underline transition-colors duration-200"
            style={{ color: 'var(--footer-text)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--footer-text)')}
          >
            {link}
          </Link>
        </li>
      ))}
    </ul>
  </div>
)

export default FooterColumn

