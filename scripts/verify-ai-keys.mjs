#!/usr/bin/env node
/**
 * Verify Gemini and Claude API keys work.
 * Run: node scripts/verify-ai-keys.mjs
 * Ensure GEMINI_API_KEY and ANTHROPIC_API_KEY are in .env.local
 */
import { config } from 'dotenv';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createAnthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';

// Load .env.local (Next.js convention), fallback to .env
config({ path: '.env.local' });
config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

async function testGemini() {
  if (!GEMINI_API_KEY) {
    console.log('❌ GEMINI_API_KEY not set in .env.local');
    return false;
  }
  try {
    const model = createGoogleGenerativeAI({ apiKey: GEMINI_API_KEY })('gemini-2.0-flash');
    const { text } = await generateText({
      model,
      prompt: 'Reply with exactly: Gemini OK',
    });
    console.log('✅ Gemini:', text?.trim() || 'Connected');
    return true;
  } catch (e) {
    const msg = e?.message || '';
    if (msg.includes('quota') || msg.includes('rate-limit') || msg.includes('exceeded')) {
      console.log('✅ Gemini: Key valid (quota reached - wait or check ai.google.dev)');
      return true;
    }
    console.log('❌ Gemini failed:', msg);
    return false;
  }
}

async function testClaude() {
  if (!ANTHROPIC_API_KEY) {
    console.log('❌ ANTHROPIC_API_KEY not set in .env.local');
    return false;
  }
  try {
    const model = createAnthropic({ apiKey: ANTHROPIC_API_KEY })('claude-3-5-sonnet-20241022');
    const { text } = await generateText({
      model,
      prompt: 'Reply with exactly: Claude OK',
    });
    console.log('✅ Claude:', text?.trim() || 'Connected');
    return true;
  } catch (e) {
    const msg = e?.message || '';
    if (msg.includes('credit') || msg.includes('too low') || msg.includes('billing')) {
      console.log('✅ Claude: Key valid (add credits at console.anthropic.com)');
      return true;
    }
    console.log('❌ Claude failed:', msg);
    return false;
  }
}

async function main() {
  console.log('Verifying AI API keys...\n');
  const g = await testGemini();
  const c = await testClaude();
  console.log('\n' + (g && c ? 'All keys working.' : 'Some keys failed. Check .env.local'));
  process.exit(g && c ? 0 : 1);
}
main();
