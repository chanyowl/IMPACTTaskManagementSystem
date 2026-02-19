/**
 * SOP (Standard Operating Procedure) Model
 *
 * Knowledge base system for organizational documentation
 * Supports versioning, templates, and task integration
 */

import { Timestamp } from 'firebase-admin/firestore';

/**
 * SOP Status Types
 */
export type SOPStatus = 'draft' | 'published' | 'archived';

/**
 * SOP Category Types
 */
export type SOPCategory =
  | 'process'
  | 'guideline'
  | 'policy'
  | 'tutorial'
  | 'reference'
  | 'template'
  | 'other';

/**
 * Template Data Structure
 * Used when isTemplate = true
 */
export interface TemplateData {
  placeholders?: string[]; // Fields that need to be filled
  defaultValues?: Record<string, any>;
  requiredFields?: string[];
  instructions?: string;
}

/**
 * Main SOP Interface
 */
export interface SOP {
  sopId: string; // Unique identifier
  title: string; // MANDATORY
  category: SOPCategory; // MANDATORY
  content: string; // Rich text/markdown content
  version: number; // Version number (starts at 1)

  // Metadata
  createdBy: string; // User ID who created
  createdAt: Timestamp;
  lastUpdated: Timestamp;
  lastUpdatedBy: string; // User ID who last modified

  // Classification & Discovery
  tags: string[]; // Keywords for search
  relatedTasks: string[]; // Linked task IDs from Task Management
  relatedSOPs: string[]; // Related SOP IDs

  // Status & Access
  status: SOPStatus; // draft, published, archived
  visibility: string[]; // User IDs or 'all' for public

  // Template Support
  isTemplate: boolean; // Can this be used as a template?
  templateData?: TemplateData; // Template-specific configuration

  // Search & Analytics
  viewCount: number;
  lastViewedAt?: Timestamp;
  searchKeywords?: string[]; // Derived from title + content
}

/**
 * SOP Creation Data
 * Used when creating a new SOP
 */
export interface CreateSOPData {
  title: string;
  category: SOPCategory;
  content: string;
  tags?: string[];
  relatedTasks?: string[];
  relatedSOPs?: string[];
  status?: SOPStatus;
  visibility?: string[];
  isTemplate?: boolean;
  templateData?: TemplateData;
}

/**
 * SOP Update Data
 * Used when updating an existing SOP
 */
export interface UpdateSOPData {
  title?: string;
  category?: SOPCategory;
  content?: string;
  tags?: string[];
  relatedTasks?: string[];
  relatedSOPs?: string[];
  status?: SOPStatus;
  visibility?: string[];
  isTemplate?: boolean;
  templateData?: TemplateData;
}

/**
 * SOP Search Filters
 */
export interface SOPSearchFilters {
  category?: SOPCategory;
  status?: SOPStatus;
  tags?: string[];
  searchQuery?: string;
  isTemplate?: boolean;
  createdBy?: string;
}

/**
 * SOP Validation Result
 */
export interface SOPValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

/**
 * Validate SOP Creation Data
 */
export function validateSOPCreation(data: CreateSOPData): SOPValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Mandatory fields
  if (!data.title || data.title.trim().length === 0) {
    errors.push('Title is mandatory');
  }

  if (!data.category) {
    errors.push('Category is mandatory');
  }

  if (!data.content || data.content.trim().length === 0) {
    errors.push('Content is mandatory');
  }

  // Title length validation
  if (data.title && data.title.length > 200) {
    errors.push('Title must be less than 200 characters');
  }

  // Template validation
  if (data.isTemplate && !data.templateData) {
    warnings.push('Template flag is set but no template data provided');
  }

  // Visibility validation
  if (data.visibility && data.visibility.length === 0) {
    warnings.push('Empty visibility array - SOP will not be accessible to anyone');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate SOP Update Data
 */
export function validateSOPUpdate(data: UpdateSOPData): SOPValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Title length validation
  if (data.title !== undefined && data.title.length > 200) {
    errors.push('Title must be less than 200 characters');
  }

  // Content validation
  if (data.content !== undefined && data.content.trim().length === 0) {
    errors.push('Content cannot be empty');
  }

  // Template validation
  if (data.isTemplate && !data.templateData) {
    warnings.push('Template flag is set but no template data provided');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
