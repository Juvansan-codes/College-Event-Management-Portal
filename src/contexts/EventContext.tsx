import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { eventService } from '../services'
import { useAuth } from './AuthContext'
import type { FestEvent, CreateEventPayload } from '../types'

/* ─── Re-export for convenience ─── */
export type { FestEvent } from '../types'

/* ─── Context Types ─── */
interface EventContextValue {
  events: FestEvent[]
  activeEvent: FestEvent | null
  isLoading: boolean
  setActiveEvent: (event: FestEvent) => void
  refreshEvents: () => Promise<void>
  createEvent: (data: CreateEventPayload) => Promise<FestEvent | null>
}

const EventContext = createContext<EventContextValue>({
  events: [],
  activeEvent: null,
  isLoading: true,
  setActiveEvent: () => {},
  refreshEvents: async () => {},
  createEvent: async () => null,
})

/* ─── Hook ─── */
export const useEvent = () => useContext(EventContext)

/* ─── localStorage key ─── */
const ACTIVE_EVENT_KEY = 'festforge_active_event_id'

/* ─── Provider ─── */
export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth()
  const [events, setEvents] = useState<FestEvent[]>([])
  const [activeEvent, setActiveEventState] = useState<FestEvent | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  /* Fetch events for this organizer */
  const refreshEvents = useCallback(async () => {
    if (!user) {
      setEvents([])
      setIsLoading(false)
      return
    }

    const { data, error } = await eventService.getEventsByOrganizer(user.id)

    if (error || !data) {
      console.error('Error fetching events:', error)
      setEvents([])
    } else {
      setEvents(data)

      /* Restore active event from localStorage */
      const savedId = localStorage.getItem(ACTIVE_EVENT_KEY)
      if (savedId) {
        const saved = data.find((e) => e.id === savedId)
        if (saved) {
          setActiveEventState(saved)
        }
      }
    }

    setIsLoading(false)
  }, [user])

  /* Load events when user is available */
  useEffect(() => {
    if (user) {
      refreshEvents()
    } else {
      setEvents([])
      setActiveEventState(null)
      setIsLoading(false)
    }
  }, [user, refreshEvents])

  /* Set active event + persist to localStorage */
  const setActiveEvent = useCallback((event: FestEvent) => {
    setActiveEventState(event)
    localStorage.setItem(ACTIVE_EVENT_KEY, event.id)
  }, [])

  /* Create a new event via service */
  const createEvent = useCallback(async (
    data: CreateEventPayload
  ): Promise<FestEvent | null> => {
    if (!user) return null

    const { data: created, error } = await eventService.createEvent(data, user.id)

    if (error || !created) {
      console.error('Error creating event:', error)
      return null
    }

    /* Refresh the list and set the new event as active */
    await refreshEvents()
    setActiveEvent(created)
    return created
  }, [user, refreshEvents, setActiveEvent])

  return (
    <EventContext.Provider value={{ events, activeEvent, isLoading, setActiveEvent, refreshEvents, createEvent }}>
      {children}
    </EventContext.Provider>
  )
}

export default EventContext
