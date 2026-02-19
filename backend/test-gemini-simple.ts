
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

async function tryModel(modelName: string) {
    console.log(`\nTesting: ${modelName}`);
    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Hi');
        console.log(`✅ Success! Response: ${await result.response.text()}`);
        return true;
    } catch (error: any) {
        console.log(`❌ Failed: ${error.message}`);
        return false;
    }
}

async function main() {
    const models = [
        'gemini-1.5-flash',
        'models/gemini-1.5-flash',
        'gemini-2.0-flash-exp',
        'models/gemini-2.0-flash-exp',
        'gemini-pro',
        'models/gemini-pro',
        'gemini-1.0-pro',
    ];

    for (const m of models) {
        if (await tryModel(m)) break;
    }
}

main();
