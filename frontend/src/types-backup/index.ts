export interface UserProfile {
  id: string;
  createdAt: Date;
  peakHours: number[];
  stressTriggers: string[];
  workStyle: 'focus-bursts' | 'marathon' | null;
  lastActive: Date;
}

export interface Task {
  id: string;
  userId: string;
  description: string;
  inferredTags: string[];
  cognitiveLoad: 'high' | 'low';
  emotionalWeight: 'scary' | 'neutral';
  userResistanceScore: number;
  status: 'pending' | 'completed' | 'snoozed';
  createdAt: Date;
  completedAt: Date | null;
}

export interface Message {
  id: string;
  message: string;
  sender: 'user' | 'crystell';
  timestamp: Date;
}

export interface TaskSuggestion {
  task: Task;
  confidence: number;
  reasoning: string;
}

export interface ChatRequest {
  message: string;
  userId: string;
}

export interface ChatResponse {
  response: string;
  suggestedTasks?: Task[];
}

export interface TaskFeedbackRequest {
  action: 'accept' | 'snooze' | 'wrong_read';
  reason?: string;
}
