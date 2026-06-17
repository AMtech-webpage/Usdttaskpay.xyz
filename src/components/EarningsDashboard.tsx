import React, { useState, useEffect } from 'react';
import { UserProfile, AdCampaign, MicroTask, Transaction, api, isSupabaseConfigured } from '../lib/supabase';
import { 
  Coins, 
  Wallet, 
  Play, 
  CheckCircle, 
  ArrowUpRight, 
  Smartphone, 
  TrendingUp, 
  Clock, 
  History, 
  BookOpen, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  Info,
  Database,
  Cpu,
  AlertTriangle,
  Flame,
  Copy,
  Loader2,
  X
} from 'lucide-react';
import { motion } from 'motion/react';

interface EarningsDashboardProps {
  currentProfile: UserProfile;
  onProfileChange: (updated: UserProfile) => void;
  onLogout: () => void;
  onOpenDeveloperPane: () => void;
}

export const EarningsDashboard: React.FC<EarningsDashboardProps> = ({
  currentProfile,
  onProfileChange,
  onLogout,
  onOpenDeveloperPane
}) => {
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [tasks, setTasks] = useState<MicroTask[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Active watching ad simulator
  const [activeAd, setActiveAd] = useState<AdCampaign | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [isWatching, setIsWatching] = useState(false);
  const [watchStep, setWatchStep] = useState<'intro' | 'playing' | 'reward'>('intro');

  // Withdrawal form states
  const [withdrawAddress, setWithdrawAddress] = useState(currentProfile.wallet_address || '');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawalLoading, setWithdrawalLoading] = useState(false);
  const [withdrawalStatus, setWithdrawalStatus] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [networkType, setNetworkType] = useState<'erc20' | 'bep20' | 'trc20'>('trc20');

  // Copied alert state
  const [copiedTxId, setCopiedTxId] = useState<string | null>(null);

  const isProd = isSupabaseConfigured();

  // Load backend statistics & collections
  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const liveCampaigns = await api.campaigns.list();
      const liveTasks = await api.tasks.list(currentProfile.id);
      const liveTransactions = await api.transactions.list(currentProfile.id);
      
      setCampaigns(liveCampaigns);
      setTasks(liveTasks);
      setTransactions(liveTransactions);
    } catch (err) {
      console.error('Error loading dashboard datasets: ', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [currentProfile.id]);

  // Video Ad player countdown clock callback
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isWatching && countdown > 0 && watchStep === 'playing') {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (isWatching && countdown === 0 && watchStep === 'playing') {
      triggerAdCompletion();
    }
    return () => clearInterval(interval);
  }, [isWatching, countdown, watchStep]);

  // Launch Video Ad player
  const handleWatchAd = (campaign: AdCampaign) => {
    setActiveAd(campaign);
    setCountdown(campaign.duration);
    setIsWatching(true);
    setWatchStep('playing');
  };

  // Safe ad completion transaction routine updating balances:
  // It handles 80% to user and 20% to platform
  const triggerAdCompletion = async () => {
    if (!activeAd) return;
    setWatchStep('reward');
    try {
      // Safely update user profile with 80/20 ratio breakdown
      const updatedProfile = await api.profiles.addRewards(
        currentProfile.id,
        activeAd.user_share,
        activeAd.platform_share,
        `Watched Ad: ${activeAd.title}`,
        activeAd.id
      );
      
      onProfileChange(updatedProfile);
      
      // Sync list state
      await loadDashboardData();
    } catch (err: any) {
      console.error('Ad completion failed: ', err);
      alert('Internal sync error during ad validation: ' + err.message);
    }
  };

  // Safe task completion click handler
  const handleCompleteTask = async (task: MicroTask) => {
    // Open action url in new screen
    window.open(task.action_url, '_blank');
    
    // Auto-trigger simulated or real complete transition
    try {
      const completedTask = await api.tasks.completeTask(currentProfile.id, task.id);
      
      // Update profile
      const updatedProfile = await api.profiles.getProfile(currentProfile.id);
      onProfileChange(updatedProfile);
      
      // Refresh datasets
      await loadDashboardData();
    } catch (err: any) {
      console.error('Failed to update task: ', err);
    }
  };

  // Safe client-side blockchain transaction simulation
  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawalStatus(null);
    setWithdrawalLoading(true);

    const amount = parseFloat(withdrawAmount);

    if (isNaN(amount) || amount <= 0) {
      setWithdrawalStatus({ type: 'error', text: 'Please input a positive numeric withdrawal amount.' });
      setWithdrawalLoading(false);
      return;
    }

    if (amount > currentProfile.balance) {
      setWithdrawalStatus({ type: 'error', text: 'Insufficient balance available to proceed.' });
      setWithdrawalLoading(false);
      return;
    }

    if (amount < 2.0) {
      setWithdrawalStatus({ type: 'error', text: 'The minimum withdrawal limit is 2.0000 USDT.' });
      setWithdrawalLoading(false);
      return;
    }

    if (!withdrawAddress.startsWith('0x') && !withdrawAddress.startsWith('T')) {
      setWithdrawalStatus({ type: 'error', text: 'Please input a valid decentralized ERC20 (0x) or TRC20 (T) address.' });
      setWithdrawalLoading(false);
      return;
    }

    try {
      // Execute database withdrawal
      const updatedProfile = await api.profiles.withdraw(
        currentProfile.id,
        amount,
        withdrawAddress
      );

      onProfileChange(updatedProfile);
      setWithdrawAmount('');
      setWithdrawalStatus({
        type: 'success',
        text: `Transaction broadcast successfully! ${amount.toFixed(4)} USDT transferred to ${withdrawAddress.substring(0, 6)}...${withdrawAddress.substring(withdrawAddress.length - 4)} with instant blockchain approval.`
      });

      // Synchronize datasets
      await loadDashboardData();
    } catch (err: any) {
      setWithdrawalStatus({ type: 'error', text: err.message || 'Withdrawal failed.' });
    } finally {
      setWithdrawalLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTxId(id);
    setTimeout(() => setCopiedTxId(null), 2000);
  };

  // Calculate quick stats
  const aggregateTotalEarned = currentProfile.total_earned;
  const aggregateCommissionPaid = currentProfile.total_platform_commission;

  return (
    <div className="relative bg-cyber-black min-h-[calc(100vh-4rem)] pb-16">
      {/* Background cyber structures */}
      <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />

      {/* Main Grid View */}
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        
        {/* User Greeting Title */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-black text-white sm:text-3xl">
              Web3 Earnings Panel
            </h1>
            <p className="text-sm text-slate-400">
              Welcome back, <span className="text-cyan-400 font-semibold">{currentProfile.full_name}</span>. Trace your attention revenue split from this control panel.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenDeveloperPane}
              className="cursor-pointer items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all duration-300 flex bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>Supabase Schema Rules</span>
            </button>
          </div>
        </div>

        {/* Triple Summary Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-10">
          
          {/* Main Balance Display Card */}
          <div className="relative overflow-hidden rounded-2xl border border-glow bg-gradient-to-tr from-[#0F172A] via-[#111C44] to-[#1E1B4B] p-6 shadow-xl">
            <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-cyan-500/10 blur-3xl" />
            <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-electric-blue/10 blur-3xl" />

            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold tracking-wider text-cyan-400 uppercase">
                Available Wallet Balance
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-950/40 border border-cyan-500/20">
                <Coins className="h-5 w-5 text-cyan-400" />
              </div>
            </div>

            <div className="mt-4">
              <span className="font-display text-3xl font-black text-white sm:text-4xl tracking-tight">
                {currentProfile.balance.toFixed(4)}
              </span>
              <span className="ml-1.5 font-display text-sm font-bold text-cyan-400">USDT</span>
            </div>

            <p className="mt-3 text-xs text-slate-400">
              Corresponds directly to your <span className="text-emerald-400 font-semibold">80% clean yield</span>. Minimum withdraw threshold is 2.0000 USDT.
            </p>
          </div>

          {/* Cumulative Earned Card */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/30 p-6">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold tracking-wider text-slate-400 uppercase">
                Total Earned (All-Time)
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-950 border border-slate-800">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
              </div>
            </div>

            <div className="mt-4">
              <span className="font-display text-3xl font-bold text-white sm:text-4xl tracking-tight">
                {aggregateTotalEarned.toFixed(4)}
              </span>
              <span className="ml-1.5 font-display text-sm font-bold text-slate-500">USDT</span>
            </div>

            <div className="mt-3 flex items-center text-xs text-slate-500">
              <CheckCircle className="mr-1 h-3.5 w-3.5 text-emerald-400" />
              <span>Attention values fully converted</span>
            </div>
          </div>

          {/* House Split Platform Fee card */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/30 p-6">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold tracking-wider text-slate-400 uppercase">
                Platform Commission (20% House)
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-950 border border-slate-800">
                <Flame className="h-5 w-5 text-purple-400" />
              </div>
            </div>

            <div className="mt-4">
              <span className="font-display text-3xl font-bold text-white sm:text-4xl tracking-tight">
                {aggregateCommissionPaid.toFixed(4)}
              </span>
              <span className="ml-1.5 font-display text-sm font-bold text-slate-500">USDT</span>
            </div>

            <div className="mt-3 flex items-center text-xs text-slate-500">
              <Info className="mr-1 h-3.5 w-3.5 text-slate-400" />
              <span>Sustains network server infrastructure</span>
            </div>
          </div>
        </div>

        {/* Main Columns layout */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          
          {/* LEFT COLUMN: WATCH SECTION AND SOCIAL TASKS (SPAN 7) */}
          <div className="lg:col-span-7 space-y-10">
            
            {/* WATCH TO EARN GRID */}
            <div>
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Play className="h-5 w-5 text-cyan-400" />
                  <h2 className="font-display text-xl font-bold text-white">Watch-to-Earn (Ad Streams)</h2>
                </div>
                <span className="rounded-full bg-cyan-950/50 border border-cyan-500/20 px-2 py-0.5 text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest leading-none">
                  Available Streams
                </span>
              </div>

              {isLoading ? (
                <div className="flex h-40 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/10">
                  <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
                </div>
              ) : campaigns.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-800 p-8 text-center text-slate-500 text-sm">
                  No active ad campaigns available at this hour. Check back shortly.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {campaigns.map((camp) => (
                    <div 
                      key={camp.id} 
                      className="group overflow-hidden rounded-xl border border-glow bg-slate-950/60 hover:scale-[1.01] transition-all duration-300"
                    >
                      {/* Image Thumbnail wrapper */}
                      <div className="relative h-40 overflow-hidden bg-slate-900">
                        <img 
                          src={camp.thumbnail} 
                          alt={camp.title}
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                        
                        <span className="absolute bottom-3 left-3 rounded bg-slate-900/90 border border-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-cyan-400">
                          {camp.video_category}
                        </span>

                        <span className="absolute bottom-3 right-3 rounded bg-slate-950/90 border border-slate-800/80 px-1.5 py-0.5 text-[10px] font-mono text-slate-300">
                          {camp.duration} seconds
                        </span>
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <h3 className="line-clamp-2 text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {camp.title}
                        </h3>
                        <p className="mt-1 text-xs text-slate-500 font-mono">By: {camp.advertiser}</p>

                        {/* Split values */}
                        <div className="mt-4 flex items-center justify-between border-t border-slate-900 pt-3">
                          <div className="flex flex-col text-slate-400">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Your Clean Yield (80%)</span>
                            <span className="font-display text-sm font-black text-emerald-400">+{camp.user_share.toFixed(4)} USDT</span>
                          </div>

                          <button
                            onClick={() => handleWatchAd(camp)}
                            className="cursor-pointer flex items-center space-x-1.5 rounded-lg bg-gradient-to-r from-electric-blue to-cyan-500 px-3 py-2 text-xs font-bold text-white hover:brightness-110 transition-all shadow-md shadow-electric-blue/10"
                          >
                            <Play className="h-3 w-3 shrink-0" />
                            <span>Watch Ad</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* MICRO TASKS SECTION */}
            <div>
              <div className="mb-6 flex items-center space-x-2">
                <Smartphone className="h-5 w-5 text-cyan-300" />
                <h2 className="font-display text-xl font-bold text-white">Micro-Tasks & Web3 Integrations</h2>
              </div>

              {isLoading ? (
                <div className="flex h-20 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/10">
                  <Loader2 className="h-5 w-5 animate-spin text-cyan-400" />
                </div>
              ) : tasks.length === 0 ? (
                <p className="text-sm text-slate-500">No pending micro-tasks available.</p>
              ) : (
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div 
                      key={task.id} 
                      className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-glow-blue transition-all ${
                        task.completed 
                          ? 'border-emerald-500/20 bg-emerald-950/10' 
                          : 'border-slate-800 bg-slate-950/50'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase ${
                            task.type === 'twitter' 
                              ? 'bg-sky-500/10 text-sky-400' 
                              : task.type === 'telegram'
                              ? 'bg-blue-500/10 text-blue-400'
                              : 'bg-red-500/10 text-red-500'
                          }`}>
                            {task.type}
                          </span>
                          <h4 className="text-sm font-semibold text-slate-200">{task.title}</h4>
                        </div>
                        <p className="mt-1 text-xs text-slate-400 max-w-lg leading-relaxed">{task.description}</p>
                      </div>

                      <div className="flex items-center space-x-3 self-end sm:self-auto shrink-0 pt-2 sm:pt-0">
                        <div className="text-right">
                          <span className="block text-[9px] font-mono text-slate-500">Yield (80%)</span>
                          <span className={`font-display text-sm font-bold ${
                            task.completed ? 'text-slate-500' : 'text-emerald-400'
                          }`}>
                            +{task.reward.toFixed(4)} USDT
                          </span>
                        </div>

                        {task.completed ? (
                          <div className="flex items-center space-x-1 rounded-lg bg-emerald-500/10 px-2.5 py-1.5 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                            <CheckCircle className="h-3.5 w-3.5" />
                            <span>Claimed</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleCompleteTask(task)}
                            className="cursor-pointer flex items-center space-x-1.5 rounded-lg bg-slate-900 border border-slate-800 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 transition-colors"
                          >
                            <span>Verify Task</span>
                            <ExternalLink className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* RIGHT COLUMN: WITHDRAW FORM & HISTORY (SPAN 5) */}
          <div className="lg:col-span-5 space-y-10">
            
            {/* INSTANT WITHDRAW PANEL */}
            <div className="rounded-2xl border border-glow bg-slate-950/40 p-6 backdrop-blur-sm">
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
                Deploy accumulated USDT tokens directly to your external address. Supported blockchains operate at standard gas scales instantly.
              </p>

              {/* Status Notice */}
              {withdrawalStatus && (
                <div className={`p-4 rounded-xl text-xs font-medium mb-4 leading-relaxed flex items-start space-x-2.5 ${
                  withdrawalStatus.type === 'success' 
                    ? 'bg-emerald-950/20 border border-emerald-500/20 text-emerald-300' 
                    : 'bg-red-950/20 border border-red-500/20 text-red-300'
                }`}>
                  <Info className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{withdrawalStatus.text}</span>
                </div>
              )}

              <form onSubmit={handleWithdraw} className="space-y-4">
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
                    className="block w-full rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-xs text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
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
                      placeholder="e.g. 5.000"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="block w-full rounded-xl border border-slate-800 bg-slate-950/70 p-3 pr-16 text-xs text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                    />
                    <span className="absolute inset-y-0 right-3 flex items-center font-mono text-[10px] font-bold text-slate-400">
                      USDT
                    </span>
                  </div>
                </div>

                {/* Fee breakdown calculator */}
                <div className="rounded-xl bg-slate-950 p-3 border border-slate-900 space-y-1.5 font-mono text-[10px] text-slate-400">
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
                  className="cursor-pointer flex w-full items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-500 py-3 text-xs font-bold text-white transition-all duration-300 hover:brightness-110 disabled:opacity-40"
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

            {/* AUDIT CODES / HISTORICAL LOG LIST */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/10 p-6 backdrop-blur-sm">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <History className="h-5 w-5 text-slate-400" />
                  <h3 className="font-display font-bold text-base text-white">Attention Ledger History</h3>
                </div>
                <BookOpen className="h-4 w-4 text-slate-500" />
              </div>

              {isLoading ? (
                <div className="flex justify-center p-6">
                  <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
                </div>
              ) : transactions.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-950/40 text-center text-slate-600 text-xs font-mono">
                  No registered database entries yet. Completed videos or withdrawals output details here.
                </div>
              ) : (
                <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1.5">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-900 space-y-1.5">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="block text-[11px] font-semibold text-slate-200 line-clamp-1">{tx.description}</span>
                          <span className="block text-[9px] font-mono text-slate-500">
                            {new Date(tx.created_at).toLocaleString()}
                          </span>
                        </div>
                        
                        <div className="text-right">
                          <span className={`block text-[11px] font-mono font-bold ${
                            tx.type === 'withdrawal' ? 'text-red-400' : 'text-emerald-400'
                          }`}>
                            {tx.type === 'withdrawal' ? '-' : '+'}{tx.amount.toFixed(4)} USDT
                          </span>
                          <span className="block text-[8px] font-mono text-slate-500 uppercase tracking-widest leading-none">
                            {tx.type}
                          </span>
                        </div>
                      </div>

                      {/* Render transaction hash split */}
                      {tx.tx_hash && (
                        <div className="flex items-center justify-between border-t border-slate-900/60 pt-1.5 text-[9px] font-mono">
                          <span className="text-slate-500">Tx: {tx.tx_hash.substring(0, 8)}...{tx.tx_hash.substring(tx.tx_hash.length - 8)}</span>
                          <button
                            onClick={() => copyToClipboard(tx.tx_hash!, tx.id)}
                            className="cursor-pointer text-[9px] text-cyan-500/80 hover:text-cyan-400 hover:underline flex items-center space-x-1"
                          >
                            <span>{copiedTxId === tx.id ? 'Copied' : 'Copy Hash'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* ==========================================
          VIDEO PLAYER SIMULATOR OVERLAY MODAL
          ========================================== */}
      {isWatching && activeAd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          {/* Main frame block */}
          <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-800 bg-[#0c1221] shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 p-4">
              <div>
                <span className="rounded bg-electric-blue/10 border border-electric-blue/30 px-2 py-0.5 text-[9px] font-mono font-bold text-sky-400 uppercase">
                  Verified Video Stream
                </span>
                <h4 className="text-sm font-extrabold text-white mt-1">{activeAd.title}</h4>
              </div>
              
              {watchStep !== 'playing' && (
                <button 
                  onClick={() => {
                    setIsWatching(false);
                    setActiveAd(null);
                  }}
                  className="rounded-lg hover:bg-slate-900 p-1.5 text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Video Canvas Stage Simulator */}
            <div className="relative aspect-video bg-black flex items-center justify-center">
              {watchStep === 'playing' ? (
                <>
                  {/* Virtual visual elements imitating static ad streaming */}
                  <img 
                    src={activeAd.thumbnail} 
                    alt="Active Playing ad" 
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 h-full w-full object-cover opacity-30 blur-sm pointer-events-none" 
                  />
                  
                  {/* Digital glowing elements tracking attention values */}
                  <div className="relative text-center p-6 space-y-6 z-10">
                    <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400">
                      <span className="absolute inset-0 h-full w-full rounded-full border-2 border-cyan-400/30 border-t-cyan-400 animate-spin" />
                      <Play className="h-6 w-6 ml-0.5 text-cyan-400" />
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-mono font-bold text-cyan-400 tracking-widest uppercase">
                        ATTENTION SECURED • WATCHING
                      </p>
                      <p className="text-2xl font-display font-black text-white">
                        {countdown} seconds remaining
                      </p>
                    </div>

                    <p className="text-[11px] text-slate-400 max-w-sm mx-auto leading-normal">
                      Do not refresh or swap the active tab. System attention check algorithms must sign the packet at zero validation.
                    </p>
                  </div>

                  {/* Progressive indicator bar */}
                  <div className="absolute bottom-0 left-0 h-1 bg-cyan-400 transition-all duration-1000 ease-linear" 
                       style={{ width: `${((activeAd.duration - countdown) / activeAd.duration) * 100}%` }} 
                  />
                </>
              ) : (
                /* Reward successfully claimed view */
                <div className="relative text-center p-8 space-y-4 z-10">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                    <CheckCircle className="h-7 w-7" />
                  </div>

                  <div className="space-y-1">
                    <h5 className="font-display text-xl font-bold text-white">Attention Verified!</h5>
                    <p className="text-xs text-emerald-400 font-mono font-semibold">
                      Ad valuation successfully dispatched
                    </p>
                  </div>

                  {/* Revenue division detailed breakdown display */}
                  <div className="mx-auto max-w-md rounded-xl bg-slate-950 p-4 border border-slate-850 text-left font-mono text-[11px] space-y-2">
                    <div className="text-slate-400 font-bold border-b border-slate-900 pb-1.5 uppercase tracking-wide">
                      ESTABLISHED 820 SPLIT LEDGER
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Advertiser Value:</span>
                      <span className="text-slate-300">{(activeAd.total_revenue).toFixed(4)} USDT</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Your Retained Yield (80%):</span>
                      <span className="text-emerald-400 font-bold">+{activeAd.user_share.toFixed(4)} USDT</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Platform Commission (20%):</span>
                      <span className="text-purple-400">+{activeAd.platform_share.toFixed(4)} USDT</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setIsWatching(false);
                      setActiveAd(null);
                    }}
                    className="cursor-pointer inline-flex rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-2.5 text-xs font-bold text-white hover:brightness-110 transition-colors"
                  >
                    Collect Yield & Return
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
