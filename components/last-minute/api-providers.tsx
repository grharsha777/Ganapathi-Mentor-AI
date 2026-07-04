'use client'

import { useState, useMemo, useEffect } from 'react'
import {
    Search, ExternalLink, Key, Shield, Globe, Star, ArrowLeft, Lightbulb, CheckCircle2, Zap, Database, Code2, Network, Sparkles
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { AppLogo } from './app-logo'

/* ─────────────────────────────────────────────────────────── */
/*  IndexedDB Image Blob Cache                                 */
/* ─────────────────────────────────────────────────────────── */
const DB_NAME = 'AntigravityCacheDB';
const STORE_NAME = 'image-blobs';

function getBlobFromIDB(key: string): Promise<string | null> {
    return new Promise((resolve) => {
        const req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = () => req.result.createObjectStore(STORE_NAME);
        req.onsuccess = () => {
            const db = req.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) return resolve(null);
            const tx = db.transaction(STORE_NAME, 'readonly');
            const getReq = tx.objectStore(STORE_NAME).get(key);
            getReq.onsuccess = () => {
                if (getReq.result) {
                    resolve(URL.createObjectURL(getReq.result));
                } else resolve(null);
            };
            getReq.onerror = () => resolve(null);
        };
        req.onerror = () => resolve(null);
    });
}

function saveBlobToIDB(key: string, blob: Blob): Promise<void> {
    return new Promise((resolve) => {
        const req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = () => req.result.createObjectStore(STORE_NAME);
        req.onsuccess = () => {
            const tx = req.result.transaction(STORE_NAME, 'readwrite');
            tx.objectStore(STORE_NAME).put(blob, key);
            tx.oncomplete = () => resolve();
        };
    });
}

/* ─────────────────────────────────────────────────────────── */
/*  Types & Data                                               */
/* ─────────────────────────────────────────────────────────── */

export type ProviderCategory =
    | 'llm'
    | 'image-gen'
    | 'audio-voice'
    | 'dataset'
    | 'inference'
    | 'search-data'
    | 'database-backend'

export interface APIProvider {
    id: string
    name: string
    description: string
    longDescription?: string
    useCases?: string[]
    instructions?: string
    url: string
    apiDocsUrl: string
    category: ProviderCategory
    pricing: 'Free' | 'Freemium' | 'Premium' | 'Free Trial'
    freeCredits?: string
    keyFeatures: string[]
    tags: string[]
    popular?: boolean
}

const PROVIDER_CATEGORIES: Record<ProviderCategory, { label: string; color: string; searchTerms: string }> = {
    'llm': { label: 'Foundation Models', color: '#8b5cf6', searchTerms: 'artificial intelligence neural nexus dark' },
    'inference': { label: 'Inference APIs', color: '#06b6d4', searchTerms: 'server network speed neon dark' },
    'image-gen': { label: 'Image Gen', color: '#ec4899', searchTerms: 'digital art creative neon dark' },
    'audio-voice': { label: 'Audio / Voice', color: '#f59e0b', searchTerms: 'sound wave audio music dark' },
    'search-data': { label: 'Search & Scraping', color: '#10b981', searchTerms: 'data search web network dark' },
    'database-backend': { label: 'Databases & Backend', color: '#3b82f6', searchTerms: 'server database cloud dark' },
    'dataset': { label: 'ML Datasets', color: '#facc15', searchTerms: 'database matrix data flow dark' },
}

