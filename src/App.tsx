import React from 'react'
import { Route, Routes } from 'react-router-dom'
import { ThemeProvider } from './components/ThemeProvider'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import EventStage from './components/EventStage'
import Footer from './components/Footer'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import FestForgeApp from '../FestForgeApp'

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
            </>
          }
        />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/register" element={<FestForgeApp />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
      <Footer />
    </ThemeProvider>
  )
}

export default App
