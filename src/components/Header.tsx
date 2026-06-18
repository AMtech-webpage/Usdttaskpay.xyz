import React from 'react';
import { UserProfile, isSupabaseConfigured } from '../lib/supabase';
import { Coins, LogOut, Database, Wifi, ShieldAlert, Cpu } from 'lucide-react';
import { motion } from 'motion/react';

interface HeaderProps {
  currentProfile: UserProfile | null;
  onLogout: () => void;
  onNavigate: (page: 'home' | 'dashboard' | 'auth') => void;
  currentPage: 'home' | 'dashboard' | 'auth';
  onOpenDeveloperPane: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentProfile,
  onLogout,
  onNavigate,
  currentPage,
  onOpenDeveloperPane,
}) => {
  const isProd = isSupabaseConfigured();

  return (
    <header className={`sticky top-0 z-40 w-full border-b border-slate-800 bg-cyber-black/80 backdrop-blur-xl ${
      currentPage === 'dashboard' ? 'hidden md:block' : ''
    }`}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
        {/* Logo and Brand */}
        <div 
          onClick={() => onNavigate('home')} 
          className="flex cursor-pointer items-center space-x-1.5 sm:space-x-2 transition-transform duration-300 hover:scale-[1.02]"
        >
          <div className="relative flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-electric-blue to-cyan-400 p-[1px]">
            <div className="flex h-full w-full items-center justify-center rounded-xl bg-cyber-black">
              <Coins className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-400 animate-pulse" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-2 sm:h-3 w-2 sm:w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex h-2 sm:h-3 w-2 sm:w-3 rounded-full bg-cyan-500"></span>
            </span>
          </div>
          <div>
            <span className="font-display text-base sm:text-lg font-bold tracking-tight text-white">
              Watch<span className="bg-gradient-to-r from-cyan-400 to-electric-blue bg-clip-text text-transparent">2Earn</span>
            </span>
            <div className="hidden sm:flex items-center space-x-1">
              <span className="font-mono text-[9px] font-semibold text-cyan-400/80 tracking-wide uppercase">USDT Portal</span>
              <span className="font-mono text-[9px] text-slate-500">• 80/20 Share</span>
            </div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="flex items-center space-x-1 sm:space-x-3">
          <button
            onClick={() => onNavigate('home')}
            className={`cursor-pointer px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
              currentPage === 'home'
                ? 'bg-slate-800/60 text-cyan-400 border border-slate-700/60'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            Home
          </button>
          
          {currentProfile ? (
            <button
              onClick={() => onNavigate('dashboard')}
              className={`cursor-pointer px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                currentPage === 'dashboard'
                  ? 'bg-slate-800/60 text-cyan-400 border border-slate-700/60'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              Dashboard
            </button>
          ) : (
            <button
              onClick={() => onNavigate('auth')}
              className={`cursor-pointer px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                currentPage === 'auth'
                  ? 'bg-slate-800/60 text-cyan-400 border border-slate-700/60'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              Earn Now
            </button>
          )}

          {/* User Section / Action Buttons */}
          {currentProfile ? (
            <div className="flex items-center space-x-1.5 sm:space-x-3 pl-1.5 sm:pl-3 border-l border-slate-800">
              <div className="hidden sm:flex flex-col text-right">
                <span className="font-sans text-xs font-semibold text-slate-100 max-w-[124px] truncate">
                  {currentProfile.full_name}
                </span>
                <span className="font-mono text-[10px] text-emerald-400 font-bold">
                  {currentProfile.balance.toFixed(4)} USDT
                </span>
              </div>
              
              <button
                onClick={onLogout}
                title="Log Out Session"
                className="cursor-pointer flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/40 text-slate-400 hover:bg-red-950/30 hover:border-red-500/30 hover:text-red-400 transition-all duration-200"
              >
                <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-1.5 border-l border-slate-800 pl-1.5 sm:pl-4">
              <button
                onClick={() => onNavigate('auth')}
                className="cursor-pointer relative inline-flex items-center justify-center p-[1px] rounded-lg bg-gradient-to-r from-cyan-400 to-electric-blue text-[10px] sm:text-xs font-medium text-white transition-all duration-300 hover:scale-[1.03]"
              >
                <span className="relative px-2.5 sm:px-4 py-1.5 rounded-[7px] bg-cyber-black hover:bg-slate-900/50 transition-colors">
                  Get Started
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
