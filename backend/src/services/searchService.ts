/**
 * Search Service
 *
 * Advanced search and filtering for SOPs
 * Supports full-text search, faceted filtering, and relevance ranking
 */

import type { SOP, SOPCategory, SOPStatus } from '../models/SOP';
import { listSOPs } from './sopService';

/**
 * Search Result with relevance score
 */
export interface SearchResult {
  sop: SOP;
  score: number;
  matchedFields: string[];
  preview?: string;
}

/**
 * Advanced Search Options
 */
export interface SearchOptions {
  query?: string;
  categories?: SOPCategory[];
  status?: SOPStatus[];
  tags?: string[];
  isTemplate?: boolean;
  createdBy?: string;
  dateFrom?: Date;
  dateTo?: Date;
  sortBy?: 'relevance' | 'date' | 'views' | 'title';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
}

/**
 * Search Facets for filtering
 */
export interface SearchFacets {
  categories: { category: SOPCategory; count: number }[];
  tags: { tag: string; count: number }[];
  authors: { author: string; count: number }[];
  statuses: { status: SOPStatus; count: number }[];
}

/**
 * Calculate relevance score for search result
 */
function calculateRelevanceScore(sop: SOP, query: string): {
  score: number;
  matchedFields: string[];
} {
  const queryLower = query.toLowerCase();
  let score = 0;
  const matchedFields: string[] = [];

  // Title match (highest weight)
  if (sop.title.toLowerCase().includes(queryLower)) {
    score += 10;
    matchedFields.push('title');
  }

  // Category match
  if (sop.category.toLowerCase().includes(queryLower)) {
    score += 5;
    matchedFields.push('category');
  }

  // Tag match
  const matchingTags = sop.tags.filter(tag =>
    tag.toLowerCase().includes(queryLower)
  );
  if (matchingTags.length > 0) {
    score += matchingTags.length * 3;
    matchedFields.push('tags');
  }

  // Content match (lower weight)
  const contentLower = sop.content.toLowerCase();
  const occurrences = (contentLower.match(new RegExp(queryLower, 'g')) || []).length;
  if (occurrences > 0) {
    score += Math.min(occurrences, 5); // Cap at 5 points
    matchedFields.push('content');
  }

  // Boost for published SOPs
  if (sop.status === 'published') {
    score += 2;
  }

  // Boost for popular SOPs
  if (sop.viewCount > 10) {
    score += Math.log10(sop.viewCount);
  }

  return { score, matchedFields };
}

/**
 * Generate content preview with highlighted match
 */
function generatePreview(content: string, query: string, maxLength: number = 200): string {
  const queryLower = query.toLowerCase();
  const contentLower = content.toLowerCase();
  const matchIndex = contentLower.indexOf(queryLower);

  if (matchIndex === -1) {
    // No match, return beginning
    return content.substring(0, maxLength) + (content.length > maxLength ? '...' : '');
  }

  // Extract context around match
  const start = Math.max(0, matchIndex - 50);
  const end = Math.min(content.length, matchIndex + query.length + 150);

  let preview = content.substring(start, end);

  if (start > 0) preview = '...' + preview;
  if (end < content.length) preview = preview + '...';

  return preview;
}

/**
 * Advanced search with relevance ranking
 */
export async function searchSOPs(options: SearchOptions): Promise<SearchResult[]> {
  // Get all SOPs matching basic filters
  const sops = await listSOPs({
    category: options.categories?.[0],
    status: options.status?.[0],
    tags: options.tags,
    isTemplate: options.isTemplate,
    createdBy: options.createdBy
  });

  let results: SearchResult[] = sops.map(sop => {
    let score = 0;
    let matchedFields: string[] = [];

    // Calculate relevance if query provided
    if (options.query) {
      const relevance = calculateRelevanceScore(sop, options.query);
      score = relevance.score;
      matchedFields = relevance.matchedFields;
    }

    return {
      sop,
      score,
      matchedFields,
      preview: options.query ? generatePreview(sop.content, options.query) : undefined
    };
  });

  // Filter by date range
  if (options.dateFrom) {
    results = results.filter(
      r => r.sop.createdAt.toDate() >= options.dateFrom!
    );
  }

  if (options.dateTo) {
    results = results.filter(
      r => r.sop.createdAt.toDate() <= options.dateTo!
    );
  }

  // Sort results
  const sortBy = options.sortBy || 'relevance';
  const sortOrder = options.sortOrder || 'desc';

  results.sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'relevance':
        comparison = a.score - b.score;
        break;
      case 'date':
        comparison = a.sop.lastUpdated.seconds - b.sop.lastUpdated.seconds;
        break;
      case 'views':
        comparison = a.sop.viewCount - b.sop.viewCount;
        break;
      case 'title':
        comparison = a.sop.title.localeCompare(b.sop.title);
        break;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Apply limit
  if (options.limit) {
    results = results.slice(0, options.limit);
  }

  return results;
}

