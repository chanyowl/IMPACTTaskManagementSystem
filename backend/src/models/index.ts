import { Timestamp } from 'firebase-admin/firestore';

export interface UserProfile {
  id: string;
  createdAt: Timestamp;
  peakHours: number[]; // e.g., [10, 14] for 10am and 2pm
  stressTriggers: string[];
  workStyle: 'focus-bursts' | 'marathon' | null;
  lastActive: Timestamp;
}

export interface Task {
  id: string;
  userId: string;
  description: string;
  inferredTags: string[]; // ["creative", "admin", "social"]
  cognitiveLoad: 'high' | 'low';
  emotionalWeight: 'scary' | 'neutral';
  userResistanceScore: number; // 0.0-1.0
  status: 'pending' | 'completed' | 'snoozed';
  createdAt: Timestamp;
  completedAt: Timestamp | null;
}

export interface Interaction {
  id: string;
  userId: string;
  message: string;
  sender: 'user' | 'trixie';
  sentimentScore: number; // -1.0 to 1.0
  responseLatencyMs: number;
  timestamp: Timestamp;
}

export interface UserState {
  energy: 'high' | 'medium' | 'low';
  sentiment: number; // -1.0 to 1.0
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
}

export interface TaskSuggestion {
  task: Task;
  confidence: number; // 0.0-1.0
  reasoning: string;
}

export interface ChatRequest {
  message: string;
  userId: string;
  responseStartTime?: number;
}

export interface ChatResponse {
  response: string;
  suggestedTasks?: Task[];
}

export interface TaskExtractRequest {
  text: string;
  userId: string;
}

export interface TaskFeedback {
  action: 'accept' | 'snooze' | 'wrong_read';
  reason?: string;
}

export interface ParsedTask {
  description: string;
  inferredTags: string[];
  cognitiveLoad: 'high' | 'low';
  emotionalWeight: 'scary' | 'neutral';
}
