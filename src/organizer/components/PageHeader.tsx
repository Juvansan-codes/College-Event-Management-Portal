import React from 'react'
import { motion } from 'framer-motion'

interface PageHeaderProps {
  eyebrow?: string
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

const PageHeader: React.FC<PageHeaderProps> = ({ eyebrow, title, subtitle, actions }) => {
  return (
    <motion.div
      className="org-page-header"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div className="org-page-header__row">
        <div>
          {eyebrow && <p className="org-page-header__eyebrow">{eyebrow}</p>}
          <h1 className="org-page-header__title">{title}</h1>
          {subtitle && <p className="org-page-header__subtitle">{subtitle}</p>}
        </div>
        {actions && <div className="org-page-header__actions">{actions}</div>}
      </div>
    </motion.div>
  )
}

export default PageHeader
