import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
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

const getStoredActiveEventId = (): string | null => {
  if (typeof window === 'undefined') return null

  try {
    return window.localStorage.getItem(ACTIVE_EVENT_KEY)
  } catch {
    return null
  }
}

const setStoredActiveEventId = (eventId: string) => {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(ACTIVE_EVENT_KEY, eventId)
  } catch {
    // Ignore storage failures so event state still works in restricted browsers.
  }
}

const clearStoredActiveEventId = () => {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.removeItem(ACTIVE_EVENT_KEY)
  } catch {
    // Ignore storage failures so logout and refresh flows remain stable.
  }
}

/* ─── Provider ─── */
export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth()
  const [events, setEvents] = useState<FestEvent[]>([])
  const [activeEvent, setActiveEventState] = useState<FestEvent | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const isMountedRef = useRef(true)
  const requestIdRef = useRef(0)

  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  /* Fetch events for this organizer */
  const refreshEvents = useCallback(async () => {
    const requestId = ++requestIdRef.current
    setIsLoading(true)

    if (!user) {
      if (!isMountedRef.current || requestId !== requestIdRef.current) return
      setEvents([])
      setActiveEventState(null)
      clearStoredActiveEventId()
      setIsLoading(false)
      return
    }

    const { data, error } = await eventService.getEventsByOrganizer(user.id)
    if (!isMountedRef.current || requestId !== requestIdRef.current) return

    if (error || !data) {
      console.error('Error fetching events:', error)
      setEvents([])
      setActiveEventState(null)
    } else {
      setEvents(data)
      setActiveEventState((currentActiveEvent) => {
        const savedId = getStoredActiveEventId()
        const nextActiveEvent =
          data.find((event) => event.id === currentActiveEvent?.id) ??
          (savedId ? data.find((event) => event.id === savedId) ?? null : null)

        if (!nextActiveEvent) {
          clearStoredActiveEventId()
        }

        return nextActiveEvent
      })
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
      clearStoredActiveEventId()
      setIsLoading(false)
    }
  }, [user, refreshEvents])

  /* Set active event + persist to localStorage */
  const setActiveEvent = useCallback((event: FestEvent) => {
    setActiveEventState(event)
    setStoredActiveEventId(event.id)
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
