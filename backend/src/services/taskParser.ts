import { extractTasksFromText } from './aiService.js';
import { createTask } from './firebaseService.js';
import { Task, ParsedTask } from '../models/index.js';

export async function parseAndCreateTasks(text: string, userId: string): Promise<Task[]> {
  try {
    // Extract tasks using AI
    const parsedTasks = await extractTasksFromText(text);

    // Create tasks in Firestore
    const createdTasks: Task[] = [];

    for (const parsedTask of parsedTasks) {
      const task = await createTask({
        userId,
        description: parsedTask.description,
        inferredTags: parsedTask.inferredTags,
        cognitiveLoad: parsedTask.cognitiveLoad,
        emotionalWeight: parsedTask.emotionalWeight,
        userResistanceScore: 0, // Initial score
        status: 'pending',
        createdAt: null as any, // Will be set by createTask
        completedAt: null,
      } as any);

      createdTasks.push(task);
    }

    return createdTasks;
  } catch (error) {
    console.error('Error parsing and creating tasks:', error);
    throw error;
  }
}

export function categorizeTasks(tasks: Task[]): {
  highLoad: Task[];
  lowLoad: Task[];
  scary: Task[];
  neutral: Task[];
} {
  return {
    highLoad: tasks.filter(t => t.cognitiveLoad === 'high'),
    lowLoad: tasks.filter(t => t.cognitiveLoad === 'low'),
    scary: tasks.filter(t => t.emotionalWeight === 'scary'),
    neutral: tasks.filter(t => t.emotionalWeight === 'neutral'),
  };
}
