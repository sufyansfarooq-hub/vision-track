import { createBrowserClient } from '@supabase/ssr';

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function ensureAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'test@visiontrack.com',
      password: 'testpassword123',
    });
    
    if (error) {
      console.error('Auth error:', error);
      throw error;
    }
    
    console.log('Auto-logged in test user');
    return data;
  }
  
  return { session };
}

export async function getCurrentUserId() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.id || null;
}
