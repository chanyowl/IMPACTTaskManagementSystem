/**
 * Audit Routes
 *
 * API endpoints for audit log retrieval and export
 */

import express, { Request, Response } from 'express';
import {
  getTaskAuditHistory,
  getUserAuditHistory,
  getAuditLogsByAction,
  getAuditLogsByDateRange,
  exportAuditLogs,
  getRecentActivity,
  countAuditLogs
} from '../services/auditService.js';
import { AuditAction } from '../models/TaskManagement.js';

const router = express.Router();

/**
 * GET /api/audit/tasks/:taskId
 * Get audit logs for a specific task
 */
router.get('/tasks/:taskId', async (req: Request, res: Response) => {
  try {
    const taskId = req.params.taskId as string;
    const auditLogs = await getTaskAuditHistory(taskId);

    res.json({
      success: true,
      count: auditLogs.length,
      auditLogs
    });
  } catch (error: any) {
    console.error('Error getting task audit logs:', error);
    res.status(500).json({
      error: 'Failed to get audit logs',
      message: error.message
    });
  }
});

/**
 * GET /api/audit/users/:userId
 * Get audit logs by user
 */
router.get('/users/:userId', async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId as string;
    const limit = parseInt(req.query.limit as string) || 100;

    const auditLogs = await getUserAuditHistory(userId, limit);

    res.json({
      success: true,
      count: auditLogs.length,
      auditLogs
    });
  } catch (error: any) {
    console.error('Error getting user audit logs:', error);
    res.status(500).json({
      error: 'Failed to get audit logs',
      message: error.message
    });
  }
});

/**
 * GET /api/audit/actions/:action
 * Get audit logs by action type
 */
router.get('/actions/:action', async (req: Request, res: Response) => {
  try {
    const action = req.params.action as AuditAction;
    const limit = parseInt(req.query.limit as string) || 100;

    const auditLogs = await getAuditLogsByAction(action, limit);

    res.json({
      success: true,
      count: auditLogs.length,
      auditLogs
    });
  } catch (error: any) {
    console.error('Error getting audit logs by action:', error);
    res.status(500).json({
      error: 'Failed to get audit logs',
      message: error.message
    });
  }
});

/**
 * GET /api/audit/recent
 * Get recent audit activity
 */
router.get('/recent', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const auditLogs = await getRecentActivity(limit);

    res.json({
      success: true,
      count: auditLogs.length,
      auditLogs
    });
  } catch (error: any) {
    console.error('Error getting recent activity:', error);
    res.status(500).json({
      error: 'Failed to get recent activity',
      message: error.message
    });
  }
});

/**
 * GET /api/audit/export
 * Export audit logs with filters
 */
router.get('/export', async (req: Request, res: Response) => {
  try {
    const filters = {
      taskId: req.query.taskId as string,
      userId: req.query.userId as string,
      action: req.query.action as AuditAction,
      startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
      endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined
    };

    const auditLogs = await exportAuditLogs(filters);

    // Set headers for CSV download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=audit-logs.json');

    res.json({
      success: true,
      count: auditLogs.length,
      exportDate: new Date().toISOString(),
      filters,
      auditLogs
    });
  } catch (error: any) {
    console.error('Error exporting audit logs:', error);
    res.status(500).json({
      error: 'Failed to export audit logs',
      message: error.message
    });
  }
});

/**
 * GET /api/audit/count
 * Count audit logs with filters
 */
router.get('/count', async (req: Request, res: Response) => {
  try {
    const filters = {
      taskId: req.query.taskId as string,
      userId: req.query.userId as string,
      action: req.query.action as AuditAction
    };

    const count = await countAuditLogs(filters);

    res.json({
      success: true,
      count
    });
  } catch (error: any) {
    console.error('Error counting audit logs:', error);
    res.status(500).json({
      error: 'Failed to count audit logs',
      message: error.message
    });
  }
});

/**
 * GET /api/audit/date-range
 * Get audit logs within a date range
 */
router.get('/date-range', async (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();
    const limit = parseInt(req.query.limit as string) || 1000;

    const auditLogs = await getAuditLogsByDateRange(startDate, endDate, limit);

    res.json({
      success: true,
      count: auditLogs.length,
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      },
      auditLogs
    });
  } catch (error: any) {
    console.error('Error getting audit logs by date range:', error);
    res.status(500).json({
      error: 'Failed to get audit logs',
      message: error.message
    });
  }
});

export default router;