/**
 * Generate search facets for filtering
 */
export async function getSearchFacets(query?: string): Promise<SearchFacets> {
  const sops = await listSOPs({
    searchQuery: query
  });

  // Count categories
  const categoryCount = new Map<SOPCategory, number>();
  sops.forEach(sop => {
    categoryCount.set(sop.category, (categoryCount.get(sop.category) || 0) + 1);
  });

  // Count tags
  const tagCount = new Map<string, number>();
  sops.forEach(sop => {
    sop.tags.forEach(tag => {
      tagCount.set(tag, (tagCount.get(tag) || 0) + 1);
    });
  });

  // Count authors
  const authorCount = new Map<string, number>();
  sops.forEach(sop => {
    authorCount.set(sop.createdBy, (authorCount.get(sop.createdBy) || 0) + 1);
  });

  // Count statuses
  const statusCount = new Map<SOPStatus, number>();
  sops.forEach(sop => {
    statusCount.set(sop.status, (statusCount.get(sop.status) || 0) + 1);
  });

  return {
    categories: Array.from(categoryCount.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count),
    tags: Array.from(tagCount.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20), // Top 20 tags
    authors: Array.from(authorCount.entries())
      .map(([author, count]) => ({ author, count }))
      .sort((a, b) => b.count - a.count),
    statuses: Array.from(statusCount.entries())
      .map(([status, count]) => ({ status, count }))
      .sort((a, b) => b.count - a.count)
  };
}

/**
 * Get related SOPs based on tags and category
 */
export async function getRelatedSOPs(sopId: string, limit: number = 5): Promise<SOP[]> {
  const { getSOP } = await import('./sopService');
  const targetSOP = await getSOP(sopId);

  // Get all SOPs in same category
  const sameCategorySOPs = await listSOPs({
    category: targetSOP.category,
    status: 'published'
  });

  // Calculate similarity scores
  const scores = sameCategorySOPs
    .filter(sop => sop.sopId !== sopId)
    .map(sop => {
      let score = 0;

      // Shared tags
      const sharedTags = sop.tags.filter(tag => targetSOP.tags.includes(tag));
      score += sharedTags.length * 3;

      // Same category
      score += 2;

      // View count factor
      score += Math.log10(sop.viewCount + 1);

      return { sop, score };
    });

  // Sort by score and return top results
  scores.sort((a, b) => b.score - a.score);
  return scores.slice(0, limit).map(s => s.sop);
}

/**
 * Get popular SOPs by view count
 */
export async function getPopularSOPs(limit: number = 10): Promise<SOP[]> {
  const sops = await listSOPs({ status: 'published' });

  return sops
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, limit);
}

/**
 * Get recently updated SOPs
 */
export async function getRecentSOPs(limit: number = 10): Promise<SOP[]> {
  const sops = await listSOPs({ status: 'published' });

  return sops
    .sort((a, b) => b.lastUpdated.seconds - a.lastUpdated.seconds)
    .slice(0, limit);
}

/**
 * Simple autocomplete suggestions based on query
 */
export async function getSearchSuggestions(query: string, limit: number = 5): Promise<string[]> {
  if (query.length < 2) return [];

  const sops = await listSOPs({ status: 'published' });
  const suggestions = new Set<string>();

  const queryLower = query.toLowerCase();

  // Add matching titles
  sops.forEach(sop => {
    if (sop.title.toLowerCase().includes(queryLower)) {
      suggestions.add(sop.title);
    }
  });

  // Add matching tags
  sops.forEach(sop => {
    sop.tags.forEach(tag => {
      if (tag.toLowerCase().includes(queryLower)) {
        suggestions.add(tag);
      }
    });
  });

  return Array.from(suggestions).slice(0, limit);
}
