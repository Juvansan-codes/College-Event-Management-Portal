import React from 'react'

interface FooterColumnProps {
  heading: string
  links: string[]
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
          <a
            href="#"
            className="text-[0.85rem] no-underline transition-colors duration-200"
            style={{ color: 'var(--footer-text)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--footer-text)')}
          >
            {link}
          </a>
        </li>
      ))}
    </ul>
  </div>
)

export default FooterColumn
