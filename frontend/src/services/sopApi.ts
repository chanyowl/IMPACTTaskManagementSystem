/**
 * SOP API Client
 *
 * Frontend service for SOP operations
 */

const API_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001') + '/api';

/**
 * SOP Types (matching backend)
 */
export type SOPStatus = 'draft' | 'published' | 'archived';

export type SOPCategory =
  | 'process'
  | 'guideline'
  | 'policy'
  | 'tutorial'
  | 'reference'
  | 'template'
  | 'other';

export interface TemplateData {
  placeholders?: string[];
  defaultValues?: Record<string, any>;
  requiredFields?: string[];
  instructions?: string;
}

export interface SOP {
  sopId: string;
  title: string;
  category: SOPCategory;
  content: string;
  version: number;
  createdBy: string;
  createdAt: any;
  lastUpdated: any;
  lastUpdatedBy: string;
  tags: string[];
  relatedTasks: string[];
  relatedSOPs: string[];
  status: SOPStatus;
  visibility: string[];
  isTemplate: boolean;
  templateData?: TemplateData;
  viewCount: number;
  lastViewedAt?: any;
  searchKeywords?: string[];
}

export interface SOPVersion {
  versionId: string;
  sopId: string;
  versionNumber: number;
  changeType: string;
  snapshot: any;
  createdAt: any;
  createdBy: string;
  changeReason?: string;
  previousVersion?: number;
  changesSummary?: string[];
}

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

export interface SearchResult {
  sop: SOP;
  score: number;
  matchedFields: string[];
  preview?: string;
}

export interface SearchFacets {
  categories: { category: SOPCategory; count: number }[];
  tags: { tag: string; count: number }[];
  authors: { author: string; count: number }[];
  statuses: { status: SOPStatus; count: number }[];
}

/**
 * Create a new SOP
 */
export async function createSOP(data: CreateSOPData): Promise<SOP> {
  const response = await fetch(`${API_URL}/sops`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': 'current-user' // TODO: Replace with actual user ID
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create SOP');
  }

  return response.json();
}

/**
 * Get SOP by ID
 */
export async function getSOP(sopId: string): Promise<SOP> {
  const response = await fetch(`${API_URL}/sops/${sopId}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get SOP');
  }

  return response.json();
}

/**
 * Update SOP
 */
export async function updateSOP(
  sopId: string,
  data: UpdateSOPData,
  changeReason?: string
): Promise<SOP> {
  const response = await fetch(`${API_URL}/sops/${sopId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': 'current-user' // TODO: Replace with actual user ID
    },
    body: JSON.stringify({ data, changeReason })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update SOP');
  }

  return response.json();
}

/**
 * Delete SOP
 */
