import { createClient } from '@supabase/supabase-js';

// Reemplaza estos valores con los de tu proyecto Supabase
const SUPABASE_URL = 'TU_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'TU_SUPABASE_ANON_KEY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY); 