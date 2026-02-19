/**
 * AI Routes
 *
 * API endpoints for AI-assisted task management
 * Phase 3: Layer 6 AI Behavior Model
 */

import express from 'express';
import type { Request, Response } from 'express';
import {
  extractActionsFromText,
  proposeTaskDesign,
  detectAmbiguity,
  validateProposal
} from '../services/aiService';
import type { AIProposal, AIExtractionResult } from '../services/aiService';

const router = express.Router();

/**
 * POST /api/ai/extract-actions
 * Extract actionable tasks from meeting notes or documents
 *
 * Request body:
 * {
 *   "inputText": "Meeting notes or document text",
 *   "context": { // optional
 *     "defaultAssignee": "user@example.com",
 *     "defaultObjective": "Project Alpha",
 *     "dateContext": "Q1 2026"
 *   }
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "result": AIExtractionResult
 * }
 */
router.post('/extract-actions', async (req: Request, res: Response) => {
  try {
    const { inputText, context } = req.body;

    if (!inputText || typeof inputText !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'inputText is required and must be a string'
      });
    }

    const result: AIExtractionResult = await extractActionsFromText(inputText, context);

    // Validate each proposal
    const validatedProposals = result.proposals.map(proposal => {
      const validation = validateProposal(proposal);
      return {
        ...proposal,
        validation
      };
    });

    res.json({
      success: true,
      result: {
        ...result,
        proposals: validatedProposals
      }
    });
  } catch (error: any) {
    console.error('Error in /extract-actions:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to extract actions'
    });
  }
});

/**
 * POST /api/ai/propose-design
 * Get AI proposal for complete task design from partial information
 *
 * Request body:
 * {
 *   "partialTask": {
 *     "objective": "optional",
 *     "assignee": "optional",
 *     "description": "optional",
 *     "deadline": "optional"
 *   }
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "proposal": AIProposal
 * }
 */
router.post('/propose-design', async (req: Request, res: Response) => {
  try {
    const { partialTask } = req.body;

    if (!partialTask || typeof partialTask !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'partialTask object is required'
      });
    }

    const proposal: AIProposal = await proposeTaskDesign(partialTask);

    // Validate proposal
    const validation = validateProposal(proposal);

    res.json({
      success: true,
      proposal: {
        ...proposal,
        validation
      }
    });
  } catch (error: any) {
    console.error('Error in /propose-design:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to propose design'
    });
  }
});

/**
 * POST /api/ai/detect-ambiguity
 * Analyze text for ambiguity before task creation
 *
 * Request body:
 * {
 *   "inputText": "Text to analyze"
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "result": {
 *     "isAmbiguous": boolean,
 *     "ambiguities": string[],
 *     "clarifyingQuestions": string[],
 *     "confidence": number
 *   }
 * }
 */
router.post('/detect-ambiguity', async (req: Request, res: Response) => {
  try {
    const { inputText } = req.body;

    if (!inputText || typeof inputText !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'inputText is required and must be a string'
      });
    }

    const result = await detectAmbiguity(inputText);

    res.json({
      success: true,
      result
    });
  } catch (error: any) {
    console.error('Error in /detect-ambiguity:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to detect ambiguity'
    });
  }
});

/**
 * GET /api/ai/status
 * Check if AI service is available
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    const { isGeminiAvailable } = await import('../config/gemini');

    res.json({
      success: true,
      available: isGeminiAvailable(),
      message: isGeminiAvailable()
        ? 'AI service is available'
        : 'AI service is not configured. Set GEMINI_API_KEY in environment variables.'
    });
  } catch (error: any) {
    res.json({
      success: false,
      available: false,
      message: 'AI service error: ' + error.message
    });
  }
});

export default router;
