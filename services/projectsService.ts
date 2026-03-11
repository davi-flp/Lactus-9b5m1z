import { StorageService } from './storage';
import { STORAGE_KEYS } from '../constants/config';

export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

const PROJECT_COLORS = [
  '#7C3AED', '#3B82F6', '#10B981', '#F59E0B',
  '#EF4444', '#EC4899', '#06B6D4', '#8B5CF6',
];

const generateId = () => `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const ProjectsService = {
  async getAll(): Promise<Project[]> {
    const projects = await StorageService.get<Project[]>(STORAGE_KEYS.PROJECTS);
    return projects || [];
  },

  async create(data: Omit<Project, 'id' | 'color' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    const projects = await this.getAll();
    const project: Project = {
      ...data,
      id: generateId(),
      color: PROJECT_COLORS[projects.length % PROJECT_COLORS.length],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await StorageService.set(STORAGE_KEYS.PROJECTS, [project, ...projects]);
    return project;
  },

  async update(id: string, data: Partial<Project>): Promise<Project | null> {
    const projects = await this.getAll();
    const index = projects.findIndex(p => p.id === id);
    if (index === -1) return null;
    const updated = { ...projects[index], ...data, updatedAt: new Date().toISOString() };
    projects[index] = updated;
    await StorageService.set(STORAGE_KEYS.PROJECTS, projects);
    return updated;
  },

  async delete(id: string): Promise<void> {
    const projects = await this.getAll();
    await StorageService.set(STORAGE_KEYS.PROJECTS, projects.filter(p => p.id !== id));
  },
};
