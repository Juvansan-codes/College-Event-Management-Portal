import React, { lazy, Suspense } from 'react'
import { Route, Routes, useLocation, Navigate } from 'react-router-dom'
import { ThemeProvider } from './components/ThemeProvider'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import EventStage from './components/EventStage'
import ExperienceShowcase from './components/ExperienceShowcase'
import Footer from './components/Footer'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import FestForgeApp from '../FestForgeApp'

/* ─── Lazy-loaded Organizer Pages ─── */
const OrganizerLayout = lazy(() => import('./organizer/components/OrganizerLayout'))
const EventPicker = lazy(() => import('./organizer/pages/EventPicker'))
const CreateEvent = lazy(() => import('./organizer/pages/CreateEvent'))
const Dashboard = lazy(() => import('./organizer/pages/Dashboard'))
const Certifications = lazy(() => import('./organizer/pages/Certifications'))
const Agenda = lazy(() => import('./organizer/pages/Agenda'))
const Sponsorships = lazy(() => import('./organizer/pages/Sponsorships'))
const Tickets = lazy(() => import('./organizer/pages/Tickets'))
const Polls = lazy(() => import('./organizer/pages/Polls'))
const Attendance = lazy(() => import('./organizer/pages/Attendance'))
const PublicSponsorshipPage = lazy(() => import('../SponsorshipPage'))

/* ─── Lazy-loaded Attendee Pages ─── */
const AttendeeLayout = lazy(() => import('./attendee/components/AttendeeLayout'))
const AttendeeDashboard = lazy(() => import('./attendee/pages/AttendeeDashboard'))
const AttendanceCheckIn = lazy(() => import('./attendee/pages/AttendanceCheckIn'))
const AttendeePolls = lazy(() => import('./attendee/pages/AttendeePolls'))
const MyTickets = lazy(() => import('./attendee/pages/MyTickets'))
const Events = lazy(() => import('./attendee/pages/Events'))
const Certificates = lazy(() => import('./attendee/pages/Certificates'))

/* ─── Loading Fallback ─── */
const PageLoader = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'var(--bg-primary)',
    color: 'var(--text-muted)',
    fontSize: '0.9rem',
    fontWeight: 500,
  }}>
    Loading…
  </div>
)

/* ─── Route Guards ─── */

/** Redirects to /signin if user is not authenticated */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return <PageLoader />
  if (!user) {
    return (
      <Navigate
        to="/signin"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    )
  }

  return <>{children}</>
}

/** Redirects to dashboard if user is already authenticated */
const RedirectIfAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, role, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return <PageLoader />
  if (user) {
    const requestedPath = (location.state as { from?: string } | null)?.from
    const dashboardPath =
      role !== 'organizer' && requestedPath?.startsWith('/attendee/')
        ? requestedPath
        : role === 'organizer'
          ? '/organizer'
          : '/attendee'
    return <Navigate to={dashboardPath} replace />
  }

  return <>{children}</>
}

/* ─── App Shell ─── */
const AppShell: React.FC = () => {
  const location = useLocation()
  const isOrganizerRoute = location.pathname.startsWith('/organizer')
  const isAttendeeRoute = location.pathname.startsWith('/attendee')
  const isDashboardRoute = isOrganizerRoute || isAttendeeRoute

  return (
    <>
      {/* Global Navbar — hidden on dashboard pages */}
      {!isDashboardRoute && <Navbar />}

      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Landing */}
          <Route
            path="/"
            element={
              <>
                <Hero />
                <EventStage />
                <ExperienceShowcase />
              </>
            }
          />

          {/* Auth — redirect to dashboard if already logged in */}
          <Route path="/sponsor" element={<PublicSponsorshipPage />} />
          <Route path="/signin" element={<RedirectIfAuth><SignIn /></RedirectIfAuth>} />
          <Route path="/register" element={<RedirectIfAuth><FestForgeApp /></RedirectIfAuth>} />
          <Route path="/signup" element={<RedirectIfAuth><SignUp /></RedirectIfAuth>} />

          {/* Organizer Portal — protected */}
          <Route path="/organizer" element={<ProtectedRoute><OrganizerLayout /></ProtectedRoute>}>
            <Route index element={<EventPicker />} />
            <Route path="new-event" element={<CreateEvent />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="certifications" element={<Certifications />} />
            <Route path="agenda" element={<Agenda />} />
            <Route path="sponsorships" element={<Sponsorships />} />
            <Route path="tickets" element={<Tickets />} />
            <Route path="polls" element={<Polls />} />
            <Route path="attendance" element={<Attendance />} />
          </Route>

          {/* Attendee Portal — protected */}
          <Route path="/attendee" element={<ProtectedRoute><AttendeeLayout /></ProtectedRoute>}>
            <Route index element={<AttendeeDashboard />} />
            <Route path="events" element={<Events />} />
            <Route path="check-in" element={<AttendanceCheckIn />} />
            <Route path="polls" element={<AttendeePolls />} />
            <Route path="my-tickets" element={<MyTickets />} />
            <Route path="certificates" element={<Certificates />} />
          </Route>
        </Routes>
      </Suspense>

      {/* Global Footer — hidden on dashboard pages */}
      {!isDashboardRoute && <Footer />}
    </>
  )
}

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
