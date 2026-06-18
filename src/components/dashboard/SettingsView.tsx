import React from 'react';
import { UserProfile } from '../../lib/supabase';
import { Gift, Users, Sparkles, CheckCircle, Copy, UserPlus, Loader2, ArrowUpRight } from 'lucide-react';

interface SettingsViewProps {
  currentProfile: UserProfile;
  settingsWallet: string;
  setSettingsWallet: (val: string) => void;
  settingsStatus: { type: 'success' | 'error', text: string } | null;
  settingsLoading: boolean;
  onUpdateWalletSubmit: (e: React.FormEvent) => void;
  inviteLink: string;
  copiedLink: boolean;
  onCopyInvite: () => void;
  isProd: boolean;
  isSimulatingInvite: boolean;
  onSimulateInvite: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentProfile,
  settingsWallet,
  setSettingsWallet,
  settingsStatus,
  settingsLoading,
  onUpdateWalletSubmit,
  inviteLink,
  copiedLink,
  onCopyInvite,
  isProd,
  isSimulatingInvite,
  onSimulateInvite,
}) => {
  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      {/* WALLET ADDRESS MANAGER SPEC */}
      <div className="rounded-2xl border border-white/5 bg-slate-950/40 p-6 backdrop-blur-sm shadow-xl">
        <h3 className="font-display font-extrabold text-base text-white mb-2">Decentralized Recipient Wallet</h3>
        <p className="text-xs text-slate-400 mb-4">
          Establish or update your permanent saved recipient wallet below to receive automatic payout dispatch signals cleanly.
        </p>

        {settingsStatus && (
          <div className={`p-4 rounded-xl text-xs font-medium mb-4 leading-relaxed ${
            settingsStatus.type === 'success' 
              ? 'bg-emerald-950/20 border border-emerald-500/20 text-emerald-300' 
              : 'bg-red-950/20 border border-red-500/20 text-red-300'
          }`}>
            <span>{settingsStatus.text}</span>
          </div>
        )}

        <form onSubmit={onUpdateWalletSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            required
            placeholder="Enter USDT TRC20 (T...) or BEP20 (0x...) Address"
            value={settingsWallet}
            onChange={(e) => setSettingsWallet(e.target.value)}
            className="flex-1 rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
          />
          <button
            type="submit"
            disabled={settingsLoading}
            className="cursor-pointer px-5 py-3 rounded-xl bg-gradient-to-r from-electric-blue to-cyan-500 text-xs font-bold text-white hover:brightness-110 disabled:opacity-50 transition-all font-mono whitespace-nowrap"
          >
            {settingsLoading ? 'Saving...' : 'Sync Address'}
          </button>
        </form>
      </div>

      {/* REFERRAL SYSTEM PANEL */}
      <div className="rounded-2xl border border-glow-blue bg-slate-950/40 p-6 backdrop-blur-sm space-y-5 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Gift className="h-5 w-5 text-cyan-400" />
            <h3 className="font-display font-extrabold text-lg text-white">Referral Dividends</h3>
          </div>
          <span className="rounded bg-cyan-500/10 px-2 py-0.5 text-[9px] font-mono font-bold text-cyan-400 uppercase tracking-widest">
            5% Lifetime Share
          </span>
        </div>

        <p className="text-xs text-slate-400 leading-normal">
          Invite friends to discover extreme Watch-to-Earn streams! You will receive a secure <span className="text-cyan-300 font-bold">5% bonus referral yield</span> on all accomplished payouts instantly.
        </p>

        {/* Stats segment */}
        <div className="grid grid-cols-2 gap-3.5">
          <div className="bg-slate-900/40 rounded-xl p-3 border border-white/5 space-y-1">
            <span className="text-[9px] text-slate-500 uppercase tracking-wider font-mono">Invited Users</span>
            <div className="flex items-center space-x-1.5 pt-0.5">
              <Users className="h-4 w-4 text-cyan-400" />
              <span className="text-base font-bold text-white font-mono">{currentProfile.referral_count || 0}</span>
            </div>
          </div>
          <div className="bg-slate-900/40 rounded-xl p-3 border border-white/5 space-y-1">
            <span className="text-[9px] text-slate-500 uppercase tracking-wider font-mono">Referral Income</span>
            <div className="flex items-center space-x-1 pt-0.5">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-base font-bold text-emerald-400 font-mono">{(currentProfile.referral_earnings || 0).toFixed(4)} <span className="text-[9px] text-slate-400 font-sans">USDT</span></span>
            </div>
          </div>
        </div>

        {/* Invite link copy */}
        <div className="space-y-1.5 pt-2">
          <span className="block text-[9px] font-mono uppercase tracking-widest text-slate-500">Your Shareable Invite URL</span>
          <div className="relative flex items-center rounded-xl bg-slate-950 border border-slate-900 p-1 pl-3 overflow-hidden select-none">
            <span className="text-[11px] text-slate-400 truncate max-w-[280px] sm:max-w-md font-mono">{inviteLink}</span>
            <button
              type="button"
              onClick={onCopyInvite}
              className="cursor-pointer ml-auto flex items-center space-x-1 rounded-lg bg-slate-1000 text-cyan-400 text-xs px-3.5 py-1.5 font-bold hover:bg-slate-900 transition-colors border border-slate-800"
            >
              {copiedLink ? (
                <>
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Sandbox Multi-User Demo Simulator */}
        {!isProd && (
          <div className="pt-2 border-t border-slate-900">
            <button
              type="button"
              disabled={isSimulatingInvite}
              onClick={onSimulateInvite}
              className="cursor-pointer flex w-full items-center justify-center space-x-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-400 text-xs py-2.5 font-semibold text-center border border-cyan-500/10 active:scale-[0.98] transition-all"
            >
              {isSimulatingInvite ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Spinning up test invitee...</span>
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  <span>Simulate Test Invite (Yield Demo)</span>
                </>
              )}
            </button>
            <p className="text-[9px] text-slate-500 mt-1.5 text-center font-mono">
              Registers a mock invitee who streams ads. Watch your 5% passive bonus flow in dynamically!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
