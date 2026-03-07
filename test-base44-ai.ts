import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local explicitly since we are running outside Next.js
config({ path: resolve(process.cwd(), '.env.local') });

import { generateAIResponse } from './lib/ai';

async function testBase44Tools() {
    console.log("Testing AI's ability to fetch Base44 Patients...");
    try {
        const response = await generateAIResponse(
            "Fetch all patient records from the base44 database and tell me the name of the first patient you find."
        );
        console.log("AI Response:\n", response);
    } catch (e) {
        console.error("Test failed:", e);
    }
}

testBase44Tools();

