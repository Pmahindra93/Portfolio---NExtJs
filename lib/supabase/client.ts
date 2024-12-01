import { createClient } from '@supabase/supabase-js'

// These variables are safe to expose to the client as they are public
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing public Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
