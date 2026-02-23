/**
 * Report Service
 *
 * Aggregates data for compliance and activity reporting
 */

import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { listTasks } from './taskManagementService.js';
import { exportAuditLogs } from './auditService.js';
import { listObjectives } from './objectiveService.js';
import { TaskManagement, AuditLog, Objective } from '../models/TaskManagement.js';
import { scrapeUrl } from './urlScraper.js';

const db = getFirestore();

export interface ReportData {
    type: 'monthly' | 'quarterly' | 'project';
    startDate: Date;
    endDate: Date;
    stats: {
        total: number;
        pending: number;
        active: number;
        done: number;
        overdue: number;
    };
    objectives: Array<{
        title: string;
        totalTasks: number;
        status: string;
    }>;
    complianceTrail: AuditLog[];
    tasks: TaskManagement[];
    taskAccomplishments: Record<string, string[]>;
    narrative?: string;
    // DOST Specific Fields
    dostInputs?: {
        quarter: string;
        dateRange: string;
        submissionMonth: string;
        actualAccomplishments: string;
        surveyMetrics: string;
        challenges: string;
        nextQuarterPlans: string;
    };
    crawledContent?: Record<string, string>;
}

/**
 * Generate report data for a specific range
 */
export async function generateReportData(
    startDate: Date,
    endDate: Date,
    type: 'monthly' | 'quarterly' | 'project',
    objectiveId?: string,
    dostInputs?: ReportData['dostInputs'],
    assignee?: string
): Promise<ReportData> {
    // 1. Fetch tasks within or active during the period
    // Note: listTasks doesn't have a direct range filter for all tasks, so we fetch and filter
    const allTasks = await listTasks();

    const filteredTasks = allTasks.filter(task => {
        const taskStart = task.startDate.toDate();
        const taskEnd = task.dueDate.toDate();

        // Strict Business Date Overlap Logic:
        // A task is included if scheduled dates overlap the report period.
        // Overlap Condition: (Task Start <= Period End) AND (Task Due >= Period Start)
        const inDateRange = taskStart <= endDate && taskEnd >= startDate;

        const matchesObjective = objectiveId ? task.objective === objectiveId : true;

        // Matches Assignee (if provided)
        // Supports comma-separated aliases (e.g. "Chan,Chrystian") and partial matching
        // Use optional chaining fallback to prevent errors
        const matchesAssignee = assignee
            ? assignee.split(',').some(alias => (task.assignee || '').toLowerCase().includes(alias.trim().toLowerCase()))
            : true;

        return inDateRange && matchesObjective && matchesAssignee;
    });

    const stats = {
        total: filteredTasks.length,
        pending: filteredTasks.filter(t => t.status === 'Pending').length,
        active: filteredTasks.filter(t => t.status === 'Active').length,
        done: filteredTasks.filter(t => t.status === 'Done').length,
        overdue: filteredTasks.filter(t => {
            const isOverdue = (t.status === 'Pending' || t.status === 'Active') &&
                t.dueDate.toDate() < new Date();
            return isOverdue;
        }).length
    };

    // 2. Fetch objectives
    const objectives = await listObjectives();
    const filteredObjectives = objectiveId
        ? objectives.filter(obj => obj.objectiveId === objectiveId)
        : objectives;

    const reportObjectives = filteredObjectives.map(obj => ({
        title: obj.title,
        description: obj.description,
        totalTasks: obj.tasks.length,
        status: obj.status
    }));

    // 3. Fetch Audit Logs for compliance trail
    const auditLogs = await exportAuditLogs({
        startDate,
        endDate
    });

    // Sub-filter audit logs to ONLY include those for currently active/visible tasks
    // This ensures that deleted tasks (which are not in filteredTasks) never appear in the report
    const validTaskIds = new Set(filteredTasks.map(t => t.taskId));

    const filteredAuditLogs = auditLogs.filter(log => {
        // Only include logs for tasks that are part of the target list
        return validTaskIds.has(log.taskId);
    });

    // Limit audit logs for the report summary
    const complianceTrail = filteredAuditLogs.slice(0, 50);

    // 4. Generate Task Accomplishments Map from Audit Logs
    // This captures user-provided updates, significant status changes, and history
    const taskAccomplishments: Record<string, string[]> = {};

    filteredAuditLogs.forEach(log => {
        // Capture ALL history that might be relevant for the narrative
        // We still filter out pure drag-and-drop noise if it has no semantic meaning,
        // but we want to capture the lifecycle.

        let updateNote = '';

        // 1. Capture user comments/reasons ONLY
        // We exclude system-generated messages to keep the report clean and focused on user-written updates
        const reason = log.reason || '';
        const isSystemMessage =
            reason.startsWith('Ref:') ||
            reason === 'Task created' ||
            reason === 'Task deleted' ||
            reason.startsWith('Linked to task') ||
            reason.startsWith('Unlinked from task') ||
            reason.includes('via drag-and-drop');

        if (log.reason && !isSystemMessage) {
            updateNote = log.reason;
        }

        // 2. (REMOVED) Status Changes
        // 3. (REMOVED) Content Updates

        if (updateNote) {
            if (!taskAccomplishments[log.taskId]) {
                taskAccomplishments[log.taskId] = [];
            }
            // Simple deduplication
            if (!taskAccomplishments[log.taskId].includes(updateNote)) {
                taskAccomplishments[log.taskId].push(updateNote);
            }
        }
    });

    // 5. [NEW] Crawl URLs from Evidence
    const crawledContent: Record<string, string> = {};

    // We limit crawling to avoid 30s timeout issues. 
    // Optimization: Only crawl if evidence looks like a URL.
    const tasksWithUrls = filteredTasks.filter(t =>
        typeof t.evidence === 'string' && t.evidence.startsWith('http')
    );

    // Process in parallel with concurrency limit (e.g., 5 at a time)
    // For now, simple Promise.all is fine for small batches.
    const crawlPromises = tasksWithUrls.map(async (task) => {
        if (typeof task.evidence === 'string') {
            const content = await scrapeUrl(task.evidence);
            if (content) {
                // Truncate to reasonable length for context (e.g. 2000 chars per task)
                crawledContent[task.taskId] = content.substring(0, 2000);
            }
        }
    });

    await Promise.all(crawlPromises);

    return {
        type,
        startDate,
        endDate,
        stats,
        objectives: reportObjectives,
        complianceTrail,
        tasks: filteredTasks,
        taskAccomplishments,
        dostInputs,
        crawledContent
    };
}
