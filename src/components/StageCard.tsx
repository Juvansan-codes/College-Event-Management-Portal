import React, { useRef, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'

interface StageCardProps {
  label: string
  title: string
  description: string
  to?: string
  cta?: string
  icon: React.ReactNode
}

const StageCard: React.FC<StageCardProps> = ({
  label,
  title,
  description,
  to = '/',
  cta = 'Get started',
  icon,
}) => {
  const cardRef = useRef<HTMLAnchorElement>(null)
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 })

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = ((y - centerY) / centerY) * -5
    const rotateY = ((x - centerX) / centerX) * 5
    setTilt({ rotateX, rotateY })
  }, [])

  const handleMouseLeave = useCallback(() => {
    setTilt({ rotateX: 0, rotateY: 0 })
  }, [])

  return (
    <Link
      ref={cardRef}
      to={to}
      className="stage-card"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(800px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
      }}
    >
      <div className="stage-card__icon">
        {icon}
      </div>
      <span className="stage-card__label">{label}</span>
      <h2 className="stage-card__title">{title}</h2>
      <p className="stage-card__description">{description}</p>
      <span className="stage-card__cta">
        {cta}
        <svg
          className="stage-card__cta-arrow"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </span>
    </Link>
  )
}

export default StageCard

