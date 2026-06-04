import React from 'react'

interface RoleCardProps {
  label: string
  title: string
  description: string
  href?: string
}

const RoleCard: React.FC<RoleCardProps> = ({
  label,
  title,
  description,
  href = '#',
}) => {
  return (
    <a
      href={href}
      className="no-underline text-inherit bg-white border border-[#e7e7e7] rounded-3xl px-10 py-[50px] card-hover block"
    >
      <span className="block text-[#888] text-[0.9rem] mb-2.5">{label}</span>
      <h2 className="text-[2rem] font-extrabold mb-3">{title}</h2>
      <p className="m-0 text-[#666] text-[0.95rem]">{description}</p>
    </a>
  )
}

export default RoleCard
