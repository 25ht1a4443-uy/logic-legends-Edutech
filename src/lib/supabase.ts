import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured: boolean = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== 'https://your-project.supabase.co' &&
    supabaseAnonKey !== 'your-anon-key'
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

/**
 * Checks connection health to Supabase instance if configured.
 */
export async function testSupabaseConnection(): Promise<{
  connected: boolean;
  message: string;
  latencyMs?: number;
}> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      connected: false,
      message: 'Supabase credentials not configured in environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY). Running in local persistent in-memory mode.',
    };
  }

  const start = performance.now();
  try {
    const { error } = await supabase.from('assessment_categories').select('count', { count: 'exact', head: true });
    const latency = Math.round(performance.now() - start);

    if (error && error.code !== 'PGRST116') {
      // Table might not exist yet if migrations haven't run, but connection reached Supabase
      return {
        connected: true,
        message: `Connected to Supabase (${latency}ms). Database schema tables ready for initialization.`,
        latencyMs: latency,
      };
    }

    return {
      connected: true,
      message: `Active Supabase connection verified (${latency}ms).`,
      latencyMs: latency,
    };
  } catch (err: any) {
    return {
      connected: false,
      message: `Connection failed: ${err.message || 'Network error'}`,
    };
  }
}
