/**
 * SOP API Routes
 *
 * RESTful endpoints for SOP management, search, and templates
 */

import express from 'express';
import type { Request, Response } from 'express';
import * as sopService from '../services/sopService';
import * as templateService from '../services/templateService';
import * as searchService from '../services/searchService';
import type { CreateSOPData, UpdateSOPData } from '../models/SOP';

const router = express.Router();

/**
 * POST /api/sops
 * Create a new SOP
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const data: CreateSOPData = req.body;
    const userId = req.headers['x-user-id'] as string || 'system';

    const sop = await sopService.createSOP(data, userId);
    res.status(201).json(sop);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/sops
 * List SOPs with optional filters
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const filters = {
      category: req.query.category as any,
      status: req.query.status as any,
      tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
      isTemplate: req.query.isTemplate === 'true' ? true : req.query.isTemplate === 'false' ? false : undefined,
      createdBy: req.query.createdBy as string,
      searchQuery: req.query.q as string
    };

    const sops = await sopService.listSOPs(filters);
    res.json(sops);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/sops/search
 * Advanced search with relevance ranking
 */
router.get('/search', async (req: Request, res: Response) => {
  try {
    const options = {
      query: req.query.q as string,
      categories: req.query.categories ? (req.query.categories as string).split(',') as any : undefined,
      status: req.query.status ? (req.query.status as string).split(',') as any : undefined,
      tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
      isTemplate: req.query.isTemplate === 'true' ? true : req.query.isTemplate === 'false' ? false : undefined,
      createdBy: req.query.createdBy as string,
      sortBy: (req.query.sortBy as any) || 'relevance',
      sortOrder: (req.query.sortOrder as any) || 'desc',
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined
    };

    const results = await searchService.searchSOPs(options);
    res.json(results);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/sops/search/facets
 * Get search facets for filtering
 */
router.get('/search/facets', async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    const facets = await searchService.getSearchFacets(query);
    res.json(facets);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/sops/search/suggestions
 * Get autocomplete suggestions
 */
router.get('/search/suggestions', async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
    const suggestions = await searchService.getSearchSuggestions(query, limit);
    res.json(suggestions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/sops/popular
 * Get popular SOPs by view count
 */
router.get('/popular', async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const sops = await searchService.getPopularSOPs(limit);
    res.json(sops);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/sops/recent
 * Get recently updated SOPs
 */
router.get('/recent', async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const sops = await searchService.getRecentSOPs(limit);
    res.json(sops);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/sops/templates
 * Get all templates
 */
router.get('/templates', async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string;
    const templates = await templateService.getTemplates(category);
    res.json(templates);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/sops/templates/:id/create-sop
 * Create SOP from template
 */
router.post('/templates/:id/create-sop', async (req: Request, res: Response) => {
  try {
    const templateId = req.params.id as string;
    const userId = req.headers['x-user-id'] as string || 'system';
    const data = req.body;

    const sop = await templateService.createSOPFromTemplate(templateId, data, userId);
    res.status(201).json(sop);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/sops/templates/:id/create-task
 * Generate task data from template
 */
router.post('/templates/:id/create-task', async (req: Request, res: Response) => {
  try {
    const templateId = req.params.id as string;
    const userId = req.headers['x-user-id'] as string || 'system';
    const data = req.body;

    const taskData = await templateService.createTaskFromTemplate(templateId, data, userId);
    res.json(taskData);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/sops/:id
 * Get SOP by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const sop = await sopService.getSOP(id);

    // Increment view count
    await sopService.incrementViewCount(id);

    res.json(sop);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

/**
 * PUT /api/sops/:id
 * Update SOP
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const data: UpdateSOPData = req.body.data || req.body;
    const userId = req.headers['x-user-id'] as string || 'system';
    const changeReason = req.body.changeReason as string;

    const sop = await sopService.updateSOP(id, data, userId, changeReason);
    res.json(sop);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * DELETE /api/sops/:id
 * Delete SOP (soft delete)
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const userId = req.headers['x-user-id'] as string || 'system';

    await sopService.deleteSOP(id, userId);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/sops/:id/versions
 * Get version history
 */
router.get('/:id/versions', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const versions = await sopService.getSOPVersions(id);
    res.json(versions);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

/**
 * GET /api/sops/:id/versions/:version
 * Get specific version
 */
router.get('/:id/versions/:version', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const versionNumber = parseInt(req.params.version as string);

    const version = await sopService.getSOPVersion(id, versionNumber);
    res.json(version);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

/**
 * POST /api/sops/:id/restore/:version
 * Restore SOP to previous version
 */
router.post('/:id/restore/:version', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const versionNumber = parseInt(req.params.version as string);
    const userId = req.headers['x-user-id'] as string || 'system';

    const sop = await sopService.restoreSOPVersion(id, versionNumber, userId);
    res.json(sop);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/sops/:id/related
 * Get related SOPs
 */
router.get('/:id/related', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;

    const related = await searchService.getRelatedSOPs(id, limit);
    res.json(related);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/sops/:id/link-task/:taskId
 * Link SOP to task
 */
router.post('/:id/link-task/:taskId', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const taskId = req.params.taskId as string;
    const userId = req.headers['x-user-id'] as string || 'system';

    await sopService.linkSOPToTask(id, taskId, userId);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * DELETE /api/sops/:id/link-task/:taskId
 * Unlink SOP from task
 */
router.delete('/:id/link-task/:taskId', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const taskId = req.params.taskId as string;
    const userId = req.headers['x-user-id'] as string || 'system';

    await sopService.unlinkSOPFromTask(id, taskId, userId);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/sops/:id/convert-to-template
 * Convert SOP to template
 */
router.post('/:id/convert-to-template', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const userId = req.headers['x-user-id'] as string || 'system';
    const templateData = req.body;

    const sop = await templateService.convertToTemplate(id, templateData, userId);
    res.json(sop);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/sops/:id/template-stats
 * Get template usage statistics
 */
router.get('/:id/template-stats', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const stats = await templateService.getTemplateStats(id);
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
