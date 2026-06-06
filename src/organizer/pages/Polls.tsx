import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'

/* ─── Metric Icons ─── */
const ChartIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
const AudienceIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>

/* ─── Types ─── */
interface PollOption {
  id: string
  text: string
  votes: number
}

interface Poll {
  id: string
  question: string
  options: PollOption[]
  isLive: boolean
  totalVotes: number
  createdAt: string
}

/* ─── Mock Data ─── */
const INITIAL_POLLS: Poll[] = [
  {
    id: '1',
    question: 'Which keynote track is your top priority for Day 2?',
    options: [
      { id: 'a', text: 'AI & Next-Gen Neural Networks', votes: 78 },
      { id: 'b', text: 'Web3 Paradigms & Sovereign Systems', votes: 34 },
      { id: 'c', text: 'Serverless Infrastructure scale limits', votes: 45 },
      { id: 'd', text: 'UX frameworks for AI Agents', votes: 52 },
    ],
    isLive: true,
    totalVotes: 209,
    createdAt: 'Active Just Now',
  },
  {
    id: '2',
    question: 'How would you rate the venue operations and catering blocks?',
    options: [
      { id: 'a', text: 'Flawless execution ⭐⭐⭐⭐⭐', votes: 94 },
      { id: 'b', text: 'Solid service flow ⭐⭐⭐⭐', votes: 56 },
      { id: 'c', text: 'Average checklist ⭐⭐⭐', votes: 12 },
      { id: 'd', text: 'Needs layout overhaul', votes: 4 },
    ],
    isLive: true,
    totalVotes: 166,
    createdAt: 'Active 2h ago',
  },
  {
    id: '3',
    question: 'Preferred start time for networking socials?',
    options: [
      { id: 'a', text: 'After luncheon (2:00 PM)', votes: 55 },
      { id: 'b', text: 'Post workshops (5:30 PM)', votes: 120 },
      { id: 'c', text: 'Late evening banquet (8:00 PM)', votes: 84 },
    ],
    isLive: false,
    totalVotes: 259,
    createdAt: 'Yesterday Archive',
  },
]

const POLL_COLORS = ['#6C5CE7', '#3B82F6', '#10B981', '#F59E0B', '#EF4444']

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] } },
}

const stagger = { animate: { transition: { staggerChildren: 0.06 } } }

