import { GoogleGenerativeAI } from '@google/generative-ai';
import { IMPACT_OBJECTIVES } from '../config/impactConstants.js';
import dotenv from 'dotenv';
import { Interaction, UserState } from '../models/index.js';

import fs from 'fs';
import path from 'path';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

const TRIXIE_SYSTEM_PROMPT = `You are Trixie, a calm and curious AI companion designed to help users manage tasks based on their personality and current state. Your principles:

1. INFERENCE OVER INTERROGATION: Never directly ask "What's your personality type?" Instead, observe patterns in their responses.

2. LOW PRESSURE: Use phrases like "How does looking at X make you feel right now?" instead of "You need to finish X."

3. THE MIRROR: Help users recognize their own patterns. Example: "You tend to avoid email replies on Monday mornings."

4. CONVERSATIONAL: Chat is the primary interface. Be warm, brief during work hours, more reflective during reviews.

5. TASK PARSING: When users dump tasks, acknowledge and categorize them without judgment. Extract tasks from messy, stream-of-consciousness input.

6. ADAPTATION: Mirror the user's formality level but maintain a calm baseline.

7. EMPATHY: Be understanding and supportive. Never judge or criticize. Recognize emotional states and respond appropriately.

8. BREVITY: Keep responses concise and conversational. Avoid long paragraphs unless the user is in a reflective mood.`;

export async function getTrixieResponse(
  conversationHistory: Interaction[],
  userState: UserState,
  currentMessage: string
): Promise<string> {
  try {
    // Build context string
    const stateContext = `\nCurrent user state: ${userState.energy} energy, ${userState.sentiment > 0 ? 'positive' : userState.sentiment < 0 ? 'negative' : 'neutral'} sentiment, ${userState.timeOfDay}`;

    // Convert conversation history to Claude messages format
    const messages = conversationHistory.slice(-10).map(interaction => ({
      role: interaction.sender === 'user' ? 'user' : 'assistant',
      content: interaction.message,
    }));

    // Add current message
    messages.push({
      role: 'user',
      content: currentMessage,
    });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: TRIXIE_SYSTEM_PROMPT + stateContext + '\n\nChat History:\n' + JSON.stringify(messages) + '\n\nUser Message: ' + currentMessage }] }],
    });
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error getting Crystell response:', error);
    throw error;
  }
}

export async function extractTasksFromText(text: string): Promise<Array<{
  description: string;
  inferredTags: string[];
  cognitiveLoad: 'high' | 'low';
  emotionalWeight: 'scary' | 'neutral';
}>> {
  try {
    const prompt = `Extract all tasks from the following text. For each task, determine:
- description: Clear, concise task description
- inferredTags: Array of tags like "creative", "admin", "social", "technical", "personal"
- cognitiveLoad: "high" (requires deep thinking, writing, design, problem-solving) or "low" (routine, admin, simple)
- emotionalWeight: "scary" (involves deadlines, new things, presentations, important people) or "neutral"

Return ONLY a JSON array of task objects. No other text.

Text: "${text}"`;

    const result = await model.generateContent(prompt + `\n\nText: "${text}"`);
    const response = await result.response;
    const content = response.text();

    // Extract JSON from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return [];
  } catch (error) {
    console.error('Error extracting tasks:', error);
    throw error;
  }
}

export async function analyzeSentiment(text: string): Promise<number> {
  try {
    const prompt = `Analyze the sentiment of this message and return ONLY a number between -1.0 (very negative/anxious) and 1.0 (very positive/energized). Return just the number, nothing else.

Message: "${text}"`;

    const result = await model.generateContent(prompt + `\n\nMessage: "${text}"`);
    const response = await result.response;
    const content = response.text();
    const sentiment = parseFloat(content.trim());

    return isNaN(sentiment) ? 0 : Math.max(-1, Math.min(1, sentiment));
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    return 0;
  }
}

// ============================================================================
// PHASE 3: AI-Assisted Task Management
// Layer 6 AI Behavior Model Implementation
// ============================================================================

/**
 * AI Proposal Structure for Task Management
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
 * Returns proposals that require human approval
 *
 * CRITICAL: AI NEVER auto-creates tasks - only proposes them
 */
