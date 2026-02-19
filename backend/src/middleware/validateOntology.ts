/**
 * Ontology Validation Middleware
 *
 * Express middleware that validates request bodies against ontology rules
 * before allowing requests to proceed to route handlers
 */

import { Request, Response, NextFunction } from 'express';
import {
  validateTaskCreation,
  validateCompleteTask
} from '../core/ontology.js';
import { objectiveExists, ensureObjectiveExists } from '../services/objectiveService.js';
import { CreateTaskRequest } from '../models/TaskManagement.js';

/**
 * Middleware to validate task creation requests
 */
export async function validateTaskCreationMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const taskData: CreateTaskRequest = req.body;

    // Basic validation first
    const basicValidation = validateTaskCreation(taskData);
    if (!basicValidation.valid) {
      res.status(400).json({
        error: 'Validation failed',
        details: basicValidation.errors
      });
      return;
    }

    // Check if objective exists (or create it if it's a known project)
    await ensureObjectiveExists(taskData.objective);
    // Since we ensure it exists, we don't need to check !objExists anymore
    /* 
    const objExists = await objectiveExists(taskData.objective);
    if (!objExists) {
       ... 
    }
    */

    // Validation passed, proceed
    next();
  } catch (error: any) {
    res.status(500).json({
      error: 'Internal server error during validation',
      message: error.message
    });
  }
}

/**
 * Middleware to validate task update requests
 */
export async function validateTaskUpdateMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const updates = req.body;

    // Check if trying to update objective (and ensure it exists)
    if (updates.objective) {
      await ensureObjectiveExists(updates.objective);
    }

    // Validation passed, proceed
    next();
  } catch (error: any) {
    res.status(500).json({
      error: 'Internal server error during validation',
      message: error.message
    });
  }
}

/**
 * Middleware to extract user ID from request
 * (Uses Firebase Auth - assumes auth middleware runs first)
 */
export function extractUserId(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Get user ID from Firebase Auth
  const userId = (req as any).user?.uid;

  if (!userId) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'User authentication required'
    });
    return;
  }

  // Attach to request for use in route handlers
  (req as any).userId = userId;
  next();
}

/**
 * Middleware to extract request metadata (IP, User-Agent)
 */
export function extractRequestMetadata(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  (req as any).metadata = {
    ipAddress: req.ip || req.headers['x-forwarded-for'] as string || 'unknown',
    userAgent: req.headers['user-agent'] || 'unknown'
  };
  next();
}
