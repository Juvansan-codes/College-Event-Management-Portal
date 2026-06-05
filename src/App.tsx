import React from 'react'
import { Route, Routes } from 'react-router-dom'
import { ThemeProvider } from './components/ThemeProvider'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import EventStage from './components/EventStage'
import ExperienceShowcase from './components/ExperienceShowcase'
import Footer from './components/Footer'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <Navbar />
      <Routes>
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
        <Route path="/signup" element={<SignUp />} />
      </Routes>
      <Footer />
    </ThemeProvider>
  )
}

export default App
