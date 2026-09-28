import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabasePublishableKey = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  ''
);

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabasePublishableKey && 
  !supabaseUrl.includes('your-project')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabasePublishableKey)
  : null;

// Fallback guest user ID for offline / unauthenticated multi-session demo continuity
const GUEST_STORAGE_KEY = 'satquery_agent_user_id';

export function getOrCreateLocalUserId(): string {
  let uid = localStorage.getItem(GUEST_STORAGE_KEY);
  if (!uid) {
    uid = 'analyst_' + Math.random().toString(36).substring(2, 10);
    localStorage.setItem(GUEST_STORAGE_KEY, uid);
  }
  return uid;
}

export function resetLocalUserSession(): string {
  const newUid = 'analyst_' + Math.random().toString(36).substring(2, 10);
  localStorage.setItem(GUEST_STORAGE_KEY, newUid);
  return newUid;
}

// ---------------------------------------------------------------------------
// Supabase Authentication & Profile Management
// ---------------------------------------------------------------------------
export async function getCurrentUser(): Promise<User | null> {
  if (!supabase) return null;
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    return user;
  } catch {
    return null;
  }
}

export async function getActiveUserId(): Promise<string> {
  const user = await getCurrentUser();
  if (user && user.id) {
    return user.id;
  }
  return getOrCreateLocalUserId();
}

export async function signInWithEmail(email: string, password: string) {
  if (!supabase) {
    throw new Error('Supabase client is not configured.');
  }
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signUpWithEmail(email: string, password: string, displayName?: string) {
  if (!supabase) {
    throw new Error('Supabase client is not configured.');
  }
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName || email.split('@')[0],
      },
    },
  });
  if (error) throw error;
  return data;
}

export async function signOutUser() {
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export function onAuthStateChange(callback: (user: User | null) => void) {
  if (!supabase) return () => {};
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user || null);
  });
  return () => {
    subscription.unsubscribe();
  };
}

// ---------------------------------------------------------------------------
// Profiles & Settings API Sync
// ---------------------------------------------------------------------------
export async function fetchUserProfile(userId: string) {
  try {
    const res = await fetch(`/api/user/profile?user_id=${encodeURIComponent(userId)}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function updateUserProfile(userId: string, data: any) {
  const res = await fetch('/api/user/profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, ...data }),
  });
  return await res.json();
}

export async function fetchUserSettings(userId: string) {
  try {
    const res = await fetch(`/api/user/settings?user_id=${encodeURIComponent(userId)}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function updateUserSettings(userId: string, settings: any) {
  const res = await fetch('/api/user/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, ...settings }),
  });
  return await res.json();
}
