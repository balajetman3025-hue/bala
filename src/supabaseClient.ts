import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://smpqxrtgnvngzlwgdmqm.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_FpFGltliEmoM5Lfrdad19g_bJIgApZx';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export default supabase;