export const API_PROVIDERS: APIProvider[] = [
    /* ── LLMs ── */
    {
        id: 'openai', name: 'OpenAI',
        description: 'Industry-leading LLMs, Vision, and Audio models.',
        useCases: ['Customer Support Bots', 'Automatic Content Generation', 'Speech-to-Text Transcription'],
        url: 'https://openai.com', apiDocsUrl: 'https://platform.openai.com/api-keys',
        category: 'llm', pricing: 'Freemium', freeCredits: '$5 free setup',
        keyFeatures: ['GPT-4o & GPT-4 Turbo', 'Function calling', 'Vision'], tags: ['gpt', 'chat'], popular: true,
    },
    {
        id: 'anthropic', name: 'Anthropic',
        description: 'Claude 3.5 Sonnet — excels at logic and coding.',
        url: 'https://anthropic.com', apiDocsUrl: 'https://console.anthropic.com/',
        category: 'llm', pricing: 'Freemium', freeCredits: '$5 free credits',
        keyFeatures: ['200K context window', 'Best-in-class coding', 'Artifacts'], tags: ['claude', 'code'], popular: true,
    },
    {
        id: 'gemini', name: 'Google Gemini',
        description: 'Gemini 2.0 Flash — elite multimodal AI.',
        url: 'https://ai.google.dev', apiDocsUrl: 'https://aistudio.google.com/apikey',
        category: 'llm', pricing: 'Free', freeCredits: '15 RPM free forever',
        keyFeatures: ['2M token context', 'Native Multimodal input'], tags: ['gemini', 'multimodal'], popular: true,
    },
    {
        id: 'grok', name: 'xAI (Grok)',
        description: 'Grok-2 with real-time Twitter/X access.',
        url: 'https://x.ai', apiDocsUrl: 'https://console.x.ai/',
        category: 'llm', pricing: 'Freemium', freeCredits: '$25 free credits/month',
        keyFeatures: ['Real-time X data', 'Vision capabilities'], tags: ['grok', 'realtime'], popular: true,
    },
    {
        id: 'moonshot', name: 'Kimi (Moonshot)',
        description: 'Kimi models for massive long-context comprehension.',
        url: 'https://moonshot.cn', apiDocsUrl: 'https://platform.moonshot.cn/console/api-keys',
        category: 'llm', pricing: 'Freemium', freeCredits: 'Generous initial credits',
        keyFeatures: ['Ultra-long context parsing', 'Chinese/English dominance'], tags: ['kimi', 'moonshot'], popular: true,
    },
    {
        id: 'qwen', name: 'Qwen (Alibaba)',
        description: 'Qwen 2.5 - Open-weights giant competing with GPT-4.',
        url: 'https://qwenlm.github.io', apiDocsUrl: 'https://bailian.console.aliyun.com/',
        category: 'llm', pricing: 'Freemium', freeCredits: 'Millions of free tokens',
        keyFeatures: ['Elite Math/Coding', 'Open weights', 'Multilingual'], tags: ['qwen', 'open-weights'], popular: true,
    },
    {
        id: 'mistral-api', name: 'Mistral AI',
        description: 'European AI powerhouse with great coding models.',
        url: 'https://mistral.ai', apiDocsUrl: 'https://console.mistral.ai/api-keys/',
        category: 'llm', pricing: 'Freemium', freeCredits: 'Free tier available',
        keyFeatures: ['Codestral for coding', 'Mistral Large 2', 'JSON mode'], tags: ['mistral', 'code', 'european'], popular: true,
    },
    {
        id: 'deepseek-api', name: 'DeepSeek',
        description: 'DeepSeek V3 & R1 — ultra-low cost reasoning models.',
        url: 'https://deepseek.com', apiDocsUrl: 'https://platform.deepseek.com/api_keys',
        category: 'llm', pricing: 'Freemium', freeCredits: 'Extremely low API costs',
        keyFeatures: ['R1 reasoning model', 'Code generation', 'Low cost'], tags: ['cheap', 'coding', 'reasoning'], popular: true,
    },
    {
        id: 'ollama-api', name: 'Ollama',
        description: 'Run LLMs locally — Llama, Mistral, Phi. 100% free.',
        url: 'https://ollama.com', apiDocsUrl: 'https://ollama.com/download',
        category: 'llm', pricing: 'Free', freeCredits: 'Completely free',
        keyFeatures: ['Run locally', 'No API key needed', 'GPU acceleration'], tags: ['local', 'free', 'private'], popular: true,
    },

    /* ── Image & Video Gen ── */
    {
        id: 'freepik-api', name: 'Freepik AI',
        description: 'High-quality AI image generation, stock photos, and vectors.',
        url: 'https://freepik.com', apiDocsUrl: 'https://www.freepik.com/api',
        category: 'image-gen', pricing: 'Freemium', freeCredits: 'Free tier available',
        keyFeatures: ['AI image generation', 'Stock photos', 'Vectors'], tags: ['stock', 'vectors', 'ai-image'], popular: true,
    },
    {
        id: 'stability-api', name: 'Stability AI',
        description: 'Stable Diffusion 3, SDXL — image generation API.',
        url: 'https://stability.ai', apiDocsUrl: 'https://platform.stability.ai/account/keys',
        category: 'image-gen', pricing: 'Freemium', freeCredits: '25 free credits initially',
        keyFeatures: ['SD3 & SDXL models', 'Inpainting', 'Image-to-image'], tags: ['stable-diffusion', 'image'], popular: true,
    },
    {
        id: 'midjourney-api', name: 'Midjourney',
        description: 'Best-in-class AI art generation.',
        url: 'https://midjourney.com', apiDocsUrl: 'https://docs.midjourney.com/',
        category: 'image-gen', pricing: 'Premium',
        keyFeatures: ['Photorealistic outputs', 'Upscaling', 'Variations'], tags: ['art', 'premium'],
    },

    /* ── Audio & Voice ── */
    {
        id: 'elevenlabs-api', name: 'ElevenLabs',
        description: 'Realistic AI text-to-speech & voice cloning.',
        url: 'https://elevenlabs.io', apiDocsUrl: 'https://elevenlabs.io/app/settings/api-keys',
        category: 'audio-voice', pricing: 'Freemium', freeCredits: '10K chars/month free',
        keyFeatures: ['Voice cloning', '29 languages', 'Sound effects'], tags: ['tts', 'voice-clone'], popular: true,
    },
    {
        id: 'suno-api', name: 'Suno AI',
        description: 'AI music generation — create full songs.',
        url: 'https://suno.com', apiDocsUrl: 'https://suno.com/',
        category: 'audio-voice', pricing: 'Freemium', freeCredits: '5 songs/day free',
        keyFeatures: ['Full song generation', 'Vocals + instruments'], tags: ['music', 'vocals'], popular: true,
    },
    {
        id: 'murf-api', name: 'Murf AI',
        description: 'Studio-quality voiceovers in minutes.',
        url: 'https://murf.ai', apiDocsUrl: 'https://murf.ai/api',
        category: 'audio-voice', pricing: 'Freemium', freeCredits: '10 mins of voice generation free',
        keyFeatures: ['120+ Text to Speech voices', 'Voice Cloning'], tags: ['tts', 'voice'], popular: true,
    },

    /* ── Inference Hubs & Infrastructure ── */
    {
        id: 'nvidia-nim', name: 'NVIDIA NIM',
        description: 'Run optimized AI models on NVIDIA GPUs.',
        url: 'https://build.nvidia.com', apiDocsUrl: 'https://build.nvidia.com/explore/discover',
        category: 'inference', pricing: 'Free', freeCredits: '1000 free calls',
        keyFeatures: ['TensorRT optimized', 'Llama 3.1 405B'], tags: ['nvidia', 'gpu'], popular: true,
    },
    {
        id: 'sarvam-api', name: 'Sarvam AI',
        description: 'India-first AI — Indic language translation and TTS.',
        url: 'https://sarvam.ai', apiDocsUrl: 'https://dashboard.sarvam.ai/',
        category: 'inference', pricing: 'Freemium', freeCredits: 'Free tier available',
        keyFeatures: ['10+ Indian languages', 'Saarika TTS', 'Translation'], tags: ['indic', 'hindi'], popular: true,
    },
    {
        id: 'groq', name: 'Groq',
        description: 'LPU-powered blazing fast inference (800+ tokens/s).',
        url: 'https://groq.com', apiDocsUrl: 'https://console.groq.com/keys',
        category: 'inference', pricing: 'Free', freeCredits: 'Generous free tier',
        keyFeatures: ['800+ tokens/sec', 'OpenAI-compatible API'], tags: ['fast', 'free', 'llama'], popular: true,
    },
    {
        id: 'together-ai', name: 'Together AI',
        description: 'Fastest cloud inference for 100+ open-source models.',
        url: 'https://together.ai', apiDocsUrl: 'https://api.together.ai/settings/api-keys',
        category: 'inference', pricing: 'Freemium', freeCredits: '$5 free credits',
        keyFeatures: ['Llama 3, Mixtral, Qwen', 'Fine-tuning platform'], tags: ['open-source', 'inference'], popular: true,
    },
    {
        id: 'huggingface', name: 'Hugging Face API',
        description: 'Inference Endpoints for basically every model on Earth.',
        url: 'https://huggingface.co', apiDocsUrl: 'https://huggingface.co/settings/tokens',
        category: 'inference', pricing: 'Freemium', freeCredits: 'Free serverless inference limit',
        keyFeatures: ['Serverless Inference API', 'Seamless integrations'], tags: ['hf', 'transformers'], popular: true,
    },
    {
        id: 'replicate', name: 'Replicate',
        description: 'Run open-source models with one line of code.',
        url: 'https://replicate.com', apiDocsUrl: 'https://replicate.com/account/api-tokens',
        category: 'inference', pricing: 'Premium', 
        keyFeatures: ['Runs SDXL, Whisper, Llama', 'Pay per second'], tags: ['docker', 'image-models'], popular: true,
    },

    /* ── Search & Scraping ── */
    {
        id: 'tavily', name: 'Tavily API',
        description: 'The search engine built specifically for AI Agents.',
        url: 'https://tavily.com', apiDocsUrl: 'https://app.tavily.com/home',
        category: 'search-data', pricing: 'Freemium', freeCredits: '1,000 free searches/month',
        keyFeatures: ['AI Agent Search', 'Real-time data', 'RAG optimized'], tags: ['search', 'agents', 'rag'], popular: true,
    },
    {
        id: 'firecrawl', name: 'Firecrawl',
        description: 'Turn any website into LLM-ready markdown instantly.',
        url: 'https://firecrawl.dev', apiDocsUrl: 'https://www.firecrawl.dev/app/api-keys',
        category: 'search-data', pricing: 'Freemium', freeCredits: '500 free pages/month',
        keyFeatures: ['Markdown extraction', 'Crawling', 'JS Rendering'], tags: ['scrape', 'markdown', 'web'], popular: true,
    },
    {
        id: 'newsapi', name: 'News API',
        description: 'Access worldwide news articles in real-time.',
        url: 'https://newsapi.org', apiDocsUrl: 'https://newsapi.org/register',
        category: 'search-data', pricing: 'Free', freeCredits: '100 requests/day',
        keyFeatures: ['80,000+ sources', 'Real-time headlines'], tags: ['news', 'media'], popular: true,
    },
    {
        id: 'serpapi', name: 'SerpAPI',
        description: 'Google Search results API — scrape SERP data.',
        url: 'https://serpapi.com', apiDocsUrl: 'https://serpapi.com/manage-api-key',
        category: 'search-data', pricing: 'Freemium', freeCredits: '100 free searches/month',
        keyFeatures: ['Google SERP data', 'Image search'], tags: ['google', 'serp'],
    },

    /* ── Databases & Backend ── */
    {
        id: 'pinecone', name: 'Pinecone',
        description: 'Serverless Vector Database for AI Search & RAG.',
        url: 'https://pinecone.io', apiDocsUrl: 'https://app.pinecone.io/',
        category: 'database-backend', pricing: 'Freemium', freeCredits: '1 free Serverless index',
        keyFeatures: ['Vector matching', 'Low latency', 'Serverless API'], tags: ['vector', 'database', 'rag'], popular: true,
    },
    {
        id: 'qdrant', name: 'Qdrant',
        description: 'High-performance, massive-scale Vector Database.',
        url: 'https://qdrant.tech', apiDocsUrl: 'https://cloud.qdrant.io/',
        category: 'database-backend', pricing: 'Freemium', freeCredits: '1GB free cloud tier',
        keyFeatures: ['Vector DB', 'Rust backend', 'Local docker'], tags: ['vector', 'rust'],
    },

    /* ── ML Datasets ── */
    {
        id: 'kaggle', name: 'Kaggle Datasets',
        description: 'The world\'s largest machine learning dataset community.',
        instructions: '1. Create a Kaggle account.\n2. Navigate to Account settings.\n3. Click "Create New Token" to download `kaggle.json`.\n4. Use the Kaggle CLI to import datasets directly.',
        longDescription: 'Kaggle provides massive high-quality datasets for almost any domain. Integrating the Kaggle API allows you to automatically pull gigabytes of training data directly into your colab or local environment.',
        useCases: ['Model Training', 'Data Science Hackathons', 'Financial Modeling'],
        url: 'https://www.kaggle.com/datasets', apiDocsUrl: 'https://www.kaggle.com/docs/api',
        category: 'dataset', pricing: 'Free', freeCredits: '100% Free',
        keyFeatures: ['500,000+ Datasets', 'Kaggle CLI Integration', 'Pre-cleaned CSVs/Images'], tags: ['data', 'ml', 'csv'], popular: true,
    },
    {
        id: 'hf-datasets', name: 'HF Datasets',
        description: 'Hugging Face Datasets library for instant NLP access.',
        longDescription: 'The `datasets` library provides a unified API for downloading and preparing datasets optimized for deep learning. Specifically incredible for NLP and Vision tasks.',
        useCases: ['Fine-tuning LLMs', 'Benchmarking Models'],
        url: 'https://huggingface.co/datasets', apiDocsUrl: 'https://huggingface.co/docs/datasets/',
        category: 'dataset', pricing: 'Free', freeCredits: '100% Free',
        keyFeatures: ['`load_dataset()` integration', 'Memory mapped caching', 'Extremely fast parsing'], tags: ['nlp', 'vision', 'training'], popular: true,
    },
    {
        id: 'paperswithcode', name: 'Papers With Code',
        description: 'Datasets linked directly to the academic papers that created them.',
        useCases: ['Reproducing Papers', 'State of the Art Benchmarking'],
        url: 'https://paperswithcode.com/datasets', apiDocsUrl: 'https://paperswithcode.com/datasets',
        category: 'dataset', pricing: 'Free',
        keyFeatures: ['Code implementations', 'Benchmark rankings'], tags: ['academic', 'sota'],
    },
    {
        id: 'aws-open-data', name: 'AWS Open Data',
        description: 'Massive exabyte-scale open data sets hosted natively on S3.',
        useCases: ['Climate Modeling', 'Genomics analysis', 'Satellite Imagery processing'],
        url: 'https://registry.opendata.aws/', apiDocsUrl: 'https://aws.amazon.com/opendata/',
        category: 'dataset', pricing: 'Free',
        keyFeatures: ['Free S3 buckets', 'Exabyte scale data', 'No AWS account needed to pull'], tags: ['aws', 's3', 'satellite'], popular: true,
    },
    {
        id: 'openml', name: 'OpenML',
        description: 'Open-source platform for sharing machine learning datasets and experiments.',
        useCases: ['Automated Machine Learning', 'Dataset Benchmarking'],
        url: 'https://www.openml.org/', apiDocsUrl: 'https://docs.openml.org/',
        category: 'dataset', pricing: 'Free', freeCredits: '100% Free',
        keyFeatures: ['Open-source', 'API integrations for Python/R', 'Standardized metrics'], tags: ['open-source', 'ml', 'benchmark'], popular: true,
    },
    {
        id: 'google-dataset-search', name: 'Google Dataset Search',
        description: 'Google Dataset Search for discovering datasets across the web.',
        useCases: ['Academic Research', 'Finding Niche Datasets', 'Data Mining'],
        url: 'https://datasetsearch.research.google.com/', apiDocsUrl: 'https://developers.google.com/search/docs/appearance/structured-data/dataset',
        category: 'dataset', pricing: 'Free', freeCredits: 'Free Search',
        keyFeatures: ['Global Search', 'Schema.org parsing', 'Vast Index'], tags: ['google', 'search', 'discovery'], popular: true,
    },
    {
        id: 'data-world', name: 'Data.World',
        description: 'The cloud-native data catalog and collaborative data workspace.',
        useCases: ['Enterprise Data Cataloging', 'Team Collaboration', 'Open Data Publishing'],
        url: 'https://data.world/', apiDocsUrl: 'https://developer.data.world/',
        category: 'dataset', pricing: 'Freemium', freeCredits: 'Free open data hosting',
        keyFeatures: ['Knowledge Graph', 'SQL/SPARQL queries', 'Integrations'], tags: ['catalog', 'collaboration', 'sql'],
    },
    {
        id: 'snowflake-marketplace', name: 'Snowflake Market',
        description: 'Snowflake Marketplace: Curated NLP, CV, and Tabular ML datasets.',
        useCases: ['Enterprise AI Training', 'IBM ecosystem integrations', 'Data Monetization'],
        url: 'https://www.snowflake.com/en/data-cloud/marketplace/', apiDocsUrl: 'https://docs.snowflake.com/en/user-guide/data-marketplace',
        category: 'dataset', pricing: 'Premium', freeCredits: 'Free trial available',
        keyFeatures: ['Curated NLP & CV', 'IBM ecosystem', 'Live data sharing'], tags: ['snowflake', 'enterprise', 'tabular'], popular: true,
    },
    {
        id: 'figure-eight-appen', name: 'Figure Eight (Appen)',
        description: 'High-quality human-annotated training data for machine learning models.',
        useCases: ['RLHF', 'Computer Vision Annotation', 'Audio Transcription'],
        url: 'https://appen.com/', apiDocsUrl: 'https://appen.com/platform/',
        category: 'dataset', pricing: 'Premium',
        keyFeatures: ['Human-in-the-loop', 'Global crowd', 'Model evaluation'], tags: ['annotation', 'rlhf', 'cv'],
    },
]

