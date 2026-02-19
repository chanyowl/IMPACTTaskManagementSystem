import { Task, UserState, TaskSuggestion } from '../models/index.js';
import { getTasks } from './firebaseService.js';

export function calculateTaskSuitability(task: Task, userState: UserState): number {
  let score = 0.5; // Base score

  // Energy-based scoring
  if (userState.energy === 'high') {
    // High energy users should tackle high cognitive load tasks
    if (task.cognitiveLoad === 'high') score += 0.3;
    // Also good for scary tasks
    if (task.emotionalWeight === 'scary') score += 0.2;
  } else if (userState.energy === 'low') {
    // Low energy users should do low cognitive load tasks
    if (task.cognitiveLoad === 'low') score += 0.3;
    // Avoid scary tasks
    if (task.emotionalWeight === 'neutral') score += 0.2;
  } else {
    // Medium energy - balanced
    score += 0.1;
  }

  // Time of day scoring
  if (userState.timeOfDay === 'morning') {
    // Morning is best for deep work
    if (task.cognitiveLoad === 'high') score += 0.2;
  } else if (userState.timeOfDay === 'afternoon') {
    // Afternoon energy dip - better for routine tasks
    if (task.cognitiveLoad === 'low') score += 0.2;
  }

  // Sentiment-based scoring
  if (userState.sentiment > 0.3) {
    // Positive sentiment - can handle challenges
    if (task.emotionalWeight === 'scary') score += 0.1;
  } else if (userState.sentiment < -0.3) {
    // Negative sentiment - stick to comfortable tasks
    if (task.emotionalWeight === 'neutral') score += 0.1;
    if (task.cognitiveLoad === 'low') score += 0.1;
  }

  // Resistance penalty
  score -= task.userResistanceScore * 0.3;

  // Normalize score to 0-1 range
  return Math.max(0, Math.min(1, score));
}

export function generateReasoning(task: Task, userState: UserState, confidence: number): string {
  const reasons: string[] = [];

  // Energy-based reasoning
  if (userState.energy === 'high' && task.cognitiveLoad === 'high') {
    reasons.push("You seem energized right now, which is perfect for diving into this task");
  } else if (userState.energy === 'low' && task.cognitiveLoad === 'low') {
    reasons.push("This is a lighter task that matches your current energy");
  }

  // Time-based reasoning
  if (userState.timeOfDay === 'morning' && task.cognitiveLoad === 'high') {
    reasons.push("Morning is typically great for focused work");
  } else if (userState.timeOfDay === 'afternoon' && task.cognitiveLoad === 'low') {
    reasons.push("This feels like a good afternoon task");
  }

  // Sentiment-based reasoning
  if (userState.sentiment > 0 && task.emotionalWeight === 'scary') {
    reasons.push("You're in a good headspace to tackle something challenging");
  } else if (userState.sentiment < 0 && task.emotionalWeight === 'neutral') {
    reasons.push("Let's start with something straightforward");
  }

  // Resistance-based reasoning
  if (task.userResistanceScore > 0.5) {
    reasons.push("I noticed you've been avoiding this one");
  }

  // Confidence-based phrasing
  if (confidence < 0.7) {
    return `How does ${task.description.toLowerCase()} feel to you right now? ${reasons.join('. ')}.`;
  } else {
    return `${reasons.join('. ')}. ${task.description}.`;
  }
}

export async function suggestTask(userId: string, userState: UserState): Promise<TaskSuggestion | null> {
  try {
    // Get all pending tasks
    const pendingTasks = await getTasks(userId, 'pending');

    if (pendingTasks.length === 0) {
      return null;
    }

    // Calculate suitability scores for all tasks
    const scoredTasks = pendingTasks.map(task => ({
      task,
      score: calculateTaskSuitability(task, userState),
    }));

    // Sort by score (highest first)
    scoredTasks.sort((a, b) => b.score - a.score);

    // Get the best task
    const bestMatch = scoredTasks[0];

    return {
      task: bestMatch.task,
      confidence: bestMatch.score,
      reasoning: generateReasoning(bestMatch.task, userState, bestMatch.score),
    };
  } catch (error) {
    console.error('Error suggesting task:', error);
    return null;
  }
}

export async function suggestMultipleTasks(
  userId: string,
  userState: UserState,
  limit: number = 3
): Promise<TaskSuggestion[]> {
  try {
    const pendingTasks = await getTasks(userId, 'pending');

    if (pendingTasks.length === 0) {
      return [];
    }

    const scoredTasks = pendingTasks.map(task => ({
      task,
      score: calculateTaskSuitability(task, userState),
    }));

    scoredTasks.sort((a, b) => b.score - a.score);

    return scoredTasks.slice(0, limit).map(match => ({
      task: match.task,
      confidence: match.score,
      reasoning: generateReasoning(match.task, userState, match.score),
    }));
  } catch (error) {
    console.error('Error suggesting multiple tasks:', error);
    return [];
  }
}
