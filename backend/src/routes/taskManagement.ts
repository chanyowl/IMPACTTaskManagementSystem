/**
 * Task Management Routes
 *
 * API endpoints for the Task Management System
 */

import express, { Request, Response } from 'express';
import {
  createTask,
  getTask,
  listTasks,
  updateTask,
  deleteTask,
  getAllTasksGroupedByStatus,
  getTaskStats,
  linkTasks,
  unlinkTasks,
  restoreTask,
  permanentlyDeleteTask,
  getDeletedTasks
} from '../services/taskManagementService.js';
import { getTaskAuditHistory } from '../services/auditService.js';
import {
  validateTaskCreationMiddleware,
  validateTaskUpdateMiddleware,
  extractRequestMetadata
} from '../middleware/validateOntology.js';
import { CreateTaskRequest, UpdateTaskRequest, TaskFilters } from '../models/TaskManagement.js';

const router = express.Router();

/**
 * POST /api/task-management
 * Create a new task
 */
router.post(
  '/',
  extractRequestMetadata,
  validateTaskCreationMiddleware,
  async (req: Request, res: Response) => {
    try {
      const taskData: CreateTaskRequest = req.body;
      const userId = (req as any).userId || 'system'; // Get from auth middleware
      const metadata = (req as any).metadata;

      const task = await createTask(taskData, userId, metadata);

      res.status(201).json({
        success: true,
        task
      });
    } catch (error: any) {
      console.error('Error creating task:', error);
      res.status(400).json({
        error: 'Failed to create task',
        message: error.message
      });
    }
  }
);

/**
 * GET /api/task-management
 * List tasks with optional filters
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const filters: TaskFilters = {
      assignee: req.query.assignee as string,
      objective: req.query.objective as string,
      status: req.query.status as any,
      tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
      createdBy: req.query.createdBy as string
    };

    const tasks = await listTasks(filters);

    res.json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (error: any) {
    console.error('Error listing tasks:', error);
    res.status(500).json({
      error: 'Failed to list tasks',
      message: error.message
    });
  }
});

/**
 * GET /api/task-management/grouped
 * Get tasks grouped by status (for Kanban board)
 */
router.get('/grouped', async (req: Request, res: Response) => {
  try {
    const grouped = await getAllTasksGroupedByStatus();

    res.json({
      success: true,
      tasks: grouped
    });
  } catch (error: any) {
    console.error('Error getting grouped tasks:', error);
    res.status(500).json({
      error: 'Failed to get grouped tasks',
      message: error.message
    });
  }
});

/**
 * GET /api/task-management/stats
 * Get task statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const filters = {
      assignee: req.query.assignee as string,
      objective: req.query.objective as string
    };

    const stats = await getTaskStats(filters);

    res.json({
      success: true,
      stats
    });
  } catch (error: any) {
    console.error('Error getting task stats:', error);
    res.status(500).json({
      error: 'Failed to get task stats',
      message: error.message
    });
  }
});

/**
 * GET /api/task-management/trash
 * Get deleted tasks (Trash Bin)
 */
router.get('/trash', async (req: Request, res: Response) => {
  try {
    const tasks = await getDeletedTasks();

    res.json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (error: any) {
    console.error('Error getting trash:', error);
    res.status(500).json({
      error: 'Failed to get trash',
      message: error.message
    });
  }
});

/**
 * GET /api/task-management/:id
 * Get a specific task
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const task = await getTask(id);

    if (!task) {
      res.status(404).json({
        error: 'Task not found'
      });
      return;
    }

    res.json({
      success: true,
      task
    });
  } catch (error: any) {
    console.error('Error getting task:', error);
    res.status(500).json({
      error: 'Failed to get task',
      message: error.message
    });
  }
});

/**
 * PUT /api/task-management/:id
 * Update a task
 */
router.put(
  '/:id',
  extractRequestMetadata,
  validateTaskUpdateMiddleware,
  async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const updates: UpdateTaskRequest = req.body;
      const userId = (req as any).userId || 'system';
      const metadata = (req as any).metadata;

      const task = await updateTask(id, updates, userId, metadata);

      res.json({
        success: true,
        task
      });
    } catch (error: any) {
      console.error('Error updating task:', error);
      res.status(400).json({
        error: 'Failed to update task',
        message: error.message
      });
    }
  }
);



/**
 * DELETE /api/task-management/:id/permanent
 * Permanently delete a task
 */
router.delete(
  '/:id/permanent',
  extractRequestMetadata,
  async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const userId = (req as any).userId || 'system';
      const metadata = (req as any).metadata;

      await permanentlyDeleteTask(id, userId, metadata);

      res.json({
        success: true,
        message: 'Task permanently deleted'
      });
    } catch (error: any) {
      console.error('Error permanently deleting task:', error);
      res.status(400).json({
        error: 'Failed to permanently delete task',
        message: error.message
      });
    }
  }
);

/**
 * POST /api/task-management/:id/restore
 * Restore a task from trash
 */
router.post(
  '/:id/restore',
  extractRequestMetadata,
  async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const userId = (req as any).userId || 'system';
      const metadata = (req as any).metadata;

      await restoreTask(id, userId, metadata);

      res.json({
        success: true,
        message: 'Task restored successfully'
      });
    } catch (error: any) {
      console.error('Error restoring task:', error);
      res.status(400).json({
        error: 'Failed to restore task',
        message: error.message
      });
    }
  }
); // End of restore route

/**
 * DELETE /api/task-management/:id
 * Delete a task (soft delete)
 */
router.delete(
  '/:id',
  extractRequestMetadata,
  async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const { reason } = req.body;
      const userId = (req as any).userId || 'system';
      const metadata = (req as any).metadata;

      await deleteTask(id, userId, reason, metadata);

      res.json({
        success: true,
        message: 'Task moved to trash'
      });
    } catch (error: any) {
      console.error('Error deleting task:', error);
      res.status(400).json({
        error: 'Failed to delete task',
        message: error.message
      });
    }
  }
);

/**
 * GET /api/task-management/:id/audit
 * Get audit history for a task
 */
router.get('/:id/audit', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const auditLogs = await getTaskAuditHistory(id);

    res.json({
      success: true,
      count: auditLogs.length,
      auditLogs
    });
  } catch (error: any) {
    console.error('Error getting audit history:', error);
    res.status(500).json({
      error: 'Failed to get audit history',
      message: error.message
    });
  }
});

/**
 * POST /api/task-management/:id/link
 * Link two tasks together
 */
router.post('/:id/link', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { linkedTaskId } = req.body;
    const userId = (req as any).userId || 'system';

    await linkTasks(id, linkedTaskId, userId);

    res.json({
      success: true,
      message: 'Tasks linked successfully'
    });
  } catch (error: any) {
    console.error('Error linking tasks:', error);
    res.status(400).json({
      error: 'Failed to link tasks',
      message: error.message
    });
  }
});

/**
 * POST /api/task-management/:id/unlink
 * Unlink two tasks
 */
router.post('/:id/unlink', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { linkedTaskId } = req.body;
    const userId = (req as any).userId || 'system';

    await unlinkTasks(id, linkedTaskId, userId);

    res.json({
      success: true,
      message: 'Tasks unlinked successfully'
    });
  } catch (error: any) {
    console.error('Error unlinking tasks:', error);
    res.status(400).json({
      error: 'Failed to unlink tasks',
      message: error.message
    });
  }
});

export default router;
