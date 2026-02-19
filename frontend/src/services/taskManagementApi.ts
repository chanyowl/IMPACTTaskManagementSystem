/**
 * Task Management API Client
 *
 * Frontend service for communicating with Task Management System backend
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export interface TaskManagement {
  taskId: string;
  objective: string;
  assignee: string;
  startDate: any;
  dueDate: any;
  status: 'Pending' | 'Active' | 'Done';
  deliverable: string;
  evidence: string | string[];
  intent?: string;
  version: number;
  visibility: string[];
  tags: string[];
  linkedTasks: string[];
  relatedSOPs?: string[];
  references: Reference[];
  createdAt: any;
  updatedAt: any;
  createdBy: string;
  lastModifiedBy: string;
}

export interface Reference {
  type: 'url' | 'file' | 'document' | 'sop';
  title: string;
  url: string;
  description?: string;
}

export interface Objective {
  objectiveId: string;
  title: string;
  description: string;
  owner: string;
  tasks: string[];
  status: 'active' | 'completed' | 'archived';
  createdAt: any;
  updatedAt: any;
  createdBy: string;
  dueDate?: any;
  tags?: string[];
}

export interface AuditLog {
  eventId: string;
  taskId: string;
  timestamp: any;
  userId: string;
  action: string;
  previousState: any;
  newState: any;
  reason?: string;
}

export interface CreateTaskData {
  objective: string;
  assignee: string;
  startDate: string | Date;
  dueDate: string | Date;
  deliverable: string;
  evidence: string | string[];
  intent?: string;
  tags?: string[];
  linkedTasks?: string[];
  relatedSOPs?: string[];
  references?: Reference[];
  visibility?: string[];
}

export interface UpdateTaskData {
  objective?: string;
  assignee?: string;
  startDate?: string | Date;
  dueDate?: string | Date;
  status?: 'Pending' | 'Active' | 'Done';
  deliverable?: string;
  evidence?: string | string[];
  intent?: string;
  tags?: string[];
  linkedTasks?: string[];
  relatedSOPs?: string[];
  references?: Reference[];
  reason?: string;
}

// ============ TASK OPERATIONS ============

export async function createTask(taskData: CreateTaskData): Promise<TaskManagement> {
  const response = await fetch(`${API_BASE_URL}/api/task-management`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(taskData),
  });

  if (!response.ok) {
    const error = await response.json();
    // Extract detailed error message
    let errorMessage = error.message || error.error || 'Failed to create task';

    // If there are validation details, include them
    if (error.details && Array.isArray(error.details)) {
      const detailMessages = error.details.map((d: any) => `${d.field}: ${d.message}`).join('; ');
      errorMessage = `${errorMessage} - ${detailMessages}`;
    }

    throw new Error(errorMessage);
  }

  const data = await response.json();
  return data.task;
}

export async function getTasks(filters?: {
  assignee?: string;
  objective?: string;
  status?: string;
  tags?: string[];
}): Promise<TaskManagement[]> {
  const params = new URLSearchParams();

  if (filters?.assignee) params.append('assignee', filters.assignee);
  if (filters?.objective) params.append('objective', filters.objective);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.tags) params.append('tags', filters.tags.join(','));

  const response = await fetch(`${API_BASE_URL}/api/task-management?${params}`);

  if (!response.ok) {
    throw new Error('Failed to fetch tasks');
  }

  const data = await response.json();
  return data.tasks;
}

export async function getTasksGrouped(): Promise<{
  pending: TaskManagement[];
  active: TaskManagement[];
  done: TaskManagement[];
}> {
  const response = await fetch(`${API_BASE_URL}/api/task-management/grouped`);

  if (!response.ok) {
    throw new Error('Failed to fetch grouped tasks');
  }

  const data = await response.json();
  return data.tasks;
}

export async function getTask(taskId: string): Promise<TaskManagement> {
  const response = await fetch(`${API_BASE_URL}/api/task-management/${taskId}`);

  if (!response.ok) {
    throw new Error('Failed to fetch task');
  }

  const data = await response.json();
  return data.task;
}

export async function updateTask(
  taskId: string,
  updates: UpdateTaskData
): Promise<TaskManagement> {
  const response = await fetch(`${API_BASE_URL}/api/task-management/${taskId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update task');
  }

  const data = await response.json();
  return data.task;
}

export async function deleteTask(taskId: string, reason?: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/task-management/${taskId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ reason }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete task');
  }
}

export async function getTaskAudit(taskId: string): Promise<AuditLog[]> {
  const response = await fetch(`${API_BASE_URL}/api/task-management/${taskId}/audit`);

  if (!response.ok) {
    throw new Error('Failed to fetch audit logs');
  }

  const data = await response.json();
  return data.auditLogs;
}

export async function getTaskStats(filters?: {
  assignee?: string;
  objective?: string;
}): Promise<{
  total: number;
  pending: number;
  active: number;
  done: number;
  overdue: number;
}> {
  const params = new URLSearchParams();
  if (filters?.assignee) params.append('assignee', filters.assignee);
  if (filters?.objective) params.append('objective', filters.objective);

  const response = await fetch(`${API_BASE_URL}/api/task-management/stats?${params}`);

  if (!response.ok) {
    throw new Error('Failed to fetch task stats');
  }

  const data = await response.json();
  return data.stats;
}

// ============ OBJECTIVE OPERATIONS ============

export async function createObjective(objectiveData: {
  title: string;
  description: string;
  owner: string;
  dueDate?: string | Date;
  tags?: string[];
}): Promise<Objective> {
  const response = await fetch(`${API_BASE_URL}/api/objectives`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(objectiveData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create objective');
  }

  const data = await response.json();
  return data.objective;
}

export async function getObjectives(filters?: {
  owner?: string;
  status?: string;
  tags?: string[];
}): Promise<Objective[]> {
  const params = new URLSearchParams();
  if (filters?.owner) params.append('owner', filters.owner);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.tags) params.append('tags', filters.tags.join(','));

  const response = await fetch(`${API_BASE_URL}/api/objectives?${params}`);

  if (!response.ok) {
    throw new Error('Failed to fetch objectives');
  }

  const data = await response.json();
  return data.objectives;
}

export async function getObjective(objectiveId: string): Promise<Objective> {
  const response = await fetch(`${API_BASE_URL}/api/objectives/${objectiveId}`);

  if (!response.ok) {
    throw new Error('Failed to fetch objective');
  }

  const data = await response.json();
  return data.objective;
}

export async function getObjectiveTasks(objectiveId: string): Promise<TaskManagement[]> {
  const response = await fetch(`${API_BASE_URL}/api/objectives/${objectiveId}/tasks`);

  if (!response.ok) {
    throw new Error('Failed to fetch objective tasks');
  }

  const data = await response.json();
  return data.tasks;
}

export async function updateObjective(
  objectiveId: string,
  updates: Partial<Objective>
): Promise<Objective> {
  const response = await fetch(`${API_BASE_URL}/api/objectives/${objectiveId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update objective');
  }

  const data = await response.json();
  return data.objective;
}

// ============ AUDIT OPERATIONS ============

export async function getRecentActivity(limit: number = 50): Promise<AuditLog[]> {
  const response = await fetch(`${API_BASE_URL}/api/audit/recent?limit=${limit}`);

  if (!response.ok) {
    throw new Error('Failed to fetch recent activity');
  }

  const data = await response.json();
  return data.auditLogs;
}

export async function exportAuditLogs(filters?: {
  taskId?: string;
  userId?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
}): Promise<Blob> {
  const params = new URLSearchParams();
  if (filters?.taskId) params.append('taskId', filters.taskId);
  if (filters?.userId) params.append('userId', filters.userId);
  if (filters?.action) params.append('action', filters.action);
  if (filters?.startDate) params.append('startDate', filters.startDate);
  if (filters?.endDate) params.append('endDate', filters.endDate);

  const response = await fetch(`${API_BASE_URL}/api/audit/export?${params}`);

  if (!response.ok) {
    throw new Error('Failed to export audit logs');
  }

  return await response.blob();
}
