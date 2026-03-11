import { StorageService } from './storage';
import { STORAGE_KEYS } from '../constants/config';

export interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  isPinned: boolean;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

const generateId = () => `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const NotesService = {
  async getAll(): Promise<Note[]> {
    const notes = await StorageService.get<Note[]>(STORAGE_KEYS.NOTES);
    return notes || [];
  },

  async create(data: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> {
    const notes = await this.getAll();
    const note: Note = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await StorageService.set(STORAGE_KEYS.NOTES, [note, ...notes]);
    return note;
  },

  async update(id: string, data: Partial<Note>): Promise<Note | null> {
    const notes = await this.getAll();
    const index = notes.findIndex(n => n.id === id);
    if (index === -1) return null;
    const updated = { ...notes[index], ...data, updatedAt: new Date().toISOString() };
    notes[index] = updated;
    await StorageService.set(STORAGE_KEYS.NOTES, notes);
    return updated;
  },

  async delete(id: string): Promise<void> {
    const notes = await this.getAll();
    await StorageService.set(STORAGE_KEYS.NOTES, notes.filter(n => n.id !== id));
  },

  async togglePin(id: string): Promise<void> {
    const notes = await this.getAll();
    const note = notes.find(n => n.id === id);
    if (note) await this.update(id, { isPinned: !note.isPinned });
  },
};
