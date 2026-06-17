import React from 'react';
import { Play, Shield, TrendingUp, Sparkles, CheckCircle, ArrowRight, Users, Wallet, HelpCircle, Eye, ShieldCheck, Layers } from 'lucide-react';
import { motion } from 'motion/react';

interface HeroSectionProps {
  onStart: () => void;
  onNavigateToAuth: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onStart, onNavigateToAuth }) => {
  return (
    <div className="relative overflow-hidden bg-cyber-black min-h-[calc(100vh-4rem)] pb-12">
      {/* Background cyber grid overlay */}
      <div className="absolute inset-0 cyber-grid opacity-50 pointer-events-none" />
      
      {/* Glowing neon background orbs */}
      <div className="absolute top-1/4 left-1/10 h-72 w-72 rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/10 h-80 w-80 rounded-full bg-[#0052FF]/10 blur-[130px] pointer-events-none" />

      {/* Hero Section Container */}
      <div className="relative mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        
        {/* Bento Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mt-6">
          
          {/* Bento Box 1: Hero Pitch (col-span-8) */}
          <div className="md:col-span-8 bg-gradient-to-br from-[#161B28] to-[#0D121D] rounded-3xl p-6 sm:p-10 border border-white/5 relative overflow-hidden flex flex-col justify-between shadow-2xl">
            <div className="relative z-10">
              {/* Badge Tag */}
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full w-fit mb-6">
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400 font-mono">Live Earning Active</span>
              </div>
              
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] mb-5 text-white">
                Turn Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-400">Screen Time</span> Into Real Crypto.
              </h1>
              
              <p className="text-slate-400 text-sm sm:text-base md:text-md mb-8 leading-relaxed max-w-xl">
                Watch verified video ads, complete micro-tasks, and withdraw verified USDT. You keep <strong className="text-white">80% of promotional revenue</strong> directly, with a professional 20% platform commission model.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 relative z-10">
              <button
                onClick={onStart}
                className="cursor-pointer px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-[#0A0E17] font-extrabold rounded-xl shadow-xl shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 group text-sm font-mono tracking-tight uppercase"
              >
                <span>Get Started Now</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              <button
                onClick={() => onNavigateToAuth()}
                className="cursor-pointer px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl border border-white/10 transition-all text-sm"
              >
                Login to Account
              </button>
            </div>

            {/* Decorative background aura */}
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-cyan-500/5 blur-[100px] rounded-full pointer-events-none" />
          </div>

          {/* Bento Box 2: Static / Interactive Live Preview Card (col-span-4) */}
          <div className="md:col-span-4 bg-[#161B28] rounded-3xl p-6 border border-white/5 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] text-cyan-400 font-mono font-bold uppercase tracking-widest">Network Live Status</span>
                <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-sm font-mono font-bold">ACTIVE</span>
              </div>
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-3">Est. Demo Payout</p>
              
              <div className="py-4 px-5 rounded-2xl bg-slate-950/50 border border-white/5 mb-4">
                <span className="block text-[10px] text-slate-500 font-mono">Watch Reward Rate</span>
                <div className="text-3xl font-mono font-black tracking-tight text-white mt-1">
                  +0.0500 <span className="text-xs text-cyan-400 font-bold">USDT / Ad</span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-400 py-1 border-b border-white/5">
                  <span>Ad Contract Rate:</span>
                  <span className="text-white font-mono">0.0625 USDT</span>
                </div>
                <div className="flex justify-between text-slate-400 py-1 border-b border-white/5">
                  <span>Ad revenue share:</span>
                  <span className="text-emerald-400 font-mono font-bold">80% (You keep)</span>
                </div>
                <div className="flex justify-between text-slate-400 py-1">
                  <span>Platform fee:</span>
                  <span className="text-slate-500 font-mono">20% (House fee)</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-white/5">
              <button 
                onClick={onStart}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/60 rounded-xl text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                Instant Connect Sync
              </button>
            </div>
          </div>

          {/* Bento Row 2: Statistics Matrix items */}
          <div className="md:col-span-4 bg-[#161B28] rounded-2xl p-5 border border-white/5 flex items-center gap-4 shadow-md">
            <div className="w-12 h-12 bg-cyan-500/5 border border-cyan-500/10 rounded-xl flex items-center justify-center text-xl">
              <Users className="h-6 w-6 text-cyan-400" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-wider">Users Globally</p>
              <p className="text-2xl font-black text-white">20.4M+</p>
              <p className="text-[10px] text-emerald-400 font-mono">Verified Active Daily</p>
            </div>
          </div>

          <div className="md:col-span-4 bg-[#161B28] rounded-2xl p-5 border border-white/5 flex items-center gap-4 shadow-md">
            <div className="w-12 h-12 bg-emerald-500/5 border border-emerald-500/10 rounded-xl flex items-center justify-center text-xl">
              <Wallet className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-wider">USDT Paid Out</p>
              <p className="text-2xl font-black text-white">$45.8M+</p>
              <p className="text-[10px] text-slate-400 font-mono">Instant withdrawals</p>
            </div>
          </div>

          <div className="md:col-span-4 bg-[#161B28] rounded-2xl p-5 border border-white/5 flex items-center gap-4 shadow-md">
            <div className="w-12 h-12 bg-purple-500/5 border border-purple-500/10 rounded-xl flex items-center justify-center text-xl">
              <Sparkles className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-wider">Rating</p>
              <p className="text-2xl font-black text-white">4.8/5 ★</p>
              <p className="text-[10px] text-slate-400 font-mono">Community Approved</p>
            </div>
          </div>

          {/* Bento Row 3: How It Works Step block (col-span-12 or col-span-7) */}
          <div className="md:col-span-7 bg-gradient-to-br from-[#1E2536]/40 to-[#161B28] rounded-3xl p-6 sm:p-8 border border-white/5 flex flex-col justify-center shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display font-bold text-white uppercase text-xs tracking-wider text-cyan-400">
                Start earning in 3 simple steps
              </h3>
              <span className="text-[10px] font-mono text-slate-500">80/20 transparent payout</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-1 text-center sm:text-left bg-white/[0.02] p-4 rounded-xl border border-white/5">
                <div className="text-xl mb-1 text-cyan-400 font-bold">🆔</div>
                <p className="text-[10px] font-black uppercase text-cyan-400 mb-1">Step 01</p>
                <p className="text-xs font-bold text-white mb-1">Create Identity</p>
                <p className="text-[11px] text-slate-400 leading-tight">Register fully via secure Supabase integration.</p>
              </div>

              <div className="flex-1 text-center sm:text-left bg-white/[0.02] p-4 rounded-xl border border-white/5">
                <div className="text-xl mb-1 text-sky-400 font-bold">📺</div>
                <p className="text-[10px] font-black uppercase text-sky-400 mb-1">Step 02</p>
                <p className="text-xs font-bold text-white mb-1">Stream Content</p>
                <p className="text-[11px] text-slate-400 leading-tight">Watch ads and do micro-tasks verified in click sessions.</p>
              </div>

              <div className="flex-1 text-center sm:text-left bg-white/[0.02] p-4 rounded-xl border border-white/5">
                <div className="text-xl mb-1 text-emerald-400 font-bold">🏦</div>
                <p className="text-[10px] font-black uppercase text-emerald-400 mb-1">Step 03</p>
                <p className="text-xs font-bold text-white mb-1">Get Paid 80%</p>
                <p className="text-[11px] text-slate-400 leading-tight">Withdraw directly via TRC-20 / BEP-20 / ERC-20 USDT protocols.</p>
              </div>
            </div>
          </div>

          {/* Bento Row 3 Right: Revenue share visual diagram (col-span-5) */}
          <div className="md:col-span-5 bg-gradient-to-br from-[#161B28] to-[#111622] rounded-3xl p-6 border border-white/5 flex flex-col justify-between shadow-xl">
            <div>
              <span className="text-[10px] font-mono font-bold text-slate-400 tracking-wider block mb-2">ETHICAL ATTENTION ECONOMY MODEL</span>
              <h3 className="font-display text-lg font-bold text-white mb-2">The 80% User, 20% House Model</h3>
              <p className="text-xs text-slate-400 leading-normal mb-4">
                Unlike corporate networks that pocket 100% of commercial revenue, WatchEarn operates double-entry ledger audits where your attention gains value.
              </p>

              {/* Sample bar graph styled identically to the Bento Design wireframe */}
              <div className="flex items-center h-8 rounded-lg overflow-hidden font-mono text-[10px] text-center font-bold mb-4">
                <div className="h-full bg-gradient-to-r from-cyan-400 to-sky-500 text-slate-950 flex items-center justify-center w-[80%]">
                  User: 80%
                </div>
                <div className="h-full bg-slate-800 text-slate-400 flex items-center justify-center w-[20%] border-l border-white/5">
                  House: 20%
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                  <span className="block text-[10px] font-mono text-slate-500">Your Attention Cut</span>
                  <span className="text-sm font-bold text-cyan-400 font-mono">0.0500 USDT</span>
                </div>
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                  <span className="block text-[10px] font-mono text-slate-500">Platform Split</span>
                  <span className="text-sm font-bold text-slate-400 font-mono">0.0125 USDT</span>
                </div>
              </div>
            </div>

            <div className="text-[10px] font-mono text-slate-500 text-center mt-3 pt-2 border-t border-white/5">
              Attention value matrices are signed instantly in your Supabase profile.
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

