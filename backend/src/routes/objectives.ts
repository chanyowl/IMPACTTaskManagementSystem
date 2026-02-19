/**
 * Objectives Routes
 *
 * API endpoints for objective management
 */

import express, { Request, Response } from 'express';
import {
  createObjective,
  getObjective,
  listObjectives,
  updateObjective,
  deleteObjective,
  getObjectiveStats,
  getObjectiveTasks
} from '../services/objectiveService.js';
import { listTasks } from '../services/taskManagementService.js';

const router = express.Router();

/**
 * POST /api/objectives
 * Create a new objective
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, description, owner, dueDate, tags } = req.body;
    const createdBy = (req as any).userId || 'system';

    if (!title || !description || !owner) {
      res.status(400).json({
        error: 'Missing required fields',
        message: 'title, description, and owner are required'
      });
      return;
    }

    const objective = await createObjective(
      title,
      description,
      owner,
      createdBy,
      {
        dueDate: dueDate ? new Date(dueDate) : undefined,
        tags
      }
    );

    res.status(201).json({
      success: true,
      objective
    });
  } catch (error: any) {
    console.error('Error creating objective:', error);
    res.status(400).json({
      error: 'Failed to create objective',
      message: error.message
    });
  }
});

/**
 * GET /api/objectives
 * List all objectives with optional filters
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const filters = {
      owner: req.query.owner as string,
      status: req.query.status as any,
      tags: req.query.tags ? (req.query.tags as string).split(',') : undefined
    };

    const objectives = await listObjectives(filters);

    res.json({
      success: true,
      count: objectives.length,
      objectives
    });
  } catch (error: any) {
    console.error('Error listing objectives:', error);
    res.status(500).json({
      error: 'Failed to list objectives',
      message: error.message
    });
  }
});

/**
 * GET /api/objectives/:id
 * Get a specific objective
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const objective = await getObjective(id);

    if (!objective) {
      res.status(404).json({
        error: 'Objective not found'
      });
      return;
    }

    res.json({
      success: true,
      objective
    });
  } catch (error: any) {
    console.error('Error getting objective:', error);
    res.status(500).json({
      error: 'Failed to get objective',
      message: error.message
    });
  }
});

/**
 * GET /api/objectives/:id/tasks
 * Get all tasks for an objective
 */
router.get('/:id/tasks', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    // Get tasks filtered by objective
    const tasks = await listTasks({ objective: id });

    res.json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (error: any) {
    console.error('Error getting objective tasks:', error);
    res.status(500).json({
      error: 'Failed to get objective tasks',
      message: error.message
    });
  }
});

/**
 * GET /api/objectives/:id/stats
 * Get objective statistics
 */
router.get('/:id/stats', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const stats = await getObjectiveStats(id);

    res.json({
      success: true,
      stats
    });
  } catch (error: any) {
    console.error('Error getting objective stats:', error);
    res.status(500).json({
      error: 'Failed to get objective stats',
      message: error.message
    });
  }
});

/**
 * PUT /api/objectives/:id
 * Update an objective
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const updates = req.body;

    const objective = await updateObjective(id, updates);

    res.json({
      success: true,
      objective
    });
  } catch (error: any) {
    console.error('Error updating objective:', error);
    res.status(400).json({
      error: 'Failed to update objective',
      message: error.message
    });
  }
});

/**
 * DELETE /api/objectives/:id
 * Delete (archive) an objective
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    await deleteObjective(id);

    res.json({
      success: true,
      message: 'Objective archived successfully'
    });
  } catch (error: any) {
    console.error('Error deleting objective:', error);
    res.status(400).json({
      error: 'Failed to delete objective',
      message: error.message
    });
  }
});

export default router;