/* ─────────────────────────────────────────────────────────── */
/*  IDB-Backed Pexels Background Hook                          */
/* ─────────────────────────────────────────────────────────── */
function useIDBPexelsBackground(category: ProviderCategory, id: string): string | null {
    const [bg, setBg] = useState<string | null>(null)

    useEffect(() => {
        let mounted = true;
        const cacheKey = `pexels_${category}_${id}`

        getBlobFromIDB(cacheKey).then((localUrl: string | null) => {
            if (localUrl && mounted) {
                setBg(localUrl)
                return;
            }
            
            // Not in IDB, fetch from Pexels API
            const catData = PROVIDER_CATEGORIES[category]
            const query = catData?.searchTerms || 'neon technology abstract'
            
            let hash = 0;
            for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
            const page = (Math.abs(hash) % 5) + 1;

            fetch(`/api/assets/pexels?query=${encodeURIComponent(query)}&per_page=1&page=${page}&orientation=landscape`)
                .then(res => res.ok ? res.json() : null)
                .then(async data => {
                    const url = data?.photos?.[0]?.src?.large || data?.photos?.[0]?.src?.medium
                    if (url) {
                        try {
                            const imgRes = await fetch(url)
                            const blob = await imgRes.blob()
                            await saveBlobToIDB(cacheKey, blob)
                            if (mounted) setBg(URL.createObjectURL(blob))
                        } catch (e) {
                            if (mounted) setBg(url) // fallback to string url
                        }
                    }
                }).catch(() => {})
        })

        return () => { mounted = false }
    }, [category, id])

    return bg
}

