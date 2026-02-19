import { Interaction, UserState } from '../models/index.js';
import { getRecentInteractions } from './firebaseService.js';

export function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = new Date().getHours();

  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'night';
}

export function calculateEnergy(interactions: Interaction[]): 'high' | 'medium' | 'low' {
  if (interactions.length === 0) return 'medium';

  // Calculate average response latency
  const userInteractions = interactions.filter(i => i.sender === 'user');
  if (userInteractions.length === 0) return 'medium';

  const avgLatency = userInteractions.reduce((sum, i) => sum + i.responseLatencyMs, 0) / userInteractions.length;

  // Quick responses (< 3 seconds) = high energy
  // Medium responses (3-10 seconds) = medium energy
  // Slow responses (> 10 seconds) = low energy
  if (avgLatency < 3000) return 'high';
  if (avgLatency < 10000) return 'medium';
  return 'low';
}

export function calculateAverageSentiment(interactions: Interaction[]): number {
  if (interactions.length === 0) return 0;

  const userInteractions = interactions.filter(i => i.sender === 'user');
  if (userInteractions.length === 0) return 0;

  const avgSentiment = userInteractions.reduce((sum, i) => sum + i.sentimentScore, 0) / userInteractions.length;

  return Math.max(-1, Math.min(1, avgSentiment));
}

export async function inferUserState(userId: string): Promise<UserState> {
  try {
    // Get recent interactions (last 10)
    const recentInteractions = await getRecentInteractions(userId, 10);

    const energy = calculateEnergy(recentInteractions);
    const sentiment = calculateAverageSentiment(recentInteractions);
    const timeOfDay = getTimeOfDay();

    return {
      energy,
      sentiment,
      timeOfDay,
    };
  } catch (error) {
    console.error('Error inferring user state:', error);
    // Return default state
    return {
      energy: 'medium',
      sentiment: 0,
      timeOfDay: getTimeOfDay(),
    };
  }
}

// Detect anxiety markers in text
export function hasAnxietyMarkers(text: string): boolean {
  const anxietyWords = ['worried', 'anxious', 'stressed', 'overwhelmed', 'urgent', 'behind', 'so much', 'too many'];
  const lowerText = text.toLowerCase();
  return anxietyWords.some(word => lowerText.includes(word));
}

// Detect flow markers in text
export function hasFlowMarkers(text: string): boolean {
  const flowWords = ['crushed', 'finished', 'done', 'completed', 'easy', 'smooth', 'great', 'awesome'];
  const lowerText = text.toLowerCase();
  return flowWords.some(word => lowerText.includes(word));
}
