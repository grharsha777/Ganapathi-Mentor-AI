import { config } from 'dotenv';
import { InferenceClient } from '@huggingface/inference';

config({ path: '.env.local' });
config();

const HF_TOKEN = process.env.HUGGINGFACE_API_KEY || process.env.HF_TOKEN;

async function testHF() {
    if (!HF_TOKEN) {
        console.log("❌ HF_TOKEN not found in environment.");
        process.exit(1);
    }

    console.log("Initializing HF Client...");
    const client = new InferenceClient(HF_TOKEN);

    try {
        console.log("Testing Gemma-3 Chat Completion...");
        const chatStream = client.chatCompletionStream({
            model: "google/gemma-3-27b-it:featherless-ai",
            messages: [{ role: "user", content: "Say 'Hugging Face API is working!'" }]
        });

        let output = "";
        for await (const chunk of chatStream) {
            output += chunk.choices[0]?.delta?.content || "";
        }
        console.log("✅ Chat Output:", output);
    } catch (e: any) {
        console.log("❌ Chat Error:", e.message);
    }
}

testHF();
