
import dotenv from 'dotenv';
import { generateReportNarrative } from './services/aiService.js';
// We mock types to avoid complex dependencies in this simple test script
// import { ReportData } from './services/reportService.js';

dotenv.config();

async function runTest() {
    console.log('Starting Report Generation Test with Crawled Content...');

    const mockData: any = {
        type: 'quarterly',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-03-31'),
        stats: {
            total: 5,
            pending: 0,
            active: 0,
            done: 5,
            overdue: 0
        },
        objectives: [
            {
                title: 'Objective 1: Test Crawling',
                totalTasks: 5,
                status: 'On Track'
            }
        ],
        complianceTrail: [],
        tasks: [
            {
                taskId: 'task-1',
                description: 'Analysis of Competency Framework',
                dueDate: '2025-02-15', // Simulating a date string or object
                startDate: '2025-02-01',
                status: 'Done',
                evidence: 'http://example.com/doc',
                objective: 'Objective 1: Test Crawling',
                title: 'Competency Framework Analysis',
                deliverable: 'Competency Framework Report',
                tags: []
            }
        ],
        taskAccomplishments: {
            'task-1': ['Draft completed', 'Review finished']
        },
        crawledContent: {
            'task-1': 'EVIDENCE CONTENT: The Competency Framework for TTOs focuses on 5 key pillars: Technical Proficiency, Strategic Management, Legal Compliance, Communication, and Ethics. Detailed analysis shows a gap in Strategic Management skills across 45% of surveyed officers. Recommendation: Implement a targeted training module on IP Strategy by Q2.'
        }
    };

    try {
        const narrative = await generateReportNarrative(mockData);
        console.log('\n=== GENERATED REPORT ===\n');
        console.log(narrative);
        console.log('\n=== END REPORT ===\n');

        let pass = true;
        // Simple validation
        if (narrative.includes('5 key pillars') || narrative.includes('Strategic Management')) {
            console.log('SUCCESS: Generated report snippet contains crawled content details.');
        } else {
            console.warn('WARNING: Generated report snippet DOES NOT contain specific crawled content details.');
            pass = false;
        }

        // Check for SPECIFIC SUBTASK HEADERS in bullets (mapped from taskAccomplishments)
        if (narrative.includes('Draft completed') || narrative.includes('Review finished')) {
            console.log('SUCCESS: Subtask headers found in bullet points (Direct mapping from logs).');
        } else {
            console.error('FAIL: Detailed subtask headers (e.g., "Draft completed") NOT found.');
            pass = false;
        }

        // Check for sub-chapters format (2.1.1 or similar deep nesting)
        if (narrative.includes('2.1.1') || narrative.match(/\d\.\d\.\d/)) {
            console.log('SUCCESS: Sub-chapters detected (e.g. 2.1.1).');
        } else {
            console.warn('WARNING: No sub-chapters (e.g. 2.1.1) detected.');
            pass = false;
        }

        // Check for FORBIDDEN level 4 headers
        if (narrative.match(/\d\.\d\.\d\.\d/)) {
            console.error('FAIL: Found level 4 header (e.g., 2.1.1.1). This should be a bullet point.');
            pass = false;
        } else {
            console.log('SUCCESS: No level 4 headers found.');
        }

        // Check for bullet points in sub-chapters
        if (narrative.includes('* **') || narrative.includes('- **')) {
            console.log('SUCCESS: Bold bullet points detected.');
        } else {
            console.warn('WARNING: No bold bullet points detected (might differ based on AI choice).');
        }

        if (pass) {
            console.log('OVERALL TEST RESULT: PASS');
        } else {
            console.log('OVERALL TEST RESULT: FAIL (but could be acceptable variability)');
        }

    } catch (error) {
        console.error('Error running test:', error);
    }
}

runTest();
