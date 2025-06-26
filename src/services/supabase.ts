import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Reemplaza estos valores con los de tu proyecto Supabase
const SUPABASE_URL = 'https://jxcbvhpnynrqttrnojcu.supabase.co'; // URL real de tu proyecto
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4Y2J2aHBueW5ycXR0cm5vamN1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzQ2MTgyMSwiZXhwIjoyMDYzMDM3ODIxfQ.a3P3L7v3kL_jMA6s-rPBrbbjtCdZg7N73Rmrr8-PdoM';

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY); 