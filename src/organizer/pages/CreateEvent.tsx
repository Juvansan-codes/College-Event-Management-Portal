import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useEvent } from '../../contexts/EventContext'

/* ─── Animations ─── */
const fadeUp = {
  initial: { opacity: 0, y: 25, filter: 'blur(8px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

const stagger = { animate: { transition: { staggerChildren: 0.06 } } }

const CATEGORIES = ['General', 'Technology', 'Cultural', 'Hackathon', 'Workshop', 'Concert', 'Sports', 'Conference']

const CreateEvent: React.FC = () => {
  const navigate = useNavigate()
  const { createEvent } = useEvent()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [venue, setVenue] = useState('')
  const [category, setCategory] = useState('General')
  const [maxAttendees, setMaxAttendees] = useState(500)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Event name is required')
      return
    }
    if (!startDate || !endDate) {
      setError('Start and end dates are required')
      return
    }
    if (new Date(endDate) < new Date(startDate)) {
      setError('End date cannot be before start date')
      return
    }

    setIsSubmitting(true)
    try {
      const created = await createEvent({
        name: name.trim(),
        description: description.trim() || null,
        start_date: startDate,
        end_date: endDate,
        venue: venue.trim() || null,
        category,
        max_attendees: maxAttendees,
        status: 'Draft',
      })

      if (created) {
        navigate('/organizer/dashboard')
      } else {
        setError('Failed to create event. Please make sure the events table exists in your Supabase database.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div variants={stagger} initial="initial" animate="animate">
      {/* Header */}
      <motion.div variants={fadeUp} style={{ marginBottom: '2rem' }}>
        <button
          onClick={() => navigate('/organizer')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--org-text-tertiary)',
            fontSize: '0.8rem',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            padding: 0,
            marginBottom: '1rem',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--org-text-primary)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--org-text-tertiary)')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
          </svg>
          Back to Events
        </button>

        <p style={{ fontSize: '0.68rem', fontWeight: 650, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--org-accent-text)', marginBottom: '0.35rem' }}>
          New Event
        </p>
        <h1 style={{ fontSize: 'clamp(1.6rem, 2.5vw, 2.1rem)', fontWeight: 780, letterSpacing: '-0.04em', color: 'var(--org-text-primary)', lineHeight: 1.15, marginBottom: '0.35rem' }}>
          Create Your Event
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--org-text-secondary)', lineHeight: 1.55, maxWidth: '500px' }}>
          Fill in the details to set up your college event. You can always edit these later.
        </p>
      </motion.div>

      {/* Form */}
      <motion.div variants={fadeUp}>
        <form
          onSubmit={handleSubmit}
          className="org-surface org-surface--elevated"
          style={{ padding: '2rem', maxWidth: '680px' }}
        >
          {error && (
            <div style={{
              padding: '0.75rem 1rem',
              borderRadius: '0.55rem',
              background: 'var(--org-danger-soft)',
              border: '1px solid rgba(var(--org-danger-rgb), 0.2)',
              color: 'var(--org-danger)',
              fontSize: '0.82rem',
              fontWeight: 500,
              marginBottom: '1.25rem',
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Event Name */}
            <label className="org-label">
              Event Name *
              <input
                className="org-input"
                placeholder="e.g. TechFest 2026, Hackathon Winter, Cultural Night"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </label>

            {/* Description */}
            <label className="org-label">
              Description
              <textarea
                className="org-textarea"
                placeholder="Brief description of your event — goals, theme, highlights…"
                style={{ minHeight: 100 }}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </label>

            {/* Dates */}
            <div className="org-form-grid">
              <label className="org-label">
                Start Date *
                <input
                  className="org-input"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </label>
              <label className="org-label">
                End Date *
                <input
                  className="org-input"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </label>
            </div>

            {/* Venue + Category */}
            <div className="org-form-grid">
              <label className="org-label">
                Venue / Location
                <input
                  className="org-input"
                  placeholder="e.g. Main Auditorium, Block A"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                />
              </label>
              <label className="org-label">
                Category
                <select
                  className="org-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>
            </div>

            {/* Max Attendees */}
            <label className="org-label">
              Maximum Attendees
              <input
                className="org-input"
                type="number"
                min={1}
                value={maxAttendees}
                onChange={(e) => setMaxAttendees(parseInt(e.target.value) || 1)}
              />
            </label>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid var(--org-border-subtle)' }}>
            <button
              type="button"
              className="org-btn org-btn--secondary"
              onClick={() => navigate('/organizer')}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="org-btn org-btn--accent"
              disabled={isSubmitting}
              style={{ opacity: isSubmitting ? 0.6 : 1 }}
            >
              {isSubmitting ? 'Creating…' : 'Create Event'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

export default CreateEvent
