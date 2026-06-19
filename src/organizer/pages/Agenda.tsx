import React, { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import PageHeader from '../components/PageHeader'
import { useEvent } from '../../contexts/EventContext'
import { agendaService } from '../../services'
import type { AgendaItem } from '../../services/agendaService'

/* ─── Constants ─── */
const CATEGORY_COLORS: Record<string, string> = {
  'Workshop': '#6C5CE7',
  'Talk': '#3B82F6',
  'Panel': '#10B981',
  'Break': '#F59E0B',
  'Competition': '#EF4444'
}

const TIMELINE_HOURS = [
  { label: '09:00 AM', hour: 9 },
  { label: '10:00 AM', hour: 10 },
  { label: '11:00 AM', hour: 11 },
  { label: '12:00 PM', hour: 12 },
  { label: '01:00 PM', hour: 13 },
  { label: '02:00 PM', hour: 14 },
  { label: '03:00 PM', hour: 15 },
  { label: '04:00 PM', hour: 16 },
  { label: '05:00 PM', hour: 17 },
  { label: '06:00 PM', hour: 18 }
]

/* ─── Animation Variants ─── */
const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] } },
}

const stagger = {
  animate: { transition: { staggerChildren: 0.06 } },
}

/* ─── Helper: parse time label to hour int ─── */
function timeToHour(time: string): number {
  const match24 = time.match(/^(\d{1,2}):(\d{2})$/)
  if (match24) return parseInt(match24[1], 10)

  const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (!match) return 9
  let h = parseInt(match[1], 10)
  const period = match[3].toUpperCase()
  if (period === 'PM' && h !== 12) h += 12
  if (period === 'AM' && h === 12) h = 0
  return h
}

function formatTime12Hour(time: string): string {
  const match24 = time.match(/^(\d{1,2}):(\d{2})$/)
  if (match24) {
    let h = parseInt(match24[1], 10)
    const m = match24[2]
    const ampm = h >= 12 ? 'PM' : 'AM'
    h = h % 12
    if (h === 0) h = 12
    const hStr = h < 10 ? '0' + h : h.toString()
    return `${hStr}:${m} ${ampm}`
  }
  return time
}

function convertTo24Hour(time: string): string {
  const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (!match) return time
  let h = parseInt(match[1], 10)
  const m = match[2]
  const period = match[3].toUpperCase()
  if (period === 'PM' && h !== 12) h += 12
  if (period === 'AM' && h === 12) h = 0
  const hStr = h < 10 ? '0' + h : h.toString()
  return `${hStr}:${m}`
}

