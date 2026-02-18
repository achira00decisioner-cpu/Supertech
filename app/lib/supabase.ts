import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Check if environment variables are missing
if (!supabaseUrl || !supabaseAnonKey) {
    // Only log warning, do not throw error to allow build process to complete for static pages
    console.warn('⚠️ Warning: Missing Supabase Environment Variables. Supabase features may not work correctly.')
}

// Use fallback values during build time if environment variables are missing
// This prevents "supabaseUrl is required" error during static generation (e.g., /_not-found)
const url = supabaseUrl || 'https://placeholder.supabase.co'
const key = supabaseAnonKey || 'placeholder-key'

export const supabase = createClient<Database>(url, key)