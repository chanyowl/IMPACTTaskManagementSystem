/**
 * Reports Routes
 *
 * API endpoints for report generation and narrative preview
 */

import express, { Request, Response } from 'express';
import { generateReportData } from '../services/reportService.js';
import { generateReportNarrative } from '../services/aiService.js';

const router = express.Router();

/**
 * GET /api/reports/preview
 * Aggregates data and generates an AI narrative preview
 */
// Shared logic for generating preview
const handlePreviewRequest = async (req: Request, res: Response) => {
    try {
        // Support both query params (GET) and body (POST)
        const type = (req.body?.type || req.query.type) as 'monthly' | 'quarterly' | 'project' || 'monthly';
        const startDateRaw = (req.body?.startDate || req.query.startDate) as string;
        const endDateRaw = (req.body?.endDate || req.query.endDate) as string;
        const objectiveId = (req.body?.objectiveId || req.query.objectiveId) as string;
        const assignee = (req.body?.assignee || req.query.assignee) as string;
        const dostInputs = req.body?.dostInputs; // Only available in POST/body

        if (!startDateRaw || !endDateRaw) {
            return res.status(400).json({
                success: false,
                error: 'startDate and endDate are required'
            });
        }

        const startDate = new Date(startDateRaw);
        const endDate = new Date(endDateRaw);
        // Set end date to end of day to be inclusive
        endDate.setHours(23, 59, 59, 999);

        // 1. Generate core report data
        const reportData = await generateReportData(startDate, endDate, type, objectiveId, dostInputs, assignee);

        // 2. Generate AI narrative
        const narrative = await generateReportNarrative(reportData);

        res.json({
            success: true,
            report: {
                ...reportData,
                narrative
            }
        });
    } catch (error: any) {
        console.error('Error generating report preview:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to generate report preview',
        });
    }
};

router.get('/preview', handlePreviewRequest);
router.post('/preview', handlePreviewRequest);

/**
 * GET /api/reports/export
 * Downloads the report as a structured Markdown file
 */
router.get('/export', async (req: Request, res: Response) => {
    try {
        const type = (req.query.type as 'monthly' | 'quarterly' | 'project') || 'monthly';
        const startDateRaw = req.query.startDate as string;
        const endDateRaw = req.query.endDate as string;
        const objectiveId = req.query.objectiveId as string;
        const assignee = req.query.assignee as string;

        const startDate = new Date(startDateRaw);
        const endDate = new Date(endDateRaw);
        // Set end date to end of day to be inclusive
        endDate.setHours(23, 59, 59, 999);

        const reportData = await generateReportData(startDate, endDate, type, objectiveId, undefined, assignee);
        const narrative = await generateReportNarrative(reportData);

        const filename = `${type}-report-${startDateRaw}.md`;

        // Generate Markdown content
        let markdown = `# ${type.toUpperCase()} REPORT\n`;
        markdown += `Period: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}\n\n`;

        markdown += `## 1. Executive Summary / Activity Narrative\n`;
        markdown += `${narrative}\n\n`;

        markdown += `## 2. Quantitative Performance\n`;
        markdown += `- Total Tasks Managed: ${reportData.stats.total}\n`;
        markdown += `- Completed Tasks: ${reportData.stats.done}\n`;
        markdown += `- Active Tasks: ${reportData.stats.active}\n`;
        markdown += `- Pending Tasks: ${reportData.stats.pending}\n`;
        markdown += `- Overdue Tasks: ${reportData.stats.overdue}\n\n`;

        markdown += `## 3. Compliance & Audit Trail (Recent Activity)\n`;
        markdown += `The following activities have been logged for audit readiness:\n\n`;

        reportData.complianceTrail.forEach(log => {
            const date = log.timestamp.toDate().toLocaleString();
            markdown += `- [${date}] User ${log.userId.substring(0, 8)} performed action: **${log.action}** on task ${log.taskId.substring(0, 8)}\n`;
        });

        res.setHeader('Content-Type', 'text/markdown');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        res.send(markdown);

    } catch (error: any) {
        console.error('Error exporting report:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to export report'
        });
    }
});

export default router;
