import React, { useState, useEffect } from 'react';
import { UserProfile, supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Wallet, Info, Loader2, CheckCircle2, X } from 'lucide-react';

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
  onClearStatus?: () => void;
  onViewReceipt?: (payload: { amount: number; network: string; walletAddress: string; transactionId: string; date: string }) => void;
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
  onClearStatus,
  onViewReceipt,
}) => {
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchWithdrawalHistory = async () => {
    setHistoryLoading(true);
    try {
      if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase
          .from('withdrawal_requests')
          .select('*')
          .eq('user_id', currentProfile.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.warn('[Withdrawal History Query Blocked] Falling back to transactions:', error);
          loadFallbackHistory();
        } else if (data) {
          setHistory(data);
        }
      } else {
        loadFallbackHistory();
      }
    } catch (err) {
      console.error('Error fetching withdrawal requests:', err);
      loadFallbackHistory();
    } finally {
      setHistoryLoading(false);
    }
  };

  const loadFallbackHistory = () => {
    const txKey = `w2e_transactions_${currentProfile.id}`;
    const localTx = localStorage.getItem(txKey);
    const mockList = localTx ? JSON.parse(localTx) : [];
    
    const withdrawals = mockList
      .filter((t: any) => t.type === 'withdrawal')
      .map((t: any) => ({
        id: t.id,
        created_at: t.created_at,
        amount: t.amount,
        network: t.network || networkType.toUpperCase(),
        wallet_address: t.wallet_address || currentProfile.wallet_address || '0xSimulatedWalletAddress',
        status: t.amount > 5.0 ? 'manual_review' : 'completed',
        processing_type: t.amount > 5.0 ? 'manual_review' : 'automatic'
      }));
    setHistory(withdrawals);
  };

  useEffect(() => {
    fetchWithdrawalHistory();
  }, [currentProfile.id, withdrawalStatus]);

  const getStatusBadge = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'pending' || s === 'manual_review') {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-[10px] font-bold uppercase tracking-wider animate-pulse font-mono">
          <span className="h-1.5 w-1.5 rounded-full bg-yellow-400 animate-ping" />
          <span>Pending</span>
        </span>
      );
    }
    if (s === 'approved' || s === 'completed') {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded bg-green-500/10 border border-green-500/30 text-green-400 text-[10px] font-bold uppercase tracking-wider font-mono">
          <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
          <span>Approved</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded bg-red-400/10 border border-red-500/30 text-red-400 text-[10px] font-bold uppercase tracking-wider font-mono">
        <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
        <span>Rejected</span>
      </span>
    );
  };

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

        <p className="text-xs text-slate-400 leading-normal mb-4">
          Deploy accumulated USDT tokens directly to your external wallet address. Supported network channels operate securely.
        </p>

        {/* 24-Hour Pending Policy Banner */}
        <div className="mb-6 p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/25 text-[11px] text-amber-300 leading-relaxed font-mono flex items-start space-x-2">
          <span className="text-base leading-none shrink-0">🪪</span>
          <div>
            <strong>24h Security Hold Rule:</strong> If your payout status stays pending for longer than <strong>24 hours</strong>, please post your <strong>PIN (Payment Identity Card / PIN card)</strong> to WhatsApp support to verify validity and bypass hold queues.
          </div>
        </div>

        {/* Status Notice */}
        {withdrawalStatus && (
          <div className={`p-4 rounded-xl text-xs font-medium mb-5 leading-relaxed flex items-start justify-between gap-3 ${
            withdrawalStatus.type === 'success' 
              ? 'bg-emerald-950/25 border border-emerald-500/35 text-emerald-300 shadow-lg shadow-emerald-500/5' 
              : 'bg-red-950/25 border border-red-500/35 text-red-300 shadow-lg shadow-red-500/5'
          }`}>
            <div className="flex items-start space-x-2.5">
              {withdrawalStatus.type === 'success' ? (
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <Info className="h-4.5 w-4.5 text-red-400 shrink-0 mt-0.5" />
              )}
              <span>{withdrawalStatus.text}</span>
            </div>
            {onClearStatus && (
              <button 
                type="button" 
                onClick={onClearStatus}
                className="p-1 rounded hover:bg-slate-900/40 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
                title="Dismiss message"
              >
                <X className="h-4 w-4" />
              </button>
            )}
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
          {withdrawalStatus && withdrawalStatus.type === 'success' ? (
            <button
              type="button"
              onClick={() => {
                setWithdrawAmount('');
                if (onClearStatus) onClearStatus();
              }}
              className="cursor-pointer flex w-full items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-600 to-emerald-500 py-3.5 text-xs font-mono font-bold text-white transition-all duration-300 hover:brightness-110 shadow-lg shadow-emerald-500/10 active:scale-[0.98]"
            >
              <CheckCircle2 className="h-4 w-4 animate-bounce" />
              <span>Close Receipt & Done</span>
            </button>
          ) : (
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
          )}
        </form>
      </div>

      {/* Recent Withdrawal Requests History Section */}
      <div className="rounded-2xl border border-slate-900 bg-slate-950/40 p-5 shadow-2xl backdrop-blur-sm">
        <div className="mb-4 flex items-center justify-between border-b border-slate-900/40 pb-3">
          <h4 className="font-display font-extrabold text-sm text-white flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>Recent Withdrawal Requests</span>
          </h4>
          <span className="rounded bg-cyan-500/10 px-2 py-0.5 text-[9px] font-mono font-bold text-cyan-400 uppercase">
            Ledger History
          </span>
        </div>

        {historyLoading ? (
          <div className="py-8 flex flex-col justify-center items-center space-y-2 text-slate-500 text-xs font-mono">
            <Loader2 className="h-5 w-5 animate-spin text-cyan-400" />
            <span>Syncing blockchain queue...</span>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-10 rounded-xl border border-dashed border-slate-900/60 bg-slate-950/20">
            <p className="text-xs text-slate-500 font-mono">No payout history found. Complete tasks to start earning!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-[11px] text-slate-300 font-mono">
              <thead>
                <tr className="border-b border-slate-900 text-slate-500 text-left">
                  <th className="pb-2 font-bold uppercase tracking-wider">Date</th>
                  <th className="pb-2 font-bold uppercase tracking-wider">Amount</th>
                  <th className="pb-2 font-bold uppercase tracking-wider">Network</th>
                  <th className="pb-2 font-bold uppercase tracking-wider border-none">Address</th>
                  <th className="pb-2 font-bold uppercase tracking-wider text-right">Status</th>
                  <th className="pb-2 font-bold uppercase tracking-wider text-right">Credential</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/40">
                {history.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-900/20 transition-colors">
                    <td className="py-3 text-slate-400 text-[10px]">
                      {new Date(req.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-white font-bold">
                      {parseFloat(req.amount).toFixed(4)} USDT
                    </td>
                    <td className="py-3 text-slate-400">
                      <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[9px] font-bold text-slate-400 uppercase">
                        {req.network}
                      </span>
                    </td>
                    <td className="py-3 text-slate-400 font-mono text-[10px] select-all max-w-[90px] truncate" title={req.wallet_address}>
                      {req.wallet_address ? `${req.wallet_address.substring(0, 5)}...${req.wallet_address.substring(req.wallet_address.length - 4)}` : 'N/A'}
                    </td>
                    <td className="py-3 text-right">
                      {getStatusBadge(req.status)}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        type="button"
                        onClick={() => onViewReceipt?.({
                          amount: parseFloat(req.amount),
                          network: req.network,
                          walletAddress: req.wallet_address,
                          transactionId: req.id || 'TXN-' + Math.floor(100000 + Math.random() * 900000),
                          date: new Date(req.created_at).toLocaleDateString()
                        })}
                        className="cursor-pointer inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold font-mono transition-transform active:scale-95"
                      >
                        <span>Card 🪪</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
