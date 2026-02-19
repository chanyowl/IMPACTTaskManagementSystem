
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    try {
        // There isn't a direct listModels on the client instance in some versions, 
        // but let's try a direct fetch if sdk doesn't expose it easily or just try a standard one.

        // Actually, let's just try 'gemini-1.0-pro' which is often the robust default if 'gemini-pro' failed.
        // But wait, the error said "models/gemini-1.5-flash is not found". 

        // Let's try running a generation with 'gemini-1.0-pro'

        console.log('Trying gemini-1.0-pro...');
        const model = genAI.getGenerativeModel({ model: 'gemini-1.0-pro' });
        const result = await model.generateContent('hello');
        console.log('Success with gemini-1.0-pro:', await result.response.text());

    } catch (error) {
        console.error('Error:', error.message);
    }
}

listModels();
