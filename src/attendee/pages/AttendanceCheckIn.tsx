import React, { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { attendanceService } from '../../services'

type CheckInState = 'idle' | 'locating' | 'submitting' | 'success' | 'error'

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

const AttendanceCheckIn: React.FC = () => {
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const token = searchParams.get('token')?.trim() ?? ''
  const [state, setState] = useState<CheckInState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [distance, setDistance] = useState<number | null>(null)
  const [accuracy, setAccuracy] = useState<number | null>(null)

  const checkIn = async () => {
    if (!token || !user) return

    setError(null)
    setState('locating')

    try {
      const position = await getCurrentPosition()
      setAccuracy(position.coords.accuracy)
      setState('submitting')

      const result = await attendanceService.markAttendance(
        token,
        position.coords.latitude,
        position.coords.longitude,
        {
          id: user.id,
          email: user.email,
          fullName: user.user_metadata.full_name || user.email || 'Student',
        },
        navigator.userAgent,
        'client-unavailable',
      )

      if (result.error || !result.data) {
        setError(result.error ?? 'Attendance could not be marked.')
        setState('error')
        return
      }

      setDistance(result.data.distance)
      setState('success')
    } catch (err) {
      const message =
        isGeolocationError(err)
          ? err.code === err.PERMISSION_DENIED
            ? 'Location permission is required to mark attendance.'
            : 'Your location could not be determined. Move near a window and try again.'
          : err instanceof Error
            ? err.message
            : 'Could not access your location.'
      setError(message)
      setState('error')
    }
  }

  if (!token) {
    return (
      <div className="attendance-checkin-shell">
        <section className="org-surface org-surface--elevated attendance-checkin-card">
          <div className="attendance-checkin-icon">QR</div>
          <h1>Scan an attendance QR</h1>
          <p>This page needs the unique code shown by your event organizer.</p>
          <Link className="org-btn org-btn--secondary" to="/attendee">Back to dashboard</Link>
        </section>
      </div>
    )
  }

  return (
    <div className="attendance-checkin-shell">
      <motion.section
        className="org-surface org-surface--elevated attendance-checkin-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {state === 'success' ? (
          <>
            <div className="attendance-checkin-icon attendance-checkin-icon--success">OK</div>
            <span className="org-badge org-badge--success">Attendance recorded</span>
            <h1>You are checked in</h1>
            <p>
              Your attendance was marked successfully
              {distance !== null ? ` from ${Math.round(distance)} meters away` : ''}.
            </p>
            {accuracy !== null && (
              <small>Location accuracy reported by your device: about {Math.round(accuracy)} meters.</small>
            )}
            <Link className="org-btn org-btn--primary" to="/attendee">Done</Link>
          </>
        ) : (
          <>
            <div className="attendance-checkin-icon">GPS</div>
            <span className="org-badge org-badge--info">Secure check-in</span>
            <h1>Mark your attendance</h1>
            <p>
              We will compare your current location with the event location. Your browser will ask for location permission.
            </p>

            {error && <div className="attendance-alert attendance-alert--error">{error}</div>}

            <div className="attendance-privacy-note">
              <strong>Before you continue</strong>
              <span>Stay at the event venue, enable precise location, and do not close this page.</span>
            </div>

            <button
              className="org-btn org-btn--primary attendance-checkin-button"
              onClick={checkIn}
              disabled={state === 'locating' || state === 'submitting'}
            >
              {state === 'locating'
                ? 'Finding your location...'
                : state === 'submitting'
                  ? 'Recording attendance...'
                  : state === 'error'
                    ? 'Try again'
                    : 'Allow location and check in'}
            </button>
          </>
        )}
      </motion.section>
    </div>
  )
}

export default AttendanceCheckIn