/* ─── Custom Interactive Poll Card Component ─── */
const PollCard: React.FC<{ poll: Poll; onVote: (pollId: string, optionId: string) => void }> = ({ poll, onVote }) => {
  return (
    <div className="org-surface org-surface--elevated" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
        {poll.isLive ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span className="org-hero__eyebrow-dot" style={{ width: 8, height: 8 }} />
            <span className="org-badge org-badge--success" style={{ fontSize: '0.68rem', fontWeight: 700 }}>LIVE POLL</span>
          </div>
        ) : (
          <span className="org-badge org-badge--neutral" style={{ fontSize: '0.68rem', fontWeight: 700 }}>CLOSED ARCHIVE</span>
        )}
        <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--org-text-tertiary)', fontWeight: 600 }}>{poll.createdAt}</span>
      </div>

      <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--org-text-primary)', marginBottom: '1.25rem', letterSpacing: '-0.02em' }}>
        {poll.question}
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {poll.options.map((option, i) => {
          const pct = poll.totalVotes > 0 ? Math.round((option.votes / poll.totalVotes) * 100) : 0
          const optionColor = POLL_COLORS[i % POLL_COLORS.length]
          
          return (
            <div
              key={option.id}
              className="org-poll-option"
              onClick={() => poll.isLive && onVote(poll.id, option.id)}
              style={{
                position: 'relative',
                cursor: poll.isLive ? 'pointer' : 'default',
                padding: '0.8rem 1rem',
                borderRadius: '0.6rem',
                border: '1px solid var(--org-border-default)',
                overflow: 'hidden',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'border-color 0.2s ease'
              }}
            >
              {/* Animated Progress Bar fill */}
              <motion.div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  bottom: 0,
                  background: `${optionColor}12`,
                  zIndex: 0
                }}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              />

              <span style={{ zIndex: 1, fontSize: '0.84rem', fontWeight: 650, color: 'var(--org-text-primary)' }}>
                {option.text}
              </span>
              
              <div style={{ zIndex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--org-text-secondary)' }}>({option.votes} votes)</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: optionColor }}>{pct}%</span>
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--org-border-subtle)', paddingTop: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: 'var(--org-text-tertiary)', fontWeight: 600 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
          <span>{poll.totalVotes} Total Audience Response Plotted</span>
        </div>
        {poll.isLive && (
          <span style={{ color: 'var(--org-accent-text)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            ● Awaiting updates...
          </span>
        )}
      </div>
    </div>
  )
}

const Polls: React.FC = () => {
  const [polls, setPolls] = useState<Poll[]>(INITIAL_POLLS)
  const [showModal, setShowModal] = useState(false)
  const [newQuestion, setNewQuestion] = useState('')
  const [newOptions, setNewOptions] = useState(['', ''])

  const handleVote = (pollId: string, optionId: string) => {
    setPolls((prev) =>
      prev.map((p) => {
        if (p.id !== pollId) return p
        return {
          ...p,
          totalVotes: p.totalVotes + 1,
          options: p.options.map((o) =>
            o.id === optionId ? { ...o, votes: o.votes + 1 } : o
          ),
        }
      })
    )
  }

  const handleCreatePoll = () => {
    if (!newQuestion || newOptions.filter(Boolean).length < 2) return
    const poll: Poll = {
      id: Date.now().toString(),
      question: newQuestion,
      options: newOptions.filter(Boolean).map((text, i) => ({
        id: `opt_${i}`,
        text,
        votes: 0,
      })),
      isLive: true,
      totalVotes: 0,
      createdAt: 'Live Just Now',
    }
    setPolls((prev) => [poll, ...prev])
    setNewQuestion('')
    setNewOptions(['', ''])
    setShowModal(false)
  }

  const addOption = () => setNewOptions((prev) => [...prev, ''])
  const removeOption = (idx: number) => setNewOptions((prev) => prev.filter((_, i) => i !== idx))
  const updateOption = (idx: number, val: string) =>
    setNewOptions((prev) => prev.map((o, i) => (i === idx ? val : o)))

  const livePolls = polls.filter((p) => p.isLive)
  const closedPolls = polls.filter((p) => !p.isLive)
  const totalVotesCount = polls.reduce((s, p) => s + p.totalVotes, 0)

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="org-polls-container">
      <PageHeader
        eyebrow="Console"
        title="Live Engagement & Feedback"
        subtitle="Manage live interactive voting structures, collect feedback, and monitor analytics."
        actions={
          <button className="org-btn org-btn--accent" onClick={() => setShowModal(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.2rem' }}>
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Create Poll
          </button>
        }
      />

      {/* Target Revenue Progress Header & Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', marginBottom: '2rem', alignItems: 'stretch' }}>
        
        {/* SVG Circle Donut Engagement Distribution */}
        <motion.div className="org-surface org-surface--elevated" style={{ padding: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'center' }} variants={fadeUp}>
          
          {/* Donut graphic */}
          <div style={{ position: 'relative', width: 90, height: 90, flexShrink: 0 }}>
            <svg viewBox="0 0 36 36" width="100%" height="100%">
              {/* Outer backdrop path */}
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--org-progress-track)" strokeWidth="3" />
              {/* Ring segment: 75% for Active voters, stroke-dasharray="75 25" */}
              <motion.circle
                cx="18" cy="18" r="15.915"
                fill="none" stroke="#6C5CE7" strokeWidth="3.2"
                strokeDasharray="72 28"
                strokeDashoffset="25"
                initial={{ strokeDasharray: "0 100" }}
                animate={{ strokeDasharray: "72 28" }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
              <span style={{ fontSize: '1rem', fontWeight: 850, color: 'var(--org-text-primary)' }}>72%</span>
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--org-text-tertiary)', fontWeight: 700, display: 'block' }}>Response Rate metrics</span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--org-text-primary)', marginTop: '0.15rem' }}>Active Voter Response</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--org-text-secondary)', lineHeight: 1.4, marginTop: '0.2rem' }}>
              Audited from total registrants database. Live engagement rate stands high.
            </p>
          </div>
        </motion.div>

        {/* mini stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <StatCard icon={<ChartIcon />} label="Total Polls" value={polls.length} colorClass="accent" index={0} />
          <StatCard icon={<AudienceIcon />} label="Cumulative Votes" value={totalVotesCount} colorClass="success" index={1} />
        </div>
      </div>

      {/* Grid: Live Polls + Archived Side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Live Active Polls */}
        <motion.div variants={fadeUp}>
          <div className="org-section__header">
            <div>
              <h2 className="org-section__title" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span className="org-hero__eyebrow-dot" /> Live Feedback Channels
              </h2>
              <p className="org-section__subtitle">Broadcasted questions currently accepting votes from students.</p>
            </div>
          </div>
          {livePolls.map((poll) => (
            <PollCard key={poll.id} poll={poll} onVote={handleVote} />
          ))}
        </motion.div>

        {/* Closed/Archived Polls */}
        <motion.div variants={fadeUp}>
          <div className="org-section__header">
            <div>
              <h2 className="org-section__title">Archived Polls</h2>
              <p className="org-section__subtitle">Concluded questions with finalized audience breakdowns.</p>
            </div>
          </div>
          {closedPolls.map((poll) => (
            <PollCard key={poll.id} poll={poll} onVote={handleVote} />
          ))}
        </motion.div>
      </div>

      {/* Create Poll Modal */}
      {createPortal(
        <AnimatePresence>
          {showModal && (
            <motion.div
              className="org-modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
            >
              <motion.div
                className="org-modal"
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.98 }}
                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="org-modal__header">
                  <h2 className="org-modal__title">Create Interactive Poll</h2>
                  <button className="org-modal__close" onClick={() => setShowModal(false)}>×</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <label className="org-label">
                    Poll Question
                    <input
                      className="org-input"
                      placeholder="e.g. Which project track won your vote?"
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                    />
                  </label>

                  <div>
                    <div className="org-label" style={{ marginBottom: '0.5rem' }}>Voting Options</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      {newOptions.map((opt, i) => (
                        <div key={i} style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                          <input
                            className="org-input"
                            placeholder={`Option #${i + 1}`}
                            value={opt}
                            onChange={(e) => updateOption(i, e.target.value)}
                          />
                          {newOptions.length > 2 && (
                            <button className="org-btn org-btn--ghost" onClick={() => removeOption(i)} style={{ padding: '0.4rem' }}>
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button className="org-btn org-btn--ghost" onClick={addOption} style={{ alignSelf: 'flex-start', marginTop: '0.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--org-accent-text)' }}>
                      + Add Option
                    </button>
                  </div>
                </div>

                <div className="org-modal__footer">
                  <button className="org-btn org-btn--secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button className="org-btn org-btn--accent" onClick={handleCreatePoll}>Create Poll</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </motion.div>
  )
}

export default Polls
