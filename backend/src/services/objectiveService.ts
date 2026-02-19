/**
 * Objective Service
 *
 * Manages objectives (which group related tasks)
 */

import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';
import { Objective } from '../models/TaskManagement.js';
import { validateObjectiveCreation } from '../core/ontology.js';

const db = getFirestore();
const OBJECTIVES_COLLECTION = 'objectives';

/**
 * Create a new objective
 */
export async function createObjective(
  title: string,
  description: string,
  owner: string,
  createdBy: string,
  options?: {
    dueDate?: Date;
    tags?: string[];
  }
): Promise<Objective> {
  // Validate
  const validation = validateObjectiveCreation({
    title,
    description,
    owner
  });

  if (!validation.valid) {
    throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
  }

  const objectiveId = uuidv4();
  const now = Timestamp.now();

  const objective: Objective = {
    objectiveId,
    title,
    description,
    owner,
    tasks: [],
    status: 'active',
    createdAt: now,
    updatedAt: now,
    createdBy,
    dueDate: options?.dueDate ? Timestamp.fromDate(options.dueDate) : undefined,
    tags: options?.tags || []
  };

  await db.collection(OBJECTIVES_COLLECTION).doc(objectiveId).set({
    ...objective,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    dueDate: objective.dueDate || null
  });

  return objective;
}

/**
 * Get an objective by ID
 */
export async function getObjective(objectiveId: string): Promise<Objective | null> {
  const doc = await db.collection(OBJECTIVES_COLLECTION).doc(objectiveId).get();

  if (!doc.exists) {
    return null;
  }

  return doc.data() as Objective;
}

/**
 * Check if an objective exists
 */
export async function objectiveExists(objectiveId: string): Promise<boolean> {
  const doc = await db.collection(OBJECTIVES_COLLECTION).doc(objectiveId).get();
  return doc.exists;
}

/**
 * Ensure an objective exists, creating it if necessary (for auto-migration of Projects)
 */
export async function ensureObjectiveExists(objectiveId: string): Promise<void> {
  const docRef = db.collection(OBJECTIVES_COLLECTION).doc(objectiveId);
  const doc = await docRef.get();

  if (!doc.exists) {
    const now = Timestamp.now();
    const objective: Objective = {
      objectiveId,
      title: objectiveId, // Use ID as title for these auto-created projects
      description: 'Auto-created project objective',
      owner: 'system',
      tasks: [],
      status: 'active',
      createdAt: now,
      updatedAt: now,
      createdBy: 'system',
      tags: ['project']
    };

    await docRef.set({
      ...objective,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });
    console.log(`Auto-created objective: ${objectiveId}`);
  }
}

/**
 * List all objectives
 */
export async function listObjectives(filters?: {
  owner?: string;
  status?: 'active' | 'completed' | 'archived';
  tags?: string[];
}): Promise<Objective[]> {
  let query = db.collection(OBJECTIVES_COLLECTION).orderBy('createdAt', 'desc');

  if (filters?.owner) {
    query = query.where('owner', '==', filters.owner) as any;
  }

  if (filters?.status) {
    query = query.where('status', '==', filters.status) as any;
  }

  const snapshot = await query.get();
  let objectives = snapshot.docs.map(doc => doc.data() as Objective);

  // Filter by tags (client-side since array-contains doesn't work with multiple values)
  if (filters?.tags && filters.tags.length > 0) {
    objectives = objectives.filter(obj =>
      filters.tags!.some(tag => obj.tags?.includes(tag))
    );
  }

  return objectives;
}

/**
 * Update an objective
 */
export async function updateObjective(
  objectiveId: string,
  updates: Partial<Objective>
): Promise<Objective> {
  const existingObj = await getObjective(objectiveId);
  if (!existingObj) {
    throw new Error(`Objective ${objectiveId} not found`);
  }

  // Prevent updating immutable fields
  const { objectiveId: _, createdAt, createdBy, ...allowedUpdates } = updates as any;

  const updatedObjective: Objective = {
    ...existingObj,
    ...allowedUpdates,
    updatedAt: Timestamp.now()
  };

  await db.collection(OBJECTIVES_COLLECTION).doc(objectiveId).update({
    ...allowedUpdates,
    updatedAt: FieldValue.serverTimestamp()
  });

  return updatedObjective;
}

/**
 * Add a task to an objective
 */
export async function linkTaskToObjective(
  objectiveId: string,
  taskId: string
): Promise<void> {
  const objective = await getObjective(objectiveId);
  if (!objective) {
    throw new Error(`Objective ${objectiveId} not found`);
  }

  if (!objective.tasks.includes(taskId)) {
    await db.collection(OBJECTIVES_COLLECTION).doc(objectiveId).update({
      tasks: FieldValue.arrayUnion(taskId),
      updatedAt: FieldValue.serverTimestamp()
    });
  }
}

/**
 * Remove a task from an objective
 */
export async function unlinkTaskFromObjective(
  objectiveId: string,
  taskId: string
): Promise<void> {
  const objective = await getObjective(objectiveId);
  if (!objective) {
    console.warn(`Objective ${objectiveId} not found, cannot unlink task ${taskId}`);
    return;
  }

  await db.collection(OBJECTIVES_COLLECTION).doc(objectiveId).update({
    tasks: FieldValue.arrayRemove(taskId),
    updatedAt: FieldValue.serverTimestamp()
  });
}

/**
 * Get all tasks for an objective
 * (Returns task IDs, use taskService to fetch full task data)
 */
export async function getObjectiveTasks(objectiveId: string): Promise<string[]> {
  const objective = await getObjective(objectiveId);
  if (!objective) {
    throw new Error(`Objective ${objectiveId} not found`);
  }

  return objective.tasks;
}

/**
 * Delete an objective (soft delete - mark as archived)
 */
export async function deleteObjective(objectiveId: string): Promise<void> {
  await db.collection(OBJECTIVES_COLLECTION).doc(objectiveId).update({
    status: 'archived',
    updatedAt: FieldValue.serverTimestamp()
  });
}

/**
 * Get objective statistics
 */
export async function getObjectiveStats(objectiveId: string): Promise<{
  totalTasks: number;
  objective: Objective;
}> {
  const objective = await getObjective(objectiveId);
  if (!objective) {
    throw new Error(`Objective ${objectiveId} not found`);
  }

  return {
    totalTasks: objective.tasks.length,
    objective
  };
}
