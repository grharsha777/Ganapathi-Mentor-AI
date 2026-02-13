const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkTables() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error("Missing Supabase credentials");
        return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase.from('learning_paths').select('id').limit(1);

    if (error) {
        if (error.code === '42P01') {
            console.log("TABLES_NOT_FOUND: The 'learning_paths' table does not exist.");
        } else {
            console.error("Supabase Error:", error.message);
        }
    } else {
        console.log("TABLES_FOUND: Required tables seem to exist.");
    }
}

checkTables();
