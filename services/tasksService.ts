import { StorageService } from './storage';
import { STORAGE_KEYS, TaskStatus, TaskPriority } from '../constants/config';

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  checklist: ChecklistItem[];
  projectId: string | null;
  createdAt: string;
  updatedAt: string;
}

const generateId = (prefix: string) =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const TasksService = {
  async getAll(): Promise<Task[]> {
    const tasks = await StorageService.get<Task[]>(STORAGE_KEYS.TASKS);
    return tasks || [];
  },

  async create(data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const tasks = await this.getAll();
    const task: Task = {
      ...data,
      id: generateId('task'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await StorageService.set(STORAGE_KEYS.TASKS, [task, ...tasks]);
    return task;
  },

  async update(id: string, data: Partial<Task>): Promise<Task | null> {
    const tasks = await this.getAll();
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) return null;
    const updated = { ...tasks[index], ...data, updatedAt: new Date().toISOString() };
    tasks[index] = updated;
    await StorageService.set(STORAGE_KEYS.TASKS, tasks);
    return updated;
  },

  async delete(id: string): Promise<void> {
    const tasks = await this.getAll();
    await StorageService.set(STORAGE_KEYS.TASKS, tasks.filter(t => t.id !== id));
  },

  async toggleChecklist(taskId: string, itemId: string): Promise<void> {
    const tasks = await this.getAll();
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const checklist = task.checklist.map(item =>
      item.id === itemId ? { ...item, done: !item.done } : item
    );
    await this.update(taskId, { checklist });
  },
};
