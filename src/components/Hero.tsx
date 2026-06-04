import React from 'react'
import RoleCard from './RoleCard'

const ROLE_CARDS = [
  {
    label: 'For',
    title: 'Organizers',
    description: 'Manage and run events.',
  },
  {
    label: 'For',
    title: 'Attendees',
    description: 'Discover and join events.',
  },
] as const

const Hero: React.FC = () => {
  return (
    <section className="min-h-[calc(100vh-60px)] flex flex-col justify-center items-center text-center px-10 pt-[60px] pb-10 md:px-5 md:pt-10 md:pb-[30px]">
      {/* Headline */}
      <h1
        className="text-[clamp(2.6rem,7vw,5rem)] leading-[1.08] font-extrabold tracking-[-0.05em] max-w-[780px] mb-5"
      >
        College Event
        <br />
        Management Platform
      </h1>

      {/* Tagline */}
      <p className="text-[1.05rem] text-[#666] mb-9 italic">
        "Make your dream college fest come true"
      </p>

      {/* CTA buttons */}
      <div className="flex gap-3 mb-20">
        <button className="px-[22px] py-2.5 rounded-lg border border-[#ccc] bg-white text-[0.9rem] font-semibold text-[#111] cursor-pointer hover:border-[#999] hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-200">
          Book an Event
        </button>
        <button className="px-[22px] py-2.5 rounded-lg border-none bg-[#111] text-white text-[0.9rem] font-semibold cursor-pointer hover:bg-[#333] hover:-translate-y-px transition-all duration-200">
          Register
        </button>
      </div>

      {/* Role cards grid */}
      <div className="grid grid-cols-2 gap-6 w-full max-w-[900px] md:grid-cols-1">
        {ROLE_CARDS.map((card) => (
          <RoleCard key={card.title} {...card} />
        ))}
      </div>
    </section>
  )
}

export default Hero
