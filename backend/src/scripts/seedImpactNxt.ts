import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
// import { createRequire } from 'module';

dotenv.config();

// const require = createRequire(import.meta.url);
const serviceAccount = require('../../serviceAccountKey.json');

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();

const IMPACT_NXT_OBJECTIVE = {
    title: 'IMPACT NXT',
    description: 'IMPACT-NXT Project: Objectives and Targets',
    owner: 'system', // or specific user
    status: 'active',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    createdBy: 'system'
};

const TASKS = [
    // OBJECTIVE 1
    {
        target: '1.1',
        deliverable: 'Target 1.1: Desk research on benchmarks, role of universities/RDIs (and especially TTOs) in innovation value chains',
        status: 'Pending',
        weight: 45
    },
    {
        target: '1.2',
        deliverable: 'Target 1.2: Review/gathering of relevant documents/data for contextualization (PH agenda, laws, initial survey)',
        status: 'Pending',
        weight: 45
    },
    {
        target: '1.3',
        deliverable: 'Target 1.3: Drafting of initial competency framework, for further validation',
        status: 'Pending',
        weight: 45
    },
    {
        target: '1.4',
        deliverable: 'Target 1.4: IMPACT Local Conference',
        status: 'Pending',
        weight: 45
    },
    // OBJECTIVE 2
    {
        target: '2.1',
        deliverable: 'Target 2.1: Creation of TNA tools (Survey instrument)',
        status: 'Pending',
        weight: 20
    },
    {
        target: '2.2',
        deliverable: 'Target 2.2: Pre-TNA Assessment activities (Defining criteria, selection of assessors)',
        status: 'Pending',
        weight: 20
    },
    {
        target: '2.3',
        deliverable: 'Target 2.3: Coordination for TNA Assessment: Actual TNA Assessment (Hiring/Training Assessors, Survey proper)',
        status: 'Pending',
        weight: 20
    },
    {
        target: '2.4',
        deliverable: 'Target 2.4: TNA survey report and writing of TNA Assessment Reports',
        status: 'Pending',
        weight: 20
    },
    {
        target: '2.5',
        deliverable: 'Target 2.5: Initial roll-out of Competency Framework and Philippine TNA tools through 2-day workshops',
        status: 'Pending',
        weight: 20
    },
    {
        target: '2.6',
        deliverable: 'Target 2.6: Coordinating for TNA Assessment: Actual TNA Assessment',
        status: 'Pending',
        weight: 20
    },
    {
        target: '2.7',
        deliverable: 'Target 2.7: Analysis of data from TNA survey report and writing of TNA Assessment Reports (Categorization of personnel)',
        status: 'Pending',
        weight: 20
    },
    // OBJECTIVE 3
    {
        target: '3.1',
        deliverable: 'Target 3.1: Writing of training plans and roadmaps for Level 1, 2, and 3 TTO personnel',
        status: 'Pending',
        weight: 20
    },
    // OBJECTIVE 4
    {
        target: '4.1',
        deliverable: 'Target 4.1: Activity Recommendations for sustaining skills development: Development of Policy Proposal',
        status: 'Pending',
        weight: 15
    }
];

async function seed() {
    try {
        console.log('Seeding IMPACT NXT...');

        // 1. Check if Objective exists, or create it
        const objectivesRef = db.collection('objectives');
        const q = objectivesRef.where('title', '==', 'IMPACT NXT');
        const snapshot = await q.get();

        let objectiveId = '';

        if (snapshot.empty) {
            console.log('Creating new IMPACT NXT Objective...');
            const docRef = objectivesRef.doc();
            objectiveId = docRef.id;
            await docRef.set({
                ...IMPACT_NXT_OBJECTIVE,
                objectiveId: objectiveId,
                tasks: [] // Will identify tasks later
            });
        } else {
            console.log('IMPACT NXT Objective already exists.');
            objectiveId = snapshot.docs[0].id;
        }

        console.log('Objective ID:', objectiveId);

        // 2. Create Tasks
        const tasksRef = db.collection('taskManagement');
        const taskIds = [];

        for (const t of TASKS) {
            // Check if task exists (simple check by deliverable title to avoid dupes)
            const taskQ = tasksRef.where('deliverable', '==', t.deliverable).where('objective', '==', objectiveId);
            const taskSnap = await taskQ.get();

            if (taskSnap.empty) {
                const taskId = uuidv4();
                taskIds.push(taskId);

                const taskData = {
                    taskId: taskId,
                    objective: objectiveId,
                    assignee: 'unassigned', // Default
                    startDate: Timestamp.now(),
                    dueDate: Timestamp.now(), // Default to now, user will update
                    status: 'Pending',
                    deliverable: t.deliverable,
                    evidence: '',
                    tags: ['IMPACT NXT', `Target ${t.target}`],
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now(),
                    createdBy: 'system',
                    lastModifiedBy: 'system'
                };

                await tasksRef.doc(taskId).set(taskData);
                console.log(`Created task: ${t.target}`);
            } else {
                console.log(`Task ${t.target} already exists.`);
                taskIds.push(taskSnap.docs[0].id);
            }
        }

        // 3. Update Objective with Task IDs
        await objectivesRef.doc(objectiveId).update({
            tasks: taskIds
        });

        console.log('Seeding complete!');

    } catch (error) {
        console.error('Error seeding data:', error);
    }
}

seed();
