/**
 * Audit Service
 *
 * Manages audit log creation and retrieval
 * CRITICAL: Audit logs are IMMUTABLE - once created, they cannot be modified
 */

import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';
import {
  AuditLog,
  AuditAction,
  TaskManagement
} from '../models/TaskManagement.js';

const db = getFirestore();
const AUDIT_COLLECTION = 'auditLogs';

/**
 * Creates an audit log entry
 * This is called automatically by task mutations
 */
export async function createAuditLog(
  taskId: string,
  userId: string,
  action: AuditAction,
  previousState: Partial<TaskManagement> | null,
  newState: Partial<TaskManagement>,
  reason?: string,
  metadata?: { ipAddress?: string; userAgent?: string }
): Promise<AuditLog> {
  const eventId = uuidv4();

  const auditLog: AuditLog = {
    eventId,
    taskId,
    timestamp: Timestamp.now(),
    userId,
    action,
    previousState,
    newState,
    ...(reason ? { reason } : {}),
    ...metadata
  };

  // Write to Firestore
  await db.collection(AUDIT_COLLECTION).doc(eventId).set({
    ...auditLog,
    // Convert Timestamp to ensure proper serialization
    timestamp: FieldValue.serverTimestamp()
  });

  return auditLog;
}

/**
 * Get audit logs for a specific task
 */
export async function getTaskAuditHistory(taskId: string): Promise<AuditLog[]> {
  try {
    const snapshot = await db
      .collection(AUDIT_COLLECTION)
      .where('taskId', '==', taskId)
      .get();

    // Sort in memory to avoid Firestore index requirement
    const logs = snapshot.docs.map(doc => doc.data() as AuditLog);
    return logs.sort((a, b) => {
      const timeA = a.timestamp?.seconds || 0;
      const timeB = b.timestamp?.seconds || 0;
      return timeB - timeA; // Descending order (newest first)
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    // Return empty array instead of throwing to prevent 500 errors
    return [];
  }
}

/**
 * Get audit logs by user
 */
export async function getUserAuditHistory(
  userId: string,
  limit: number = 100
): Promise<AuditLog[]> {
  const snapshot = await db
    .collection(AUDIT_COLLECTION)
    .where('userId', '==', userId)
    .orderBy('timestamp', 'desc')
    .limit(limit)
    .get();

  return snapshot.docs.map(doc => doc.data() as AuditLog);
}

/**
 * Get audit logs by action type
 */
export async function getAuditLogsByAction(
  action: AuditAction,
  limit: number = 100
): Promise<AuditLog[]> {
  const snapshot = await db
    .collection(AUDIT_COLLECTION)
    .where('action', '==', action)
    .orderBy('timestamp', 'desc')
    .limit(limit)
    .get();

  return snapshot.docs.map(doc => doc.data() as AuditLog);
}

/**
 * Get audit logs within a date range
 */
export async function getAuditLogsByDateRange(
  startDate: Date,
  endDate: Date,
  limit: number = 1000
): Promise<AuditLog[]> {
  const snapshot = await db
    .collection(AUDIT_COLLECTION)
    .where('timestamp', '>=', Timestamp.fromDate(startDate))
    .where('timestamp', '<=', Timestamp.fromDate(endDate))
    .orderBy('timestamp', 'desc')
    .limit(limit)
    .get();

  return snapshot.docs.map(doc => doc.data() as AuditLog);
}

/**
 * Export audit logs (for compliance/reporting)
 * Returns all audit logs matching filters
 */
export async function exportAuditLogs(filters?: {
  taskId?: string;
  userId?: string;
  action?: AuditAction;
  startDate?: Date;
  endDate?: Date;
}): Promise<AuditLog[]> {
  let query = db.collection(AUDIT_COLLECTION).orderBy('timestamp', 'desc');

  if (filters?.taskId) {
    query = query.where('taskId', '==', filters.taskId) as any;
  }

  if (filters?.userId) {
    query = query.where('userId', '==', filters.userId) as any;
  }

  if (filters?.action) {
    query = query.where('action', '==', filters.action) as any;
  }

  if (filters?.startDate) {
    query = query.where('timestamp', '>=', Timestamp.fromDate(filters.startDate)) as any;
  }

  if (filters?.endDate) {
    query = query.where('timestamp', '<=', Timestamp.fromDate(filters.endDate)) as any;
  }

  const snapshot = await query.limit(10000).get();
  return snapshot.docs.map(doc => doc.data() as AuditLog);
}

/**
 * Get recent audit activity (for dashboard)
 */
export async function getRecentActivity(limit: number = 50): Promise<AuditLog[]> {
  const snapshot = await db
    .collection(AUDIT_COLLECTION)
    .orderBy('timestamp', 'desc')
    .limit(limit)
    .get();

  return snapshot.docs.map(doc => doc.data() as AuditLog);
}

/**
 * Count audit logs (for analytics)
 */
export async function countAuditLogs(filters?: {
  taskId?: string;
  userId?: string;
  action?: AuditAction;
}): Promise<number> {
  let query = db.collection(AUDIT_COLLECTION);

  if (filters?.taskId) {
    query = query.where('taskId', '==', filters.taskId) as any;
  }

  if (filters?.userId) {
    query = query.where('userId', '==', filters.userId) as any;
  }

  if (filters?.action) {
    query = query.where('action', '==', filters.action) as any;
  }

  const snapshot = await query.count().get();
  return snapshot.data().count;
}

/**
 * Helper to create a comparison between states (for UI display)
 */
export function generateStateDiff(
  previous: Partial<TaskManagement> | null,
  current: Partial<TaskManagement>
): Array<{ field: string; before: any; after: any }> {
  if (!previous) {
    return Object.keys(current).map(field => ({
      field,
      before: null,
      after: (current as any)[field]
    }));
  }

  const changes: Array<{ field: string; before: any; after: any }> = [];

  // Check all fields in current state
  for (const field of Object.keys(current)) {
    const beforeValue = (previous as any)[field];
    const afterValue = (current as any)[field];

    // Deep comparison for objects/arrays
    if (JSON.stringify(beforeValue) !== JSON.stringify(afterValue)) {
      changes.push({
        field,
        before: beforeValue,
        after: afterValue
      });
    }
  }

  return changes;
}
