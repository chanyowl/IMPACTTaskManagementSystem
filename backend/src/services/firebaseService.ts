import { db, Timestamp, FieldValue } from '../config/firebase.js';
import { UserProfile, Task, Interaction } from '../models/index.js';

// User Profile Operations
export async function getUser(userId: string): Promise<UserProfile | null> {
  try {
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return null;
    }
    return { id: userDoc.id, ...userDoc.data() } as UserProfile;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}

export async function createUser(userId: string): Promise<UserProfile> {
  try {
    const userData: Omit<UserProfile, 'id'> = {
      createdAt: Timestamp.now(),
      peakHours: [],
      stressTriggers: [],
      workStyle: null,
      lastActive: Timestamp.now(),
    };

    await db.collection('users').doc(userId).set(userData);
    return { id: userId, ...userData };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

export async function updateUser(userId: string, data: Partial<UserProfile>): Promise<void> {
  try {
    await db.collection('users').doc(userId).update({
      ...data,
      lastActive: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

// Task Operations
export async function createTask(taskData: Omit<Task, 'id'>): Promise<Task> {
  try {
    const taskRef = await db.collection('tasks').add({
      ...taskData,
      createdAt: Timestamp.now(),
      completedAt: null,
    });

    const taskDoc = await taskRef.get();
    return { id: taskRef.id, ...taskDoc.data() } as Task;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
}

export async function getTasks(userId: string, status?: string): Promise<Task[]> {
  try {
    let query = db.collection('tasks').where('userId', '==', userId);

    if (status) {
      query = query.where('status', '==', status);
    }

    const snapshot = await query.orderBy('createdAt', 'desc').get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Task[];
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
}

export async function updateTask(taskId: string, data: Partial<Task>): Promise<void> {
  try {
    const updateData: any = { ...data };

    if (data.status === 'completed' && !data.completedAt) {
      updateData.completedAt = Timestamp.now();
    }

    await db.collection('tasks').doc(taskId).update(updateData);
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
}

// Interaction Operations
export async function logInteraction(interactionData: Omit<Interaction, 'id'>): Promise<Interaction> {
  try {
    const interactionRef = await db.collection('interactions').add({
      ...interactionData,
      timestamp: Timestamp.now(),
    });

    const interactionDoc = await interactionRef.get();
    return { id: interactionRef.id, ...interactionDoc.data() } as Interaction;
  } catch (error) {
    console.error('Error logging interaction:', error);
    throw error;
  }
}

export async function getRecentInteractions(userId: string, limit: number = 10): Promise<Interaction[]> {
  try {
    const snapshot = await db
      .collection('interactions')
      .where('userId', '==', userId)
      .get();

    const interactions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Interaction[];

    // Sort in memory (descending)
    return interactions
      .sort((a, b) => b.timestamp.seconds - a.timestamp.seconds)
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching interactions:', error);
    throw error;
  }
}

// Helper: Get or create user
export async function getOrCreateUser(userId: string): Promise<UserProfile> {
  const user = await getUser(userId);
  if (user) {
    return user;
  }
  return await createUser(userId);
}
