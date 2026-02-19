/**
 * Task Management Context
 *
 * Global state management for Task Management System
 */

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type {
  TaskManagement,
  Objective,
  CreateTaskData,
  UpdateTaskData
} from '../services/taskManagementApi';
import {
  getTasksGrouped,
  getObjectives,
  createTask,
  updateTask,
  deleteTask
} from '../services/taskManagementApi';

interface TaskManagementContextType {
  // Tasks grouped by status
  tasks: {
    pending: TaskManagement[];
    active: TaskManagement[];
    done: TaskManagement[];
  };

  // Objectives
  objectives: Objective[];

  // Loading states
  loading: boolean;
  error: string | null;

  // Actions
  refreshTasks: () => Promise<void>;
  refreshObjectives: () => Promise<void>;
  createNewTask: (taskData: CreateTaskData) => Promise<TaskManagement>;
  updateExistingTask: (taskId: string, updates: UpdateTaskData) => Promise<TaskManagement>;
  deleteExistingTask: (taskId: string, reason?: string) => Promise<void>;
  moveTaskToStatus: (taskId: string, newStatus: 'Pending' | 'Active' | 'Done', reason?: string) => Promise<void>;
}

const TaskManagementContext = createContext<TaskManagementContextType | undefined>(undefined);

export function TaskManagementProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<{
    pending: TaskManagement[];
    active: TaskManagement[];
    done: TaskManagement[];
  }>({
    pending: [],
    active: [],
    done: []
  });

  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load tasks on mount
  useEffect(() => {
    refreshTasks();
    refreshObjectives();
  }, []);

  const refreshTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const groupedTasks = await getTasksGrouped();
      setTasks(groupedTasks);
    } catch (err: any) {
      console.error('Error fetching tasks:', err);
      setError(err.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const refreshObjectives = async () => {
    try {
      // Don't filter by status - load all objectives
      // This ensures newly created objectives appear immediately
      const objs = await getObjectives();
      setObjectives(objs);
    } catch (err: any) {
      console.error('Error fetching objectives:', err);
    }
  };

  const createNewTask = async (taskData: CreateTaskData): Promise<TaskManagement> => {
    try {
      setError(null);
      const newTask = await createTask(taskData);
      await refreshTasks(); // Refresh to get updated list
      return newTask;
    } catch (err: any) {
      setError(err.message || 'Failed to create task');
      throw err;
    }
  };

  const updateExistingTask = async (
    taskId: string,
    updates: UpdateTaskData
  ): Promise<TaskManagement> => {
    try {
      setError(null);
      const updatedTask = await updateTask(taskId, updates);
      await refreshTasks(); // Refresh to get updated list
      return updatedTask;
    } catch (err: any) {
      setError(err.message || 'Failed to update task');
      throw err;
    }
  };

  const deleteExistingTask = async (taskId: string, reason?: string): Promise<void> => {
    try {
      setError(null);
      await deleteTask(taskId, reason);
      await refreshTasks(); // Refresh to get updated list
    } catch (err: any) {
      setError(err.message || 'Failed to delete task');
      throw err;
    }
  };

  const moveTaskToStatus = async (
    taskId: string,
    newStatus: 'Pending' | 'Active' | 'Done',
    reason?: string
  ): Promise<void> => {
    try {
      setError(null);
      await updateTask(taskId, { status: newStatus, reason });
      await refreshTasks(); // Refresh to get updated list
    } catch (err: any) {
      setError(err.message || 'Failed to move task');
      throw err;
    }
  };

  const value: TaskManagementContextType = {
    tasks,
    objectives,
    loading,
    error,
    refreshTasks,
    refreshObjectives,
    createNewTask,
    updateExistingTask,
    deleteExistingTask,
    moveTaskToStatus
  };

  return (
    <TaskManagementContext.Provider value={value}>
      {children}
    </TaskManagementContext.Provider>
  );
}

export function useTaskManagement() {
  const context = useContext(TaskManagementContext);
  if (context === undefined) {
    throw new Error('useTaskManagement must be used within a TaskManagementProvider');
  }
  return context;
}