/* ─────────────────────────────────────────────────────────── */
/*  Provider Tile (Store Style)                                */
/* ─────────────────────────────────────────────────────────── */
function ProviderTile({ provider, onClick }: { provider: APIProvider; onClick: () => void }) {
    const catMeta = PROVIDER_CATEGORIES[provider.category]
    const bgImage = useIDBPexelsBackground(provider.category, provider.id)

    return (
        <div
            onClick={onClick}
            className={cn(
                'group relative rounded-3xl cursor-pointer overflow-hidden',
                'bg-gradient-to-br from-white/[0.04] to-black/60',
                'border border-white/10 hover:border-white/30',
                'transition-all duration-500 ease-out',
                'hover:-translate-y-1.5 hover:shadow-[0_20px_40px_-15px_rgba(139,92,246,0.3)]',
                'w-full flex flex-col h-[260px]'
            )}
        >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500" style={{ backgroundColor: catMeta.color }} />

            {/* Banner Area */}
            <div className="relative w-full h-[120px] flex items-center justify-center overflow-hidden flex-shrink-0">
                {bgImage ? (
                    <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={bgImage} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 group-hover:scale-110 transition-all duration-700" loading="lazy" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                    </>
                ) : (
                    <div className="absolute inset-0" style={{ background: `radial-gradient(circle at top, ${catMeta.color}30, #000 80%)` }} />
                )}

                <div className="absolute w-32 h-32 rounded-full blur-3xl opacity-20 group-hover:opacity-60 transition-opacity duration-700" style={{ backgroundColor: catMeta.color }} />

                <div className="relative z-10 w-16 h-16 rounded-2xl bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-500">
                    <AppLogo toolName={provider.name} toolUrl={provider.url} className="w-10 h-10 drop-shadow-xl" imgClassName="rounded-lg object-contain w-full h-full" />
                </div>
            </div>

            {/* Content Details */}
            <div className="relative p-5 flex flex-col justify-between flex-grow bg-gradient-to-t from-black to-black/80">
                <div>
                    <h3 className="font-black text-lg text-white truncate">{provider.name}</h3>
                    <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: catMeta.color }}>{catMeta.label}</p>
                    <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed">{provider.description}</p>
                </div>
                
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/10">
                    <span className={cn(
                        'text-[10px] font-bold px-2 py-1 rounded bg-white/5 uppercase tracking-wider flex items-center gap-1.5 text-gray-300'
                    )}>
                        {provider.category === 'dataset' ? <Database className="w-3 h-3" /> : <Key className="w-3 h-3" />}
                        {provider.pricing}
                    </span>
                    {provider.popular && <Star className="w-4 h-4 fill-amber-400 text-amber-400 opacity-80 ml-auto shadow-[0_0_10px_rgba(251,191,36,0.5)]" />}
                </div>
            </div>
        </div>
    )
}

