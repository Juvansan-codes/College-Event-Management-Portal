import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import PageHeader from '../components/PageHeader'

/* ─── Types ─── */
interface Activity {
  id: string
  time: string
  title: string
  speaker: string
  venue: string
  category: string
  description: string
  hour: number // 9 for 9 AM, 13 for 1 PM etc. used to map to timeline rows
}

/* ─── Mock Data ─── */
const CATEGORY_COLORS: Record<string, string> = {
  'Workshop': '#6C5CE7', // Purple
  'Talk': '#3B82F6',     // Blue
  'Panel': '#10B981',    // Green
  'Break': '#F59E0B',    // Amber
  'Competition': '#EF4444' // Red
}

const INITIAL_DAY1: Activity[] = [
  { id: '1', time: '09:00 AM', title: 'Opening Keynote Address', speaker: 'Dr. Ramesh Iyer', venue: 'Main Auditorium', category: 'Talk', description: 'Annual welcome speech, event overview, and launch of FestForge summit.', hour: 9 },
  { id: '2', time: '10:30 AM', title: 'Deep Dive: ML with TensorFlow', speaker: 'Prof. Anita Desai', venue: 'Lab Block A', category: 'Workshop', description: 'Practical session covering basic neural networks and predictive datasets.', hour: 10 },
  { id: '3', time: '12:00 PM', title: 'Networking Luncheon', speaker: 'All Attendees', venue: 'Garden Cafeteria', category: 'Break', description: 'Buffet lunch with breakout networking tables.', hour: 12 },
  { id: '4', time: '01:30 PM', title: 'Next-Gen Frontend Paradigms', speaker: 'Karthik Nair', venue: 'Seminar Hall 2', category: 'Panel', description: 'Panel debate on Server Actions, SSR, and dynamic rendering models.', hour: 13 },
  { id: '5', time: '03:30 PM', title: 'SaaS Hackathon Briefing', speaker: 'Core Tech Committee', venue: 'Innovation Center', category: 'Competition', description: 'Kickoff of the 24-hour development marathon.', hour: 15 },
]

const INITIAL_DAY2: Activity[] = [
  { id: '6', time: '09:30 AM', title: 'Hackathon Pitch Presentations', speaker: 'Hackathon Finalists', venue: 'Main Auditorium', category: 'Competition', description: 'Teams pitch their working software prototypes to judges.', hour: 9 },
  { id: '7', time: '11:00 AM', title: 'Cloud Infrastructure Best Practices', speaker: 'Vikram Patel', venue: 'Lab Block B', category: 'Workshop', description: 'Deploying secure, scaling environments on AWS and cloud providers.', hour: 11 },
  { id: '8', fill: '2:00 PM', time: '02:00 PM', title: 'Student Startup Pitch Session', speaker: 'Selected Founders', venue: 'Seminar Hall 1', category: 'Talk', description: 'Incubated student projects present designs to local seed funds.', hour: 14 },
] as any[] // cast to override minor custom keys if needed

// Standardized list of timeline hours for the Notion Calendar grid
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

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] } },
}

const stagger = {
  animate: { transition: { staggerChildren: 0.06 } },
}

