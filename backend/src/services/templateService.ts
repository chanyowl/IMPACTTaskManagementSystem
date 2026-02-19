/**
 * Template Service
 *
 * Manages SOP templates and task creation from templates
 * Enables quick task/SOP creation with pre-filled data
 */

import type { SOP, CreateSOPData, TemplateData } from '../models/SOP';
import type { CreateTaskRequest } from '../models/TaskManagement';
import { listSOPs, getSOP, createSOP } from './sopService';

/**
 * Get all available templates
 */
export async function getTemplates(category?: string): Promise<SOP[]> {
  const filters = {
    isTemplate: true,
    status: 'published' as const,
    category: category as any
  };

  return await listSOPs(filters);
}

/**
 * Get template by ID
 */
export async function getTemplate(templateId: string): Promise<SOP> {
  const template = await getSOP(templateId);

  if (!template.isTemplate) {
    throw new Error(`SOP ${templateId} is not a template`);
  }

  return template;
}

/**
 * Create SOP from template
 * Fills in template placeholders with provided data
 */
export async function createSOPFromTemplate(
  templateId: string,
  data: {
    title?: string;
    content?: string;
    placeholderValues?: Record<string, string>;
    tags?: string[];
    relatedTasks?: string[];
  },
  userId: string
): Promise<SOP> {
  const template = await getTemplate(templateId);

  // Start with template content
  let content = data.content || template.content;

  // Replace placeholders if provided
  if (data.placeholderValues && template.templateData?.placeholders) {
    template.templateData.placeholders.forEach(placeholder => {
      const value = data.placeholderValues![placeholder];
      if (value) {
        // Replace {{placeholder}} with actual value
        const regex = new RegExp(`{{${placeholder}}}`, 'g');
        content = content.replace(regex, value);
      }
    });
  }

  // Apply default values from template
  const defaultValues = template.templateData?.defaultValues || {};

  const sopData: CreateSOPData = {
    title: data.title || template.title,
    category: template.category,
    content,
    tags: data.tags || template.tags,
    relatedTasks: data.relatedTasks || [],
    relatedSOPs: [templateId], // Link to template
    status: 'draft',
    visibility: template.visibility,
    isTemplate: false,
    ...defaultValues
  };

  return await createSOP(sopData, userId);
}

/**
 * Create task from SOP template
 * Generates task data based on SOP content and instructions
 */
export async function createTaskFromTemplate(
  templateId: string,
  data: {
    assignee: string;
    startDate: string;
    dueDate: string;
    placeholderValues?: Record<string, string>;
  },
  userId: string
): Promise<CreateTaskRequest> {
  const template = await getTemplate(templateId);

  // Start with template content for deliverable
  let deliverable = template.content;

  // Replace placeholders
  if (data.placeholderValues && template.templateData?.placeholders) {
    template.templateData.placeholders.forEach(placeholder => {
      const value = data.placeholderValues![placeholder];
      if (value) {
        const regex = new RegExp(`{{${placeholder}}}`, 'g');
        deliverable = deliverable.replace(regex, value);
      }
    });
  }

  // Extract evidence from template or use default
  const evidence =
    template.templateData?.defaultValues?.evidence ||
    'To be provided upon completion';

  // Extract objective from template or use title
  const objective =
    template.templateData?.defaultValues?.objective || template.title;

  const taskData: CreateTaskRequest = {
    objective,
    assignee: data.assignee,
    startDate: data.startDate,
    dueDate: data.dueDate,
    deliverable: deliverable.substring(0, 500), // Limit length
    evidence,
    tags: [...template.tags, 'from-template'],
    visibility: template.visibility
  };

  return taskData;
}

/**
 * Validate template structure
 * Ensures template has proper configuration
 */
export function validateTemplate(template: SOP): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!template.isTemplate) {
    errors.push('SOP is not marked as a template');
  }

  if (!template.templateData) {
    warnings.push('Template has no templateData configuration');
  } else {
    // Check for placeholders in content
    const placeholderRegex = /{{(\w+)}}/g;
    const contentPlaceholders = new Set<string>();
    let match;

    while ((match = placeholderRegex.exec(template.content)) !== null) {
      contentPlaceholders.add(match[1]);
    }

    // Warn if placeholders in content but not declared
    if (contentPlaceholders.size > 0 && !template.templateData.placeholders) {
      warnings.push(
        `Content contains placeholders but none are declared: ${Array.from(
          contentPlaceholders
        ).join(', ')}`
      );
    }

    // Warn if declared placeholders not used
    if (template.templateData.placeholders) {
      template.templateData.placeholders.forEach(placeholder => {
        if (!contentPlaceholders.has(placeholder)) {
          warnings.push(
            `Declared placeholder '${placeholder}' not found in content`
          );
        }
      });
    }
  }

  if (template.status !== 'published') {
    warnings.push('Template is not published - it will not be available to users');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Get template usage statistics
 */
export async function getTemplateStats(templateId: string): Promise<{
  sopCount: number;
  taskCount: number;
  lastUsed?: Date;
}> {
  const template = await getTemplate(templateId);

  // Count SOPs created from this template
  const relatedSOPs = await listSOPs({
    searchQuery: undefined
  });

  const sopsFromTemplate = relatedSOPs.filter(sop =>
    sop.relatedSOPs?.includes(templateId)
  );

  return {
    sopCount: sopsFromTemplate.length,
    taskCount: 0, // Will be implemented when task service is integrated
    lastUsed: template.lastViewedAt
      ? new Date(template.lastViewedAt.seconds * 1000)
      : undefined
  };
}

/**
 * Convert regular SOP to template
 */
export async function convertToTemplate(
  sopId: string,
  templateData: TemplateData,
  userId: string
): Promise<SOP> {
  const { updateSOP } = await import('./sopService');

  return await updateSOP(
    sopId,
    {
      isTemplate: true,
      templateData,
      status: 'published'
    },
    userId,
    'Converted to template'
  );
}

/**
 * Extract placeholders from content
 * Helper to identify {{placeholder}} patterns
 */
export function extractPlaceholders(content: string): string[] {
  const placeholderRegex = /{{(\w+)}}/g;
  const placeholders = new Set<string>();
  let match;

  while ((match = placeholderRegex.exec(content)) !== null) {
    placeholders.add(match[1]);
  }

  return Array.from(placeholders);
}