/* ─────────────────────────────────────────────────────────── */
/*  Provider Detail Page (Full view overlay)                   */
/* ─────────────────────────────────────────────────────────── */
function ProviderDetailView({ provider, onBack }: { provider: APIProvider; onBack: () => void }) {
    const catMeta = PROVIDER_CATEGORIES[provider.category]
    const bgImage = useIDBPexelsBackground(provider.category, provider.id)
    const isDataset = provider.category === 'dataset'

    return (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 pb-20">
            <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 group bg-white/5 pr-4 pl-2 py-1.5 rounded-full border border-white/10 w-fit">
                <div className="bg-black/50 rounded-full p-1"><ArrowLeft className="h-3 w-3 group-hover:-translate-x-0.5 transition-transform" /></div>
                <span className="text-xs font-bold uppercase tracking-wider">Back to Hub</span>
            </button>

            {/* Hero Section */}
            <div className="relative rounded-[2.5rem] overflow-hidden mb-8 border border-white/10 bg-black min-h-[300px] flex items-end">
                {bgImage ? (
                    <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={bgImage} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-screen" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                    </>
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black" />
                )}

                <div className="absolute top-0 right-0 p-8">
                     <Badge variant="outline" className="border-white/20 bg-black/40 backdrop-blur-xl text-white font-mono tracking-widest px-3 py-1 uppercase">
                         ID: {provider.id}
                     </Badge>
                </div>

                <div className="relative z-10 p-8 flex flex-col sm:flex-row gap-8 items-end sm:items-center w-full">
                    <div className="w-28 h-28 rounded-3xl flex items-center justify-center bg-black/60 backdrop-blur-2xl border border-white/20 shadow-[0_0_40px_rgba(0,0,0,0.8)] flex-shrink-0 relative overflow-hidden group">
                        <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-white to-transparent pointer-events-none" />
                        <AppLogo toolName={provider.name} toolUrl={provider.url} imgClassName="w-16 h-16 drop-shadow-2xl" />
                    </div>

                    <div className="flex-1">
                        <p className="text-sm font-bold tracking-widest uppercase mb-1" style={{ color: catMeta.color }}>
                           {catMeta.label}
                        </p>
                        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tighter drop-shadow-2xl mb-4">{provider.name}</h1>
                        
                        <div className="flex flex-wrap gap-3">
                            <span className="font-bold px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl text-white flex items-center gap-2 text-sm border border-white/10">
                                {isDataset ? <Database className="w-4 h-4"/> : <Key className="w-4 h-4"/>} {provider.pricing}
                            </span>
                            {provider.freeCredits && (
                                <span className="font-bold px-4 py-2 bg-gradient-to-r from-violet-600/30 to-blue-600/30 backdrop-blur-md border border-violet-500/30 text-violet-100 rounded-xl flex items-center gap-2 text-sm">
                                    <Sparkles className="w-4 h-4" /> {provider.freeCredits}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 w-full sm:w-auto">
                        <Button 
                            onClick={() => window.open(provider.apiDocsUrl, '_blank')}
                            size="lg" 
                            className="font-black rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:scale-105 transition-all text-base border-2"
                            style={{ backgroundColor: 'white', color: 'black', borderColor: 'transparent' }}
                        >
                            {isDataset ? 'Access Datasets' : 'Get API Key'} <ExternalLink className="w-4 h-4 ml-2" />
                        </Button>
                        <Button variant="outline" size="lg" className="font-bold rounded-2xl border-white/20 bg-black/50 text-white backdrop-blur-md hover:bg-white/10" onClick={() => window.open(provider.url, '_blank')}>
                            Open Website
                        </Button>
                    </div>
                </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-[#09090b]/80 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
                        <h2 className="text-2xl font-black text-white mb-4 flex items-center gap-3">
                            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/30"><Network className="w-5 h-5"/></div>
                            Overview
                        </h2>
                        <p className="text-gray-300 leading-relaxed text-lg">
                            {provider.longDescription || provider.description}
                        </p>
                        
                        <div className="mt-8">
                            <h3 className="text-xs font-black text-gray-500 mb-4 uppercase tracking-widest">Core Capabilities</h3>
                            <div className="flex flex-wrap gap-2">
                                {provider.keyFeatures.map((f, i) => (
                                    <div key={i} className="px-4 py-2 bg-white/5 border border-white/10 text-white text-sm font-medium rounded-xl flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4" style={{ color: catMeta.color }} /> {f}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#09090b]/80 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
                        <h2 className="text-2xl font-black text-white mb-4 flex items-center gap-3">
                            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30"><Lightbulb className="w-5 h-5"/></div>
                            Developer Use Cases
                        </h2>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {(provider.useCases || ['Production Apps', 'Research Prototyping', 'Hackathons']).map((uc, i) => (
                                <div key={i} className="flex items-center gap-4 p-4 bg-black/60 rounded-2xl border border-white/5">
                                    <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
                                        <Zap className="w-4 h-4" />
                                    </div>
                                    <span className="text-white font-bold">{uc}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="bg-[#09090b]/80 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
                        <h3 className="text-xl font-black text-white mb-6">Integration Guide</h3>
                        <div className="space-y-6">
                            {(provider.instructions || '1. Visit official website\n2. Create an account\n3. Generate your secure API Key or Download CLI').split('\n').map((step, i) => (
                                <div key={i} className="flex gap-4">
                                    <span className="flex-shrink-0 w-8 h-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center font-black text-white text-sm">
                                        {i + 1}
                                    </span>
                                    <span className="mt-1 text-sm font-medium text-gray-300 leading-relaxed">{step.replace(/^\d+\.\s*/, '')}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {isDataset && (
                        <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-3xl p-8 backdrop-blur-xl text-center">
                            <Database className="w-10 h-10 text-indigo-400 mx-auto mb-4" />
                            <h3 className="text-lg font-black text-white mb-2">Massive Datasets</h3>
                            <p className="text-sm text-indigo-200">This provider contains raw ML datasets. Ensure your local environment has sufficient storage before pulling via CLI.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function Badge({ children, className, variant }: any) {
    return <span className={cn('px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2', className)}>{children}</span>
}

/* ─────────────────────────────────────────────────────────── */
/*  Main Panel Tabbed Interface                                */
/* ─────────────────────────────────────────────────────────── */
export function APIProvidersPanel() {
    const [search, setSearch] = useState('')
    const [selectedProvider, setSelectedProvider] = useState<APIProvider | null>(null)
    const [activeTab, setActiveTab] = useState<'apis' | 'datasets'>('apis')

    const filtered = useMemo(() => {
        let base = API_PROVIDERS;
        if (activeTab === 'apis') base = base.filter(p => p.category !== 'dataset')
        if (activeTab === 'datasets') base = base.filter(p => p.category === 'dataset')
        
        if (!search.trim()) return base;
        const q = search.toLowerCase()
        return base.filter(p => 
            p.name.toLowerCase().includes(q) || 
            p.description.toLowerCase().includes(q) || 
            p.tags.some(t => t.toLowerCase().includes(q))
        )
    }, [search, activeTab])

    if (selectedProvider) {
        return <ProviderDetailView provider={selectedProvider} onBack={() => setSelectedProvider(null)} />
    }

    return (
        <div className="space-y-10 pb-10 animate-in fade-in duration-500 pt-4">
            
            <div className="text-center space-y-6 max-w-3xl mx-auto py-8">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-bold shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                    <Globe className="w-4 h-4" /> Developer Connectivity Hub
                </div>
                <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none mt-2">
                    Models & <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500">Datasets</span>
                </h1>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto font-medium mt-4">Equip your applications with the world's most powerful Foundation Models, Inference APIs, and Gigabyte-scale ML datasets.</p>
                
                <div className="flex items-center justify-center gap-3 mt-4 opacity-80 hover:opacity-100 transition-opacity">
                    <span className="flex h-2.5 w-2.5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span className="text-sm font-bold text-emerald-400 uppercase tracking-widest">{API_PROVIDERS.length}+ Connected APIs & Datasets Active</span>
                </div>

                {/* Custom Segmented Control */}
                <div className="flex bg-black/60 p-2 rounded-2xl border border-white/10 w-fit mx-auto mt-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                    <button
                        onClick={() => setActiveTab('apis')}
                        className={cn('px-8 py-3 font-bold rounded-xl transition-all text-sm uppercase tracking-wider', activeTab === 'apis' ? 'bg-white text-black shadow-lg' : 'text-gray-500 hover:text-white')}
                    >
                        <Zap className="w-4 h-4 inline-block mr-2 -mt-0.5" /> API Keys
                    </button>
                    <button
                        onClick={() => setActiveTab('datasets')}
                        className={cn('px-8 py-3 font-bold rounded-xl transition-all text-sm uppercase tracking-wider', activeTab === 'datasets' ? 'bg-white text-black shadow-lg' : 'text-gray-500 hover:text-white')}
                    >
                        <Database className="w-4 h-4 inline-block mr-2 -mt-0.5" /> ML Datasets
                    </button>
                </div>
            </div>

            {search.trim() ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 px-4">
                    {filtered.map(p => (
                        <ProviderTile key={p.id} provider={p} onClick={() => setSelectedProvider(p)} />
                    ))}
                </div>
            ) : (
                <div className="space-y-16 px-4">
                    {(Object.keys(PROVIDER_CATEGORIES) as ProviderCategory[]).map(cat => {
                        // Skip rendering category if it doesn't match the current tab filter
                        if (activeTab === 'apis' && cat === 'dataset') return null
                        if (activeTab === 'datasets' && cat !== 'dataset') return null

                        const providers = filtered.filter(p => p.category === cat)
                        if (providers.length === 0) return null
                        const meta = PROVIDER_CATEGORIES[cat]
                        
                        return (
                            <section key={cat} className="space-y-6">
                                <h2 className="text-3xl font-black text-white flex items-center gap-4">
                                    <span className="w-2 h-10 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.3)]" style={{ backgroundColor: meta.color }} />
                                    {meta.label}
                                    <span className="text-sm font-bold bg-white/5 border border-white/10 text-gray-400 px-4 py-1.5 rounded-full">{providers.length} APIs</span>
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                                    {providers.map(p => (
                                        <ProviderTile key={p.id} provider={p} onClick={() => setSelectedProvider(p)} />
                                    ))}
                                </div>
                            </section>
                        )
                    })}
                </div>
            )}
            
            {filtered.length === 0 && (
                <div className="text-center py-20 text-gray-500 font-bold uppercase tracking-widest">
                    No results found in {activeTab}.
                </div>
            )}
        </div>
    )
}
