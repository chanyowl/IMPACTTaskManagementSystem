import express from 'express';
import { parseAndCreateTasks } from '../services/taskParser.js';
import { getTasks, updateTask, getOrCreateUser } from '../services/firebaseService.js';
import { suggestTask } from '../services/recommendationService.js';
import { inferUserState } from '../services/userStateService.js';
import { TaskExtractRequest, TaskFeedback } from '../models/index.js';

const router = express.Router();

// Extract and create tasks from text
router.post('/extract', async (req, res) => {
  try {
    const { text, userId }: TaskExtractRequest = req.body;

    if (!text || !userId) {
      return res.status(400).json({ error: 'Text and userId are required' });
    }

    // Ensure user exists
    await getOrCreateUser(userId);

    // Parse and create tasks
    const tasks = await parseAndCreateTasks(text, userId);

    res.json({ tasks });
  } catch (error) {
    console.error('Task extraction error:', error);
    res.status(500).json({ error: 'Failed to extract tasks' });
  }
});

// Get tasks for a user
router.get('/', async (req, res) => {
  try {
    const { userId, status } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const tasks = await getTasks(userId as string, status as string);

    res.json({ tasks });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Get task suggestion
router.get('/suggest', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Infer user state
    const userState = await inferUserState(userId as string);

    // Get suggestion
    const suggestion = await suggestTask(userId as string, userState);

    if (!suggestion) {
      return res.json({ message: 'No tasks available' });
    }

    res.json(suggestion);
  } catch (error) {
    console.error('Task suggestion error:', error);
    res.status(500).json({ error: 'Failed to suggest task' });
  }
});

// Provide feedback on a task
router.post('/:taskId/feedback', async (req, res) => {
  try {
    const { taskId } = req.params;
    const { action, reason }: TaskFeedback = req.body;

    if (!action) {
      return res.status(400).json({ error: 'Action is required' });
    }

    // Update task based on action
    if (action === 'accept') {
      await updateTask(taskId, { status: 'completed' });
    } else if (action === 'snooze') {
      await updateTask(taskId, {
        status: 'snoozed',
        userResistanceScore: 0.5, // Increase resistance score
      });
    } else if (action === 'wrong_read') {
      // User corrected our understanding
      // Could update task attributes or user preferences here
      console.log(`Wrong read feedback for task ${taskId}: ${reason}`);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Task feedback error:', error);
    res.status(500).json({ error: 'Failed to process feedback' });
  }
});

// Update task
router.patch('/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    const updates = req.body;

    await updateTask(taskId, updates);

    res.json({ success: true });
  } catch (error) {
    console.error('Task update error:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

export default router;
