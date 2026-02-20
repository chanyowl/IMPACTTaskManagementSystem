/**
 * Task Management Service
 *
 * Core CRUD operations for tasks with:
 * - Ontology validation
 * - Automatic audit logging
 * - Objective linking
 * - Soft relationship management
 */

import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';
import {
  TaskManagement,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskFilters,
  TaskStatus
} from '../models/TaskManagement.js';
import {
  validateTaskCreation,
  validateTaskUpdate,
  validateCompleteTask
} from '../core/ontology.js';
import { createAuditLog } from './auditService.js';
import {
  objectiveExists,
  linkTaskToObjective,
  unlinkTaskFromObjective
} from './objectiveService.js';

const db = getFirestore();
const TASKS_COLLECTION = 'taskManagement';

/**
 * Check if a user exists (simplified - in production check against users collection)
 */
async function userExists(userId: string): Promise<boolean> {
  // For Phase 1, we'll assume the user exists if there's a Firebase Auth user
  // In production, check against a users collection
  return !!(userId && userId.length > 0);
}

/**
 * Create a new task
 * CRITICAL: Validates ontology and creates audit log
 */
export async function createTask(
  taskData: CreateTaskRequest,
  createdBy: string,
  metadata?: { ipAddress?: string; userAgent?: string }
): Promise<TaskManagement> {
  // Step 1: Validate against ontology
  const validation = await validateCompleteTask(
    taskData,
    objectiveExists,
    userExists
  );

  if (!validation.valid) {
    const errorMessage = validation.errors.map(e => `${e.field}: ${e.message}`).join('; ');
    throw new Error(`Task validation failed: ${errorMessage}`);
  }

  // Step 2: Create task object
  const taskId = uuidv4();
  const now = Timestamp.now();

  const task: TaskManagement = {
    taskId,
    objective: taskData.objective,
    assignee: taskData.assignee,
    startDate: Timestamp.fromDate(new Date(taskData.startDate)),
    dueDate: Timestamp.fromDate(new Date(taskData.dueDate)),
    status: 'Pending',
    deliverable: taskData.deliverable,
    evidence: taskData.evidence,
    intent: taskData.intent,

    // Recommended fields
    version: 1,
    visibility: taskData.visibility || ['all'],

    // Soft relationships
    tags: taskData.tags || [],
    linkedTasks: taskData.linkedTasks || [],
    relatedSOPs: taskData.relatedSOPs || [],
    references: taskData.references || [],

    // Metadata
    createdAt: now,
    updatedAt: now,
    createdBy,
    lastModifiedBy: createdBy
  };

  // Step 3: Write to Firestore
  await db.collection(TASKS_COLLECTION).doc(taskId).set({
    ...task,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  });

  // Step 4: Link to objective
  await linkTaskToObjective(taskData.objective, taskId);

  // Step 5: Create audit log
  await createAuditLog(
    taskId,
    createdBy,
    'created',
    null,
    task,
    'Task created',
    metadata
  );

  return task;
}

/**
 * Get a task by ID
 */
export async function getTask(taskId: string): Promise<TaskManagement | null> {
  const doc = await db.collection(TASKS_COLLECTION).doc(taskId).get();

  if (!doc.exists) {
    return null;
  }

  return doc.data() as TaskManagement;
}

/**
 * List tasks with filters
 */
export async function listTasks(filters?: TaskFilters): Promise<TaskManagement[]> {
  let query = db.collection(TASKS_COLLECTION).orderBy('createdAt', 'desc');

  if (filters?.assignee) {
    query = query.where('assignee', '==', filters.assignee) as any;
  }

  if (filters?.objective) {
    query = query.where('objective', '==', filters.objective) as any;
  }

  if (filters?.status) {
    query = query.where('status', '==', filters.status) as any;
  }

  if (filters?.createdBy) {
    query = query.where('createdBy', '==', filters.createdBy) as any;
  }

  if (filters?.dueBefore) {
    query = query.where('dueDate', '<=', Timestamp.fromDate(filters.dueBefore)) as any;
  }

  if (filters?.dueAfter) {
    query = query.where('dueDate', '>=', Timestamp.fromDate(filters.dueAfter)) as any;
  }

  const snapshot = await query.limit(1000).get();
  let tasks = snapshot.docs.map(doc => doc.data() as TaskManagement);

  // Filter by tags (client-side)
  if (filters?.tags && filters.tags.length > 0) {
    tasks = tasks.filter(task =>
      filters.tags!.some(tag => task.tags.includes(tag))
    );
  }

  // EXCLUDE DELETED TASKS (Trash Bin logic)
  tasks = tasks.filter(task => !task.deletedAt);

  return tasks;
}

/**
 * Update a task
 * CRITICAL: Validates changes and creates audit log
 */
