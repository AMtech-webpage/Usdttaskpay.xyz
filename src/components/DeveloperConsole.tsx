import React, { useState } from 'react';
import { SUPABASE_SQL_CODE, isSupabaseConfigured } from '../lib/supabase';
import { Database, Code, Check, Copy, Wifi, ShieldAlert, Cpu, HelpCircle, X, Terminal } from 'lucide-react';
import { motion } from 'motion/react';

interface DeveloperConsoleProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeveloperConsole: React.FC<DeveloperConsoleProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const isProd = isSupabaseConfigured();

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l border-slate-800 bg-[#070b13] shadow-2xl">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 p-4">
        <div className="flex items-center space-x-2">
          <Database className="h-5 w-5 text-cyan-400" />
          <h3 className="font-display font-bold text-sm text-white">Database Integration Hub</h3>
        </div>
        <button 
          onClick={onClose}
          className="rounded-lg hover:bg-slate-900 p-1.5 text-slate-400 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Content wrapper */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* Connection status card */}
        <div className={`p-4 rounded-xl border ${
          isProd 
            ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-300' 
            : 'bg-amber-950/20 border-amber-500/20 text-amber-300'
        }`}>
          <div className="flex items-center space-x-2.5">
            {isProd ? (
              <Wifi className="h-5 w-5 text-emerald-400 animate-pulse" />
            ) : (
              <Cpu className="h-5 w-5 text-amber-400" />
            )}
            <h4 className="font-display font-extrabold text-sm text-white">
              {isProd ? 'Production Sync Active' : 'Simulated Sandbox Mode Active'}
            </h4>
          </div>

          <p className="mt-2 text-xs text-slate-400 leading-normal">
            {isProd ? (
              'The application is actively communicating live with your Supabase auth and database schema instance on cloud. Registration and reward completions sync in real-time.'
            ) : (
              'No custom Supabase configuration detected. The application is running on a high-fidelity local memory layer. All balances, login registration, ad completions, and ledgers preserve inside localStorage.'
            )}
          </p>
        </div>

        {/* Integration Instructions */}
        <div className="space-y-3">
          <h4 className="font-display font-bold text-slate-200 text-sm flex items-center space-x-1.5">
            <Terminal className="h-4 w-4 text-cyan-400" />
            <span>Connection Guidelines</span>
          </h4>
          
          <p className="text-xs text-slate-400 leading-normal">
            To switch the sandbox from simulated offline to live cloud sync with your private Supabase backend instance, complete these simple steps:
          </p>

          <ol className="text-xs text-slate-400 space-y-2.5 ml-4 list-decimal leading-relaxed">
            <li>
              Log in to your dashboard at <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline inline-flex items-center space-x-0.5"><span>supabase.com</span><ExternalLink className="h-3 w-3" /></a> and form a new empty project.
            </li>
            <li>
              Go to project <strong className="text-white">Settings &gt; API</strong>, locate your credentials, and declare them as environment variables inside your workspace secret panel:
              <div className="mt-2 rounded-xl bg-slate-950 p-2.5 border border-slate-9ml font-mono text-[10px] space-y-1.5 text-slate-300">
                <p>VITE_SUPABASE_URL="your-project-endpoint..."</p>
                <p>VITE_SUPABASE_ANON_KEY="your-anon-api-key..."</p>
              </div>
            </li>
            <li>
              Open the Supabase <strong className="text-white">SQL Editor</strong> tab, click <strong className="text-white">New Query</strong>, paste the initialization script below, and hit <strong className="text-emerald-400">Run</strong>!
            </li>
          </ol>
        </div>

        {/* SQL Copy module */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-display font-bold text-slate-200 text-sm flex items-center space-x-1.5">
              <Code className="h-4 w-4 text-cyan-400" />
              <span>Supabase Postgres Schema Code</span>
            </h4>

            <button
              onClick={handleCopyCode}
              className="cursor-pointer inline-flex items-center space-x-1 rounded bg-slate-900 border border-slate-800 px-2 py-1 text-[10px] font-sans text-slate-300 hover:bg-slate-800 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">SQL Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy SQL Code</span>
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-slate-500 leading-normal">
            This SQL script automatically deploys the public user profiles, transaction indices, handles safe RLS access rules, and registers an auth listener function to sync registrations seamlessly without HTTP 500 crashes.
          </p>

          <pre className="max-h-[220px] overflow-auto rounded-xl bg-slate-950 p-3 text-[10px] font-mono text-slate-300 border border-slate-900 leading-relaxed tracking-wide scrollbar">
            {SUPABASE_SQL_CODE}
          </pre>
        </div>

      </div>

      {/* Footer information bar */}
      <div className="border-t border-slate-900/60 bg-slate-950/80 p-4 font-mono text-[9px] text-slate-500 text-center">
        Watch-to-Earn USDT Platform Integration Panel • 2026
      </div>
    </div>
  );
};

// Help helper icon
const ExternalLink: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    className={className} 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    viewBox="0 0 24 24" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
);
