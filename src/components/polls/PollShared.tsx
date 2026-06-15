import React, { useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Poll, PollOption } from '../../types'

export const POLL_COLORS = ['#6C5CE7', '#3B82F6', '#10B981', '#F59E0B', '#EF4444']

export const fadeUp = {
  initial: { opacity: 0, y: 22, filter: 'blur(6px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] } },
}

export const stagger = { animate: { transition: { staggerChildren: 0.07 } } }

export const getOptionPct = (poll: Poll, option: PollOption) =>
  poll.totalVotes > 0 ? Math.round((option.votes / poll.totalVotes) * 100) : 0

export const getLeadingOption = (poll: Poll): PollOption | null => {
  if (!poll.options.length || poll.totalVotes === 0) return null
  return poll.options.reduce((best, opt) => (opt.votes > best.votes ? opt : best), poll.options[0])
}

export const getEngagementPct = (polls: Poll[]) =>
  polls.length === 0 ? 0 : Math.round((polls.filter((p) => p.totalVotes > 0).length / polls.length) * 100)

/* ─── Toast ─── */
export type ToastType = 'success' | 'error' | 'info'

interface ToastState {
  message: string
  type: ToastType
}

export const usePollToast = () => {
  const [toast, setToast] = useState<ToastState | null>(null)

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    setToast({ message, type })
  }, [])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3200)
    return () => clearTimeout(t)
  }, [toast])

  const Toast = () => (
    <AnimatePresence>
      {toast && (
        <motion.div
          className={`poll-toast poll-toast--${toast.type}`}
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.96 }}
          transition={{ duration: 0.28 }}
        >
          <span className="poll-toast__icon">
            {toast.type === 'success' && '✓'}
            {toast.type === 'error' && '✕'}
            {toast.type === 'info' && '●'}
          </span>
          {toast.message}
        </motion.div>
      )}
    </AnimatePresence>
  )

  return { showToast, Toast }
}

/* ─── Skeleton ─── */
export const PollSkeleton: React.FC<{ count?: number }> = ({ count = 2 }) => (
  <div className="poll-skeleton-grid">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="poll-skeleton-card">
        <div className="poll-skeleton-line poll-skeleton-line--sm" />
        <div className="poll-skeleton-line poll-skeleton-line--lg" />
        <div className="poll-skeleton-line poll-skeleton-line--md" />
        <div className="poll-skeleton-options">
          {[0, 1, 2].map((j) => (
            <div key={j} className="poll-skeleton-option" />
          ))}
        </div>
      </div>
    ))}
  </div>
)

/* ─── Winner / Leader Badge ─── */
export const PollLeaderBadge: React.FC<{ variant?: 'winner' | 'leading' }> = ({ variant = 'winner' }) => (
  <span className={`poll-leader-badge poll-leader-badge--${variant}`}>
    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7-6.3-4.6L6 21l2.3-7-6-4.6h7.6z" />
    </svg>
    {variant === 'winner' ? 'Winner' : 'Leading'}
  </span>
)

/* ─── Empty State ─── */
export const PollEmptyState: React.FC<{
  icon: React.ReactNode
  title: string
  description: string
}> = ({ icon, title, description }) => (
  <div className="poll-empty-state">
    <div className="poll-empty-state__icon">{icon}</div>
    <h3 className="poll-empty-state__title">{title}</h3>
    <p className="poll-empty-state__desc">{description}</p>
  </div>
)

/* ─── Tab Switcher ─── */
export type PollTab = 'active' | 'closed' | 'all'

interface PollTabsProps {
  active: PollTab
  onChange: (tab: PollTab) => void
  counts: { active: number; closed: number; all: number }
}

export const PollTabs: React.FC<PollTabsProps> = ({ active, onChange, counts }) => (
  <div className="poll-tabs" role="tablist">
    {([
      { id: 'active' as PollTab, label: 'Active', count: counts.active },
      { id: 'closed' as PollTab, label: 'Closed', count: counts.closed },
      { id: 'all' as PollTab, label: 'All', count: counts.all },
    ]).map((tab) => (
      <button
        key={tab.id}
        role="tab"
        aria-selected={active === tab.id}
        className={`poll-tabs__btn${active === tab.id ? ' poll-tabs__btn--active' : ''}`}
        onClick={() => onChange(tab.id)}
      >
        {tab.label}
        <span className="poll-tabs__count">{tab.count}</span>
      </button>
    ))}
  </div>
)