export async function updateTask(
  taskId: string,
  updates: UpdateTaskRequest,
  updatedBy: string,
  metadata?: { ipAddress?: string; userAgent?: string }
): Promise<TaskManagement> {
  // Step 1: Get current task
  const currentTask = await getTask(taskId);
  if (!currentTask) {
    throw new Error(`Task ${taskId} not found`);
  }

  // Step 2: Validate update against ontology
  const validation = validateTaskUpdate(currentTask, updates);
  if (!validation.valid) {
    const errorMessage = validation.errors.map(e => `${e.field}: ${e.message}`).join('; ');
    throw new Error(`Task update validation failed: ${errorMessage}`);
  }

  // Step 3: Prepare updated task
  const previousState = { ...currentTask };
  const { reason, ...taskUpdates } = updates;

  const updatedTask: TaskManagement = {
    ...currentTask,
    ...taskUpdates,
    startDate: updates.startDate
      ? Timestamp.fromDate(new Date(updates.startDate))
      : currentTask.startDate,
    dueDate: updates.dueDate
      ? Timestamp.fromDate(new Date(updates.dueDate))
      : currentTask.dueDate,
    version: currentTask.version + 1,
    updatedAt: Timestamp.now(),
    lastModifiedBy: updatedBy
  };

  // Step 4: Handle objective change
  if (updates.objective && updates.objective !== currentTask.objective) {
    await unlinkTaskFromObjective(currentTask.objective, taskId);
    await linkTaskToObjective(updates.objective, taskId);
  }

  // Step 5: Write to Firestore
  const { taskId: _, createdAt, createdBy, ...updateData } = updatedTask as any;
  await db.collection(TASKS_COLLECTION).doc(taskId).update({
    ...updateData,
    updatedAt: FieldValue.serverTimestamp()
  });

  // Step 6: Create audit log
  const action = updates.status && updates.status !== currentTask.status
    ? 'status_changed'
    : updates.assignee && updates.assignee !== currentTask.assignee
      ? 'reassigned'
      : 'updated';

  await createAuditLog(
    taskId,
    updatedBy,
    action,
    previousState,
    updatedTask,
    updates.reason,
    metadata
  );

  return updatedTask;
}

/**
 * Delete a task (soft delete)
 * CRITICAL: Creates audit log and marks as deleted
 */
export async function deleteTask(
  taskId: string,
  deletedBy: string,
  reason?: string,
  metadata?: { ipAddress?: string; userAgent?: string }
): Promise<void> {
  // Step 1: Get current task
  const currentTask = await getTask(taskId);
  if (!currentTask) {
    throw new Error(`Task ${taskId} not found`);
  }

  // Step 2: Create audit log BEFORE deletion
  await createAuditLog(
    taskId,
    deletedBy,
    'deleted',
    currentTask,
    { ...currentTask, deletedAt: Timestamp.now() },
    reason || 'Task moved to trash',
    metadata
  );

  // Step 3: Soft delete - update deletedAt timestamp
  await db.collection(TASKS_COLLECTION).doc(taskId).update({
    deletedAt: FieldValue.serverTimestamp(),
    deletedBy: deletedBy,
    updatedAt: FieldValue.serverTimestamp()
  });
}

/**
 * Restore a task from trash
 */
export async function restoreTask(
  taskId: string,
  restoredBy: string,
  metadata?: { ipAddress?: string; userAgent?: string }
): Promise<void> {
  const currentTask = await getTask(taskId);
  if (!currentTask) {
    throw new Error(`Task ${taskId} not found`);
  }

  // Remove deletedAt field
  await db.collection(TASKS_COLLECTION).doc(taskId).update({
    deletedAt: FieldValue.delete(),
    deletedBy: FieldValue.delete(),
    updatedAt: FieldValue.serverTimestamp(),
    lastModifiedBy: restoredBy
  });

  // Audit log
  await createAuditLog(
    taskId,
    restoredBy,
    'status_changed', // Using status_changed or generic updated
    currentTask,
    { ...currentTask, deletedAt: null } as any,
    'Task restored from trash',
    metadata
  );
}

/**
 * Permanently delete a task
 */
export async function permanentlyDeleteTask(
  taskId: string,
  deletedBy: string,
  metadata?: { ipAddress?: string; userAgent?: string }
): Promise<void> {
  const currentTask = await getTask(taskId);
  if (!currentTask) {
    throw new Error(`Task ${taskId} not found`);
  }

  // Audit log (final record)
  await createAuditLog(
    taskId,
    deletedBy,
    'deleted',
    currentTask,
    null as any,
    'Task permanently deleted',
    metadata
  );

  // Unlink from objective
  await unlinkTaskFromObjective(currentTask.objective, taskId);

  // Hard delete
  await db.collection(TASKS_COLLECTION).doc(taskId).delete();
}

/**
 * Get deleted tasks (Trash Bin)
 */
