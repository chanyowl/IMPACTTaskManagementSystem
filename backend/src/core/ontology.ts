/**
 * Core Ontology Validation
 *
 * Enforces the fundamental rules and relationships of the Task Management System
 * Based on Architecture Requirements:
 * - Every Task MUST link to an Objective
 * - Every Task MUST have an Assignee
 * - All mandatory fields must be present
 * - Status transitions must be logical (Pending → Active → Done)
 */

import {
  TaskManagement,
  TaskStatus,
  CreateTaskRequest,
  UpdateTaskRequest,
  ValidationResult,
  ValidationError,
  Objective
} from '../models/TaskManagement.js';
import { Timestamp } from 'firebase-admin/firestore';

/**
 * Validates a task creation request against ontology rules
 */
export function validateTaskCreation(request: CreateTaskRequest): ValidationResult {
  const errors: ValidationError[] = [];

  // === MANDATORY FIELD VALIDATION ===
  if (!request.objective || request.objective.trim() === '') {
    errors.push({
      field: 'objective',
      message: 'Objective is required and cannot be empty',
      code: 'REQUIRED_FIELD'
    });
  }

  if (!request.assignee || request.assignee.trim() === '') {
    errors.push({
      field: 'assignee',
      message: 'Assignee is required and cannot be empty',
      code: 'REQUIRED_FIELD'
    });
  }

  if (!request.startDate) {
    errors.push({
      field: 'startDate',
      message: 'Start date is required',
      code: 'REQUIRED_FIELD'
    });
  }

  if (!request.dueDate) {
    errors.push({
      field: 'dueDate',
      message: 'Due date is required',
      code: 'REQUIRED_FIELD'
    });
  }

  if (!request.deliverable || request.deliverable.trim() === '') {
    errors.push({
      field: 'deliverable',
      message: 'Deliverable is required and cannot be empty',
      code: 'REQUIRED_FIELD'
    });
  }

  if (!request.evidence || (Array.isArray(request.evidence) && request.evidence.length === 0)) {
    errors.push({
      field: 'evidence',
      message: 'Evidence is required (can be URL, file path, or description)',
      code: 'REQUIRED_FIELD'
    });
  }

  // === DATE VALIDATION ===
  if (request.startDate && request.dueDate) {
    const startDate = new Date(request.startDate);
    const dueDate = new Date(request.dueDate);

    if (isNaN(startDate.getTime())) {
      errors.push({
        field: 'startDate',
        message: 'Invalid start date format',
        code: 'INVALID_DATE'
      });
    }

    if (isNaN(dueDate.getTime())) {
      errors.push({
        field: 'dueDate',
        message: 'Invalid due date format',
        code: 'INVALID_DATE'
      });
    }

    if (startDate > dueDate) {
      errors.push({
        field: 'dueDate',
        message: 'Due date must be after start date',
        code: 'INVALID_DATE_RANGE'
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validates a task update request
 */
export function validateTaskUpdate(
  currentTask: TaskManagement,
  updates: UpdateTaskRequest
): ValidationResult {
  const errors: ValidationError[] = [];

  // If updating mandatory fields, ensure they're not empty
  if (updates.objective !== undefined && updates.objective.trim() === '') {
    errors.push({
      field: 'objective',
      message: 'Objective cannot be empty',
      code: 'REQUIRED_FIELD'
    });
  }

  if (updates.assignee !== undefined && updates.assignee.trim() === '') {
    errors.push({
      field: 'assignee',
      message: 'Assignee cannot be empty',
      code: 'REQUIRED_FIELD'
    });
  }

  if (updates.deliverable !== undefined && updates.deliverable.trim() === '') {
    errors.push({
      field: 'deliverable',
      message: 'Deliverable cannot be empty',
      code: 'REQUIRED_FIELD'
    });
  }

  // Validate status transitions
  if (updates.status && !validateStatusTransition(currentTask.status, updates.status)) {
    errors.push({
      field: 'status',
      message: `Invalid status transition: ${currentTask.status} → ${updates.status}. All transitions are bidirectional.`,
      code: 'INVALID_STATUS_TRANSITION'
    });
  }

  // Date validation
  if (updates.startDate && updates.dueDate) {
    const startDate = new Date(updates.startDate);
    const dueDate = new Date(updates.dueDate);

    if (startDate > dueDate) {
      errors.push({
        field: 'dueDate',
        message: 'Due date must be after start date',
        code: 'INVALID_DATE_RANGE'
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validates status transitions
 * Valid transitions (BIDIRECTIONAL):
 * - Pending ↔ Active
 * - Active ↔ Done
 * - Pending ↔ Done
 *
 * All transitions are allowed in both directions to support workflow flexibility
 */
export function validateStatusTransition(
  currentStatus: TaskStatus,
  newStatus: TaskStatus
): boolean {
  if (currentStatus === newStatus) {
    return true; // No change
  }

  // Allow all bidirectional transitions between statuses
  const validTransitions: Record<TaskStatus, TaskStatus[]> = {
    'Pending': ['Active', 'Done'],
    'Active': ['Pending', 'Done'],  // Can go back to Pending or forward to Done
    'Done': ['Active', 'Pending']   // Can reopen to Active or Pending
  };

  return validTransitions[currentStatus]?.includes(newStatus) || false;
}

/**
 * Validates that an objective exists
 * (This will be used by the service layer to check against Firestore)
 */
export function validateObjectiveReference(objectiveId: string): ValidationResult {
  const errors: ValidationError[] = [];

  if (!objectiveId || objectiveId.trim() === '') {
    errors.push({
      field: 'objective',
      message: 'Objective ID is required',
      code: 'REQUIRED_FIELD'
    });
  }

  // Note: Actual existence check happens in the service layer
  // This just validates the format

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validates that an assignee exists
 * (This will be used by the service layer to check against Firestore)
 */
export function validateAssigneeReference(assigneeId: string): ValidationResult {
  const errors: ValidationError[] = [];

  if (!assigneeId || assigneeId.trim() === '') {
    errors.push({
      field: 'assignee',
      message: 'Assignee ID is required',
      code: 'REQUIRED_FIELD'
    });
  }

  // Note: Actual existence check happens in the service layer

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validates soft relationships (tags, links, references)
 */
export function validateSoftRelationships(
  linkedTasks?: string[],
  tags?: string[]
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: string[] = [];

  // Validate linked tasks (if provided)
  if (linkedTasks && linkedTasks.length > 0) {
    if (linkedTasks.length > 20) {
      warnings.push('Task has more than 20 linked tasks. Consider grouping under an objective.');
    }

    // Check for duplicates
    const uniqueLinks = new Set(linkedTasks);
    if (uniqueLinks.size !== linkedTasks.length) {
      errors.push({
        field: 'linkedTasks',
        message: 'Duplicate task IDs found in linkedTasks',
        code: 'DUPLICATE_REFERENCE'
      });
    }
  }

  // Validate tags
  if (tags && tags.length > 0) {
    if (tags.length > 10) {
      warnings.push('Task has more than 10 tags. Consider using fewer, more specific tags.');
    }

    // Check for empty tags
    const emptyTags = tags.filter(tag => !tag || tag.trim() === '');
    if (emptyTags.length > 0) {
      errors.push({
        field: 'tags',
        message: 'Tags cannot be empty strings',
        code: 'INVALID_TAG'
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

/**
 * Validates an objective creation
 */
export function validateObjectiveCreation(objective: Partial<Objective>): ValidationResult {
  const errors: ValidationError[] = [];

  if (!objective.title || objective.title.trim() === '') {
    errors.push({
      field: 'title',
      message: 'Objective title is required',
      code: 'REQUIRED_FIELD'
    });
  }

  if (!objective.description || objective.description.trim() === '') {
    errors.push({
      field: 'description',
      message: 'Objective description is required',
      code: 'REQUIRED_FIELD'
    });
  }

  if (!objective.owner || objective.owner.trim() === '') {
    errors.push({
      field: 'owner',
      message: 'Objective owner is required',
      code: 'REQUIRED_FIELD'
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Complete validation for a task (used by middleware)
 */
export async function validateCompleteTask(
  taskData: CreateTaskRequest,
  checkObjectiveExists: (id: string) => Promise<boolean>,
  checkAssigneeExists: (id: string) => Promise<boolean>
): Promise<ValidationResult> {
  // First, validate structure
  const structureValidation = validateTaskCreation(taskData);
  if (!structureValidation.valid) {
    return structureValidation;
  }

  const errors: ValidationError[] = [];

  // Check if objective exists
  const objectiveExists = await checkObjectiveExists(taskData.objective);
  if (!objectiveExists) {
    errors.push({
      field: 'objective',
      message: `Objective '${taskData.objective}' does not exist`,
      code: 'INVALID_REFERENCE'
    });
  }

  // Check if assignee exists
  const assigneeExists = await checkAssigneeExists(taskData.assignee);
  if (!assigneeExists) {
    errors.push({
      field: 'assignee',
      message: `Assignee '${taskData.assignee}' does not exist`,
      code: 'INVALID_REFERENCE'
    });
  }

  // Validate soft relationships
  const softValidation = validateSoftRelationships(taskData.linkedTasks, taskData.tags);
  errors.push(...softValidation.errors);

  return {
    valid: errors.length === 0,
    errors,
    warnings: softValidation.warnings
  };
}
