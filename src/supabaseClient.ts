import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://uhsunqveqjsqymcebwlo.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_P0bBW7Hs2ibocZstswrGeQ_2-wRDlpP';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