export async function getDeletedTasks(): Promise<TaskManagement[]> {
  // We can't easily query for non-null in basic firestore without composite index sometimes
  // So we'll query all and filter, OR simply query 'deletedAt' > 0 if feasible.
  // Easiest for now: order by deletedAt
  try {
    const snapshot = await db.collection(TASKS_COLLECTION)
      .orderBy('deletedAt', 'desc')
      .get();

    return snapshot.docs.map(doc => doc.data() as TaskManagement);
  } catch (e) {
    // If index missing, fallback: fetch all and filter client side (not efficient but safe for v1)
    // Actually, let's just use the fact that we can filter listTasks to NOT show them, 
    // and here we want ONLY them.
    // A query for orderBy('deletedAt') implies deletedAt exists.
    const snapshot = await db.collection(TASKS_COLLECTION).get();
    return snapshot.docs
      .map(doc => doc.data() as TaskManagement)
      .filter(t => !!t.deletedAt);
  }
}


/**
 * Link two tasks together (soft relationship)
 */
export async function linkTasks(
  taskId: string,
  linkedTaskId: string,
  userId: string
): Promise<void> {
  const task = await getTask(taskId);
  if (!task) {
    throw new Error(`Task ${taskId} not found`);
  }

  if (!task.linkedTasks.includes(linkedTaskId)) {
    await db.collection(TASKS_COLLECTION).doc(taskId).update({
      linkedTasks: FieldValue.arrayUnion(linkedTaskId),
      updatedAt: FieldValue.serverTimestamp(),
      lastModifiedBy: userId
    });

    // Create audit log
    await createAuditLog(
      taskId,
      userId,
      'linked',
      { linkedTasks: task.linkedTasks },
      { linkedTasks: [...task.linkedTasks, linkedTaskId] },
      `Linked to task ${linkedTaskId}`
    );
  }
}

/**
 * Unlink two tasks (soft relationship)
 */
export async function unlinkTasks(
  taskId: string,
  linkedTaskId: string,
  userId: string
): Promise<void> {
  const task = await getTask(taskId);
  if (!task) {
    throw new Error(`Task ${taskId} not found`);
  }

  await db.collection(TASKS_COLLECTION).doc(taskId).update({
    linkedTasks: FieldValue.arrayRemove(linkedTaskId),
    updatedAt: FieldValue.serverTimestamp(),
    lastModifiedBy: userId
  });

  // Create audit log
  await createAuditLog(
    taskId,
    userId,
    'unlinked',
    { linkedTasks: task.linkedTasks },
    { linkedTasks: task.linkedTasks.filter(id => id !== linkedTaskId) },
    `Unlinked from task ${linkedTaskId}`
  );
}

/**
 * Get tasks by status (for Kanban board)
 */
export async function getTasksByStatus(status: TaskStatus): Promise<TaskManagement[]> {
  const snapshot = await db
    .collection(TASKS_COLLECTION)
    .where('status', '==', status)
    .get();

  // Sort client-side to avoid composite index requirement
  let tasks = snapshot.docs.map(doc => doc.data() as TaskManagement);

  // Filter out deleted tasks
  tasks = tasks.filter(t => !t.deletedAt);

  return tasks.sort((a, b) => {
    const aTime = a.dueDate.toMillis();
    const bTime = b.dueDate.toMillis();
    return aTime - bTime;
  });
}

/**
 * Get all tasks grouped by status (for Kanban board)
 */
export async function getAllTasksGroupedByStatus(): Promise<{
  pending: TaskManagement[];
  active: TaskManagement[];
  done: TaskManagement[];
}> {
  const [pending, active, done] = await Promise.all([
    getTasksByStatus('Pending'),
    getTasksByStatus('Active'),
    getTasksByStatus('Done')
  ]);

  return { pending, active, done };
}

/**
 * Get overdue tasks
 */
export async function getOverdueTasks(): Promise<TaskManagement[]> {
  const now = Timestamp.now();

  const snapshot = await db
    .collection(TASKS_COLLECTION)
    .where('dueDate', '<', now)
    .where('status', 'in', ['Pending', 'Active'])
    .get();

  let tasks = snapshot.docs.map(doc => doc.data() as TaskManagement);
  return tasks.filter(t => !t.deletedAt);
}

/**
 * Get task statistics
 */
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
  let query = db.collection(TASKS_COLLECTION);

  if (filters?.assignee) {
    query = query.where('assignee', '==', filters.assignee) as any;
  }

  if (filters?.objective) {
    query = query.where('objective', '==', filters.objective) as any;
  }

  const snapshot = await query.get();
  let tasks = snapshot.docs.map(doc => doc.data() as TaskManagement);

  // Filter out deleted tasks
  tasks = tasks.filter(t => !t.deletedAt);

  const now = Date.now();

  return {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'Pending').length,
    active: tasks.filter(t => t.status === 'Active').length,
    done: tasks.filter(t => t.status === 'Done').length,
    overdue: tasks.filter(
      t => (t.status === 'Pending' || t.status === 'Active') &&
        t.dueDate.toMillis() < now
    ).length
  };
}
