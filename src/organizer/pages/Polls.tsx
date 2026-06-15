import React, { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import { useAuth } from '../../contexts/AuthContext'
import { pollService } from '../../services'
import type { Poll } from '../../types'
import {
  POLL_COLORS,
  fadeUp,
  stagger,
  getOptionPct,
  getLeadingOption,
  getEngagementPct,
  usePollToast,
  PollSkeleton,
  PollLeaderBadge,
  PollEmptyState,
  PollSearch,
  ClosePollModal,
  copyPollResults,
} from '../../components/polls/PollShared'

const ChartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
  </svg>
)

const AudienceIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
  </svg>
)

const LivePulse = () => (
  <span className="poll-live-pulse">
    <span className="poll-live-pulse__ring" />
    <span className="poll-live-pulse__dot" />
  </span>
)

const PollCard: React.FC<{
  poll: Poll
  onClose: (pollId: string) => void
  onCopy: (poll: Poll) => void
}> = ({ poll, onClose, onCopy }) => {
  const leader = getLeadingOption(poll)

  return (
    <div className="org-surface org-surface--elevated poll-org-card" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
        {poll.isLive ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <LivePulse />
            <span className="org-badge org-badge--success" style={{ fontSize: '0.68rem', fontWeight: 700 }}>LIVE POLL</span>
          </div>
        ) : (
          <span className="org-badge org-badge--neutral" style={{ fontSize: '0.68rem', fontWeight: 700 }}>CLOSED</span>
        )}
        <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--org-text-tertiary)', fontWeight: 600 }}>{poll.createdAt}</span>
      </div>

      <h3 className="poll-card__question" style={{ fontSize: '1rem' }}>{poll.question}</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {poll.options.map((option, i) => {
          const pct = getOptionPct(poll, option)
          const optionColor = POLL_COLORS[i % POLL_COLORS.length]
          const isLeader = leader?.id === option.id && poll.totalVotes > 0

          return (
            <div
              key={option.id}
              style={{
                position: 'relative',
                padding: '0.8rem 1rem',
                borderRadius: '0.6rem',
                border: isLeader ? `1.5px solid ${optionColor}` : '1px solid var(--org-border-default)',
                overflow: 'hidden',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <motion.div
                className="poll-result-bar"
                style={{ background: `${optionColor}12` }}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              />

              <span style={{ zIndex: 1, fontSize: '0.84rem', fontWeight: 650, color: 'var(--org-text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span className="poll-option-dot" style={{ background: optionColor }} />
                {isLeader && <PollLeaderBadge variant={poll.isLive ? 'leading' : 'winner'} />}
                {option.text}
              </span>

              <div style={{ zIndex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--org-text-secondary)' }}>({option.votes})</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: optionColor, fontVariantNumeric: 'tabular-nums' }}>{pct}%</span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="poll-card__footer" style={{ fontSize: '0.72rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
            <span>{poll.totalVotes} unique voters</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button className="poll-action-btn" onClick={() => onCopy(poll)} title="Copy results">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            Copy
          </button>
          {poll.isLive && (
            <button className="poll-action-btn poll-action-btn--danger" onClick={() => onClose(poll.id)}>
              Close Poll
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

const Polls: React.FC = () => {
  const { user } = useAuth()
  const [polls, setPolls] = useState<Poll[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [newQuestion, setNewQuestion] = useState('')
  const [newOptions, setNewOptions] = useState(['', ''])
  const [search, setSearch] = useState('')
  const [closingPollId, setClosingPollId] = useState<string | null>(null)
  const { showToast, Toast } = usePollToast()

  const fetchPolls = async () => {
    const res = await pollService.getPolls(user?.id)
    if (res.data) setPolls(res.data)
    setIsLoading(false)
  }

  useEffect(() => {
    fetchPolls()
    const interval = setInterval(fetchPolls, 5000)
    return () => clearInterval(interval)
  }, [user?.id])

  const handleClosePoll = (pollId: string) => setClosingPollId(pollId)

  const confirmClosePoll = async () => {
    if (!closingPollId) return
    const res = await pollService.closePoll(closingPollId)
    if (res.error) {
      showToast(res.error, 'error')
    } else {
      showToast('Poll closed and archived.', 'success')
      fetchPolls()
    }
    setClosingPollId(null)
  }

  const handleCreatePoll = async () => {
    if (!newQuestion.trim() || !user) return
    const filteredOpts = newOptions.filter(Boolean)
    if (filteredOpts.length < 2) {
      showToast('Add at least 2 options.', 'error')
      return
    }

    const res = await pollService.createPoll(newQuestion.trim(), filteredOpts, user.id)
    if (res.error) {
      showToast(res.error, 'error')
    } else {
      setNewQuestion('')
      setNewOptions(['', ''])
      setShowModal(false)
      showToast('Poll is live! Students can vote now.', 'success')
      fetchPolls()
    }
  }

  const handleCopyResults = async (poll: Poll) => {
    try {
      await copyPollResults(poll)
      showToast('Results copied to clipboard.', 'success')
    } catch {
      showToast('Could not copy results.', 'error')
    }
  }

  const addOption = () => setNewOptions((prev) => (prev.length < 6 ? [...prev, ''] : prev))
  const removeOption = (idx: number) => setNewOptions((prev) => prev.filter((_, i) => i !== idx))
  const updateOption = (idx: number, val: string) =>
    setNewOptions((prev) => prev.map((o, i) => (i === idx ? val : o)))

  const livePolls = polls.filter((p) => p.isLive)
  const closedPolls = polls.filter((p) => !p.isLive)
  const totalVotesCount = polls.reduce((s, p) => s + p.totalVotes, 0)
  const engagementPct = getEngagementPct(polls)
  const avgVotesPerPoll = polls.length > 0 ? Math.round(totalVotesCount / polls.length) : 0

  const filterBySearch = (list: Poll[]) => {
    const q = search.trim().toLowerCase()
    if (!q) return list
    return list.filter((p) => p.question.toLowerCase().includes(q))
  }

  const filteredLive = useMemo(() => filterBySearch(livePolls), [livePolls, search])
  const filteredClosed = useMemo(() => filterBySearch(closedPolls), [closedPolls, search])

  const closingPoll = polls.find((p) => p.id === closingPollId)
  const previewOptions = newOptions.filter(Boolean)

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="org-polls-container poll-page">
      <Toast />

      <PageHeader
        eyebrow="Console"
        title="Live Engagement & Feedback"
        subtitle="Create polls, track real-time responses, and archive results when done."
        actions={
          <button className="org-btn org-btn--accent" onClick={() => setShowModal(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.2rem' }}>
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Create Poll
          </button>
        }
      />

      <div className="poll-org-stats-grid">
        <motion.div className="org-surface org-surface--elevated poll-engagement-card" variants={fadeUp}>
          <div className="poll-donut" style={{ position: 'relative', width: 90, height: 90, flexShrink: 0 }}>
            <svg viewBox="0 0 36 36" width="100%" height="100%">
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--org-progress-track)" strokeWidth="3" />
              <motion.circle
                cx="18" cy="18" r="15.915"
                fill="none" stroke="#6C5CE7" strokeWidth="3.2"
                strokeLinecap="round"
                initial={{ strokeDasharray: '0 100' }}
                animate={{ strokeDasharray: `${engagementPct} ${100 - engagementPct}` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
              />
            </svg>
            <div className="poll-donut__center">
              <span className="poll-donut__value">{engagementPct}%</span>
            </div>
          </div>

          <div>
            <span className="poll-engagement-card__eyebrow">Engagement Rate</span>
            <h3 className="poll-engagement-card__title">Polls With Responses</h3>
            <p className="poll-engagement-card__desc">
              {polls.filter((p) => p.totalVotes > 0).length} of {polls.length} polls received votes.
              Avg. {avgVotesPerPoll} votes per poll.
            </p>
          </div>
        </motion.div>

        <div className="poll-org-mini-stats">
          <StatCard icon={<ChartIcon />} label="Total Polls" value={polls.length} colorClass="accent" index={0} />
          <StatCard icon={<AudienceIcon />} label="Cumulative Votes" value={totalVotesCount} colorClass="success" index={1} />
          <StatCard icon={<LivePulse />} label="Live Now" value={livePolls.length} colorClass="warning" index={2} />
        </div>
      </div>

      <motion.div variants={fadeUp} className="poll-toolbar" style={{ marginBottom: '1.5rem' }}>
        <PollSearch value={search} onChange={setSearch} placeholder="Search polls by question…" />
      </motion.div>

      {isLoading ? (
        <PollSkeleton count={2} />
      ) : (
        <div className="poll-org-grid">
          <motion.div variants={fadeUp}>
            <div className="org-section__header">
              <div>
                <h2 className="org-section__title" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <LivePulse /> Live Channels
                </h2>
                <p className="org-section__subtitle">Questions currently accepting student votes.</p>
              </div>
            </div>
            {filteredLive.length === 0 ? (
              <PollEmptyState
                icon={<ChartIcon />}
                title="No live polls"
                description='Click "Create Poll" to launch your first interactive question.'
              />
            ) : (
              filteredLive.map((poll) => (
                <PollCard key={poll.id} poll={poll} onClose={handleClosePoll} onCopy={handleCopyResults} />
              ))
            )}
          </motion.div>

          <motion.div variants={fadeUp}>
            <div className="org-section__header">
              <div>
                <h2 className="org-section__title">Archived Polls</h2>
                <p className="org-section__subtitle">Closed polls with finalized breakdowns.</p>
              </div>
            </div>
            {filteredClosed.length === 0 ? (
              <PollEmptyState
                icon={<ChartIcon />}
                title="No archived polls"
                description="Closed polls appear here with winner highlights and exportable results."
              />
            ) : (
              filteredClosed.map((poll) => (
                <PollCard key={poll.id} poll={poll} onClose={handleClosePoll} onCopy={handleCopyResults} />
              ))
            )}
          </motion.div>
        </div>
      )}

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
                className="org-modal poll-create-modal"
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

                <div className="poll-create-modal__body">
                  <div className="poll-create-modal__form">
                    <label className="org-label">
                      Poll Question
                      <input
                        className="org-input"
                        placeholder="e.g. Which workshop track should we repeat?"
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        maxLength={200}
                      />
                    </label>

                    <div>
                      <div className="org-label" style={{ marginBottom: '0.5rem' }}>Voting Options</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        {newOptions.map((opt, i) => (
                          <div key={i} style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                            <span className="poll-option-dot" style={{ background: POLL_COLORS[i % POLL_COLORS.length], flexShrink: 0 }} />
                            <input
                              className="org-input"
                              placeholder={`Option ${i + 1}`}
                              value={opt}
                              onChange={(e) => updateOption(i, e.target.value)}
                              maxLength={120}
                            />
                            {newOptions.length > 2 && (
                              <button className="org-btn org-btn--ghost" onClick={() => removeOption(i)} style={{ padding: '0.4rem' }}>×</button>
                            )}
                          </div>
                        ))}
                      </div>
                      {newOptions.length < 6 && (
                        <button className="org-btn org-btn--ghost" onClick={addOption} style={{ marginTop: '0.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--org-accent-text)' }}>
                          + Add Option
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="poll-create-modal__preview">
                    <span className="poll-create-modal__preview-label">Live Preview</span>
                    <div className="org-surface" style={{ padding: '1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.75rem' }}>
                        <LivePulse />
                        <span className="org-badge org-badge--success" style={{ fontSize: '0.65rem' }}>LIVE</span>
                      </div>
                      <p className="poll-card__question" style={{ fontSize: '0.9rem', marginBottom: '0.85rem' }}>
                        {newQuestion || 'Your poll question appears here…'}
                      </p>
                      {(previewOptions.length > 0 ? previewOptions : ['Option 1', 'Option 2']).map((opt, i) => (
                        <div key={i} className="poll-preview-option">
                          <span className="poll-option-dot" style={{ background: POLL_COLORS[i % POLL_COLORS.length] }} />
                          {opt}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="org-modal__footer">
                  <button className="org-btn org-btn--secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button
                    className="org-btn org-btn--accent"
                    onClick={handleCreatePoll}
                    disabled={!newQuestion.trim() || newOptions.filter(Boolean).length < 2}
                  >
                    Launch Poll
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      <ClosePollModal
        open={!!closingPoll}
        question={closingPoll?.question ?? ''}
        totalVotes={closingPoll?.totalVotes ?? 0}
        onConfirm={confirmClosePoll}
        onCancel={() => setClosingPollId(null)}
      />
    </motion.div>
  )
}

export default Polls
