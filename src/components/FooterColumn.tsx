import React from 'react'

interface FooterColumnProps {
  heading: string
  links: string[]
}

const FooterColumn: React.FC<FooterColumnProps> = ({ heading, links }) => (
  <div>
    <h4 className="text-[0.82rem] font-bold mb-[18px] text-[#111] uppercase tracking-wide">
      {heading}
    </h4>
    <ul className="list-none flex flex-col gap-[11px]">
      {links.map((link) => (
        <li key={link}>
          <a
            href="#"
            className="text-[0.85rem] text-[#555] no-underline hover:text-[#111] transition-colors duration-200"
          >
            {link}
          </a>
        </li>
      ))}
    </ul>
  </div>
)

export default FooterColumn
