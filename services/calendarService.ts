import { StorageService } from './storage';
import { STORAGE_KEYS } from '../constants/config';

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  color: string;
  createdAt: string;
  updatedAt: string;
}

const EVENT_COLORS = ['#7C3AED', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];
const generateId = () => `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const CalendarService = {
  async getAll(): Promise<CalendarEvent[]> {
    const events = await StorageService.get<CalendarEvent[]>(STORAGE_KEYS.EVENTS);
    return events || [];
  },

  async getByDate(date: string): Promise<CalendarEvent[]> {
    const events = await this.getAll();
    return events.filter(e => e.date === date);
  },

  async getByMonth(year: number, month: number): Promise<CalendarEvent[]> {
    const events = await this.getAll();
    const prefix = `${year}-${String(month).padStart(2, '0')}`;
    return events.filter(e => e.date.startsWith(prefix));
  },

  async create(data: Omit<CalendarEvent, 'id' | 'color' | 'createdAt' | 'updatedAt'>): Promise<CalendarEvent> {
    const events = await this.getAll();
    const event: CalendarEvent = {
      ...data,
      id: generateId(),
      color: EVENT_COLORS[events.length % EVENT_COLORS.length],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await StorageService.set(STORAGE_KEYS.EVENTS, [event, ...events]);
    return event;
  },

  async update(id: string, data: Partial<CalendarEvent>): Promise<CalendarEvent | null> {
    const events = await this.getAll();
    const index = events.findIndex(e => e.id === id);
    if (index === -1) return null;
    const updated = { ...events[index], ...data, updatedAt: new Date().toISOString() };
    events[index] = updated;
    await StorageService.set(STORAGE_KEYS.EVENTS, events);
    return updated;
  },

  async delete(id: string): Promise<void> {
    const events = await this.getAll();
    await StorageService.set(STORAGE_KEYS.EVENTS, events.filter(e => e.id !== id));
  },
};
