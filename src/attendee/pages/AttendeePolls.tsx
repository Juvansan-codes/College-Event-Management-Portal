import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { pollService } from '../../services'
import type { Poll } from '../../types'
import {
  POLL_COLORS,
  fadeUp,
  stagger,
  getOptionPct,
  getLeadingOption,
  usePollToast,
  PollSkeleton,
  PollLeaderBadge,
  PollEmptyState,
  PollTabs,
  PollSearch,
  VoteConfirmModal,
  type PollTab,
} from '../../components/polls/PollShared'

const ChartIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
  </svg>
)

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const LivePulse = () => (
  <span className="poll-live-pulse">
    <span className="poll-live-pulse__ring" />
    <span className="poll-live-pulse__dot" />
  </span>
)

interface AttendeePollCardProps {
  poll: Poll
  onSelectOption: (pollId: string, optionId: string, optionText: string, color: string) => void
  justVoted?: boolean
}

const AttendeePollCard: React.FC<AttendeePollCardProps> = ({ poll, onSelectOption, justVoted }) => {
  const hasVoted = !!poll.userVotedOptionId
  const leader = getLeadingOption(poll)
  const showResults = !poll.isLive || hasVoted

  return (
    <motion.div
      variants={fadeUp}
      className={`org-surface org-surface--elevated att-poll-card${justVoted ? ' att-poll-card--voted' : ''}`}
      style={{ padding: '1.75rem', marginBottom: '1.5rem', position: 'relative', overflow: 'hidden' }}
    >
      <div className="poll-card__glow" aria-hidden />

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
        {poll.isLive ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <LivePulse />
            <span className="org-badge org-badge--success" style={{ fontSize: '0.7rem', fontWeight: 800 }}>LIVE POLL</span>
          </div>
        ) : (
          <span className="org-badge org-badge--neutral" style={{ fontSize: '0.7rem', fontWeight: 800 }}>CLOSED</span>
        )}
        <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--org-text-tertiary)', fontWeight: 600 }}>{poll.createdAt}</span>
      </div>

      <h3 className="poll-card__question">{poll.question}</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {poll.options.map((option, i) => {
          const isSelected = poll.userVotedOptionId === option.id
          const pct = getOptionPct(poll, option)
          const optionColor = POLL_COLORS[i % POLL_COLORS.length]
          const isLeader = leader?.id === option.id && poll.totalVotes > 0

          if (poll.isLive && !hasVoted) {
            return (
              <motion.button
                key={option.id}
                className="att-poll-option poll-vote-btn"
                onClick={() => onSelectOption(poll.id, option.id, option.text, optionColor)}
                whileHover={{ scale: 1.01, borderColor: optionColor, backgroundColor: `${optionColor}08` }}
                whileTap={{ scale: 0.99 }}
                style={{
                  width: '100%',
                  padding: '1rem 1.25rem',
                  borderRadius: '0.75rem',
                  border: '1px solid var(--org-border-default)',
                  background: 'var(--org-surface-bg)',
                  color: 'var(--org-text-primary)',
                  fontSize: '0.88rem',
                  fontWeight: 650,
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span className="poll-option-dot" style={{ background: optionColor }} />
                  {option.text}
                </span>
                <span className="poll-option-radio" />
              </motion.button>
            )
          }

          return (
            <div
              key={option.id}
              className={`att-poll-option${isSelected ? ' selected' : ''}`}
              style={{
                position: 'relative',
                padding: '1rem 1.25rem',
                borderRadius: '0.75rem',
                border: isSelected ? `1.5px solid ${optionColor}` : '1px solid var(--org-border-default)',
                background: 'var(--org-surface-bg)',
                overflow: 'hidden',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <motion.div
                className="poll-result-bar"
                style={{ background: `${optionColor}${isSelected ? '1C' : '10'}` }}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
              />

              <span style={{ zIndex: 1, fontSize: '0.88rem', fontWeight: isSelected ? 750 : 600, color: isSelected ? optionColor : 'var(--org-text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                {isSelected && (
                  <span className="poll-voted-chip" style={{ background: optionColor }}>
                    <CheckIcon /> Voted
                  </span>
                )}
                {showResults && isLeader && (
                  <PollLeaderBadge variant={poll.isLive ? 'leading' : 'winner'} />
                )}
                {option.text}
              </span>

              <div style={{ zIndex: 1, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--org-text-secondary)' }}>({option.votes})</span>
                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: optionColor, fontVariantNumeric: 'tabular-nums' }}>{pct}%</span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="poll-card__footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
          <span>{poll.totalVotes} students voted</span>
        </div>
        {poll.isLive ? (
          hasVoted ? (
            <span className="poll-status poll-status--success">
              <CheckIcon /> Vote recorded — results update live
            </span>
          ) : (
            <span className="poll-status poll-status--pending">● Tap an option to vote</span>
          )
        ) : (
          <span className="poll-status">Final results</span>
        )}
      </div>
    </motion.div>
  )
}

const AttendeePolls: React.FC = () => {
  const { user } = useAuth()
  const [polls, setPolls] = useState<Poll[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<PollTab>('active')
  const [search, setSearch] = useState('')
  const [pendingVote, setPendingVote] = useState<{
    pollId: string
    optionId: string
    optionText: string
    optionColor: string
    question: string
  } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [justVotedId, setJustVotedId] = useState<string | null>(null)
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

  const livePolls = polls.filter((p) => p.isLive)
  const closedPolls = polls.filter((p) => !p.isLive)
  const votedCount = polls.filter((p) => p.userVotedOptionId).length
  const totalVotes = polls.reduce((s, p) => s + p.totalVotes, 0)

  const filteredPolls = useMemo(() => {
    const base = activeTab === 'active' ? livePolls : activeTab === 'closed' ? closedPolls : polls
    const q = search.trim().toLowerCase()
    if (!q) return base
    return base.filter((p) => p.question.toLowerCase().includes(q))
  }, [activeTab, search, polls, livePolls, closedPolls])

  const handleSelectOption = (pollId: string, optionId: string, optionText: string, optionColor: string) => {
    const poll = polls.find((p) => p.id === pollId)
    if (!poll) return
    setPendingVote({ pollId, optionId, optionText, optionColor, question: poll.question })
  }

  const handleConfirmVote = async () => {
    if (!user || !pendingVote) return
    setIsSubmitting(true)
    const res = await pollService.vote(pendingVote.pollId, pendingVote.optionId, user.id)
    setIsSubmitting(false)

    if (res.error) {
      showToast(res.error, 'error')
    } else {
      setJustVotedId(pendingVote.pollId)
      showToast('Vote cast! Results are updating live.', 'success')
      setTimeout(() => setJustVotedId(null), 2000)
      fetchPolls()
    }
    setPendingVote(null)
  }

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="org-dashboard-container poll-page">
      <Toast />

      <motion.div className="org-hero poll-hero" variants={fadeUp}>
        <div className="org-hero__content">
          <div className="poll-hero__eyebrow">
            <span style={{ color: 'var(--org-accent-text)' }}><ChartIcon /></span>
            <span>Student Voice</span>
            <span className="poll-hero__live-tag"><LivePulse /> Real-time</span>
          </div>
          <h1 className="org-hero__title">Live Interactive Polls</h1>
          <p className="org-hero__desc">
            Shape campus events with your vote. See results update instantly as fellow students participate.
          </p>
        </div>

        <div className="poll-mini-stats">
          <div className="poll-mini-stat">
            <span className="poll-mini-stat__value">{livePolls.length}</span>
            <span className="poll-mini-stat__label">Active</span>
          </div>
          <div className="poll-mini-stat">
            <span className="poll-mini-stat__value">{votedCount}</span>
            <span className="poll-mini-stat__label">You voted</span>
          </div>
          <div className="poll-mini-stat">
            <span className="poll-mini-stat__value">{totalVotes}</span>
            <span className="poll-mini-stat__label">Total votes</span>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="poll-toolbar">
        <PollTabs
          active={activeTab}
          onChange={setActiveTab}
          counts={{ active: livePolls.length, closed: closedPolls.length, all: polls.length }}
        />
        <PollSearch value={search} onChange={setSearch} />
      </motion.div>

      {isLoading ? (
        <PollSkeleton count={2} />
      ) : filteredPolls.length === 0 ? (
        <PollEmptyState
          icon={<ChartIcon />}
          title={search ? 'No matching polls' : activeTab === 'active' ? 'No active polls' : 'Nothing here yet'}
          description={
            search
              ? 'Try a different search term.'
              : activeTab === 'active'
                ? 'Check back soon — organizers may launch a poll during the event.'
                : 'Closed polls will appear here once organizers archive them.'
          }
        />
      ) : (
        <div className="poll-list">
          {filteredPolls.map((poll) => (
            <AttendeePollCard
              key={poll.id}
              poll={poll}
              onSelectOption={handleSelectOption}
              justVoted={justVotedId === poll.id}
            />
          ))}
        </div>
      )}

      <VoteConfirmModal
        open={!!pendingVote}
        question={pendingVote?.question ?? ''}
        optionText={pendingVote?.optionText ?? ''}
        optionColor={pendingVote?.optionColor ?? POLL_COLORS[0]}
        onConfirm={handleConfirmVote}
        onCancel={() => setPendingVote(null)}
        isSubmitting={isSubmitting}
      />
    </motion.div>
  )
}

export default AttendeePolls
