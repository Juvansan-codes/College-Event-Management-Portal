import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: number
  prefix?: string
  suffix?: string
  trend?: string
  trendUp?: boolean
  colorClass?: string
  index?: number
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  prefix = '',
  suffix = '',
  trend,
  trendUp,
  colorClass = 'accent',
  index = 0,
}) => {
  const [displayed, setDisplayed] = useState(0)

  useEffect(() => {
    let frame: number
    const start = performance.now()
    const duration = 1200

    const animate = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayed(Math.round(eased * value))
      if (progress < 1) frame = requestAnimationFrame(animate)
    }

    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [value])

  return (
    <motion.div
      className="org-stat-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.08, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div className={`org-stat-card__icon org-stat-card__icon--${colorClass}`}>
        {icon}
      </div>
      <div className="org-stat-card__content">
        <div className="org-stat-card__label">{label}</div>
        <div className="org-stat-card__value">
          {prefix}{displayed.toLocaleString()}{suffix}
        </div>
        {trend && (
          <div className={`org-stat-card__trend org-stat-card__trend--${trendUp ? 'up' : 'down'}`}>
            {trendUp ? '↑' : '↓'} {trend}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default StatCard
