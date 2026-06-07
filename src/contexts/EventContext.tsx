import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'
import { useAuth } from './AuthContext'

/* ─── Types ─── */
export interface FestEvent {
  id: string
  organizer_id: string
  name: string
  description: string | null
  start_date: string
  end_date: string
  venue: string | null
  category: string
  max_attendees: number
  status: string
  created_at: string
}

interface EventContextValue {
  events: FestEvent[]
  activeEvent: FestEvent | null
  isLoading: boolean
  setActiveEvent: (event: FestEvent) => void
  refreshEvents: () => Promise<void>
  createEvent: (data: Omit<FestEvent, 'id' | 'organizer_id' | 'created_at'>) => Promise<FestEvent | null>
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
    if (!isSupabaseConfigured || !supabase || !user) {
      setEvents([])
      setIsLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('organizer_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching events:', error.message)
        setEvents([])
      } else {
        setEvents(data || [])

        /* Restore active event from localStorage */
        const savedId = localStorage.getItem(ACTIVE_EVENT_KEY)
        if (savedId && data) {
          const saved = data.find((e: FestEvent) => e.id === savedId)
          if (saved) {
            setActiveEventState(saved)
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch events:', err)
      setEvents([])
    } finally {
      setIsLoading(false)
    }
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

  /* Create a new event in Supabase */
  const createEvent = useCallback(async (
    data: Omit<FestEvent, 'id' | 'organizer_id' | 'created_at'>
  ): Promise<FestEvent | null> => {
    if (!isSupabaseConfigured || !supabase || !user) return null

    try {
      const { data: created, error } = await supabase
        .from('events')
        .insert({
          ...data,
          organizer_id: user.id,
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating event:', error.message)
        return null
      }

      /* Refresh the list and set the new event as active */
      await refreshEvents()
      if (created) {
        setActiveEvent(created)
      }
      return created
    } catch (err) {
      console.error('Failed to create event:', err)
      return null
    }
  }, [user, refreshEvents, setActiveEvent])

  return (
    <EventContext.Provider value={{ events, activeEvent, isLoading, setActiveEvent, refreshEvents, createEvent }}>
      {children}
    </EventContext.Provider>
  )
}

export default EventContext
