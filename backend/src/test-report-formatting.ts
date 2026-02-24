import dotenv from 'dotenv';
import { generateReportNarrative } from './services/aiService.js';

dotenv.config();

async function runTest() {
    console.log('Starting Report Output Formatting Test...');

    const mockData: any = {
        // DOST Input triggers the specific prompt with PHASE headers
        dostInputs: {
            quarter: 'First',
            dateRange: '2025-01-01 to 2025-03-31',
            submissionMonth: 'April 2025',
            challenges: 'None',
            nextQuarterPlans: 'None',
            actualAccomplishments: 'None',
            surveyMetrics: 'None'
        },
        type: 'quarterly',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-03-31'),
        stats: { total: 5, pending: 0, active: 0, done: 5, overdue: 0 },
        objectives: [],
        complianceTrail: [],
        tasks: [],
        taskAccomplishments: {},
        crawledContent: {}
    };

    try {
        const { narrative } = await generateReportNarrative(mockData);
        console.log('\n=== GENERATED REPORT START ===\n');
        console.log(narrative);
        console.log('\n=== GENERATED REPORT END ===\n');

        let failure = false;

        // Check for "PHASE" artifacts
        if (narrative.match(/^PHASE \d+:/m)) {
            console.error('FAIL: Found "PHASE X:" header in output.');
            failure = true;
        }

        // Check for "***" artifacts
        if (narrative.includes('***')) {
            console.error('FAIL: Found "***" artifacts in output.');
            failure = true;
        }

        if (!failure) {
            console.log('PASS: No forbidden artifacts found.');
        } else {
            console.log('TEST FAILED: Clean up required.');
        }

    } catch (error) {
        console.error('Error running test:', error);
    }
}

runTest();
