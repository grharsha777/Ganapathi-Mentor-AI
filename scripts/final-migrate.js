const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Simple function to read .env.local without dotenv
function getEnv() {
    const envPath = path.join(__dirname, '../.env.local');
    const content = fs.readFileSync(envPath, 'utf8');
    const env = {};
    content.split('\n').forEach(line => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
            let value = match[2] || '';
            if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
            env[match[1]] = value;
        }
    });
    return env;
}

async function migrate() {
    const env = getEnv();
    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error("Missing Supabase credentials in .env.local");
        return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const migrationPath = path.join(__dirname, '../supabase/migrations/20240602000000_mentor_schema.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log("Attempting migration via RPC if available...");

    // In many Supabase setups, you can't run arbitrary SQL via the JS client.
    // The best way is to tell the user to use the Dashboard.
    console.log("--------------------------------------------------");
    console.log("ACTION REQUIRED: PLEASE RUN MIGRATION");
    console.log("--------------------------------------------------");
    console.log("1. Open: https://supabase.com/dashboard/project/" + supabaseUrl.split('//')[1].split('.')[0] + "/sql");
    console.log("2. Copy the content of: supabase/migrations/20240602000000_mentor_schema.sql");
    console.log("3. Paste and Run it in the SQL Editor.");
    console.log("--------------------------------------------------");
}

migrate();
