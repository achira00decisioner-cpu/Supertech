import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

// 1. Validation Logic
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    if (typeof window === 'undefined') {
        // Log error on server side but don't crash immediately unless used
        console.error("⚠️ Error: Missing Supabase Environment Variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)");
    } else {
        // On client side, it might be critical
        console.error("⚠️ Error: Missing Supabase Environment Variables");
    }
}

// 2. Robust Export for Client/Server
// Create client only if keys are available to avoid build crash
export const supabase = createClient<Database>(
    supabaseUrl || '',
    supabaseAnonKey || ''
);