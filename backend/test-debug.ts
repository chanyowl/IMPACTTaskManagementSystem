import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import admin from 'firebase-admin';
import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'fs';

// Setup environment
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('Testing Configuration...');

// Test 1: Firebase
console.log('\n--- 1. Testing Firebase ---');
try {
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './serviceAccountKey.json';
    console.log(`Reading service account from: ${serviceAccountPath}`);

    if (!process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
        console.log('Warning: FIREBASE_SERVICE_ACCOUNT_PATH env var is empty, trying default ./serviceAccountKey.json');
    }

    const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'));
    console.log(`Service account project: ${serviceAccount.project_id}`);

    // Only init if not already (though in this script it's fresh)
    if (admin.apps.length === 0) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
    }

    const db = admin.firestore();
    console.log('Attempting to read from Firestore...');
    const testRef = db.collection('test_debug').doc('test');
    await testRef.set({ timestamp: new Date(), msg: 'Debug test' });
    console.log('✅ Firebase write successful!');
} catch (error: any) {
    console.error('❌ Firebase Error:', error.message);
    if (error.code === 7) {
        console.error('Hint: Firestore API might not be enabled in Google Cloud Console.');
    }
}

// Test 2: Anthropic
console.log('\n--- 2. Testing Anthropic ---');
try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    console.log(`API Key present: ${!!apiKey}`);
    console.log(`API Key prefix: ${apiKey?.substring(0, 10)}...`);

    const anthropic = new Anthropic({ apiKey });

    console.log('Attempting simple completion (Haiku)...');
    try {
        const msg = await anthropic.messages.create({
            model: 'claude-3-haiku-20240307',
            max_tokens: 10,
            messages: [{ role: 'user', content: 'Say hello' }]
        });
        console.log(`✅ Anthropic Haiku Response: ${(msg.content[0] as any).text}`);
    } catch (e: any) {
        console.log(`❌ Haiku-3 Failed: ${e.message}`);
    }

    console.log('Attempting simple completion (Sonnet 3.5)...');
    try {
        const msg2 = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 10,
            messages: [{ role: 'user', content: 'Say hello' }]
        });
        console.log(`✅ Anthropic Sonnet 3.5 Response: ${(msg2.content[0] as any).text}`);
    } catch (e: any) {
        console.log(`❌ Sonnet 3.5 Failed: ${e.message}`);
    }

    console.log('Attempting simple completion (Sonnet 3.0)...');
    try {
        const msg3 = await anthropic.messages.create({
            model: 'claude-3-sonnet-20240229',
            max_tokens: 10,
            messages: [{ role: 'user', content: 'Say hello' }]
        });
        console.log(`✅ Anthropic Sonnet 3.0 Response: ${(msg3.content[0] as any).text}`);
    } catch (e: any) {
        console.log(`❌ Sonnet 3.0 Failed: ${e.message}`);
    }
} catch (error: any) {
    console.error('❌ Anthropic Error:', error.message);
    console.error('Full config:', error);
}

console.log('\nDone.');
process.exit(0);
