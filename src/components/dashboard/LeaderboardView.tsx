import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Crown, ArrowUpRight, Sparkles, Loader2, Coins, ArrowUpDown } from 'lucide-react';
import { api } from '../../lib/supabase';
import { UserProfile } from '../../types';

interface LeaderboardViewProps {
  currentProfile: UserProfile | null;
}

export default function LeaderboardView({ currentProfile }: LeaderboardViewProps) {
  const [leaderboard, setLeaderboard] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<'total_earned' | 'referral_count' | 'balance'>('total_earned');

  useEffect(() => {
    async function loadLeaderboard() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await api.profiles.getLeaderboard();
        setLeaderboard(data);
      } catch (err: any) {
        console.error('Leaderboard error:', err);
        setError('Unable to securely retrieve top earners right now. Please test again in a few seconds!');
      } finally {
        setIsLoading(false);
      }
    }
    loadLeaderboard();
  }, []);

  const sortedLeaderboard = [...leaderboard].sort((a, b) => {
    const valA = a[sortField] || 0;
    const valB = b[sortField] || 0;
    return valB - valA;
  });

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="h-5 w-5 text-yellow-400 animate-pulse" />;
      case 1:
        return <Medal className="h-5 w-5 text-slate-300" />;
      case 2:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-xs font-mono font-bold text-slate-500">#{index + 1}</span>;
    }
  };

  const getRankRowStyle = (index: number, isCurrentUser: boolean) => {
    if (isCurrentUser) {
      return 'bg-cyan-950/35 border-l-2 border-l-cyan-400 border-y border-slate-800/80 hover:bg-cyan-950/50';
    }
    switch (index) {
      case 0:
        return 'bg-gradient-to-r from-yellow-950/15 to-transparent border-y border-slate-800/60 hover:bg-slate-900/40';
      case 1:
        return 'bg-gradient-to-r from-slate-900/30 to-transparent border-y border-slate-800/60 hover:bg-slate-900/40';
      case 2:
        return 'bg-gradient-to-r from-amber-950/10 to-transparent border-y border-slate-800/60 hover:bg-slate-900/40';
      default:
        return 'border-b border-slate-900 hover:bg-slate-900/20';
    }
  };

  return (
    <div id="leaderboard-view" className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-electric-blue p-[1px]">
            <div className="flex h-full w-full items-center justify-center rounded-xl bg-cyber-black">
              <Trophy className="h-5 w-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <h2 className="font-display text-lg sm:text-xl font-bold text-white flex items-center gap-1.5">
              USDT Elite Leaderboard
              <Sparkles className="h-4 w-4 text-cyan-400 animate-pulse hidden sm:inline" />
            </h2>
            <p className="text-xs text-slate-400 font-sans">Top 10 most active Web3 earners syncing live</p>
          </div>
        </div>
        
        {/* Sort Controls */}
        <div className="flex items-center space-x-2 self-start sm:self-center">
          <span className="text-xs font-medium text-slate-500">Rank by:</span>
          <div className="inline-flex rounded-lg bg-slate-950 p-1 border border-slate-800">
            <button
              onClick={() => setSortField('total_earned')}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all duration-200 ${
                sortField === 'total_earned'
                  ? 'bg-gradient-to-r from-electric-blue to-cyan-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Total Earned
            </button>
            <button
              onClick={() => setSortField('referral_count')}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all duration-200 ${
                sortField === 'referral_count'
                  ? 'bg-gradient-to-r from-electric-blue to-cyan-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Invites
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-slate-900 bg-slate-950/40">
          <Loader2 className="h-8 w-8 text-cyan-400 animate-spin mb-3 animate-duration-1000" />
          <p className="text-sm font-medium text-slate-400 font-sans animate-pulse">Fetching smart-contract ledger...</p>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-yellow-500/20 bg-yellow-950/10 p-6 text-center">
          <p className="text-sm text-yellow-400/90 font-sans">{error}</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {/* Bento-style Top 3 Showcases */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sortedLeaderboard.slice(0, 3).map((player, idx) => {
              const isCurrentUser = currentProfile && player.id === currentProfile.id;
              const borderColors = [
                'border-yellow-500/30 hover:border-yellow-500/50 bg-yellow-950/5',
                'border-slate-400/20 hover:border-slate-400/45 bg-slate-900/10',
                'border-amber-700/25 hover:border-amber-700/40 bg-amber-950/5'
              ];
              const medals = [
                <Crown key="1" className="h-6 w-6 text-yellow-500 animate-bounce" />,
                <Medal key="2" className="h-6 w-6 text-slate-300" />,
                <Medal key="3" className="h-6 w-6 text-amber-600" />
              ];
              const rankTitles = ['Platform Champion', 'Elite Contributor', 'Rising Master'];

              return (
                <div
                  key={player.id}
                  className={`relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 hover:translate-y-[-2px] ${borderColors[idx]} ${
                    isCurrentUser ? 'ring-1 ring-cyan-500/30' : ''
                  }`}
                >
                  <div className="absolute top-0 right-0 p-3 opacity-15">
                    <Trophy className="h-20 w-20 text-white" />
                  </div>
                  
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold block mb-1">
                        Rank #{idx + 1} • {rankTitles[idx]}
                      </span>
                      <h4 className="font-display text-base font-bold text-slate-200 truncate max-w-[160px]">
                        {player.full_name || 'Anonymous User'}
                      </h4>
                      {isCurrentUser && (
                        <span className="mt-1 inline-block rounded-full bg-cyan-950/60 border border-cyan-400/30 px-2 py-0.5 text-[9px] font-mono font-bold text-cyan-400 uppercase tracking-widest">
                          You
                        </span>
                      )}
                    </div>
                    {medals[idx]}
                  </div>

                  <div className="mt-5 space-y-2.5">
                    <div>
                      <span className="text-[10px] text-slate-500 font-sans">Accumulated Yield:</span>
                      <div className="flex items-center space-x-1.5 mt-0.5">
                        <Coins className="h-4 w-4 text-cyan-400" />
                        <span className="font-mono text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-300">
                          {(player.total_earned || 0).toFixed(4)} <span className="text-xs font-semibold text-cyan-400">USDT</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-xs text-slate-400 font-sans">
                      <span>Referral Count:</span>
                      <span className="font-mono text-slate-200 font-semibold">{player.referral_count || 0} users</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Premium Main Leaderboard Table */}
          <div className="overflow-hidden rounded-2xl border border-slate-900 bg-cyber-black/70 backdrop-blur-md">
            <div className="overflow-x-auto min-w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-900 bg-slate-950/80 font-mono text-[11px] uppercase tracking-wider text-slate-400">
                    <th className="py-4 px-4 sm:px-6 font-bold w-16 text-center">Rank</th>
                    <th className="py-4 px-4 sm:px-6 font-bold">Web3 User</th>
                    <th className="py-4 px-4 sm:px-6 font-bold text-right">Referrals</th>
                    <th className="py-4 px-4 sm:px-6 font-bold text-right">USDT Earned</th>
                    <th className="py-4 px-4 sm:px-6 font-bold text-right hidden sm:table-cell">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/40">
                  {sortedLeaderboard.map((player, index) => {
                    const isCurrentUser = currentProfile && player.id === currentProfile.id;
                    return (
                      <tr 
                        key={player.id} 
                        className={`transition-colors duration-200 ${getRankRowStyle(index, !!isCurrentUser)}`}
                      >
                        {/* Rank */}
                        <td className="py-3.5 px-4 sm:px-6 text-center">
                          <div className="flex items-center justify-center h-7 w-7 mx-auto rounded-lg bg-slate-950/50 border border-slate-900/30">
                            {getRankIcon(index)}
                          </div>
                        </td>
                        
                        {/* User Profile */}
                        <td className="py-3.5 px-4 sm:px-6">
                          <div className="flex items-center space-x-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900/80 font-display text-xs font-bold text-cyan-400 ring-1 ring-slate-800">
                              {(player.full_name || 'U').substring(0, 2).toUpperCase()}
                            </div>
                            <div className="flex flex-col min-w-[120px] max-w-[150px] sm:max-w-[200px]">
                              <span className="font-sans text-xs font-semibold text-slate-200 truncate flex items-center gap-1.5">
                                {player.full_name || 'Anonymous User'}
                                {isCurrentUser && (
                                  <span className="rounded bg-cyan-950 border border-cyan-400/25 px-1 py-0.2 text-[8px] font-mono text-cyan-400">YOU</span>
                                )}
                              </span>
                              <span className="font-mono text-[10px] text-slate-500 truncate">
                                {player.wallet_address 
                                  ? `${player.wallet_address.substring(0, 6)}...${player.wallet_address.substring(player.wallet_address.length - 4)}` 
                                  : player.email ? player.email.replace(/(.{3})(.*)(@.*)/, '$1***$3') : 'No Wallet Connected'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Referrals */}
                        <td className="py-3.5 px-4 sm:px-6 text-right font-mono text-xs text-slate-300">
                          <span className="rounded bg-slate-950/60 border border-slate-900/50 px-2 py-0.5 text-slate-400 font-bold">
                            {player.referral_count || 0}
                          </span>
                        </td>

                        {/* USDT Earned */}
                        <td className="py-3.5 px-4 sm:px-6 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <span className="font-mono text-xs font-bold text-white">
                              {(player.total_earned || 0).toFixed(4)}
                            </span>
                            <span className="font-mono text-[10px] text-cyan-400/90 font-semibold">USDT</span>
                          </div>
                        </td>

                        {/* Joined Date */}
                        <td className="py-3.5 px-4 sm:px-6 text-right font-mono text-[11px] text-slate-500 hidden sm:table-cell">
                          {new Date(player.created_at || Date.now()).toLocaleDateString([], { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Bottom Proof Metric bar */}
            <div className="bg-slate-950/80 px-4 sm:px-6 py-3 border-t border-slate-900 border-dashed flex flex-col sm:flex-row items-center justify-between gap-2.5">
              <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                <Coins className="h-3 w-3 text-cyan-500" />
                Commission model splits 80% to active users & 20% system nodes.
              </span>
              <span className="text-[10px] text-cyan-400 font-mono flex items-center gap-1">
                Crypto Leader Rank Reset: 24h Epoch intervals <ArrowUpRight className="h-3 w-3" />
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
