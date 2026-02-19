import axios from 'axios';
import type { ChatRequest, ChatResponse, Task, TaskSuggestion, UserProfile, TaskFeedbackRequest } from '../types/index';

let API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
if (API_BASE_URL && !API_BASE_URL.startsWith('http')) {
  API_BASE_URL = `https://${API_BASE_URL}`;
}

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Chat
export async function sendMessage(userId: string, message: string): Promise<ChatResponse> {
  const startTime = Date.now();
  const response = await api.post<ChatResponse>('/chat', {
    userId,
    message,
    responseStartTime: startTime,
  } as ChatRequest);
  return response.data;
}

// Tasks
export async function extractTasks(userId: string, text: string): Promise<Task[]> {
  const response = await api.post<{ tasks: Task[] }>('/tasks/extract', { userId, text });
  return response.data.tasks;
}

export async function getTasks(userId: string, status?: string): Promise<Task[]> {
  const params = status ? { userId, status } : { userId };
  const response = await api.get<{ tasks: Task[] }>('/tasks', { params });
  return response.data.tasks;
}

export async function getTaskSuggestion(userId: string): Promise<TaskSuggestion | null> {
  const response = await api.get<TaskSuggestion | { message: string }>('/tasks/suggest', {
    params: { userId },
  });

  if ('message' in response.data) {
    return null;
  }

  return response.data;
}

export async function submitTaskFeedback(taskId: string, feedback: TaskFeedbackRequest): Promise<void> {
  await api.post(`/tasks/${taskId}/feedback`, feedback);
}

export async function updateTask(taskId: string, updates: Partial<Task>): Promise<void> {
  await api.patch(`/tasks/${taskId}`, updates);
}

// Profile
export async function getUserProfile(userId: string): Promise<UserProfile> {
  const response = await api.get<UserProfile>(`/profile/${userId}`);
  return response.data;
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
  await api.patch(`/profile/${userId}`, updates);
}

// Health check
export async function checkHealth(): Promise<boolean> {
  try {
    const response = await axios.get(`${API_BASE_URL}/health`);
    return response.data.status === 'ok';
  } catch {
    return false;
  }
}

export default api;
