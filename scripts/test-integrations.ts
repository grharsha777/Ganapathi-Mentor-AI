
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { searchArxiv } from '../lib/integrations/arxiv';
import { searchSemanticScholar } from '../lib/integrations/semantic-scholar';
import { searchWikipedia } from '../lib/integrations/wikipedia';
import { searchTavily } from '../lib/integrations/tavily';
import { searchSerp } from '../lib/integrations/serp';

async function testAll() {
    console.log('🚀 Testing Research APIs...\n');

    const integrations = [
        { name: 'arXiv', fn: searchArxiv, query: 'Machine Learning' },
        { name: 'Semantic Scholar', fn: searchSemanticScholar, query: 'Deep Learning' },
        { name: 'Wikipedia (JS)', fn: searchWikipedia, query: 'Turing Test' },
        { name: 'Tavily', fn: searchTavily, query: 'Latest AI News' },
        { name: 'SerpAPI', fn: searchSerp, query: 'React.js tutorial' }
    ];

    console.table(integrations.map(i => ({ Name: i.name, TestQuery: i.query })));
    console.log('\n------------------------------------------------\n');

    for (const integration of integrations) {
        process.stdout.write(`Testing ${integration.name}... `);
        try {
            const start = Date.now();
            const results = await integration.fn(integration.query);
            const duration = Date.now() - start;

            if (results && results.length > 0) {
                console.log(`✅ OK (${duration}ms)`);
                // Handle different result structures
                const first = results[0] as any;
                const title = first.title || first.text || 'No Title';
                const link = first.url || first.link || first.id || 'No Link';

                console.log(`   First Result: "${title.substring(0, 50)}..."`);
                console.log(`   Link: ${link}\n`);
            } else {
                console.log(`⚠️  Empty Results (${duration}ms)\n`);
            }
        } catch (error: any) {
            console.log(`❌ FAILED`);
            console.error(`   Error: ${error.message}\n`);
        }
    }
}

testAll().catch(console.error);
