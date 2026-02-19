/**
 * SOP Service
 *
 * Business logic for SOP CRUD operations with version control
 * Every update creates a new immutable version entry
 */

import { db } from '../config/firebase';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import type {
  SOP,
  CreateSOPData,
  UpdateSOPData,
  SOPSearchFilters,
  validateSOPCreation,
  validateSOPUpdate
} from '../models/SOP';
import type {
  SOPVersion,
  CreateVersionData,
  VersionChangeType,
  generateChangesSummary,
  compareVersions
} from '../models/SOPVersion';

const sopsCollection = db.collection('sops');
const versionsCollection = db.collection('sop_versions');

/**
 * Generate search keywords from title and content
 */
function generateSearchKeywords(title: string, content: string, tags: string[]): string[] {
  const keywords = new Set<string>();

  // Add title words
  title.toLowerCase().split(/\s+/).forEach(word => {
    if (word.length > 2) keywords.add(word);
  });

  // Add content words (first 500 chars to avoid huge arrays)
  const contentPreview = content.substring(0, 500).toLowerCase();
  contentPreview.split(/\s+/).forEach(word => {
    if (word.length > 3) keywords.add(word);
  });

  // Add tags
  tags.forEach(tag => keywords.add(tag.toLowerCase()));

  return Array.from(keywords);
}

/**
 * Create a new SOP with initial version
 */
export async function createSOP(
  data: CreateSOPData,
  userId: string
): Promise<SOP> {
  // Validate using imported validator
  const { validateSOPCreation } = await import('../models/SOP');
  const validation = validateSOPCreation(data);

  if (!validation.isValid) {
    throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
  }

  const sopId = sopsCollection.doc().id;
  const now = Timestamp.now();

  const searchKeywords = generateSearchKeywords(
    data.title,
    data.content,
    data.tags || []
  );

  const newSOP: SOP = {
    sopId,
    title: data.title,
    category: data.category,
    content: data.content,
    version: 1,
    createdBy: userId,
    createdAt: now,
    lastUpdated: now,
    lastUpdatedBy: userId,
    tags: data.tags || [],
    relatedTasks: data.relatedTasks || [],
    relatedSOPs: data.relatedSOPs || [],
    status: data.status || 'draft',
    visibility: data.visibility || ['all'],
    isTemplate: data.isTemplate || false,
    templateData: data.templateData,
    viewCount: 0,
    searchKeywords
  };

  // Create SOP document
  await sopsCollection.doc(sopId).set(newSOP);

  // Create initial version
  await createVersion({
    sopId,
    versionNumber: 1,
    changeType: 'created',
    snapshot: {
      title: newSOP.title,
      category: newSOP.category,
      content: newSOP.content,
      tags: newSOP.tags,
      relatedTasks: newSOP.relatedTasks,
      relatedSOPs: newSOP.relatedSOPs,
      status: newSOP.status,
      visibility: newSOP.visibility,
      isTemplate: newSOP.isTemplate,
      templateData: newSOP.templateData
    },
    createdBy: userId,
    changeReason: 'Initial creation'
  });

  return newSOP;
}

/**
 * Get SOP by ID
 */
export async function getSOP(sopId: string): Promise<SOP> {
  const doc = await sopsCollection.doc(sopId).get();

  if (!doc.exists) {
    throw new Error(`SOP not found: ${sopId}`);
  }

  return doc.data() as SOP;
}

/**
 * Update SOP and create new version
 */
export async function updateSOP(
  sopId: string,
  data: UpdateSOPData,
  userId: string,
  changeReason?: string
): Promise<SOP> {
  // Validate using imported validator
  const { validateSOPUpdate } = await import('../models/SOP');
  const validation = validateSOPUpdate(data);

  if (!validation.isValid) {
    throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
  }

  // Get current SOP
  const currentSOP = await getSOP(sopId);
  const now = Timestamp.now();

  // Determine change type
  let changeType: VersionChangeType = 'content_updated';
  if (data.status && data.status !== currentSOP.status) {
    changeType = 'status_changed';
    if (data.status === 'archived') {
      changeType = 'archived';
    }
  } else if (data.isTemplate !== undefined && data.isTemplate !== currentSOP.isTemplate) {
    changeType = 'template_modified';
  } else if (
    data.tags !== undefined ||
    data.relatedTasks !== undefined ||
    data.relatedSOPs !== undefined ||
    data.visibility !== undefined
  ) {
    changeType = 'metadata_updated';
  }

  // Prepare updated SOP
  const updatedSOP: SOP = {
    ...currentSOP,
    ...data,
    version: currentSOP.version + 1,
    lastUpdated: now,
    lastUpdatedBy: userId
  };

  // Update search keywords if title or content changed
  if (data.title || data.content || data.tags) {
    updatedSOP.searchKeywords = generateSearchKeywords(
      updatedSOP.title,
      updatedSOP.content,
      updatedSOP.tags
    );
  }

  // Generate changes summary
  const { generateChangesSummary } = await import('../models/SOPVersion');
  const changesSummary = generateChangesSummary(currentSOP, updatedSOP);

  // Update SOP document
  await sopsCollection.doc(sopId).set(updatedSOP);

  // Create new version
  await createVersion({
    sopId,
    versionNumber: updatedSOP.version,
    changeType,
    snapshot: {
      title: updatedSOP.title,
      category: updatedSOP.category,
      content: updatedSOP.content,
      tags: updatedSOP.tags,
      relatedTasks: updatedSOP.relatedTasks,
      relatedSOPs: updatedSOP.relatedSOPs,
      status: updatedSOP.status,
      visibility: updatedSOP.visibility,
      isTemplate: updatedSOP.isTemplate,
      templateData: updatedSOP.templateData
    },
    createdBy: userId,
    changeReason,
    previousVersion: currentSOP.version,
    changesSummary
  });

  return updatedSOP;
}

