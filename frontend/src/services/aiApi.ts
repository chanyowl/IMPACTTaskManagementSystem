/**
 * AI API Client
 *
 * Frontend service for AI-assisted task management
 * Phase 3: Layer 6 AI Behavior Model
 */

const API_BASE = 'http://localhost:3001/api/ai';

/**
 * AI Proposal Structure
 */
export interface AIProposal {
  taskData: {
    objective: string;
    assignee: string;
    startDate: string;
    dueDate: string;
    deliverable: string;
    evidence: string;
    tags?: string[];
  };
  confidence: number; // 0-1 scale
  reasoning: string;
  questions: string[]; // Clarifying questions
  ambiguities: string[]; // Flagged unclear points
  validation?: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  };
}

/**
 * AI Extraction Result
 */
export interface AIExtractionResult {
  proposals: AIProposal[];
  overallConfidence: number;
  clarifyingQuestions: string[];
  summary: string;
  requiresApproval: boolean; // Always true - AI never auto-acts
}

/**
 * Extract action items from meeting notes or documents
 */
export async function extractActions(
  inputText: string,
  context?: {
    defaultAssignee?: string;
    defaultObjective?: string;
    dateContext?: string;
  }
): Promise<AIExtractionResult> {
  const response = await fetch(`${API_BASE}/extract-actions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ inputText, context })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to extract actions');
  }

  const data = await response.json();
  return data.result;
}

/**
 * Get AI proposal for complete task design from partial information
 */
export async function proposeTaskDesign(partialTask: {
  objective?: string;
  assignee?: string;
  description?: string;
  deadline?: string;
}): Promise<AIProposal> {
  const response = await fetch(`${API_BASE}/propose-design`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ partialTask })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to propose design');
  }

  const data = await response.json();
  return data.proposal;
}

/**
 * Analyze text for ambiguity before task creation
 */
export async function detectAmbiguity(inputText: string): Promise<{
  isAmbiguous: boolean;
  ambiguities: string[];
  clarifyingQuestions: string[];
  confidence: number;
}> {
  const response = await fetch(`${API_BASE}/detect-ambiguity`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ inputText })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to detect ambiguity');
  }

  const data = await response.json();
  return data.result;
}

/**
 * Check if AI service is available
 */
export async function checkAIStatus(): Promise<{
  available: boolean;
  message: string;
}> {
  try {
    const response = await fetch(`${API_BASE}/status`);
    const data = await response.json();
    return {
      available: data.available,
      message: data.message
    };
  } catch (error) {
    return {
      available: false,
      message: 'Failed to connect to AI service'
    };
  }
}