export async function deleteSOP(sopId: string): Promise<void> {
  const response = await fetch(`${API_URL}/sops/${sopId}`, {
    method: 'DELETE',
    headers: {
      'x-user-id': 'current-user' // TODO: Replace with actual user ID
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete SOP');
  }
}

/**
 * List SOPs with filters
 */
export async function listSOPs(filters?: {
  category?: SOPCategory;
  status?: SOPStatus;
  tags?: string[];
  isTemplate?: boolean;
  createdBy?: string;
  searchQuery?: string;
}): Promise<SOP[]> {
  const params = new URLSearchParams();

  if (filters?.category) params.append('category', filters.category);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.tags) params.append('tags', filters.tags.join(','));
  if (filters?.isTemplate !== undefined) params.append('isTemplate', String(filters.isTemplate));
  if (filters?.createdBy) params.append('createdBy', filters.createdBy);
  if (filters?.searchQuery) params.append('q', filters.searchQuery);

  const response = await fetch(`${API_URL}/sops?${params}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to list SOPs');
  }

  return response.json();
}

/**
 * Advanced search
 */
export async function searchSOPs(options: {
  query?: string;
  categories?: SOPCategory[];
  status?: SOPStatus[];
  tags?: string[];
  isTemplate?: boolean;
  sortBy?: 'relevance' | 'date' | 'views' | 'title';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
}): Promise<SearchResult[]> {
  const params = new URLSearchParams();

  if (options.query) params.append('q', options.query);
  if (options.categories) params.append('categories', options.categories.join(','));
  if (options.status) params.append('status', options.status.join(','));
  if (options.tags) params.append('tags', options.tags.join(','));
  if (options.isTemplate !== undefined) params.append('isTemplate', String(options.isTemplate));
  if (options.sortBy) params.append('sortBy', options.sortBy);
  if (options.sortOrder) params.append('sortOrder', options.sortOrder);
  if (options.limit) params.append('limit', String(options.limit));

  const response = await fetch(`${API_URL}/sops/search?${params}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to search SOPs');
  }

  return response.json();
}

/**
 * Get search facets
 */
export async function getSearchFacets(query?: string): Promise<SearchFacets> {
  const params = new URLSearchParams();
  if (query) params.append('q', query);

  const response = await fetch(`${API_URL}/sops/search/facets?${params}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get facets');
  }

  return response.json();
}

/**
 * Get autocomplete suggestions
 */
export async function getSearchSuggestions(query: string, limit: number = 5): Promise<string[]> {
  const params = new URLSearchParams();
  params.append('q', query);
  params.append('limit', String(limit));

  const response = await fetch(`${API_URL}/sops/search/suggestions?${params}`);

  if (!response.ok) {
    return [];
  }

  return response.json();
}

/**
 * Get popular SOPs
 */
export async function getPopularSOPs(limit: number = 10): Promise<SOP[]> {
  const response = await fetch(`${API_URL}/sops/popular?limit=${limit}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get popular SOPs');
  }

  return response.json();
}

/**
 * Get recent SOPs
 */
export async function getRecentSOPs(limit: number = 10): Promise<SOP[]> {
  const response = await fetch(`${API_URL}/sops/recent?limit=${limit}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get recent SOPs');
  }

  return response.json();
}

/**
 * Get templates
 */
export async function getTemplates(category?: string): Promise<SOP[]> {
  const params = new URLSearchParams();
  if (category) params.append('category', category);

  const response = await fetch(`${API_URL}/sops/templates?${params}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get templates');
  }

  return response.json();
}

/**
 * Get SOP version history
 */
export async function getSOPVersions(sopId: string): Promise<SOPVersion[]> {
  const response = await fetch(`${API_URL}/sops/${sopId}/versions`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get versions');
  }

  return response.json();
}

/**
 * Restore SOP to previous version
 */
export async function restoreSOPVersion(sopId: string, versionNumber: number): Promise<SOP> {
  const response = await fetch(`${API_URL}/sops/${sopId}/restore/${versionNumber}`, {
    method: 'POST',
    headers: {
      'x-user-id': 'current-user' // TODO: Replace with actual user ID
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to restore version');
  }

  return response.json();
}

/**
 * Get related SOPs
 */
export async function getRelatedSOPs(sopId: string, limit: number = 5): Promise<SOP[]> {
  const response = await fetch(`${API_URL}/sops/${sopId}/related?limit=${limit}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get related SOPs');
  }

  return response.json();
}

/**
 * Link SOP to task
 */
export async function linkSOPToTask(sopId: string, taskId: string): Promise<void> {
  const response = await fetch(`${API_URL}/sops/${sopId}/link-task/${taskId}`, {
    method: 'POST',
    headers: {
      'x-user-id': 'current-user' // TODO: Replace with actual user ID
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to link SOP to task');
  }
}

/**
 * Unlink SOP from task
 */
export async function unlinkSOPFromTask(sopId: string, taskId: string): Promise<void> {
  const response = await fetch(`${API_URL}/sops/${sopId}/link-task/${taskId}`, {
    method: 'DELETE',
    headers: {
      'x-user-id': 'current-user' // TODO: Replace with actual user ID
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to unlink SOP from task');
  }
}
