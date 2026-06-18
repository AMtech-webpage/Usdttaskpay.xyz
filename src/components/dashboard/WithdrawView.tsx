import React from 'react';
import { UserProfile } from '../../lib/supabase';
import { Wallet, Info, Loader2 } from 'lucide-react';

interface WithdrawViewProps {
  currentProfile: UserProfile;
  withdrawAddress: string;
  setWithdrawAddress: (val: string) => void;
  withdrawAmount: string;
  setWithdrawAmount: (val: string) => void;
  withdrawalLoading: boolean;
  withdrawalStatus: { type: 'success' | 'error', text: string } | null;
  networkType: 'erc20' | 'bep20' | 'trc20';
  setNetworkType: (type: 'erc20' | 'bep20' | 'trc20') => void;
  onWithdrawSubmit: (e: React.FormEvent) => void;
}

export const WithdrawView: React.FC<WithdrawViewProps> = ({
  currentProfile,
  withdrawAddress,
  setWithdrawAddress,
  withdrawAmount,
  setWithdrawAmount,
  withdrawalLoading,
  withdrawalStatus,
  networkType,
  setNetworkType,
  onWithdrawSubmit,
}) => {
  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div className="rounded-2xl border border-glow bg-slate-950/40 p-6 backdrop-blur-sm shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Wallet className="h-5 w-5 text-cyan-400" />
            <h3 className="font-display font-extrabold text-lg text-white">Decentralized Payouts</h3>
          </div>
          <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[9px] font-mono font-bold text-emerald-400 uppercase">
            Instant Signature
          </span>
        </div>

        <p className="text-xs text-slate-400 leading-normal mb-6">
          Deploy accumulated USDT tokens directly to your external wallet address. Supported network channels operate securely.
        </p>

        {/* Status Notice */}
        {withdrawalStatus && (
          <div className={`p-4 rounded-xl text-xs font-medium mb-5 leading-relaxed flex items-start space-x-2.5 ${
            withdrawalStatus.type === 'success' 
              ? 'bg-emerald-950/20 border border-emerald-500/20 text-emerald-300' 
              : 'bg-red-950/20 border border-red-500/20 text-red-300'
          }`}>
            <Info className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{withdrawalStatus.text}</span>
          </div>
        )}

        <form onSubmit={onWithdrawSubmit} className="space-y-5">
          {/* Network Selection */}
          <div>
            <label className="block text-[10px] font-mono font-semibold tracking-wide text-slate-500 uppercase mb-2">
              Withdrawal Chain Network
            </label>
            <div className="grid grid-cols-3 gap-1 rounded-lg bg-slate-900/60 p-1 border border-slate-900">
              <button
                type="button"
                onClick={() => setNetworkType('trc20')}
                className={`cursor-pointer py-1.5 rounded-md text-[10px] font-semibold transition-all ${
                  networkType === 'trc20'
                    ? 'bg-slate-800 text-cyan-400 font-bold border border-slate-700/60'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                TRC-20 (Tron)
              </button>
              <button
                type="button"
                onClick={() => setNetworkType('bep20')}
                className={`cursor-pointer py-1.5 rounded-md text-[10px] font-semibold transition-all ${
                  networkType === 'bep20'
                    ? 'bg-slate-800 text-cyan-400 font-bold border border-slate-700/60'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                BEP-20 (BSC)
              </button>
              <button
                type="button"
                onClick={() => setNetworkType('erc20')}
                className={`cursor-pointer py-1.5 rounded-md text-[10px] font-semibold transition-all ${
                  networkType === 'erc20'
                    ? 'bg-slate-800 text-cyan-400 font-bold border border-slate-700/60'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ERC-20 (Eth)
              </button>
            </div>
          </div>

          {/* USDT Wallet Address */}
          <div>
            <label className="block text-[10px] font-mono font-semibold tracking-wide text-slate-500 uppercase mb-2">
              Recipient USDT Wallet Address
            </label>
            <input
              type="text"
              required
              placeholder="e.g. TR7NHqjeEToMxFR8yF1DcNH... or 0x8a1c..."
              value={withdrawAddress}
              onChange={(e) => setWithdrawAddress(e.target.value)}
              className="block w-full rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-xs text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
            />
          </div>

          {/* Amount to withdraw */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-[10px] font-mono font-semibold tracking-wide text-slate-500 uppercase">
                Amount to Withdraw (USDT)
              </label>
              <span 
                onClick={() => setWithdrawAmount(currentProfile.balance.toString())}
                className="cursor-pointer text-[10px] font-mono text-cyan-400 hover:underline hover:text-cyan-300"
              >
                Max: {currentProfile.balance.toFixed(4)} USDT
              </span>
            </div>
            
            <div className="relative">
              <input
                type="number"
                step="0.0001"
                required
                placeholder="e.g. 5.0000"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="block w-full rounded-xl border border-slate-800 bg-slate-950/70 p-3 pr-16 text-xs text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
              />
              <span className="absolute inset-y-0 right-3 flex items-center font-mono text-[10px] font-bold text-slate-400 select-none">
                USDT
              </span>
            </div>
          </div>

          {/* Fee breakdown calculator */}
          <div className="rounded-xl bg-slate-950 p-3.5 border border-slate-900 space-y-1.5 font-mono text-[10px] text-slate-400">
            <div className="flex justify-between">
              <span>Requested Amount:</span>
              <span className="text-slate-200">{(parseFloat(withdrawAmount) || 0).toFixed(4)} USDT</span>
            </div>
            <div className="flex justify-between">
              <span>Block Gas Coverage Fee:</span>
              <span className="text-slate-200">0.0000 USDT (Zero)</span>
            </div>
            <div className="flex justify-between border-t border-slate-900 pt-1.5 font-bold">
              <span>Final Amount Settled:</span>
              <span className="text-cyan-400">{(parseFloat(withdrawAmount) || 0).toFixed(4)} USDT</span>
            </div>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={withdrawalLoading || currentProfile.balance < 2}
            className="cursor-pointer flex w-full items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-500 py-3.5 text-xs font-bold text-white transition-all duration-300 hover:brightness-110 disabled:opacity-40"
          >
            {withdrawalLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Broadcasting Signature...</span>
              </>
            ) : currentProfile.balance < 2 ? (
              <span>Requires min. 2.0000 USDT balance</span>
            ) : (
              <span>Execute Blockchain Withdrawal</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
