import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Task, TasksService } from '../services/tasksService';

interface TasksContextType {
  tasks: Task[];
  loading: boolean;
  loadTasks: () => Promise<void>;
  createTask: (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Task>;
  updateTask: (id: string, data: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleChecklist: (taskId: string, itemId: string) => Promise<void>;
}

export const TasksContext = createContext<TasksContextType | undefined>(undefined);

export function TasksProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    const data = await TasksService.getAll();
    setTasks(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const createTask = useCallback(async (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const task = await TasksService.create(data);
    setTasks(prev => [task, ...prev]);
    return task;
  }, []);

  const updateTask = useCallback(async (id: string, data: Partial<Task>) => {
    const updated = await TasksService.update(id, data);
    if (updated) {
      setTasks(prev => prev.map(t => t.id === id ? updated : t));
    }
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    await TasksService.delete(id);
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const toggleChecklist = useCallback(async (taskId: string, itemId: string) => {
    await TasksService.toggleChecklist(taskId, itemId);
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      return {
        ...t,
        checklist: t.checklist.map(item =>
          item.id === itemId ? { ...item, done: !item.done } : item
        ),
      };
    }));
  }, []);

  return (
    <TasksContext.Provider value={{ tasks, loading, loadTasks, createTask, updateTask, deleteTask, toggleChecklist }}>
      {children}
    </TasksContext.Provider>
  );
}
