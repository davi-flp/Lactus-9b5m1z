import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Note, NotesService } from '../services/notesService';
import { PinService } from '../services/pinService';

interface NotesContextType {
  notes: Note[];
  loading: boolean;
  loadNotes: () => Promise<void>;
  createNote: (data: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Note>;
  updateNote: (id: string, data: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
  // PIN methods
  hasPIN: boolean;
  setupPIN: (pin: string) => Promise<void>;
  verifyPIN: (pin: string) => Promise<boolean>;
}

export const NotesContext = createContext<NotesContextType | undefined>(undefined);

export function NotesProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasPIN, setHasPIN] = useState(false);

  const loadNotes = useCallback(async () => {
    setLoading(true);
    const [data, pinExists] = await Promise.all([NotesService.getAll(), PinService.hasPIN()]);
    setNotes(data);
    setHasPIN(pinExists);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const createNote = useCallback(async (data: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const note = await NotesService.create(data);
    setNotes(prev => [note, ...prev]);
    return note;
  }, []);

  const updateNote = useCallback(async (id: string, data: Partial<Note>) => {
    const updated = await NotesService.update(id, data);
    if (updated) {
      setNotes(prev => prev.map(n => n.id === id ? updated : n));
    }
  }, []);

  const deleteNote = useCallback(async (id: string) => {
    await NotesService.delete(id);
    setNotes(prev => prev.filter(n => n.id !== id));
  }, []);

  const togglePin = useCallback(async (id: string) => {
    await NotesService.togglePin(id);
    setNotes(prev => prev.map(n => n.id === id ? { ...n, isPinned: !n.isPinned } : n));
  }, []);

  const setupPIN = useCallback(async (pin: string) => {
    await PinService.setPIN(pin);
    setHasPIN(true);
  }, []);

  const verifyPIN = useCallback(async (pin: string): Promise<boolean> => {
    return PinService.verifyPIN(pin);
  }, []);

  return (
    <NotesContext.Provider value={{ notes, loading, loadNotes, createNote, updateNote, deleteNote, togglePin, hasPIN, setupPIN, verifyPIN }}>
      {children}
    </NotesContext.Provider>
  );
}
