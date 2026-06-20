import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import PageHeader from '../components/PageHeader'
import { useEvent } from '../../contexts/EventContext'
import { attendanceService } from '../../services'
import type { AttendanceRecord, AttendanceSession } from '../../types'

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

const getCurrentPosition = (): Promise<GeolocationPosition> =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'))
      return
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    })
  })

const isGeolocationError = (error: unknown): error is GeolocationPositionError =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  'message' in error

const formatRemaining = (milliseconds: number) => {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

const Attendance: React.FC = () => {
  const navigate = useNavigate()
  const { activeEvent } = useEvent()
  const [session, setSession] = useState<AttendanceSession | null>(null)
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [radius, setRadius] = useState(100)
  const [duration, setDuration] = useState(15)
  const [useManualLocation, setUseManualLocation] = useState(false)
  const [manualLat, setManualLat] = useState<string>('')
  const [manualLng, setManualLng] = useState<string>('')
  const [remaining, setRemaining] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isStarting, setIsStarting] = useState(false)
  const [isStopping, setIsStopping] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const checkInUrl = useMemo(() => {
    if (!session) return ''
    const url = new URL('/attendee/check-in', window.location.origin)
    url.searchParams.set('token', session.token)
    return url.toString()
  }, [session])
  const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname)

  const refresh = useCallback(async () => {
    if (!activeEvent) return

    const [sessionResult, recordsResult] = await Promise.all([
      attendanceService.getActiveSession(activeEvent.id),
      attendanceService.getLiveAttendance(activeEvent.id),
    ])

    if (sessionResult.error) setError(sessionResult.error)
    if (recordsResult.error) setError(recordsResult.error)
    setSession(sessionResult.data ?? null)
    setRecords(recordsResult.data ?? [])
    setIsLoading(false)
  }, [activeEvent])

  useEffect(() => {
    if (!activeEvent) {
      navigate('/organizer', { replace: true })
      return
    }

    void refresh()
    const poller = window.setInterval(() => void refresh(), 5000)
    const onAttendanceChange = () => void refresh()
    window.addEventListener('attendance_record_added', onAttendanceChange)
    window.addEventListener('attendance_session_change', onAttendanceChange)

    return () => {
      window.clearInterval(poller)
      window.removeEventListener('attendance_record_added', onAttendanceChange)
      window.removeEventListener('attendance_session_change', onAttendanceChange)
    }
  }, [activeEvent, navigate, refresh])

  useEffect(() => {
    if (!session) {
      setRemaining(0)
      return
    }

    const updateRemaining = () => {
      setRemaining(Math.max(0, new Date(session.expires_at).getTime() - Date.now()))
    }
    updateRemaining()
    const timer = window.setInterval(updateRemaining, 1000)
    return () => window.clearInterval(timer)
  }, [session])

  const startSession = async () => {
    if (!activeEvent) return
    if (radius < 10 || duration < 1) {
      setError('Use a radius of at least 10 meters and a duration of at least 1 minute.')
      return
    }

    setIsStarting(true)
    setError(null)

    let lat: number = 0
    let lng: number = 0

    if (useManualLocation) {
      lat = parseFloat(manualLat)
      lng = parseFloat(manualLng)
      if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        setError('Please enter valid latitude (-90 to 90) and longitude (-180 to 180).')
        setIsStarting(false)
        return
      }
      setMessage('Starting session with manual coordinates...')
    } else {
      setMessage('Requesting the organizer device location...')
    }

    try {
      if (!useManualLocation) {
        const position = await getCurrentPosition()
        lat = position.coords.latitude
        lng = position.coords.longitude
      }

      const result = await attendanceService.startSession(
        activeEvent.id,
        lat,
        lng,
        radius,
        duration,
      )

      if (result.error || !result.data) {
        setError(result.error ?? 'Could not start attendance.')
        return
      }

      setSession(result.data)
      setMessage('Attendance is live. Ask students to scan the QR code.')
      await refresh()
    } catch (err) {
      setError(
        isGeolocationError(err)
          ? 'Location permission was denied or your position could not be determined.'
          : err instanceof Error
            ? err.message
            : 'Could not get the organizer location.',
      )
      setMessage(null)
    } finally {
      setIsStarting(false)
    }
  }

  const stopSession = async () => {
    if (!activeEvent) return
    setIsStopping(true)
    setError(null)
    const result = await attendanceService.stopSession(activeEvent.id)
    if (result.error) {
      setError(result.error)
    } else {
      setSession(null)
      setMessage('Attendance session stopped.')
    }
    setIsStopping(false)
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(checkInUrl)
      setMessage('Check-in link copied.')
    } catch {
      setError('The browser could not copy the link. Select it manually below.')
    }
  }

  if (!activeEvent) return null

  return (
    <motion.div initial="initial" animate="animate" className="org-dashboard-container">
      <PageHeader
        eyebrow="Live Operations"
        title="QR Attendance"
        subtitle={`Create a timed, location-verified check-in for ${activeEvent.name}.`}
      />

      {(error || message) && (
        <div className={`attendance-alert ${error ? 'attendance-alert--error' : 'attendance-alert--success'}`}>
          {error ?? message}
        </div>
      )}

      <div className="attendance-grid">
        <motion.section className="org-surface org-surface--elevated attendance-panel" variants={fadeUp}>
          <div className="org-section__header">
            <div>
              <h2 className="org-section__title">Session controls</h2>
              <p className="org-section__subtitle">The event location is captured when the session starts.</p>
            </div>
            <span className={`org-badge org-badge--${session ? 'success' : 'neutral'}`}>
              {session ? 'Live' : 'Inactive'}
            </span>
          </div>

          <div className="org-form-grid">
            <label className="org-label">
              Allowed radius (meters)
              <input
                className="org-input"
                type="number"
                min="10"
                max="5000"
                value={radius}
                disabled={Boolean(session)}
                onChange={(event) => setRadius(Number(event.target.value))}
              />
            </label>
            <label className="org-label">
              Session duration (minutes)
              <input
                className="org-input"
                type="number"
                min="1"
                max="240"
                value={duration}
                disabled={Boolean(session)}
                onChange={(event) => setDuration(Number(event.target.value))}
              />
            </label>
          </div>

          <div className="org-form-grid" style={{ marginTop: '1rem' }}>
            <label className="org-label" style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={useManualLocation}
                onChange={(event) => setUseManualLocation(event.target.checked)}
                disabled={Boolean(session)}
                style={{ width: '1.2rem', height: '1.2rem', cursor: 'pointer', accentColor: 'var(--org-accent)' }}
              />
              Set custom event coordinates (override device location)
            </label>
            {useManualLocation && (
              <>
                <label className="org-label">
                  Latitude
                  <input
                    className="org-input"
                    type="number"
                    step="any"
                    placeholder="e.g. 37.7749"
                    value={manualLat}
                    disabled={Boolean(session)}
                    onChange={(event) => setManualLat(event.target.value)}
                  />
                </label>
                <label className="org-label">
                  Longitude
                  <input
                    className="org-input"
                    type="number"
                    step="any"
                    placeholder="e.g. -122.4194"
                    value={manualLng}
                    disabled={Boolean(session)}
                    onChange={(event) => setManualLng(event.target.value)}
                  />
                </label>
              </>
            )}
          </div>

          {session ? (
            <>
              <div className="attendance-session-meta">
                <div>
                  <span>Time remaining</span>
                  <strong>{formatRemaining(remaining)}</strong>
                </div>
                <div>
                  <span>Check-ins</span>
                  <strong>{records.length}</strong>
                </div>
                <div>
                  <span>Radius</span>
                  <strong>{session.radius_meters} m</strong>
                </div>
              </div>
              <button className="org-btn attendance-stop-btn" onClick={stopSession} disabled={isStopping}>
                {isStopping ? 'Stopping...' : 'Stop attendance'}
              </button>
            </>
          ) : (
            <button className="org-btn org-btn--primary attendance-start-btn" onClick={startSession} disabled={isStarting || isLoading}>
              {isStarting ? 'Getting location...' : 'Start attendance'}
            </button>
          )}
        </motion.section>

        <motion.section className="org-surface org-surface--elevated attendance-panel attendance-qr-panel" variants={fadeUp}>
          {session ? (
            <>
              <div className="attendance-qr">
                <QRCodeSVG
                  value={checkInUrl}
                  size={220}
                  level="M"
                  marginSize={2}
                  bgColor="#ffffff"
                  fgColor="#111118"
                  title={`${activeEvent.name} attendance check-in`}
                />
              </div>
              <h2>Scan to mark attendance</h2>
              <p>Students must sign in and allow location access on their phone.</p>
              <div className="attendance-link-row">
                <input className="org-input" value={checkInUrl} readOnly aria-label="Attendance check-in link" />
                <button className="org-btn org-btn--secondary" onClick={copyLink}>Copy</button>
              </div>
              {isLocalhost && (
                <div className="attendance-localhost-warning">
                  This QR uses localhost and will not open on another phone. Open the app through an HTTPS deployment before generating the QR.
                </div>
              )}
            </>
          ) : (
            <div className="attendance-empty">
              <div className="attendance-empty__icon">QR</div>
              <h2>No active QR code</h2>
              <p>Start a session to generate a unique, expiring check-in code.</p>
            </div>
          )}
        </motion.section>
      </div>

      <motion.section variants={fadeUp} className="attendance-roster">
        <div className="org-section__header">
          <div>
            <h2 className="org-section__title">Live attendance</h2>
            <p className="org-section__subtitle">This list refreshes automatically every five seconds.</p>
          </div>
          <span className="org-badge org-badge--info">{records.length} present</span>
        </div>

        <div className="org-table-wrapper">
          <table className="org-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Check-in time</th>
                <th>Distance</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan={4} className="attendance-table-empty">
                    No students have checked in yet.
                  </td>
                </tr>
              ) : records.map((record) => (
                <tr key={record.id}>
                  <td>
                    <strong>{record.user_name}</strong>
                    <div className="attendance-user-id">{record.user_id}</div>
                  </td>
                  <td>{new Date(record.check_in_time).toLocaleString()}</td>
                  <td>{Math.round(record.distance_meters)} m</td>
                  <td><span className="org-badge org-badge--success">{record.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.section>
    </motion.div>
  )
}

export default Attendance
