/**
 * SOP Version History Model
 *
 * Immutable version tracking for all SOP changes
 * Every update creates a new version entry
 */

import { Timestamp } from 'firebase-admin/firestore';
import type { SOP, SOPStatus, SOPCategory, TemplateData } from './SOP';

/**
 * Version Change Type
 */
export type VersionChangeType =
  | 'created'
  | 'content_updated'
  | 'status_changed'
  | 'metadata_updated'
  | 'template_modified'
  | 'archived';

/**
 * SOP Version Entry
 * Immutable snapshot of SOP state at a point in time
 */
export interface SOPVersion {
  versionId: string; // Unique version identifier
  sopId: string; // Reference to parent SOP
  versionNumber: number; // Sequential version number
  changeType: VersionChangeType; // What changed

  // Snapshot of SOP state at this version
  snapshot: {
    title: string;
    category: SOPCategory;
    content: string;
    tags: string[];
    relatedTasks: string[];
    relatedSOPs: string[];
    status: SOPStatus;
    visibility: string[];
    isTemplate: boolean;
    templateData?: TemplateData;
  };

  // Version metadata
  createdAt: Timestamp;
  createdBy: string; // User who made this change
  changeReason?: string; // Optional reason for change

  // Change details
  previousVersion?: number; // Previous version number
  changesSummary?: string[]; // List of what changed
}

/**
 * Create SOP Version Data
 */
export interface CreateVersionData {
  sopId: string;
  versionNumber: number;
  changeType: VersionChangeType;
  snapshot: {
    title: string;
    category: SOPCategory;
    content: string;
    tags: string[];
    relatedTasks: string[];
    relatedSOPs: string[];
    status: SOPStatus;
    visibility: string[];
    isTemplate: boolean;
    templateData?: TemplateData;
  };
  createdBy: string;
  changeReason?: string;
  previousVersion?: number;
  changesSummary?: string[];
}

/**
 * Version Comparison Result
 * Shows differences between two versions
 */
export interface VersionDiff {
  fromVersion: number;
  toVersion: number;
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  timestamp: Timestamp;
  changedBy: string;
}

/**
 * Generate changes summary by comparing two SOP states
 */
export function generateChangesSummary(
  oldState: Partial<SOP>,
  newState: Partial<SOP>
): string[] {
  const changes: string[] = [];

  // Title changed
  if (oldState.title !== newState.title) {
    changes.push(`Title changed from "${oldState.title}" to "${newState.title}"`);
  }

  // Category changed
  if (oldState.category !== newState.category) {
    changes.push(`Category changed from "${oldState.category}" to "${newState.category}"`);
  }

  // Content changed
  if (oldState.content !== newState.content) {
    changes.push('Content updated');
  }

  // Status changed
  if (oldState.status !== newState.status) {
    changes.push(`Status changed from "${oldState.status}" to "${newState.status}"`);
  }

  // Tags changed
  if (JSON.stringify(oldState.tags) !== JSON.stringify(newState.tags)) {
    changes.push('Tags modified');
  }

  // Related tasks changed
  if (JSON.stringify(oldState.relatedTasks) !== JSON.stringify(newState.relatedTasks)) {
    changes.push('Related tasks updated');
  }

  // Related SOPs changed
  if (JSON.stringify(oldState.relatedSOPs) !== JSON.stringify(newState.relatedSOPs)) {
    changes.push('Related SOPs updated');
  }

  // Template status changed
  if (oldState.isTemplate !== newState.isTemplate) {
    changes.push(
      newState.isTemplate ? 'Converted to template' : 'Template status removed'
    );
  }

  // Visibility changed
  if (JSON.stringify(oldState.visibility) !== JSON.stringify(newState.visibility)) {
    changes.push('Visibility settings updated');
  }

  return changes;
}

/**
 * Compare two versions and generate diff
 */
export function compareVersions(
  fromVersion: SOPVersion,
  toVersion: SOPVersion
): VersionDiff {
  const changes: VersionDiff['changes'] = [];

  const oldSnapshot = fromVersion.snapshot;
  const newSnapshot = toVersion.snapshot;

  // Compare all fields
  const fields: (keyof typeof oldSnapshot)[] = [
    'title',
    'category',
    'content',
    'tags',
    'relatedTasks',
    'relatedSOPs',
    'status',
    'visibility',
    'isTemplate'
  ];

  fields.forEach((field) => {
    const oldValue = oldSnapshot[field];
    const newValue = newSnapshot[field];

    if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      changes.push({
        field,
        oldValue,
        newValue
      });
    }
  });

  return {
    fromVersion: fromVersion.versionNumber,
    toVersion: toVersion.versionNumber,
    changes,
    timestamp: toVersion.createdAt,
    changedBy: toVersion.createdBy
  };
}
