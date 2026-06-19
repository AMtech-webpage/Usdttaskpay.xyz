import React, { useState, useEffect } from 'react';
import { Trophy, Crown, Medal, Flame, Sparkles, RefreshCw, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { api, supabase } from '../../lib/supabase';
import { UserProfile } from '../../types';

interface LeaderboardWidgetProps {
  currentProfile: UserProfile | null;
  onNavigateTab: (tabId: 'dashboard' | 'offers' | 'tasks' | 'leaderboard' | 'withdraw' | 'settings') => void;
}

export default function LeaderboardWidget({ currentProfile, onNavigateTab }: LeaderboardWidgetProps) {
  const [leaderboard, setLeaderboard] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    try {
      const data = await api.profiles.getLeaderboard();
      // Take top 5 for the widget view
      setLeaderboard(data.slice(0, 5));
    } catch (err: any) {
      console.error('Leaderboard widget fetch error:', err);
      setError('Connection interrupted');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();

    let channel: any = null;

    if (supabase) {
      try {
        channel = supabase
          .channel('db-leaderboard-changes')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'profiles' },
            (payload) => {
              console.log('[Real-time Leaderboard Trigger]', payload);
              // Trigger refresh on database mutation events
              loadData();
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              setIsLive(true);
            } else {
              setIsLive(false);
            }
          });
      } catch (err) {
        console.warn('Real-time database subscription failed:', err);
      }
    }

    // Proactive fallbacks to guarantee database state freshing (every 12 seconds)
    const fallbackPollInterval = setInterval(() => {
      loadData();
    }, 12000);

    return () => {
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
      clearInterval(fallbackPollInterval);
    };
  }, []);

  const getRankStyle = (index: number) => {
    switch (index) {
      case 0:
        return {
          icon: <Crown className="h-4.5 w-4.5 text-yellow-400 animate-pulse" />,
          bgColor: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500',
          ring: 'ring-yellow-500/20'
        };
      case 1:
        return {
          icon: <Medal className="h-4.5 w-4.5 text-slate-350" />,
          bgColor: 'bg-slate-300/10 border-slate-300/20 text-slate-300',
          ring: ''
        };
      case 2:
        return {
          icon: <Medal className="h-4.5 w-4.5 text-amber-600" />,
          bgColor: 'bg-amber-600/10 border-amber-600/25 text-amber-600',
          ring: ''
        };
      default:
        return {
          icon: <span className="text-[10px] font-mono font-black text-slate-400">#{index + 1}</span>,
          bgColor: 'bg-slate-950/80 border-slate-900 text-slate-400',
          ring: ''
        };
    }
  };

  return (
    <div 
      id="top-earners-leaderboard-widget" 
      className="rounded-3xl border border-white/5 bg-[#161B28] p-6 shadow-xl relative overflow-hidden flex flex-col justify-between"
    >
      {/* Background radial highlight */}
      <div className="absolute top-0 right-0 h-36 w-36 bg-cyan-500/5 blur-[50px] rounded-full pointer-events-none" />

      <div>
        {/* Header Section */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
          <div className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-cyan-400" />
            <div>
              <h3 className="font-display font-extrabold text-white text-base">Top Earners</h3>
              <p className="text-[10px] text-slate-400">Live active player ledger</p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 bg-[#0C111D] px-2.5 py-1 rounded-full border border-white/5">
            <span className={`h-1.5 w-1.5 rounded-full ${isLive ? 'bg-cyan-400 animate-pulse' : 'bg-amber-500 animate-pulse'}`}></span>
            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider font-bold">
              {isLive ? 'Live Synced' : 'Syncing'}
            </span>
          </div>
        </div>

        {/* List Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-2">
            <RefreshCw className="h-5 w-5 text-cyan-500 animate-spin" />
            <span className="text-[10px] font-mono text-slate-500 font-bold">Fetching rankings...</span>
          </div>
        ) : error && leaderboard.length === 0 ? (
          <div className="py-8 text-center text-xs text-yellow-500/80 font-sans">
            Offline. Retrying connection...
          </div>
        ) : (
          <div className="space-y-2.5 mb-4">
            {leaderboard.map((user, idx) => {
              const isCurrentUser = currentProfile && user.id === currentProfile.id;
              const rank = getRankStyle(idx);

              return (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.05 }}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-all duration-200 ${
                    isCurrentUser 
                      ? 'bg-cyan-950/25 border-cyan-500/25 shadow-md shadow-cyan-950/10' 
                      : 'bg-[#0f131e]/50 border-slate-900 hover:border-slate-800'
                  }`}
                >
                  {/* Rank Badge & Info */}
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border font-mono font-bold ${rank.bgColor}`}>
                      {rank.icon}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center space-x-1">
                        <span className="text-xs font-semibold text-slate-200 truncate font-sans max-w-[100px] sm:max-w-[120px]">
                          {user.full_name || 'Anonymous'}
                        </span>
                        {isCurrentUser && (
                          <span className="shrink-0 px-1 py-0.2 rounded bg-cyan-500/15 border border-cyan-400/25 text-[7px] font-black font-mono text-cyan-400 uppercase">
                            You
                          </span>
                        )}
                      </div>
                      <span className="block text-[8px] font-mono text-slate-500 truncate leading-tight">
                        {user.wallet_address 
                          ? `${user.wallet_address.substring(0, 4)}...${user.wallet_address.substring(user.wallet_address.length - 4)}` 
                          : user.email ? user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3') : 'No wallet linked'}
                      </span>
                    </div>
                  </div>

                  {/* Earnings Display */}
                  <div className="text-right shrink-0 font-mono">
                    <span className="block text-xs font-black text-slate-100">
                      {(user.total_earned || 0).toFixed(4)}
                    </span>
                    <span className="text-[7.5px] uppercase font-bold text-cyan-400">USDT</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Navigation footer link */}
      <button
        onClick={() => onNavigateTab('leaderboard')}
        className="cursor-pointer w-full group py-2.5 px-3 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 flex items-center justify-between text-[11px] font-bold text-slate-300 transition-all hover:text-white"
      >
        <span className="flex items-center gap-1.5 font-sans">
          <Sparkles className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
          <span>View Detailed Elite 10</span>
        </span>
        <ArrowRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-cyan-450 group-hover:translate-x-1 transition-all" />
      </button>
    </div>
  );
}
