import React from 'react';
import { Play, Shield, TrendingUp, Cpu, Sparkles, CheckCircle, ArrowRight, Video, Zap, Users, Wallet, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface HeroSectionProps {
  onStart: () => void;
  onNavigateToAuth: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onStart, onNavigateToAuth }) => {
  return (
    <div className="relative overflow-hidden bg-cyber-black min-h-[calc(100vh-4rem)]">
      {/* Background cyber grid overlay */}
      <div className="absolute inset-0 cyber-grid opacity-70 pointer-events-none" />
      
      {/* Glowing neon background orbs */}
      <div className="absolute top-1/4 left-1/10 h-72 w-72 rounded-full bg-electric-blue/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/10 h-80 w-80 rounded-full bg-cyan-400/10 blur-[130px] pointer-events-none" />

      {/* Hero Section Container */}
      <div className="relative mx-auto max-w-7xl px-4 pt-16 pb-20 sm:px-6 lg:px-8 lg:pt-24 lg:pb-28">
        <div className="text-center">
          {/* Web3 Tagline Banner */}
          <div className="inline-flex items-center space-x-2 rounded-full border border-cyan-500/20 bg-slate-900/60 px-4 py-1.5 mb-8">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-mono text-xs font-semibold text-cyan-300 uppercase tracking-widest">
              Live Web3 Watch2Earn Portal
            </span>
            <span className="text-slate-600 font-mono text-xs">|</span>
            <span className="text-slate-400 font-mono text-xs font-bold bg-cyan-400/10 text-cyan-400 px-1.5 py-0.5 rounded">
              80% PAYOUT
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
            Turn Your Screen Time <br className="hidden md:inline" />
            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-electric-blue bg-clip-text text-transparent">
              Into Real Crypto
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mx-auto mt-6 max-w-2xl text-base text-slate-400 sm:text-lg md:text-xl">
            Watch short video ads, complete micro-tasks, and earn verified USDT daily. 
            Powered by smart integrations where <span className="text-white font-semibold">You keep 80%</span> of the ad revenue, and the platform keeps a 20% house commission.
          </p>

          {/* Call to action button */}
          <div className="mx-auto mt-10 max-w-sm sm:flex sm:max-w-none sm:justify-center">
            <div className="space-y-4 sm:space-y-0 sm:inline-flex sm:space-x-4">
              <button
                onClick={onStart}
                className="cursor-pointer glow-btn inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-electric-blue via-blue-600 to-cyan-500 px-8 py-4 text-base font-bold text-white transition-all duration-300 md:text-lg hover:brightness-110"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Social Proof Stats Matrix */}
        <div className="mt-20 border-y border-slate-800 bg-slate-950/40 py-10 backdrop-blur-sm sm:mt-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 text-center sm:grid-cols-3">
              <div className="flex flex-col items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-950/50 border border-cyan-500/20">
                  <Users className="h-6 w-6 text-cyan-400" />
                </div>
                <span className="mt-4 font-display text-3xl font-extrabold text-white">20M+</span>
                <span className="mt-1 font-sans text-sm text-slate-400 font-semibold tracking-wide uppercase">
                  Global Registered Users
                </span>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-950/50 border border-blue-500/20">
                  <Wallet className="h-6 w-6 text-blue-400" />
                </div>
                <span className="mt-4 font-display text-3xl font-extrabold text-white">$45M+ USDT</span>
                <span className="mt-1 font-sans text-sm text-slate-400 font-semibold tracking-wide uppercase">
                  Withdrawn Safely
                </span>
              </div>

              <div className="flex flex-col items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-950/50 border border-purple-500/20">
                  <Sparkles className="h-6 w-6 text-purple-400" />
                </div>
                <span className="mt-4 font-display text-3xl font-extrabold text-white">4.8 ★</span>
                <span className="mt-1 font-sans text-sm text-slate-400 font-semibold tracking-wide uppercase">
                  Community Rating
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mt-24 sm:mt-32">
          <div className="text-center">
            <h2 className="font-display text-3xl font-extrabold text-white sm:text-4xl">
              Start Earning in 3 Simple Steps
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-500">
              No technical expertise, Web3 wallet installations, or upfront capital required. Just setup and stream.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-3">
            {/* Step 1 */}
            <div className="relative flex flex-col items-center p-6 border border-slate-800 bg-slate-900/20 rounded-2xl hover:bg-slate-900/30 transition-all duration-300">
              <span className="absolute -top-6 left-6 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-electric-blue to-teal-500 font-display text-lg font-bold text-white shadow-lg shadow-electric-blue/20">
                1
              </span>
              <div className="mt-6 text-center">
                <h3 className="font-display text-xl font-bold text-white">Create Identity</h3>
                <p className="mt-3 text-sm text-slate-400">
                  Register your free, cloud-secure account. Instantly generates a clean, integrated balance worksheet configured to save your earnings securely.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative flex flex-col items-center p-6 border border-slate-800 bg-slate-900/20 rounded-2xl hover:bg-slate-900/30 transition-all duration-300">
              <span className="absolute -top-6 left-6 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-electric-blue font-display text-lg font-bold text-white shadow-lg shadow-cyan-400/20">
                2
              </span>
              <div className="mt-6 text-center">
                <h3 className="font-display text-xl font-bold text-white">Watch & Stream</h3>
                <p className="mt-3 text-sm text-slate-400">
                  Select and play video ads or accomplish quick micro-social tasks. Get rewarded instantly. 
                  <span className="text-emerald-400 font-semibold"> Keep 80%</span> of the advertiser cash payout.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative flex flex-col items-center p-6 border border-slate-800 bg-slate-900/20 rounded-2xl hover:bg-slate-900/30 transition-all duration-300">
              <span className="absolute -top-6 left-6 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 font-display text-lg font-bold text-white shadow-lg shadow-purple-500/20">
                3
              </span>
              <div className="mt-6 text-center">
                <h3 className="font-display text-xl font-bold text-white">Withdraw Instantly</h3>
                <p className="mt-3 text-sm text-slate-400">
                  Paste your standard ERC-20, BEP-20, or TRC-20 USDT wallet address and withdraw directly to your decentralized vault with real blockchain signatures.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 80/20 Model Split Featurette Banner */}
        <div className="mt-20 rounded-3xl border border-glow bg-gradient-to-r from-slate-950 via-slate-900 to-[#11192e] p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                Ethical Revenue Sharing
              </span>
              <h3 className="mt-4 font-display text-2xl font-bold text-white md:text-3xl">
                The Decentralized Platform Split
              </h3>
              <p className="mt-3 text-sm text-slate-400 leading-relaxed md:text-base">
                Traditional ad networks capture 100% of user attention values. We believe attention is asset. 
                Our 80% to 20% model ensures the bulk of promotional revenue reaches your pocket:
              </p>
              
              <ul className="mt-6 space-y-3">
                <li className="flex items-start space-x-2 text-sm text-slate-300">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-emerald-400 shrink-0" />
                  <span><strong>80% Rev Share:</strong> Deposited directly as standard USDT currency value.</span>
                </li>
                <li className="flex items-start space-x-2 text-sm text-slate-300">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-cyan-400 shrink-0" />
                  <span><strong>20% Platform Fee:</strong> Reserved for hosting, security, and developer ecosystem support.</span>
                </li>
                <li className="flex items-start space-x-2 text-sm text-slate-300">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-purple-400 shrink-0" />
                  <span><strong>100% Transparency:</strong> Access fully auditable transaction ledgers directly in your browser.</span>
                </li>
              </ul>
            </div>

            {/* Visualizer card representing 80/20 division */}
            <div className="flex flex-col p-6 rounded-2xl bg-cyber-black border border-slate-800">
              <span className="font-mono text-xs font-semibold text-slate-400">SAMPLE SPLIT GRAPH (1.00 USDT AD BILL)</span>
              
              <div className="mt-4 flex items-center h-8 rounded-lg overflow-hidden font-mono text-[10px] text-center font-bold">
                <div className="h-full bg-gradient-to-r from-cyan-400 to-electric-blue text-white flex items-center justify-center w-[80%] hover:brightness-110 transition-all">
                  User Share: 0.80 USDT (80%)
                </div>
                <div className="h-full bg-slate-800 text-slate-400 flex items-center justify-center w-[20%] hover:brightness-110 transition-all border-l border-slate-700">
                  Platform: 0.20 USDT (20%)
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="block text-xs font-mono text-slate-500">Your Share</span>
                  <span className="text-xl font-display font-extrabold text-cyan-400">0.8000 USDT</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="block text-xs font-mono text-slate-500">Platform Split</span>
                  <span className="text-xl font-display font-bold text-slate-400">0.2000 USDT</span>
                </div>
              </div>

              <div className="mt-4 text-[11px] font-mono text-slate-500 text-center">
                Earn ratios calculate in real-time instantly during all watching processes.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
