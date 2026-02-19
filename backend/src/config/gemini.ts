/**
 * Google Gemini AI Configuration
 *
 * Setup for Gemini API integration
 * Used for AI-assisted task extraction and design proposals
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn('⚠️  GEMINI_API_KEY not found in environment variables');
  console.warn('   AI features will not be available until API key is configured');
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

/**
 * Gemini Model Configuration
 * Using gemini-2.0-flash-exp for latest performance and capability
 */
export const geminiModel = genAI
  ? genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      temperature: 0.7, // Balanced creativity vs consistency
      topP: 0.9,
      maxOutputTokens: 8192,
    },
  })
  : null;

/**
 * Call Gemini API with a prompt
 * Returns AI-generated text response
 */
export async function callGemini(prompt: string): Promise<string> {
  if (!geminiModel) {
    throw new Error('Gemini API is not configured. Please set GEMINI_API_KEY in environment variables.');
  }

  try {
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error: any) {
    console.error('Gemini API error:', error.message);
    throw new Error(`Failed to call Gemini API: ${error.message}`);
  }
}

/**
 * Check if Gemini API is available
 */
export function isGeminiAvailable(): boolean {
  return geminiModel !== null;
}