export async function extractActionsFromText(
  inputText: string,
  context?: {
    defaultAssignee?: string;
    defaultObjective?: string;
    dateContext?: string;
  }
): Promise<AIExtractionResult> {
  try {
    const prompt = `You are an AI assistant helping to extract actionable tasks from text for a task management system.

CRITICAL RULES:
1. NEVER auto-create tasks - only propose them for human approval
2. Flag ANY ambiguity with clarifying questions
3. Provide confidence scores (0-1) for each proposal
4. Extract ALL mandatory fields: project (stored as objective), assignee, dates, deliverable, evidence

INPUT TEXT:
${inputText}

CONTEXT (if provided):
${context ? JSON.stringify(context, null, 2) : 'None'}

RESPOND WITH VALID JSON ONLY:
{
  "proposals": [
    {
      "taskData": {
        "objective": "The Project Name (e.g., IMPACT NXT, STEP, HEIRIT)",
        "assignee": "Person responsible (or 'UNKNOWN' if unclear)",
        "startDate": "YYYY-MM-DD (today if not specified)",
        "dueDate": "YYYY-MM-DD (estimate if not specified)",
        "deliverable": "Expected output/result",
        "evidence": "How completion will be verified",
        "tags": ["relevant", "tags"]
      },
      "confidence": 0.0-1.0,
      "reasoning": "Why you proposed this structure",
      "questions": ["Clarifying questions if anything unclear"],
      "ambiguities": ["Specific unclear points"]
    }
  ],
  "overallConfidence": 0.0-1.0,
  "clarifyingQuestions": ["Top-level questions about the entire input"],
  "summary": "Brief summary of extracted actions"
}

IMPORTANT:
- If assignee is unclear, use "UNKNOWN" and add a clarifying question
- If dates are vague, estimate but flag low confidence
- If deliverable is unclear, propose one but flag ambiguity
- DO NOT make assumptions - flag everything uncertain
- Use today's date as reference: ${new Date().toISOString().split('T')[0]}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();

    // Parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('AI did not return valid JSON');
    }

    const extractionResult: AIExtractionResult = JSON.parse(jsonMatch[0]);

    // Ensure requiresApproval is always true
    extractionResult.requiresApproval = true;

    // Validate and adjust proposals
    extractionResult.proposals = extractionResult.proposals.map(proposal => {
      // Ensure confidence is between 0 and 1
      proposal.confidence = Math.max(0, Math.min(1, proposal.confidence));

      // Flag if critical fields are missing
      if (proposal.taskData.assignee === 'UNKNOWN' || !proposal.taskData.assignee) {
        if (!proposal.ambiguities.includes('Assignee not specified')) {
          proposal.ambiguities.push('Assignee not specified');
        }
        proposal.confidence = Math.min(proposal.confidence, 0.6);
      }

      return proposal;
    });

    return extractionResult;
  } catch (error: any) {
    console.error('Error in extractActionsFromText:', error);
    throw new Error(`Failed to extract actions: ${error.message}`);
  }
}

/**
 * Propose a complete task design from partial information
 * User provides some fields, AI fills in the rest with proposals
 */
export async function proposeTaskDesign(partialTask: {
  objective?: string;
  assignee?: string;
  description?: string;
  deadline?: string;
}): Promise<AIProposal> {
  try {
    const prompt = `You are an AI assistant helping design a complete task structure for a task management system.

USER PROVIDED:
${JSON.stringify(partialTask, null, 2)}

Your job is to propose a COMPLETE task design that includes ALL mandatory fields:
- objective: The Project Name
- assignee: Who is responsible
- startDate: When work begins (YYYY-MM-DD)
- dueDate: When work must complete (YYYY-MM-DD)
- deliverable: Expected output/result
- evidence: Proof of completion

RESPOND WITH VALID JSON ONLY:
{
  "taskData": {
    "objective": "...",
    "assignee": "...",
    "startDate": "YYYY-MM-DD",
    "dueDate": "YYYY-MM-DD",
    "deliverable": "...",
    "evidence": "...",
    "tags": ["relevant", "tags"]
  },
  "confidence": 0.0-1.0,
  "reasoning": "Why you proposed this structure",
  "questions": ["What clarifications would improve this design?"],
  "ambiguities": ["What assumptions did you make?"]
}

IMPORTANT:
- Base your proposal on the user's input
- Flag ALL assumptions as ambiguities
- Ask questions for anything unclear
- Provide REASONING for your choices
- Use today's date as reference: ${new Date().toISOString().split('T')[0]}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();

    // Parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('AI did not return valid JSON');
    }

    const proposal: AIProposal = JSON.parse(jsonMatch[0]);

    // Ensure confidence is between 0 and 1
    proposal.confidence = Math.max(0, Math.min(1, proposal.confidence));

    return proposal;
  } catch (error: any) {
    console.error('Error in proposeTaskDesign:', error);
    throw new Error(`Failed to propose task design: ${error.message}`);
  }
}

/**
 * Detect ambiguity in input text
 * Returns clarifying questions before any action
 */
