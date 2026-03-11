// App configuration constants
export const APP_NAME = 'Lactus';
export const APP_VERSION = '1.0.0';

export const STORAGE_KEYS = {
  NOTES: '@lactus_notes',
  TASKS: '@lactus_tasks',
  PROJECTS: '@lactus_projects',
  EVENTS: '@lactus_events',
  SETTINGS: '@lactus_settings',
  PRIVATE_PIN: '@lactus_private_pin',
  WIDGETS: '@lactus_widgets',
};

export const TASK_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  DONE: 'done',
} as const;

export const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const;

export const PROJECT_COLUMNS = {
  TODO: 'todo',
  DOING: 'doing',
  DONE: 'done',
} as const;

export type TaskStatus = typeof TASK_STATUS[keyof typeof TASK_STATUS];
export type TaskPriority = typeof TASK_PRIORITY[keyof typeof TASK_PRIORITY];
export type ProjectColumn = typeof PROJECT_COLUMNS[keyof typeof PROJECT_COLUMNS];
