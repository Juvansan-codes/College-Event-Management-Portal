import React, { useMemo } from 'react'
import { motion } from 'framer-motion'

interface Particle {
  id: number
  x: number
  y: number
  size: number
  duration: number
  delay: number
  dx: number
  dy: number
}

const PARTICLE_COUNT = 25

const AmbientParticles: React.FC = () => {
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 2 + Math.random() * 4,
      duration: 10 + Math.random() * 12,
      delay: Math.random() * 5,
      dx: (Math.random() - 0.5) * 40,
      dy: (Math.random() - 0.5) * 30,
    }))
  }, [])

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}
      aria-hidden="true"
    >
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="ambient-particle"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            x: [0, p.dx, -p.dx * 0.5, 0],
            y: [0, p.dy, -p.dy * 0.6, 0],
            opacity: [0.03, 0.08, 0.05, 0.03],
            scale: [1, 1.3, 0.9, 1],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

export default AmbientParticles
