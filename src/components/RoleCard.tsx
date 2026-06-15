import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

interface RoleCardProps {
  label: string
  title: string
  description: string
  to?: string
}

const RoleCard: React.FC<RoleCardProps> = ({
  label,
  title,
  description,
  to = '/',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -8 }}
    >
      <Link
        to={to}
        className="no-underline text-inherit bg-white border border-[#e7e7e7] rounded-3xl px-10 py-[50px] card-hover block transition-all duration-300"
      >
        <motion.span 
          className="block text-[#888] text-[0.9rem] mb-2.5"
          whileHover={{ color: '#111' }}
        >
          {label}
        </motion.span>
        <h2 className="text-[2rem] font-extrabold mb-3">{title}</h2>
        <p className="m-0 text-[#666] text-[0.95rem] group-hover:text-[#444] transition-colors">{description}</p>
      </Link>
    </motion.div>
  )
}

export default RoleCard

