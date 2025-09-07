import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-anon-key';

// Check if we're in demo mode (no real Supabase configured)
const isDemoMode = supabaseUrl.includes('demo') || supabaseAnonKey.includes('demo');

export const supabase = isDemoMode 
  ? null // We'll handle this in the service layer
  : createClient(supabaseUrl, supabaseAnonKey);

export { isDemoMode };
