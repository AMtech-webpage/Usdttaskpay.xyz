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
        const response: any = await api.auth.signUp(email, password, fullName);

        // Try to perform a fast under-the-hood auto-login in production if the session wasn't already returned by default
        let finalSession: any = response;
        if (isProd && !finalSession?.profile) {
          try {
            const autoLogin: any = await api.auth.signIn(email, password);
            if (autoLogin?.profile) {
              finalSession = autoLogin;
            }
          } catch (autoLoginError) {
            console.log('Immediate automatic login skipped or waiting confirmation:', autoLoginError);
          }
        }

        const hasSession = !!finalSession?.profile;

        setSuccessMsg(
          isProd
            ? (hasSession
                ? 'Account registered and authorized successfully! Redirecting you to the app...'
                : 'Account registered successfully! Please click below to check your dashboard or confirm via confirmation request.')
            : 'Simulated Sandbox registration completed! Welcome aboard.'
        );

        // If authorized (or emulator mode), navigate directly to dashboard
        if (!isProd || hasSession) {
          setTimeout(() => {
            onSuccess(finalSession);
          }, 1200);
        } else {
          // If live Supabase requires confirmation or session could not be established immediately,
          // swap to login and let them access or bypass easily.
          setTimeout(() => {
            // Also suggest bypassing if needed by providing a notice or letting them access
            setSuccessMsg(null);
            setActiveTab('login');
          }, 4500);
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

      <div className="relative w-full max-w-md rounded-3xl border border-white/5 bg-[#161B28] p-7 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 h-40 w-40 bg-cyan-500/5 blur-[80px] rounded-full pointer-events-none" />
        
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
          <div className="flex flex-col rounded-xl border border-red-500/20 bg-red-950/25 p-4 mb-6">
            <div className="flex items-start space-x-2.5">
              <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
              <div className="text-sm text-red-200 font-semibold leading-normal">{errorMsg}</div>
            </div>

            {/* Custom interactive action hooks for different error modes */}
            {errorMsg.toLowerCase().includes('invalid login credentials') && (
              <div className="mt-3 pt-3 border-t border-red-500/20 text-xs text-slate-300">
                <p className="mb-2 leading-relaxed">
                  Wrong email or password. If you are testing the interface, you can click below to instantly bypass this credentials block and enter a simulated sandbox session under these details.
                </p>
                <button
                  type="button"
                  onClick={async () => {
                    setErrorMsg(null);
                    setIsLoading(true);
                    try {
                      const session = await (api.auth as any).bypassIntoSandbox(email, fullName || 'Demo Explorer');
                      onSuccess(session);
                    } catch (e: any) {
                      setErrorMsg(e.message);
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  className="px-3.5 py-2 bg-gradient-to-r from-red-500 via-amber-500 to-yellow-500 hover:brightness-110 text-slate-950 font-extrabold rounded-lg text-[10px] uppercase tracking-wider cursor-pointer shadow-md transition-all font-mono w-full text-center"
                >
                  Bypass with Sandbox Session
                </button>
              </div>
            )}

            {(errorMsg.toLowerCase().includes('email not confirmed') || errorMsg.toLowerCase().includes('confirm') || errorMsg.toLowerCase().includes('verify')) && (
              <div className="mt-3 pt-3 border-t border-red-500/20 text-xs text-slate-300">
                <p className="mb-2 leading-relaxed">
                  Decentralized confirmation is disabled or pending. Since verification emails cannot be received in sandbox viewports, click below to bypass validation and access the panel.
                </p>
                <button
                  type="button"
                  onClick={async () => {
                    setErrorMsg(null);
                    setIsLoading(true);
                    try {
                      const session = await (api.auth as any).bypassIntoSandbox(email, fullName || 'Verified earner');
                      onSuccess(session);
                    } catch (e: any) {
                      setErrorMsg(e.message);
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  className="px-3.5 py-2 bg-gradient-to-r from-cyan-500 via-sky-450 to-blue-500 hover:brightness-110 text-slate-950 font-extrabold rounded-lg text-[10px] uppercase tracking-wider cursor-pointer shadow-md transition-all font-mono w-full text-center"
                >
                  Force Bypass Verification
                </button>
              </div>
            )}

            {(errorMsg.toLowerCase().includes('rate limit') || errorMsg.toLowerCase().includes('rate_limit') || errorMsg.toLowerCase().includes('spam') || errorMsg.toLowerCase().includes('too many requests')) && (
              <div className="mt-3 pt-3 border-t border-red-500/20 text-xs text-slate-300">
                <p className="mb-2 leading-relaxed">
                  Supabase email limits have been reached on this IP. Don't worry—click below to enter under high-yield offline simulated status instantly.
                </p>
                <button
                  type="button"
                  onClick={async () => {
                    setErrorMsg(null);
                    setIsLoading(true);
                    try {
                      const session = await (api.auth as any).bypassIntoSandbox(email, fullName || 'Resilient earner');
                      onSuccess(session);
                    } catch (e: any) {
                      setErrorMsg(e.message);
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  className="px-3.5 py-2 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 hover:brightness-110 text-white font-extrabold rounded-lg text-[10px] uppercase tracking-wider cursor-pointer shadow-md transition-all font-mono w-full text-center"
                >
                  Enter Sandbox Mode
                </button>
              </div>
            )}
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

        {/* Security Notice */}
        <div className="mt-6 flex items-start space-x-2.5 rounded-lg bg-slate-950 p-3.5 border border-slate-800/20">
          <ShieldCheck className="h-4.5 w-4.5 text-cyan-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-slate-400 leading-normal">
            <strong>Secure Cryptographic Storage.</strong> Your credentials are fully encrypted and protected via premium TLS layers. Verified balances and reward yields are synced on a secure, fault-tolerant network.
          </p>
        </div>
      </div>
    </div>
  );
};