const Agenda: React.FC = () => {
  const [activeDay, setActiveDay] = useState(0)
  const [days, setDays] = useState<Activity[][]>([INITIAL_DAY1, INITIAL_DAY2])
  const [showModal, setShowModal] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  
  const [newActivity, setNewActivity] = useState<Omit<Activity, 'id'>>({
    time: '09:00 AM', title: '', speaker: '', venue: '', category: 'Talk', description: '', hour: 9
  })

  const currentActivities = days[activeDay] || []

  // Create clean PDF print view inside an iframe/window
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
        <td style="padding: 14px 16px; font-weight: 700; color: #111; font-size: 13px; white-space: nowrap;">${act.time}</td>
        <td style="padding: 14px 16px;">
          <div style="font-weight: 700; color: #6C5CE7; font-size: 14px; margin-bottom: 3px;">${act.title}</div>
          <div style="color: #555; font-size: 12px;">${act.description || 'No detailed description.'}</div>
        </td>
        <td style="padding: 14px 16px;"><span style="display: inline-block; padding: 3px 8px; border-radius: 12px; background: ${CATEGORY_COLORS[act.category]}15; color: ${CATEGORY_COLORS[act.category]}; font-size: 11px; font-weight: 700;">${act.category}</span></td>
        <td style="padding: 14px 16px; font-weight: 600; color: #333; font-size: 13px;">${act.speaker || '—'}</td>
        <td style="padding: 14px 16px; color: #555; font-size: 12px; font-style: italic;">${act.venue || '—'}</td>
      </tr>
    `).join('')

    printWindow.document.write(`
      <html>
        <head>
          <title>FestForge Summit Day ${activeDay + 1} Agenda</title>
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
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div class="logo">FESTFORGE</div>
              <div style="font-size: 11px; color: #999;">Exported: ${new Date().toLocaleDateString()}</div>
            </div>
            <h1 class="title">Event Schedule & Agenda</h1>
            <p class="subtitle">Official timeline mapping scheduled panels, talks, workshops, and student tracks.</p>
          </div>
          
          <div class="meta-bar">
            <div class="meta-item">
              <span class="meta-label">Schedule Block</span>
              <span class="meta-val">Day ${activeDay + 1} Roster</span>
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

  const handleAddActivity = () => {
    if (!newActivity.title || !newActivity.time) return
    const hourInt = parseInt(newActivity.time.split(':')[0]) || 9
    const activity: Activity = { 
      ...newActivity, 
      id: Date.now().toString(),
      hour: newActivity.time.toLowerCase().includes('pm') && hourInt !== 12 ? hourInt + 12 : hourInt
    }
    setDays((prev) => {
      const updated = [...prev]
      updated[activeDay] = [...updated[activeDay], activity].sort((a, b) => a.hour - b.hour)
      return updated
    })
    setNewActivity({ time: '09:00 AM', title: '', speaker: '', venue: '', category: 'Talk', description: '', hour: 9 })
    setShowModal(false)
  }

  const handleDeleteActivity = (id: string) => {
    setDays((prev) => {
      const updated = [...prev]
      updated[activeDay] = updated[activeDay].filter((a) => a.id !== id)
      return updated
    })
    setSelectedActivity(null)
  }

  return (
    <motion.div variants={stagger} initial="initial" animate="animate">
      <PageHeader
        eyebrow="Console"
        title="Event Agenda Planner"
        subtitle="Notion-style chronological calendar and speaker schedule planning workspace."
        actions={
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button className="org-btn org-btn--secondary" onClick={handleExportPDF}>
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

      {/* Day Tabs */}
      <motion.div className="org-tabs" variants={fadeUp} style={{ marginBottom: '1.5rem' }}>
        {days.map((_, i) => (
          <button
            key={i}
            className={`org-tab ${activeDay === i ? 'active' : ''}`}
            onClick={() => setActiveDay(i)}
          >
            Day {i + 1} Plan
          </button>
        ))}
        <button
          className="org-tab"
          onClick={() => {
            setDays((prev) => [...prev, []])
            setActiveDay(days.length)
          }}
          style={{ color: 'var(--org-accent-text)', fontWeight: 600 }}
        >
          + Add New Day
        </button>
      </motion.div>

      {/* Apple Calendar / Notion style schedule layout */}
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
              This schedule block is empty. Pluck speaker activities and launch day slots.
            </p>
            <button className="org-btn org-btn--accent" onClick={() => setShowModal(true)}>Add First Activity</button>
          </div>
        ) : (
          <div className="org-calendar-container org-surface org-surface--elevated">
            {/* Left Hours Sidebar + Agenda items alignment */}
            <div className="org-calendar-hours-column">
              {TIMELINE_HOURS.map((t) => (
                <div key={t.label} className="org-calendar-hour-slot">
                  <span className="org-calendar-hour-label">{t.label}</span>
                  <div className="org-calendar-grid-line" />
                </div>
              ))}
            </div>

            {/* Plotted Activity Cards overlapping timeline */}
            <div className="org-calendar-agenda-container">
              {currentActivities.map((act) => {
                // Approximate vertical calculation based on hour (e.g. 9 AM sits near top, 6 PM sits near bottom)
                // 9 AM -> hour 9, offset = (9 - 9) * 80px
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
                    <span className="org-calendar-card__time">{act.time}</span>
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

      {/* Expand Details Drawer/Modal */}
      {createPortal(
        <AnimatePresence>
          {selectedActivity && (
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
                    <span style={{ fontSize: '0.8rem', color: 'var(--org-text-secondary)', fontWeight: 600 }}>{selectedActivity.time}</span>
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
                        {selectedActivity.speaker.split(' ').map(n=>n[0]).join('') || 'SP'}
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
                  <button className="org-btn org-btn--ghost" onClick={() => handleDeleteActivity(selectedActivity.id)} style={{ color: 'var(--org-danger)', paddingLeft: 0 }}>
                    Delete Activity
                  </button>
                  <button className="org-btn org-btn--secondary" onClick={() => setSelectedActivity(null)}>Close</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Add Activity Modal */}
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
                  <h2 className="org-modal__title">Schedule New Activity</h2>
                  <button className="org-modal__close" onClick={() => setShowModal(false)}>×</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="org-form-grid">
                    <label className="org-label">
                      Time
                      <select className="org-select" value={newActivity.time} onChange={(e) => setNewActivity((p) => ({ ...p, time: e.target.value }))}>
                        {TIMELINE_HOURS.map((t) => <option key={t.label} value={t.label}>{t.label}</option>)}
                      </select>
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
                  <button className="org-btn org-btn--secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button className="org-btn org-btn--accent" onClick={handleAddActivity}>Schedule Activity</button>
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
