import React, { lazy, Suspense } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { ThemeProvider } from './components/ThemeProvider'
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
const Dashboard = lazy(() => import('./organizer/pages/Dashboard'))
const Certifications = lazy(() => import('./organizer/pages/Certifications'))
const Agenda = lazy(() => import('./organizer/pages/Agenda'))
const Sponsorships = lazy(() => import('./organizer/pages/Sponsorships'))
const Tickets = lazy(() => import('./organizer/pages/Tickets'))
const Polls = lazy(() => import('./organizer/pages/Polls'))

/* ─── Loading Fallback ─── */
const PageLoader: React.FC = () => (
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

/* ─── App Shell ─── */
const AppShell: React.FC = () => {
  const location = useLocation()
  const isOrganizerRoute = location.pathname.startsWith('/organizer')

  return (
    <>
      {/* Global Navbar — hidden on organizer pages */}
      {!isOrganizerRoute && <Navbar />}

      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Landing & Auth */}
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
          <Route path="/signin" element={<SignIn />} />
          <Route path="/register" element={<FestForgeApp />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Organizer Portal */}
          <Route path="/organizer" element={<OrganizerLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="certifications" element={<Certifications />} />
            <Route path="agenda" element={<Agenda />} />
            <Route path="sponsorships" element={<Sponsorships />} />
            <Route path="tickets" element={<Tickets />} />
            <Route path="polls" element={<Polls />} />
          </Route>
        </Routes>
      </Suspense>

      {/* Global Footer — hidden on organizer pages */}
      {!isOrganizerRoute && <Footer />}
    </>
  )
}

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppShell />
    </ThemeProvider>
  )
}

export default App
