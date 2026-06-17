import React, { useState } from 'react';
import { api, isSupabaseConfigured } from '../lib/supabase';
import { Mail, Lock, User, Eye, EyeOff, Loader2, AlertTriangle, ShieldCheck, Database, Info, Cpu } from 'lucide-react';
import { motion } from 'motion/react';

interface AuthModalProps {
  onSuccess: (session: any) => void;
  onNavigateHome: () => void;
  initialState?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  onSuccess,
  onNavigateHome,
  initialState = 'login'
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(initialState);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const isProd = isSupabaseConfigured();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    // Validation
    if (!email || !password) {
      setErrorMsg('Please populate all login fields.');
      setIsLoading(false);
      return;
    }

    if (activeTab === 'signup' && !fullName) {
      setErrorMsg('Please specify your Full Name.');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Passwords must consist of at least 6 characters.');
      setIsLoading(false);
      return;
    }

    try {
      if (activeTab === 'signup') {
        // Use custom wrapper passing full_name into user metadata context
        const response = await api.auth.signUp(email, password, fullName);
        setSuccessMsg(
          isProd
            ? 'Account registered successfully! A signup validation request has been sent to your email.'
            : 'Simulated Sandbox registration completed! Welcome aboard.'
        );

        // Auto transition mock logins or trigger success callback
        if (!isProd) {
          setTimeout(() => {
            onSuccess(response);
          }, 1500);
        } else {
          // Live Supabase signup completed, swap to login tab
          setTimeout(() => {
            setSuccessMsg(null);
            setActiveTab('login');
          }, 3500);
        }
      } else {
        // SignIn Operation
        const session = await api.auth.signIn(email, password);
        setSuccessMsg(
          isProd
            ? 'Session approved successfully! Loading dashboard...'
            : 'Simulated Sandbox login approved! Welcome back.'
        );

        setTimeout(() => {
          onSuccess(session);
        }, 1200);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'An unexpected authentication failure occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 sm:p-6 bg-cyber-black">
      {/* Background grids */}
      <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-cyan-400/5 blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-xl sm:p-8">
        
        {/* Brand Banner */}
        <div className="text-center mb-6">
          <h2 className="font-display text-2xl font-extrabold text-white sm:text-3xl">
            {activeTab === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            {activeTab === 'login'
              ? 'Login to view your USDT wallet and start earning.'
              : 'Sign up to keep 80% of ad revenue starting today.'}
          </p>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-2 rounded-lg bg-slate-950 p-1 mb-6 border border-slate-800">
          <button
            onClick={() => {
              setActiveTab('login');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`cursor-pointer py-2 rounded-md text-xs font-semibold tracking-wider uppercase transition-all ${
              activeTab === 'login'
                ? 'bg-gradient-to-r from-electric-blue to-cyan-500 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Log In
          </button>
          
          <button
            onClick={() => {
              setActiveTab('signup');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`cursor-pointer py-2 rounded-md text-xs font-semibold tracking-wider uppercase transition-all ${
              activeTab === 'signup'
                ? 'bg-gradient-to-r from-electric-blue to-cyan-500 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Status Messages */}
        {errorMsg && (
          <div className="flex items-start space-x-2.5 rounded-xl border border-red-500/20 bg-red-950/20 p-4 mb-6">
            <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
            <div className="text-sm text-red-300 font-medium leading-normal">{errorMsg}</div>
          </div>
        )}

        {successMsg && (
          <div className="flex items-start space-x-2.5 rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-4 mb-6">
            <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-sm text-emerald-300 font-medium leading-normal">{successMsg}</div>
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleAuth} className="space-y-4">
          
          {/* Full Name for Signup */}
          {activeTab === 'signup' && (
            <div>
              <label className="block text-xs font-mono font-bold tracking-wide text-slate-400 uppercase mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <User className="h-4.5 w-4.5 text-slate-500" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. Satoshi Nakamoto"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="block w-full rounded-xl border border-slate-800 bg-slate-950/70 py-3 pl-10 pr-3 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-sans"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-mono font-bold tracking-wide text-slate-400 uppercase mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Mail className="h-4.5 w-4.5 text-slate-500" />
              </div>
              <input
                type="email"
                required
                placeholder="developer@w2e.network"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-xl border border-slate-800 bg-slate-950/70 py-3 pl-10 pr-3 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-sans"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-mono font-bold tracking-wide text-slate-400 uppercase mb-2">
              Password
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock className="h-4.5 w-4.5 text-slate-500" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-xl border border-slate-800 bg-slate-950/70 py-3 pl-10 pr-10 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-sans"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
            </div>
          </div>

          {/* Register Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="cursor-pointer flex w-full items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-electric-blue via-blue-600 to-cyan-500 py-3.5 text-sm font-bold text-white transition-all duration-300 glow-btn hover:brightness-110 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4.5 w-4.5 animate-spin" />
                <span>Verifying Signatures...</span>
              </>
            ) : (
              <span>{activeTab === 'login' ? 'Access App Dashboard' : 'Secure Sign Up'}</span>
            )}
          </button>
        </form>

        {/* Database Sync Notice */}
        <div className="mt-6 flex items-start space-x-2.5 rounded-lg bg-slate-950 p-3.5 border border-slate-800/80">
          {isProd ? (
            <Database className="h-4.5 w-4.5 text-cyan-400 shrink-0 mt-0.5" />
          ) : (
            <Cpu className="h-4.5 w-4.5 text-amber-400 shrink-0 mt-0.5" />
          )}
          <p className="text-[11px] text-slate-400 leading-normal">
            {isProd ? (
              <>
                <strong>Submitting to live database.</strong> Account parameters are synced automatically with our custom PostgreSQL schema. Full name transfers safely to profiles tables via authentication metadata triggers.
              </>
            ) : (
              <>
                <strong>Local sandbox active.</strong> Simulated environment parses user metadata locally to profiles lists instantly. Enter database credentials anytime in the developer settings panel to make it live!
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