/* ─── Search ─── */
export const PollSearch: React.FC<{
  value: string
  onChange: (v: string) => void
  placeholder?: string
}> = ({ value, onChange, placeholder = 'Search polls…' }) => (
  <div className="poll-search">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
    <input
      type="search"
      className="poll-search__input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  </div>
)

/* ─── Vote Confirm Modal ─── */
interface VoteConfirmModalProps {
  open: boolean
  question: string
  optionText: string
  optionColor: string
  onConfirm: () => void
  onCancel: () => void
  isSubmitting?: boolean
}

export const VoteConfirmModal: React.FC<VoteConfirmModalProps> = ({
  open,
  question,
  optionText,
  optionColor,
  onConfirm,
  onCancel,
  isSubmitting,
}) => (
  <AnimatePresence>
    {open && (
      <motion.div
        className="org-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
      >
        <motion.div
          className="org-modal poll-confirm-modal"
          initial={{ opacity: 0, y: 18, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 18, scale: 0.97 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="poll-confirm-modal__header">
            <div className="poll-confirm-modal__icon" style={{ background: `${optionColor}18`, color: optionColor }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            </div>
            <h2 className="org-modal__title">Confirm Your Vote</h2>
            <p className="poll-confirm-modal__subtitle">Your choice is final — one vote per poll.</p>
          </div>

          <div className="poll-confirm-modal__preview">
            <span className="poll-confirm-modal__label">Poll</span>
            <p className="poll-confirm-modal__question">{question}</p>
            <span className="poll-confirm-modal__label">Your selection</span>
            <div className="poll-confirm-modal__choice" style={{ borderColor: optionColor, background: `${optionColor}10` }}>
              <span className="poll-confirm-modal__dot" style={{ background: optionColor }} />
              {optionText}
            </div>
          </div>

          <div className="org-modal__footer">
            <button className="org-btn org-btn--secondary" onClick={onCancel} disabled={isSubmitting}>
              Go Back
            </button>
            <button
              className="org-btn org-btn--accent"
              onClick={onConfirm}
              disabled={isSubmitting}
              style={{ background: optionColor, borderColor: optionColor }}
            >
              {isSubmitting ? 'Submitting…' : 'Cast Vote'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
)

/* ─── Close Poll Confirm ─── */
export const ClosePollModal: React.FC<{
  open: boolean
  question: string
  totalVotes: number
  onConfirm: () => void
  onCancel: () => void
}> = ({ open, question, totalVotes, onConfirm, onCancel }) => (
  <AnimatePresence>
    {open && (
      <motion.div
        className="org-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
      >
        <motion.div
          className="org-modal poll-confirm-modal"
          initial={{ opacity: 0, y: 18, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 18, scale: 0.97 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="poll-confirm-modal__header">
            <div className="poll-confirm-modal__icon poll-confirm-modal__icon--warn">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h2 className="org-modal__title">Close This Poll?</h2>
            <p className="poll-confirm-modal__subtitle">
              {totalVotes} vote{totalVotes !== 1 ? 's' : ''} collected. Students will no longer be able to vote.
            </p>
          </div>
          <p className="poll-confirm-modal__question" style={{ marginBottom: '1.25rem' }}>"{question}"</p>
          <div className="org-modal__footer">
            <button className="org-btn org-btn--secondary" onClick={onCancel}>Keep Open</button>
            <button className="org-btn" style={{ background: '#EF4444', borderColor: '#EF4444', color: '#fff' }} onClick={onConfirm}>
              Close Poll
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
)

/* ─── Copy Results ─── */
export const copyPollResults = (poll: Poll) => {
  const leader = getLeadingOption(poll)
  const lines = [
    `Poll: ${poll.question}`,
    `Status: ${poll.isLive ? 'Live' : 'Closed'}`,
    `Total votes: ${poll.totalVotes}`,
    '',
    ...poll.options.map((o) => {
      const pct = getOptionPct(poll, o)
      const tag = leader?.id === o.id ? ' ★' : ''
      return `• ${o.text}: ${o.votes} votes (${pct}%)${tag}`
    }),
  ]
  return navigator.clipboard.writeText(lines.join('\n'))
}
