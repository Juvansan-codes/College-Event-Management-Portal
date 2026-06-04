import React from 'react'
import { ThemeProvider } from './components/ThemeProvider'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import EventStage from './components/EventStage'
import Footer from './components/Footer'

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <Navbar />
      <Hero />
      <EventStage />
      <Footer />
    </ThemeProvider>
  )
}

export default App
