import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { CalendarEvent, CalendarService } from '../services/calendarService';

interface CalendarContextType {
  events: CalendarEvent[];
  loading: boolean;
  loadEvents: () => Promise<void>;
  createEvent: (data: Omit<CalendarEvent, 'id' | 'color' | 'createdAt' | 'updatedAt'>) => Promise<CalendarEvent>;
  updateEvent: (id: string, data: Partial<CalendarEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  getEventsByDate: (date: string) => CalendarEvent[];
}

export const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export function CalendarProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    const data = await CalendarService.getAll();
    setEvents(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const createEvent = useCallback(async (data: Omit<CalendarEvent, 'id' | 'color' | 'createdAt' | 'updatedAt'>) => {
    const event = await CalendarService.create(data);
    setEvents(prev => [event, ...prev]);
    return event;
  }, []);

  const updateEvent = useCallback(async (id: string, data: Partial<CalendarEvent>) => {
    const updated = await CalendarService.update(id, data);
    if (updated) {
      setEvents(prev => prev.map(e => e.id === id ? updated : e));
    }
  }, []);

  const deleteEvent = useCallback(async (id: string) => {
    await CalendarService.delete(id);
    setEvents(prev => prev.filter(e => e.id !== id));
  }, []);

  const getEventsByDate = useCallback((date: string) => {
    return events.filter(e => e.date === date).sort((a, b) => a.time.localeCompare(b.time));
  }, [events]);

  return (
    <CalendarContext.Provider value={{ events, loading, loadEvents, createEvent, updateEvent, deleteEvent, getEventsByDate }}>
      {children}
    </CalendarContext.Provider>
  );
}
