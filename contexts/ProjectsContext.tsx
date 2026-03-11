import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Project, ProjectsService } from '../services/projectsService';

interface ProjectsContextType {
  projects: Project[];
  loading: boolean;
  loadProjects: () => Promise<void>;
  createProject: (data: Omit<Project, 'id' | 'color' | 'createdAt' | 'updatedAt'>) => Promise<Project>;
  updateProject: (id: string, data: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
}

export const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    const data = await ProjectsService.getAll();
    setProjects(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const createProject = useCallback(async (data: Omit<Project, 'id' | 'color' | 'createdAt' | 'updatedAt'>) => {
    const project = await ProjectsService.create(data);
    setProjects(prev => [project, ...prev]);
    return project;
  }, []);

  const updateProject = useCallback(async (id: string, data: Partial<Project>) => {
    const updated = await ProjectsService.update(id, data);
    if (updated) {
      setProjects(prev => prev.map(p => p.id === id ? updated : p));
    }
  }, []);

  const deleteProject = useCallback(async (id: string) => {
    await ProjectsService.delete(id);
    setProjects(prev => prev.filter(p => p.id !== id));
  }, []);

  return (
    <ProjectsContext.Provider value={{ projects, loading, loadProjects, createProject, updateProject, deleteProject }}>
      {children}
    </ProjectsContext.Provider>
  );
}