/* ─── Component ─── */
const Agenda: React.FC = () => {
  const { activeEvent } = useEvent()

  /* ── State ── */
  const [allItems, setAllItems] = useState<AgendaItem[]>([])
  const [dayNumbers, setDayNumbers] = useState<number[]>([1])
  const [activeDay, setActiveDay] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [conflictMsg, setConflictMsg] = useState<string | null>(null)

  const [showModal, setShowModal] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState<AgendaItem | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)

  // Form state for creating
  const [newActivity, setNewActivity] = useState({
    time: '09:00', title: '', speaker: '', venue: '', category: 'Talk', description: ''
  })

  // Form state for editing
  const [editForm, setEditForm] = useState({
    time: '', title: '', speaker: '', venue: '', category: '', description: ''
  })

  const currentActivities = allItems
    .filter(item => item.day_number === activeDay)
    .sort((a, b) => a.hour - b.hour)

  /* ── Fetch agenda data ── */
  const fetchAgenda = useCallback(async () => {
    if (!activeEvent) return

    setIsLoading(true)
    setError(null)

    const { data, error: err } = await agendaService.getAgendaByEvent(activeEvent.id)

    if (err) {
      setError(err)
      setIsLoading(false)
      return
    }

    const items = data || []
    setAllItems(items)

    // Compute unique day numbers
    const days = [...new Set(items.map(i => i.day_number))].sort((a, b) => a - b)
    if (days.length === 0) days.push(1)
    setDayNumbers(days)

    // If active day is not in the list, reset to first day
    if (!days.includes(activeDay)) {
      setActiveDay(days[0])
    }

    setIsLoading(false)
  }, [activeEvent, activeDay])

  useEffect(() => {
    fetchAgenda()
  }, [fetchAgenda])

  /* ── Create activity ── */
  const handleAddActivity = async () => {
    if (!activeEvent || !newActivity.title || !newActivity.time) return

    const hour = timeToHour(newActivity.time)

    // Conflict check: same day + same hour
    const conflict = currentActivities.find(a => a.hour === hour)
    if (conflict) {
      setConflictMsg(
        `Scheduling conflict: "${conflict.title}" is already scheduled at ${conflict.time_label} on Day ${activeDay}. Please choose a different time slot.`
      )
      return
    }

    setConflictMsg(null)
    setIsSaving(true)

    const timeLabel12h = formatTime12Hour(newActivity.time)

    const { error: err } = await agendaService.createAgendaItem(activeEvent.id, {
      day_number: activeDay,
      time_label: timeLabel12h,
      hour,
      title: newActivity.title,
      speaker: newActivity.speaker,
      venue: newActivity.venue,
      category: newActivity.category,
      description: newActivity.description,
    })

    setIsSaving(false)

    if (err) {
      setError(err)
      return
    }

    setNewActivity({ time: '09:00', title: '', speaker: '', venue: '', category: 'Talk', description: '' })
    setShowModal(false)
    await fetchAgenda()
  }

  /* ── Delete activity ── */
  const handleDeleteActivity = async (id: string) => {
    setIsSaving(true)
    const { error: err } = await agendaService.deleteAgendaItem(id)
    setIsSaving(false)

    if (err) {
      setError(err)
      return
    }

    setSelectedActivity(null)
    await fetchAgenda()
  }

  /* ── Open edit modal ── */
  const handleOpenEdit = (act: AgendaItem) => {
    setEditForm({
      time: convertTo24Hour(act.time_label),
      title: act.title,
      speaker: act.speaker,
      venue: act.venue,
      category: act.category,
      description: act.description,
    })
    setSelectedActivity(act)
    setShowEditModal(true)
  }

  /* ── Save edit ── */
  const handleSaveEdit = async () => {
    if (!selectedActivity || !editForm.title) return

    const hour = timeToHour(editForm.time)

    // Conflict check: same day + same hour, but exclude the item being edited
    const conflict = currentActivities.find(a => a.hour === hour && a.id !== selectedActivity.id)
    if (conflict) {
      setConflictMsg(
        `Scheduling conflict: "${conflict.title}" is already scheduled at ${conflict.time_label} on Day ${activeDay}. Please choose a different time slot.`
      )
      return
    }

    setConflictMsg(null)
    setIsSaving(true)

    const timeLabel12h = formatTime12Hour(editForm.time)

    const { error: err } = await agendaService.updateAgendaItem(selectedActivity.id, {
      time_label: timeLabel12h,
      hour,
      title: editForm.title,
      speaker: editForm.speaker,
      venue: editForm.venue,
      category: editForm.category,
      description: editForm.description,
    })

    setIsSaving(false)

    if (err) {
      setError(err)
      return
    }

    setShowEditModal(false)
    setSelectedActivity(null)
    await fetchAgenda()
  }

  /* ── Add new day ── */
  const handleAddDay = () => {
    const nextDay = dayNumbers.length > 0 ? Math.max(...dayNumbers) + 1 : 1
    setDayNumbers(prev => [...prev, nextDay])
    setActiveDay(nextDay)
  }

  /* ── Export PDF ── */
  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const categoriesHtml = Object.keys(CATEGORY_COLORS).map(cat =>
      `<span style="display:inline-block; margin-right: 15px; font-size: 12px; color: #444;">
        <span style="display:inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${CATEGORY_COLORS[cat]}; margin-right: 5px;"></span>
        ${cat}
       </span>`
    ).join('')

    const activitiesHtml = currentActivities.map(act => `
      <tr style="border-bottom: 1px solid #eaeaea;">
        <td style="padding: 14px 16px; font-weight: 700; color: #111; font-size: 13px; white-space: nowrap;">${act.time_label}</td>
        <td style="padding: 14px 16px;">
          <div style="font-weight: 700; color: #6C5CE7; font-size: 14px; margin-bottom: 3px;">${act.title}</div>
          <div style="color: #555; font-size: 12px;">${act.description || 'No detailed description.'}</div>
        </td>
        <td style="padding: 14px 16px;"><span style="display: inline-block; padding: 3px 8px; border-radius: 12px; background: ${CATEGORY_COLORS[act.category] || '#6C5CE7'}15; color: ${CATEGORY_COLORS[act.category] || '#6C5CE7'}; font-size: 11px; font-weight: 700;">${act.category}</span></td>
        <td style="padding: 14px 16px; font-weight: 600; color: #333; font-size: 13px;">${act.speaker || '—'}</td>
        <td style="padding: 14px 16px; color: #555; font-size: 12px; font-style: italic;">${act.venue || '—'}</td>
      </tr>
    `).join('')

    const eventName = activeEvent?.name || 'Event'

    printWindow.document.write(`
      <html>
        <head>
          <title>${eventName} — Day ${activeDay} Agenda</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #333; line-height: 1.5; }
            .header { border-bottom: 2px solid #6C5CE7; padding-bottom: 20px; margin-bottom: 25px; }
            .logo { font-size: 22px; font-weight: 800; color: #6C5CE7; letter-spacing: -0.5px; }
            .title { font-size: 26px; font-weight: 800; margin-top: 8px; margin-bottom: 4px; color: #111; }
            .subtitle { font-size: 13px; color: #666; margin-bottom: 0; }
            .meta-bar { display: flex; gap: 40px; background: #f8f9fa; padding: 15px 20px; border-radius: 8px; margin-bottom: 30px; border: 1px solid #eee; }
            .meta-item { display: flex; flex-direction: column; }
            .meta-label { font-size: 10px; color: #888; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; }
            .meta-val { font-size: 14px; color: #222; font-weight: 700; margin-top: 3px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background: #f4f5f6; text-align: left; padding: 12px 16px; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #666; border-bottom: 2px solid #ddd; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div class="logo">FESTFORGE</div>
              <div style="font-size: 11px; color: #999;">Exported: ${new Date().toLocaleDateString()}</div>
            </div>
            <h1 class="title">${eventName} — Day ${activeDay} Schedule</h1>
            <p class="subtitle">Official timeline mapping scheduled panels, talks, workshops, and student tracks.</p>
          </div>
          
          <div class="meta-bar">
            <div class="meta-item">
              <span class="meta-label">Schedule Block</span>
              <span class="meta-val">Day ${activeDay} Roster</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Total Activities</span>
              <span class="meta-val">${currentActivities.length} Slots Plotted</span>
            </div>
          </div>

          <div style="margin-bottom: 25px; border-bottom: 1px solid #f0f0f0; padding-bottom: 15px;">
            <span style="font-size: 11px; color: #888; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; display: block; margin-bottom: 8px;">Track Filter</span>
            ${categoriesHtml}
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 15%">Time</th>
                <th style="width: 45%">Activity & Description</th>
                <th style="width: 15%">Track</th>
                <th style="width: 15%">Host / Speaker</th>
                <th style="width: 10%">Venue</th>
              </tr>
            </thead>
            <tbody>
              ${activitiesHtml}
            </tbody>
          </table>

          <div style="margin-top: 60px; text-align: center; font-size: 11px; color: #aaa; border-top: 1px solid #eee; padding-top: 20px;">
            FestForge Enterprise Event Portal. This agenda is subject to operational updates.
          </div>
          
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  /* ── Render ── */
  return (
    <motion.div variants={stagger} initial="initial" animate="animate">
      <PageHeader
        eyebrow="Console"
        title="Event Agenda Planner"
        subtitle="Notion-style chronological calendar and speaker schedule planning workspace."
        actions={
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button className="org-btn org-btn--secondary" onClick={handleExportPDF} disabled={currentActivities.length === 0}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.2rem' }}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Export PDF
            </button>
            <button className="org-btn org-btn--accent" onClick={() => setShowModal(true)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.2rem' }}>
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Activity
            </button>
          </div>
        }
      />

      {/* Error Banner */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '0.75rem',
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            color: '#EF4444',
            fontSize: '0.85rem',
            fontWeight: 600,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontWeight: 700, fontSize: '1rem' }}
          >
            ×
          </button>
        </motion.div>
      )}

      {/* Day Tabs */}
      <motion.div className="org-tabs" variants={fadeUp} style={{ marginBottom: '1.5rem' }}>
        {dayNumbers.map((dayNum) => (
          <button
            key={dayNum}
            className={`org-tab ${activeDay === dayNum ? 'active' : ''}`}
            onClick={() => setActiveDay(dayNum)}
          >
            Day {dayNum} Plan
          </button>
        ))}
        <button
          className="org-tab"
          onClick={handleAddDay}
          style={{ color: 'var(--org-accent-text)', fontWeight: 600 }}
        >
          + Add New Day
        </button>
      </motion.div>

      {/* Loading State */}
      {isLoading ? (
        <div className="org-surface org-surface--elevated" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5rem 2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.9rem', color: 'var(--org-text-secondary)', fontWeight: 500 }}>Loading agenda…</div>
        </div>
      ) : (
        /* Calendar / Timeline */
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
          {currentActivities.length === 0 ? (
            <div className="org-surface org-surface--elevated" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 2rem', textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--org-accent-soft)', color: 'var(--org-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
                </svg>
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--org-text-primary)' }}>No Activities Plotted</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--org-text-secondary)', maxWidth: 300, marginTop: '0.25rem', marginBottom: '1.25rem' }}>
                This schedule block is empty. Add speaker activities and launch day slots.
              </p>
              <button className="org-btn org-btn--accent" onClick={() => setShowModal(true)}>Add First Activity</button>
            </div>
          ) : (
            <div className="org-calendar-container org-surface org-surface--elevated">
              {/* Left Hours Sidebar */}
              <div className="org-calendar-hours-column">
                {TIMELINE_HOURS.map((t) => (
                  <div key={t.label} className="org-calendar-hour-slot">
                    <span className="org-calendar-hour-label">{t.label}</span>
                    <div className="org-calendar-grid-line" />
                  </div>
                ))}
              </div>

              {/* Plotted Activity Cards */}
              <div className="org-calendar-agenda-container">
                {currentActivities.map((act) => {
                  const topOffset = (act.hour - 9) * 82 + 10
                  const catColor = CATEGORY_COLORS[act.category] || '#6C5CE7'

                  return (
                    <motion.div
                      key={act.id}
                      className="org-calendar-card"
                      style={{
                        top: `${topOffset}px`,
                        borderLeftColor: catColor,
                        '--cat-tint': `${catColor}12`
                      } as React.CSSProperties}
                      whileHover={{ scale: 1.015, x: 4 }}
                      onClick={() => setSelectedActivity(act)}
                    >
                      <div className="org-calendar-card__badge" style={{ color: catColor, background: `${catColor}15` }}>
                        {act.category}
                      </div>
                      <span className="org-calendar-card__time">{act.time_label}</span>
                      <h4 className="org-calendar-card__title">{act.title}</h4>
                      <div className="org-calendar-card__footer-meta">
                        {act.speaker && (
                          <span className="org-calendar-card__meta-item">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                            {act.speaker}
                          </span>
                        )}
                        {act.venue && (
                          <span className="org-calendar-card__meta-item">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                            {act.venue}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── View Activity Detail Modal ─── */}
      {createPortal(
        <AnimatePresence>
          {selectedActivity && !showEditModal && (
            <motion.div
              className="org-modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedActivity(null)}
            >
              <motion.div
                className="org-modal"
                initial={{ opacity: 0, y: 25, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 25, scale: 0.98 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="org-modal__header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span className="org-badge" style={{ background: `${CATEGORY_COLORS[selectedActivity.category]}20`, color: CATEGORY_COLORS[selectedActivity.category] }}>
                      {selectedActivity.category}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--org-text-secondary)', fontWeight: 600 }}>{selectedActivity.time_label}</span>
                  </div>
                  <button className="org-modal__close" onClick={() => setSelectedActivity(null)}>×</button>
                </div>

                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--org-text-primary)' }}>
                  {selectedActivity.title}
                </h2>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.25rem', borderBottom: '1px solid var(--org-border-subtle)', paddingBottom: '1.25rem' }}>
                  <div>
                    <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--org-text-tertiary)', fontWeight: 700 }}>Speaker / Host</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                      <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--org-accent-soft)', color: 'var(--org-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700 }}>
                        {(selectedActivity.speaker || 'SP').split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{selectedActivity.speaker || 'No Speaker Plotted'}</span>
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--org-text-tertiary)', fontWeight: 700 }}>Venue Location</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--org-text-secondary)" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{selectedActivity.venue || 'No Venue Added'}</span>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '1rem' }}>
                  <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--org-text-tertiary)', fontWeight: 700 }}>Agenda Summary</span>
                  <p style={{ fontSize: '0.85rem', color: 'var(--org-text-secondary)', lineHeight: 1.6, marginTop: '0.3rem' }}>
                    {selectedActivity.description || 'No summary or schedule notes added for this activity.'}
                  </p>
                </div>

                <div className="org-modal__footer" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <button
                    className="org-btn org-btn--ghost"
                    onClick={() => handleDeleteActivity(selectedActivity.id)}
                    disabled={isSaving}
                    style={{ color: 'var(--org-danger)', paddingLeft: 0 }}
                  >
                    {isSaving ? 'Deleting…' : 'Delete Activity'}
                  </button>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="org-btn org-btn--accent" onClick={() => handleOpenEdit(selectedActivity)}>
                      Edit
                    </button>
                    <button className="org-btn org-btn--secondary" onClick={() => setSelectedActivity(null)}>Close</button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* ─── Edit Activity Modal ─── */}
      {createPortal(
        <AnimatePresence>
          {showEditModal && selectedActivity && (
            <motion.div
              className="org-modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowEditModal(false); setSelectedActivity(null); setConflictMsg(null) }}
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
                  <h2 className="org-modal__title">Edit Activity</h2>
                  <button className="org-modal__close" onClick={() => { setShowEditModal(false); setSelectedActivity(null); setConflictMsg(null) }}>×</button>
                </div>

                {conflictMsg && (
                  <div style={{
                    background: 'rgba(245,158,11,0.1)',
                    border: '1px solid rgba(245,158,11,0.35)',
                    borderRadius: '0.6rem',
                    padding: '0.65rem 0.85rem',
                    marginBottom: '0.75rem',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.5rem',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: '#B45309',
                    lineHeight: 1.45,
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B45309" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '1px' }}>
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    <span>{conflictMsg}</span>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="org-form-grid">
                    <label className="org-label">
                      Time
                      <input type="time" className="org-input" value={editForm.time} onChange={(e) => setEditForm(p => ({ ...p, time: e.target.value }))} />
                    </label>
                    <label className="org-label">
                      Category Track
                      <select className="org-select" value={editForm.category} onChange={(e) => setEditForm(p => ({ ...p, category: e.target.value }))}>
                        {Object.keys(CATEGORY_COLORS).map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </label>
                  </div>
                  <label className="org-label">
                    Activity Title
                    <input className="org-input" placeholder="e.g. AI & SaaS Core Keynote" value={editForm.title} onChange={(e) => setEditForm(p => ({ ...p, title: e.target.value }))} />
                  </label>
                  <div className="org-form-grid">
                    <label className="org-label">
                      Speaker / Host
                      <input className="org-input" placeholder="e.g. Prof. Anita Desai" value={editForm.speaker} onChange={(e) => setEditForm(p => ({ ...p, speaker: e.target.value }))} />
                    </label>
                    <label className="org-label">
                      Venue Location
                      <input className="org-input" placeholder="e.g. Lab Block A" value={editForm.venue} onChange={(e) => setEditForm(p => ({ ...p, venue: e.target.value }))} />
                    </label>
                  </div>
                  <label className="org-label">
                    Activity Description
                    <textarea className="org-textarea" placeholder="Brief outline…" style={{ minHeight: 80 }} value={editForm.description} onChange={(e) => setEditForm(p => ({ ...p, description: e.target.value }))} />
                  </label>
                </div>

                <div className="org-modal__footer">
                  <button className="org-btn org-btn--secondary" onClick={() => { setShowEditModal(false); setSelectedActivity(null); setConflictMsg(null) }}>Cancel</button>
                  <button className="org-btn org-btn--accent" onClick={handleSaveEdit} disabled={isSaving}>
                    {isSaving ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* ─── Add Activity Modal ─── */}
      {createPortal(
        <AnimatePresence>
          {showModal && (
            <motion.div
              className="org-modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowModal(false); setConflictMsg(null) }}
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
                  <h2 className="org-modal__title">Schedule New Activity — Day {activeDay}</h2>
                  <button className="org-modal__close" onClick={() => { setShowModal(false); setConflictMsg(null) }}>×</button>
                </div>

                {conflictMsg && (
                  <div style={{
                    background: 'rgba(245,158,11,0.1)',
                    border: '1px solid rgba(245,158,11,0.35)',
                    borderRadius: '0.6rem',
                    padding: '0.65rem 0.85rem',
                    marginBottom: '0.75rem',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.5rem',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: '#B45309',
                    lineHeight: 1.45,
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B45309" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '1px' }}>
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    <span>{conflictMsg}</span>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="org-form-grid">
                    <label className="org-label">
                      Time
                      <input type="time" className="org-input" value={newActivity.time} onChange={(e) => setNewActivity((p) => ({ ...p, time: e.target.value }))} />
                    </label>
                    <label className="org-label">
                      Category Track
                      <select className="org-select" value={newActivity.category} onChange={(e) => setNewActivity((p) => ({ ...p, category: e.target.value }))}>
                        {Object.keys(CATEGORY_COLORS).map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </label>
                  </div>
                  <label className="org-label">
                    Activity Title
                    <input className="org-input" placeholder="e.g. AI & SaaS Core Keynote" value={newActivity.title} onChange={(e) => setNewActivity((p) => ({ ...p, title: e.target.value }))} />
                  </label>
                  <div className="org-form-grid">
                    <label className="org-label">
                      Speaker / Host
                      <input className="org-input" placeholder="e.g. Prof. Anita Desai" value={newActivity.speaker} onChange={(e) => setNewActivity((p) => ({ ...p, speaker: e.target.value }))} />
                    </label>
                    <label className="org-label">
                      Venue Location
                      <input className="org-input" placeholder="e.g. Lab Block A" value={newActivity.venue} onChange={(e) => setNewActivity((p) => ({ ...p, venue: e.target.value }))} />
                    </label>
                  </div>
                  <label className="org-label">
                    Activity Description
                    <textarea className="org-textarea" placeholder="Brief outline of the workshop scope, keynote targets, or panel discussions..." style={{ minHeight: 80 }} value={newActivity.description} onChange={(e) => setNewActivity((p) => ({ ...p, description: e.target.value }))} />
                  </label>
                </div>

                <div className="org-modal__footer">
                  <button className="org-btn org-btn--secondary" onClick={() => { setShowModal(false); setConflictMsg(null) }}>Cancel</button>
                  <button className="org-btn org-btn--accent" onClick={handleAddActivity} disabled={isSaving}>
                    {isSaving ? 'Saving…' : 'Schedule Activity'}
                  </button>
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

export default Agenda