export async function detectAmbiguity(inputText: string): Promise<{
  isAmbiguous: boolean;
  ambiguities: string[];
  clarifyingQuestions: string[];
  confidence: number;
}> {
  try {
    const prompt = `Analyze this text for ambiguity. Flag anything unclear that would prevent creating a well-defined task.

INPUT:
${inputText}

RESPOND WITH VALID JSON ONLY:
{
  "isAmbiguous": true/false,
  "ambiguities": ["List specific unclear points"],
  "clarifyingQuestions": ["Questions to resolve ambiguity"],
  "confidence": 0.0-1.0 (confidence in your analysis)
}

LOOK FOR:
- Missing assignee
- Vague deadlines ("soon", "later", etc.)
- Unclear deliverables
- Ambiguous responsibility
- Missing context`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();

    // Parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('AI did not return valid JSON');
    }

    const ambiguityResult = JSON.parse(jsonMatch[0]);
    ambiguityResult.confidence = Math.max(0, Math.min(1, ambiguityResult.confidence || 0.5));

    return ambiguityResult;
  } catch (error: any) {
    console.error('Error in detectAmbiguity:', error);
    throw new Error(`Failed to detect ambiguity: ${error.message}`);
  }
}

/**
 * Validate proposal against ontology
 * Ensures all mandatory fields are present and valid
 */
