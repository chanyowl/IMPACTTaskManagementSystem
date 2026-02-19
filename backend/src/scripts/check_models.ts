
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
// const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error('No GEMINI_API_KEY found');
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    try {
        // There isn't a direct "list models" in the easy SDK surface sometimes, 
        // but we can try to generate with a known model to check connection,
        // or use the model endpoint if available via fetch.
        // Actually the SDK might not expose listModels directly in the high level helper.
        // Let's rely on the error message from a known bad model vs a good one.

        // Attempt 1: List models via REST if SDK doesn't support it easily 
        // (SDK usually does but let's just try to fetch it raw to be sure)

        console.log('Checking available models via API...');
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        interface Model {
            name: string;
            displayName: string;
        }

        interface ModelsResponse {
            models?: Model[];
        }

        const data = await response.json() as ModelsResponse;

        if (data.models) {
            console.log('Available Models:');
            data.models.forEach((m: Model) => {
                if (m.name.includes('gemini')) {
                    console.log(`- ${m.name.replace('models/', '')} (${m.displayName})`);
                }
            });
        } else {
            console.log('Could not list models:', JSON.stringify(data, null, 2));
        }

    } catch (error) {
        console.error('Error listing models:', error);
    }
}

listModels();
