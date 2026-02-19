import express from 'express';
import { getTrixieResponse, analyzeSentiment } from '../services/aiService.js';
import { logInteraction, getRecentInteractions, getOrCreateUser } from '../services/firebaseService.js';
import { inferUserState } from '../services/userStateService.js';
import { ChatRequest, ChatResponse } from '../models/index.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { message, userId, responseStartTime }: ChatRequest = req.body;

    if (!message || !userId) {
      return res.status(400).json({ error: 'Message and userId are required' });
    }

    // Ensure user exists
    await getOrCreateUser(userId);

    // Calculate response latency
    const responseLatencyMs = responseStartTime ? Date.now() - responseStartTime : 0;

    // Analyze sentiment
    const sentimentScore = await analyzeSentiment(message);

    // Log user interaction
    await logInteraction({
      userId,
      message,
      sender: 'user',
      sentimentScore,
      responseLatencyMs,
      timestamp: null as any,
    } as any);

    // Get recent conversation history
    const conversationHistory = await getRecentInteractions(userId, 10);

    // Infer current user state
    const userState = await inferUserState(userId);

    // Get Trixie's response
    const trixieMessage = await getTrixieResponse(conversationHistory, userState, message);

    // Log Trixie's response
    await logInteraction({
      userId,
      message: trixieMessage,
      sender: 'trixie',
      sentimentScore: 0,
      responseLatencyMs: 0,
      timestamp: null as any,
    } as any);

    const response: ChatResponse = {
      response: trixieMessage,
    };

    res.json(response);
  } catch (error) {
    console.error('Chat endpoint error:', error);
    console.error('Chat endpoint error:', error);
    res.status(500).json({ error: 'Failed to process chat message', details: error instanceof Error ? error.message : String(error) });
  }
});

export default router;
