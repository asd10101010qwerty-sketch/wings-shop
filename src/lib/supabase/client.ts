import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vlhzaalkeymydemzrnww.supabase.co';
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsaHphYWxrZXlteWRlbXpybnd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMyNzM5NzgsImV4cCI6MjEwODg0OTk3OH0.xYGPwcjTfzW2_SpmcNUi8W_qUag6msp5rEx-gnuAavQ';

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