export function validateProposal(proposal: AIProposal): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check mandatory fields
  if (!proposal.taskData.objective || proposal.taskData.objective.trim().length === 0) {
    errors.push('Project is required');
  }

  if (!proposal.taskData.assignee || proposal.taskData.assignee === 'UNKNOWN') {
    errors.push('Assignee must be specified');
  }

  if (!proposal.taskData.startDate) {
    errors.push('Start date is required');
  }

  if (!proposal.taskData.dueDate) {
    errors.push('Due date is required');
  }

  if (!proposal.taskData.deliverable || proposal.taskData.deliverable.trim().length === 0) {
    errors.push('Deliverable is required');
  }

  if (!proposal.taskData.evidence || proposal.taskData.evidence.trim().length === 0) {
    errors.push('Evidence is required');
  }

  // Warnings for low confidence
  if (proposal.confidence < 0.5) {
    warnings.push('Low confidence proposal - review carefully');
  }

  // Warnings for ambiguities
  if (proposal.ambiguities.length > 0) {
    warnings.push(`${proposal.ambiguities.length} ambiguities flagged`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
/**
 * Clean AI output of internal artifacts
 */
function cleanAIOutput(text: string): string {
  return text
    // Remove "PHASE X:" headers
    .replace(/^PHASE \d+:.*$/gm, '')
    // Remove "STEP X:" headers
    .replace(/^STEP \d+:.*$/gm, '')
    // Remove lines starting with *** or ===
    .replace(/^(\*\*\*|===).*$/gm, '')
    // Remove multiple consecutive newlines left by deletions
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Generate a specific DOST-format narrative
 */
async function generateDOSTNarrative(reportData: any): Promise<string> {
  try {
    const inputs = reportData.dostInputs;
    if (!inputs) {
      throw new Error("Missing 'dostInputs' in reportData. Cannot generate DOST narrative.");
    }
    // Infer Quarter and Month from date range
    const startDate = new Date(inputs.dateRange.split(' to ')[0]);
    const endDate = new Date(inputs.dateRange.split(' to ')[1]);

    const getQuarter = (date: Date) => {
      const month = date.getMonth() + 1;
      return Math.ceil(month / 3);
    };

    const quarterMap = ['First', 'Second', 'Third', 'Fourth'];
    const quarterName = quarterMap[getQuarter(endDate) - 1] || 'Current';
    const submissionMonth = endDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    // Load prompt from external markdown file
    const promptPath = path.join(__dirname, '../prompts/reporting_prompt.md');
    let promptTemplate = '';

    try {
      promptTemplate = fs.readFileSync(promptPath, 'utf8');
    } catch (err) {
      console.error('Failed to load prompt template from:', promptPath);
      throw new Error('Reporting prompt template not found.');
    }

    // Replace placeholders with actual data
    const prompt = promptTemplate
      .replace(/{{quarterName}}/g, quarterName)
      .replace(/{{dateRange}}/g, inputs.dateRange)
      .replace(/{{submissionMonth}}/g, submissionMonth)
      .replace(/{{challenges}}/g, inputs.challenges || "None provided (Infer from task logs)")
      .replace(/{{nextQuarterPlans}}/g, inputs.nextQuarterPlans || "None provided (Infer from 'Pending' tasks)")
      .replace(/{{actualAccomplishments}}/g, inputs.actualAccomplishments || "None provided (Focus on dashboard data)")
      .replace(/{{surveyMetrics}}/g, inputs.surveyMetrics || "None provided")
      .replace(/{{dashboardData}}/g, JSON.stringify(reportData.tasks.map((t: any) => {
        const history = reportData.taskAccomplishments?.[t.taskId] || [];
        return {
          TaskName: t.deliverable,
          Objective: t.objective,
          Status: t.status,
          Description: t.description || 'No description provided',
          Evidence: t.evidence,
          DueDate: t.dueDate,
          UpdatesAndActivityLog: history,
          Tags: t.tags || []
        };
      }), null, 2))
      .replace(/{{crawledContent}}/g, JSON.stringify(reportData.crawledContent || {}, null, 2))
      .replace(/{{projectObjectives}}/g, JSON.stringify(IMPACT_OBJECTIVES, null, 2));

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return cleanAIOutput(response.text());
  } catch (error) {
    console.error('Error generating DOST narrative:', error);
    return `Error generating DOST narrative: ${error instanceof Error ? error.message : String(error)} `;
  }
}

/**
 * Generate a professional activity narrative for a report
 * Uses task and audit data to create a high-level summary
 */
export async function generateReportNarrative(
  reportData: any
): Promise<string> {
  try {
    // Check if this is a DOST report request
    if (reportData.dostInputs) {
      return await generateDOSTNarrative(reportData);
    }

    let prompt = '';

    if (reportData.type === 'monthly') {
      // Monthly Report: Strict "Accomplishment Report" Template Content
      prompt = `You are an executive assistant extracting accomplishment details for a report.

  DATA:
  - Stats: ${JSON.stringify(reportData.stats)}
- Tasks: ${JSON.stringify(reportData.tasks.map((t: any) => ({
        title: t.deliverable || t.objective, // Use deliverable as title if available
        status: t.status,
        date: t.dueDate || t.updatedAt,
        updates: reportData.taskAccomplishments?.[t.taskId] || []
      })))
        }
- Objectives: ${JSON.stringify(reportData.objectives)}
- Audit Logs: ${JSON.stringify(reportData.complianceTrail)}

INSTRUCTIONS:
- Generate a high - level "Thematic Analysis" and "Executive Summary" of the period.
      - Focus on IMPACT, STRATEGIC ALIGNMENT, and KEY WINS.
      - Look at task "updates" to identify specific subtasks or milestones achieved.
      - DO NOT list individual tasks(these will be listed programmatically).
      - Analyze the trends in the data(e.g., "High focus on Q1 production", "Compliance rate is 100%").
      - Keep it professional, concise, and executive - level.
      - Limit to 1 - 2 short paragraphs.

      Example Output:
"This period was characterized by a strong push towards Q1 production goals, with 85% of strategic objectives met. Key achievements include the successful deployment of the new payment gateway and the finalization of the marketing roadmap. Operational efficiency remains high, with zero compliance issues reported."`;
    } else if (reportData.type === 'quarterly') {
      // Quarterly Report: Technical Project Rapporteur Template
      prompt = `You are a Technical Project Rapporteur.Your goal is to transform a raw list of completed tasks and project details into a formal Quarterly Narrative Report following a strict template.

      REPORT CONTEXT:
- Period: ${new Date(reportData.startDate).toLocaleDateString()} to ${new Date(reportData.endDate).toLocaleDateString()}

DATA:
- Stats: ${JSON.stringify(reportData.stats)}
- Objectives: ${JSON.stringify(reportData.objectives)}
- PROJECT CONTEXT(Use this as the "North Star"): 
        If the project is "IMPACT NXT", refer to these core objectives:
1. Customizing a Competency Framework for TTOs(45 %)
        2. Implementing Competency Assessment / TNA(20 %)
3. Establishment of Training Plans(20 %)
4. Policy Recommendations for Sustaining Skills(15 %)
  - Tasks(Detailed Activities): ${JSON.stringify(reportData.tasks.map((t: any) => ({
        deliverable: t.deliverable,
        status: t.status,
        date: t.dueDate,
        updates: reportData.taskAccomplishments?.[t.taskId] || [],
        objective: t.objective
      })))
        }
- Audit Logs(Evidence): ${JSON.stringify(reportData.complianceTrail?.slice(0, 30) || [])}
- CRAWLED EVIDENCE CONTENT: ${JSON.stringify(reportData.crawledContent || {}, null, 2)}

STRUCTURE & INSTRUCTIONS:

1. Front Matter:
- Generate a Title Page content block with: Project Name(Use the "Project" provided in the data, or "Compliance Report" if none), Report Period, and a placeholder for Table of Contents.
         - DO NOT mention "Anti Gravity" unless it is explicitly listed as a task or objective in the data.

      2. Executive Summary:
- Synthesize a 3 - 4 paragraph narrative highlighting the "foundational focus" of the quarter.
         - Mention major milestones(e.g., conferences, key approvals, key tasks completed) and overall status(e.g., "generally on track").

      3. Chapter 1: Overview of Accomplishments:
- Provide a brief introduction to the project’s national significance.
         - Table 1(Summary Table): Create a 4 - column HTML table: ** Objectives | Target Activities | 1st Quarter Accomplishments | % Weight **.
         - CRITICAL: Render this table using strict HTML <table> tags.Do NOT use Markdown tables.
          - Use <thead>, <tbody>, <tr>, <th>, <td> tags.
         - Do not wrap the HTML in code blocks.Output raw HTML mixed with the markdown text.

      4. Chapter 2: Detailed Activities(THE CORE NARRATIVE):
- For every significant task in the data, expand it into a sub - section(e.g., 2.1, 2.2).
         - Include "how" and "why" the task was done(e.g., explaining why a specific methodology was chosen over "off-the-shelf" models).
         - Insert placeholders for ** Tables(for frameworks)** and ** Figures(for process diagrams)** where data saturation or methodologies are discussed.
         - Document challenges encountered(e.g., logistical bottlenecks or weather disruptions) and how they were handled.
          - ** CRITICAL **: Use the "updates" field in the task data AND the "CRAWLED EVIDENCE CONTENT" to extract specific subtasks or user - entered progress details.
          - ** SUB - CHAPTERS **: If crawled evidence provided detailed content(like meeting minutes or document text), create sub - chapters(e.g., 2.1.1, 2.1.2) to detail these findings.
          - ** FORMATTING CRITICAL **: Do NOT use level 4 headers (e.g., 2.1.1.1). Any deeper details must be presented as **bullet points** with a bold key (e.g., "**Key Finding:** ..."). Each bullet should be 2-3 sentences.
          - ** SUBTASKS MAPPING (MANDATORY)**: You MUST map items from the 'updates' field (Task history) to these bullet points. One bullet per significant update.
            - **STRICT FORMAT**: **[Update/Subtask Name]:** [2-3 sentence explanation]. 
            - **FORBIDDEN**: Do NOT summarize these updates into a single paragraph. You must list them individually.

      5. Chapter 3: Assessment & Next Steps:
- Summarize the shift in focus for the upcoming quarter(e.g., moving from "foundational research" to "active data collection").
         - Provide a bulleted list of Priority Activities for the next three months.

      6. Annex Section:
- List all supporting documents, survey tools, and links provided in the task details.

  TONE:
- Professional, technical, and evidence - based.
      - Use terms like "data saturation", "methodological rigor", and "contextual anchoring".

      OUTPUT FORMAT:
- Markdown.Use ## for Chapters, ### for Sub - sections.`;
    } else {
      // Project Summary / Default
      prompt = `You are a professional auditor and management consultant.Your goal is to generate a high - quality, audit - ready "Activity Narrative" for a ${reportData.type} report.
      
      REPORT CONTEXT:
- Type: ${reportData.type}
- Period: ${new Date(reportData.startDate).toLocaleDateString()} to ${new Date(reportData.endDate).toLocaleDateString()}
      
      DATA SUMMARY:
- Stats: ${JSON.stringify(reportData.stats)}
- Objectives: ${JSON.stringify(reportData.objectives)}
- Key Activities(Audit Logs): ${JSON.stringify(reportData.complianceTrail)}
- Task Updates: ${JSON.stringify(reportData.tasks.map((t: any) => ({
        title: t.deliverable,
        updates: reportData.taskAccomplishments?.[t.taskId] || []
      })))
        }
      
      GOALS FOR NARRATIVE:
1. EXPLAIN THE PROGRESS: Summarize what was accomplished during this period, using specific task "updates" as evidence of subtask completion.
      2. HIGHLIGHT ACCOUNTABILITY: Mention key reassignments or status changes.
      3. RIGOR & COMPLIANCE: Note that all activities left a timestamped audit trail.
      4. FORWARD LOOKING: Mention pending or overdue tasks that require attention.

  TONE: Professional, objective, and authoritative.Avoid fluff.Focus on "What was done, by whom, and the impact on objectives".

    FORMAT: 3 - 4 paragraphs of prose.No bullet points.`;
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return cleanAIOutput(response.text());
  } catch (error: any) {
    console.error('Error in generateReportNarrative:', error);
    return "Error generating narrative. Please review the raw statistics for compliance details.";
  }
}