/**
 * Delete SOP (soft delete by archiving)
 */
export async function deleteSOP(sopId: string, userId: string): Promise<void> {
  await updateSOP(
    sopId,
    { status: 'archived' },
    userId,
    'SOP archived/deleted'
  );
}

/**
 * List SOPs with optional filters
 */
export async function listSOPs(filters?: SOPSearchFilters): Promise<SOP[]> {
  let query: FirebaseFirestore.Query = sopsCollection;

  // Apply filters
  if (filters?.category) {
    query = query.where('category', '==', filters.category);
  }

  if (filters?.status) {
    query = query.where('status', '==', filters.status);
  } else {
    // Default: exclude archived
    query = query.where('status', '!=', 'archived');
  }

  if (filters?.isTemplate !== undefined) {
    query = query.where('isTemplate', '==', filters.isTemplate);
  }

  if (filters?.createdBy) {
    query = query.where('createdBy', '==', filters.createdBy);
  }

  if (filters?.tags && filters.tags.length > 0) {
    query = query.where('tags', 'array-contains-any', filters.tags);
  }

  // Order by last updated
  query = query.orderBy('lastUpdated', 'desc');

  const snapshot = await query.get();
  const sops = snapshot.docs.map(doc => doc.data() as SOP);

  // Apply search query if provided
  if (filters?.searchQuery) {
    const searchLower = filters.searchQuery.toLowerCase();
    return sops.filter(
      sop =>
        sop.title.toLowerCase().includes(searchLower) ||
        sop.content.toLowerCase().includes(searchLower) ||
        sop.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  }

  return sops;
}

/**
 * Get SOP version history
 */
export async function getSOPVersions(sopId: string): Promise<SOPVersion[]> {
  const snapshot = await versionsCollection
    .where('sopId', '==', sopId)
    .orderBy('versionNumber', 'desc')
    .get();

  return snapshot.docs.map(doc => doc.data() as SOPVersion);
}

/**
 * Get specific version
 */
export async function getSOPVersion(
  sopId: string,
  versionNumber: number
): Promise<SOPVersion> {
  const snapshot = await versionsCollection
    .where('sopId', '==', sopId)
    .where('versionNumber', '==', versionNumber)
    .limit(1)
    .get();

  if (snapshot.empty) {
    throw new Error(`Version ${versionNumber} not found for SOP ${sopId}`);
  }

  return snapshot.docs[0].data() as SOPVersion;
}

/**
 * Restore SOP to a previous version
 */
export async function restoreSOPVersion(
  sopId: string,
  versionNumber: number,
  userId: string
): Promise<SOP> {
  const version = await getSOPVersion(sopId, versionNumber);

  // Update SOP with snapshot data
  return await updateSOP(
    sopId,
    {
      title: version.snapshot.title,
      category: version.snapshot.category,
      content: version.snapshot.content,
      tags: version.snapshot.tags,
      relatedTasks: version.snapshot.relatedTasks,
      relatedSOPs: version.snapshot.relatedSOPs,
      status: version.snapshot.status,
      visibility: version.snapshot.visibility,
      isTemplate: version.snapshot.isTemplate,
      templateData: version.snapshot.templateData
    },
    userId,
    `Restored to version ${versionNumber}`
  );
}

/**
 * Increment view count
 */
export async function incrementViewCount(sopId: string): Promise<void> {
  await sopsCollection.doc(sopId).update({
    viewCount: FieldValue.increment(1),
    lastViewedAt: Timestamp.now()
  });
}

/**
 * Link SOP to task
 */
export async function linkSOPToTask(
  sopId: string,
  taskId: string,
  userId: string
): Promise<void> {
  const sop = await getSOP(sopId);

  if (!sop.relatedTasks.includes(taskId)) {
    await updateSOP(
      sopId,
      { relatedTasks: [...sop.relatedTasks, taskId] },
      userId,
      `Linked to task ${taskId}`
    );
  }
}

/**
 * Unlink SOP from task
 */
export async function unlinkSOPFromTask(
  sopId: string,
  taskId: string,
  userId: string
): Promise<void> {
  const sop = await getSOP(sopId);

  await updateSOP(
    sopId,
    { relatedTasks: sop.relatedTasks.filter(id => id !== taskId) },
    userId,
    `Unlinked from task ${taskId}`
  );
}

/**
 * Create a version entry
 * Internal helper function
 */
async function createVersion(data: CreateVersionData): Promise<SOPVersion> {
  const versionId = versionsCollection.doc().id;

  const version: SOPVersion = {
    versionId,
    sopId: data.sopId,
    versionNumber: data.versionNumber,
    changeType: data.changeType,
    snapshot: data.snapshot,
    createdAt: Timestamp.now(),
    createdBy: data.createdBy,
    changeReason: data.changeReason,
    previousVersion: data.previousVersion,
    changesSummary: data.changesSummary
  };

  await versionsCollection.doc(versionId).set(version);

  return version;
}
