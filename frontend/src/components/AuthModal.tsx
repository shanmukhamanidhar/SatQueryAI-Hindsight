import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, 
  X, 
  Lock, 
  Mail, 
  LogIn, 
  UserPlus, 
  LogOut, 
  ShieldCheck, 
  Database, 
  Brain, 
  RefreshCw,
  KeyRound,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { 
  supabase, 
  isSupabaseConfigured, 
  signInWithEmail, 
  signUpWithEmail, 
  signOutUser, 
  getCurrentUser,
  getOrCreateLocalUserId,
  resetLocalUserSession
} from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onUserChanged: (user: User | null) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChanged,
}) => {
  const [tab, setTab] = useState<'signin' | 'signup' | 'profile'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [localGuestId, setLocalGuestId] = useState<string>(() => getOrCreateLocalUserId());

  useEffect(() => {
    if (currentUser) {
      setTab('profile');
    } else {
      setTab('signin');
    }
    setErrorMsg(null);
    setSuccessMsg(null);
  }, [currentUser, isOpen]);

  if (!isOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const data = await signInWithEmail(email, password);
      setSuccessMsg('Successfully signed in to Supabase!');
      onUserChanged(data.user);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to sign in.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const data = await signUpWithEmail(email, password, displayName);
      setSuccessMsg('Account created successfully! Check your email or sign in directly.');
      if (data.user) {
        onUserChanged(data.user);
      }
      setTimeout(() => {
        setTab('signin');
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOutUser();
      onUserChanged(null);
      setTab('signin');
      setSuccessMsg('Signed out of Supabase session.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to sign out.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetGuest = () => {
    const newId = resetLocalUserSession();
    setLocalGuestId(newId);
    setSuccessMsg(`Guest session reset. New ID: ${newId}`);
  };

  const activeUserId = currentUser ? currentUser.id : localGuestId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-2xl overflow-hidden font-sans text-slate-900 dark:text-slate-100">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-950/50">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-blue-600 flex items-center justify-center text-white shadow-md">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                <span>SUPABASE AUTH & IDENTITY</span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                User isolation for analysis history and Hindsight memory banks.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Configuration Status Ribbon */}
        <div className="px-6 py-2 bg-slate-100 dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-800 text-[11px] flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <span className={`h-2 w-2 rounded-full ${isSupabaseConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="font-medium text-slate-600 dark:text-zinc-400">
              Supabase Status:
            </span>
            <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">
              {isSupabaseConfigured ? 'ONLINE (Cloud)' : 'LOCAL PERSISTENCE'}
            </span>
          </div>
          <div className="flex items-center space-x-1 font-mono text-[10px] text-violet-600 dark:text-violet-400">
            <Brain className="w-3 h-3" />
            <span>Bank Isolated</span>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Mode Tabs if not logged in */}
          {!currentUser ? (
            <div className="flex rounded-xl bg-slate-100 dark:bg-zinc-800 p-1">
              <button
                type="button"
                onClick={() => { setTab('signin'); setErrorMsg(null); }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  tab === 'signin'
                    ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setTab('signup'); setErrorMsg(null); }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  tab === 'signup'
                    ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Sign Up
              </button>
            </div>
          ) : null}

          {/* TAB: SIGN IN */}
          {tab === 'signin' && !currentUser && (
            <form onSubmit={handleSignIn} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="analyst@agency.gov"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    disabled={loading || !isSupabaseConfigured}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    disabled={loading || !isSupabaseConfigured}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !isSupabaseConfigured}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-40 flex items-center justify-center space-x-1.5 shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{loading ? 'Authenticating...' : 'Sign In with Supabase'}</span>
              </button>
            </form>
          )}

          {/* TAB: SIGN UP */}
          {tab === 'signup' && !currentUser && (
            <form onSubmit={handleSignUp} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1">
                  Full Name / Display Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Dr. Maya Rao"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    disabled={loading || !isSupabaseConfigured}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="analyst@agency.gov"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    disabled={loading || !isSupabaseConfigured}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1">
                  Password (min 6 characters)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    disabled={loading || !isSupabaseConfigured}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !isSupabaseConfigured}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-40 flex items-center justify-center space-x-1.5 shadow-sm"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{loading ? 'Creating Account...' : 'Create Supabase Account'}</span>
              </button>
            </form>
          )}

          {/* TAB: PROFILE / LOGGED IN STATE */}
          {currentUser && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-bold text-xs text-emerald-800 dark:text-emerald-300">
                      Authenticated Analyst
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-mono text-[10px] font-bold">
                    RLS PROTECTED
                  </span>
                </div>
                <div className="text-xs text-slate-600 dark:text-zinc-300">
                  <strong>Email:</strong> {currentUser.email}
                </div>
                <div className="text-[11px] font-mono text-slate-500 dark:text-zinc-400 break-all">
                  <strong>Supabase UID:</strong> {currentUser.id}
                </div>
                <div className="text-[11px] font-mono text-violet-600 dark:text-violet-400">
                  <strong>Hindsight Bank ID:</strong> satquery-user-{currentUser.id.replace(/-/g, '').slice(0, 16)}
                </div>
              </div>

              <button
                type="button"
                onClick={handleSignOut}
                disabled={loading}
                className="w-full py-2 rounded-xl border border-slate-300 dark:border-zinc-700 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 text-xs font-semibold transition-all flex items-center justify-center space-x-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}

          {/* Guest Session Identifier Box */}
          <div className="pt-3 border-t border-slate-200 dark:border-zinc-800">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-600 dark:text-zinc-400 flex items-center space-x-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-blue-500" />
                  <span>Session Identity:</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold">
                  {currentUser ? 'Supabase Auth' : 'Guest Local Session'}
                </span>
              </div>
              <div className="text-[11px] font-mono text-slate-700 dark:text-zinc-300 break-all">
                {activeUserId}
              </div>
              {!currentUser && (
                <div className="pt-1 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 dark:text-zinc-400">Need a fresh start?</span>
                  <button
                    type="button"
                    onClick={handleResetGuest}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline flex items-center space-x-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Reset Guest ID</span>
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
