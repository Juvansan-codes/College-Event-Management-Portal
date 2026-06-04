import React from 'react'
import FestForgeLogo from './FestForgeLogo'

const NAV_LINKS = [
  'Students Events',
  'Faculty',
  'Collaborators',
  'Event Partnerships',
  'Pricing',
  'Contact',
] as const

const Navbar: React.FC = () => {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-[#e7e7e7] flex items-center justify-between px-10 h-[60px]">
      {/* Logo */}
      <a
        href="#"
        className="flex items-center gap-2 text-[1.3rem] font-extrabold tracking-tight text-[#111] no-underline"
      >
        <FestForgeLogo size={22} />
        FestForge
      </a>

      {/* Nav links — hidden on mobile */}
      <ul className="hidden md:flex items-center gap-7 list-none">
        {NAV_LINKS.map((link) => (
          <li key={link}>
            <a
              href="#"
              className="text-[0.88rem] font-medium text-[#333] no-underline hover:text-black transition-colors duration-200"
            >
              {link}
            </a>
          </li>
        ))}
      </ul>

      {/* Actions */}
      <div className="flex items-center gap-2.5">
        <button className="px-[18px] py-[7px] rounded-lg border border-[#d0d0d0] bg-transparent text-[0.85rem] font-semibold text-[#111] cursor-pointer hover:bg-[#f5f5f5] hover:border-[#aaa] transition-all duration-200">
          Sign in
        </button>
        <button className="px-[18px] py-[7px] rounded-lg border-none bg-[#111] text-white text-[0.85rem] font-semibold cursor-pointer hover:bg-[#333] hover:-translate-y-px transition-all duration-200">
          Register
        </button>
      </div>
    </nav>
  )
}

export default Navbar
