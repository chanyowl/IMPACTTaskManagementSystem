import { Timestamp } from 'firebase-admin/firestore';

/**
 * Task Management System - Core Task Model
 * Based on Architecture Requirements from 122-page document
 *
 * MANDATORY FIELDS (enforced by ontology):
 * - taskId, objective, assignee, startDate, dueDate, status, deliverable, evidence
 */

export interface TaskManagement {
  // === MANDATORY FIELDS (Core Ontology) ===
  taskId: string;                           // UUID
  objective: string;                        // What this task achieves (links to Objective)
  assignee: string;                         // User ID of person responsible
  startDate: Timestamp;                     // When work begins
  dueDate: Timestamp;                       // When work must complete
  status: TaskStatus;                       // Pending | Active | Done
  deliverable: string;                      // Expected output/result
  evidence: string | string[];              // Proof of completion (URLs, file paths, etc.)
  intent?: string;                          // Purpose or intent of the task

  // === RECOMMENDED FIELDS ===
  version: number;                          // For versioning (default: 1)
  visibility: string[];                     // Role-based access (e.g., ["admin", "team-lead"])

  // === SOFT RELATIONSHIPS (Flexible) ===
  tags: string[];                           // Categorization (e.g., ["urgent", "frontend"])
  linkedTasks: string[];                    // Related task IDs
  relatedSOPs?: string[];                   // Linked SOP IDs (Phase 2 - Knowledge Base)
  references: Reference[];                  // External links/documents

  // === METADATA ===
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;                        // User ID
  lastModifiedBy: string;                   // User ID

  // === COMPUTED FIELDS (from architecture) ===
  cognitiveLoad?: 'high' | 'low';          // For AI integration (Phase 3)
  emotionalWeight?: 'scary' | 'neutral';   // For AI integration (Phase 3)
}

export type TaskStatus = 'Pending' | 'Active' | 'Done';

export interface Reference {
  type: 'url' | 'file' | 'document' | 'sop';
  title: string;
  url: string;
  description?: string;
}

/**
 * Objective Model
 * Groups related tasks together
 */
export interface Objective {
  objectiveId: string;                      // UUID
  title: string;                            // Short name
  description: string;                      // Detailed description
  owner: string;                            // User ID (required)
  tasks: string[];                          // Array of task IDs
  status: 'active' | 'completed' | 'archived';

  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;

  // Optional fields
  dueDate?: Timestamp;
  tags?: string[];
}

/**
 * Audit Log Model
 * IMMUTABLE - once created, cannot be modified
 * Captures every task mutation
 */
export interface AuditLog {
  eventId: string;                          // UUID
  taskId: string;                           // Which task was changed
  timestamp: Timestamp;                     // When change occurred
  userId: string;                           // Who made the change
  action: AuditAction;                      // What action was performed
  previousState: Partial<TaskManagement> | null;  // State before change
  newState: Partial<TaskManagement>;        // State after change
  reason?: string;                          // Optional explanation

  // Metadata
  ipAddress?: string;
  userAgent?: string;
}

export type AuditAction =
  | 'created'
  | 'updated'
  | 'deleted'
  | 'status_changed'
  | 'reassigned'
  | 'linked'
  | 'unlinked';

/**
 * Validation result from ontology checks
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings?: string[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

/**
 * Task creation request (from API)
 */
export interface CreateTaskRequest {
  objective: string;
  assignee: string;
  startDate: string | Date;                 // ISO string or Date
  dueDate: string | Date;
  deliverable: string;
  evidence: string | string[];
  intent?: string;

  // Optional fields
  tags?: string[];
  linkedTasks?: string[];
  relatedSOPs?: string[];
  references?: Reference[];
  visibility?: string[];
}

/**
 * Task update request (from API)
 */
export interface UpdateTaskRequest {
  objective?: string;
  assignee?: string;
  startDate?: string | Date;
  dueDate?: string | Date;
  status?: TaskStatus;
  deliverable?: string;
  evidence?: string | string[];
  intent?: string;

  tags?: string[];
  linkedTasks?: string[];
  relatedSOPs?: string[];
  references?: Reference[];
  visibility?: string[];

  reason?: string;                          // Why this change is being made
}

/**
 * Task filters for querying
 */
export interface TaskFilters {
  assignee?: string;
  objective?: string;
  status?: TaskStatus;
  tags?: string[];
  dueBefore?: Date;
  dueAfter?: Date;
  createdBy?: string;
}
