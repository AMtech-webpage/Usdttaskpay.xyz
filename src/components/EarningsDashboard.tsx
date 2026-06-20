import React, { useState, useEffect } from 'react';
import { UserProfile, AdCampaign, MicroTask, Transaction, api, isSupabaseConfigured } from '../lib/supabase';
import { detectLocationSecurity } from '../lib/geo';
import { 
  Coins, 
  Wallet, 
  Play, 
  Check,
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
  X,
  Users,
  Gift,
  UserPlus,
  Menu,
  LayoutDashboard,
  Settings,
  PlusCircle,
  Trophy,
  Globe,
  RefreshCw,
  Shield
} from 'lucide-react';
import { motion } from 'motion/react';
import { NINReceiptCard } from './dashboard/NINReceiptCard';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { OffersView } from './dashboard/OffersView';
import { TasksView } from './dashboard/TasksView';
import { WithdrawView } from './dashboard/WithdrawView';
import { SettingsView } from './dashboard/SettingsView';
import LeaderboardView from './dashboard/LeaderboardView';
import LeaderboardWidget from './dashboard/LeaderboardWidget';

interface EarningsDashboardProps {
  currentProfile: UserProfile;
  onProfileChange: (updated: UserProfile) => void;
  onLogout: () => void;
  onOpenDeveloperPane: () => void;
  onNavigateToLegal?: (page: 'terms' | 'privacy' | 'contact') => void;
}

export const EarningsDashboard: React.FC<EarningsDashboardProps> = ({
  currentProfile,
  onProfileChange,
  onLogout,
  onOpenDeveloperPane,
  onNavigateToLegal
}) => {
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [tasks, setTasks] = useState<MicroTask[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Responsive tab and dialog state helpers
  const [dashboardTab, setDashboardTab] = useState<'dashboard' | 'offers' | 'tasks' | 'withdraw' | 'settings' | 'leaderboard'>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

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
  const [activeReceipt, setActiveReceipt] = useState<{
    amount: number;
    network: string;
    walletAddress: string;
    transactionId: string;
    date: string;
  } | null>(null);

  // Settings form states
  const [settingsWallet, setSettingsWallet] = useState(currentProfile.wallet_address || '');
  const [settingsStatus, setSettingsStatus] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(false);

  // Copied alert state
  const [copiedTxId, setCopiedTxId] = useState<string | null>(null);

  // Referral system states
  const [copiedLink, setCopiedLink] = useState(false);
  const [isSimulatingInvite, setIsSimulatingInvite] = useState(false);

  // Timeframe and daily login check-in modal states
  const [timeframe, setTimeframe] = useState<7 | 30>(7);
  const [showDailyBonusAlert, setShowDailyBonusAlert] = useState<{ streak: number; reward: number } | null>(null);

  // Location detection states
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const performLocationDetection = async (forceRefresh = false) => {
    if (!currentProfile?.id) return;
    setIsDetectingLocation(true);
    setGeoError(null);
    try {
      const geo = await detectLocationSecurity();
      // Only write to database if the stored info is different or we explicitly force a refresh
      const needsDatabaseUpdate = forceRefresh || 
        !currentProfile.country || 
        currentProfile.ip_address !== geo.ip ||
        currentProfile.is_vpn_proxy !== geo.is_vpn_proxy;

      if (needsDatabaseUpdate) {
        const updated = await api.profiles.updateLocationMetadata(currentProfile.id, {
          country: geo.country,
          country_code: geo.country_code,
          region: geo.region,
          city: geo.city,
          ip_address: geo.ip,
          is_vpn_proxy: geo.is_vpn_proxy,
          vpn_provider: geo.vpn_provider
        });
        if (updated) {
          onProfileChange(updated);
        }
      }
    } catch (err: any) {
      console.error('Error during automatic geolocation check:', err);
      setGeoError(err.message || 'Unable to load location security status');
    } finally {
      setIsDetectingLocation(false);
    }
  };

  useEffect(() => {
    if (currentProfile?.id) {
      // Auto-run on load
      performLocationDetection(false);
    }
  }, [currentProfile?.id]);

  const inviteLink = `${window.location.origin}${window.location.pathname}?ref=${currentProfile.referral_code || currentProfile.id}`;

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const getTrendData = () => {
    const data: { date: string; amount: number }[] = [];
    const now = new Date();
    
    const limit = timeframe;
    for (let i = limit - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      const dateQueryStr = d.toISOString().split('T')[0];
      
      let dayAmount = 0;
      transactions.forEach((tx) => {
        if (tx.status === 'completed' && tx.amount > 0) {
          const txDateStr = new Date(tx.created_at).toISOString().split('T')[0];
          if (txDateStr === dateQueryStr) {
            dayAmount += tx.amount;
          }
        }
      });

      data.push({
        date: dateStr,
        amount: parseFloat(dayAmount.toFixed(4))
      });
    }

    const hasTxPoints = data.some((item) => item.amount > 0);
    if (!hasTxPoints && currentProfile.total_earned > 0) {
      const total = currentProfile.total_earned;
      const pieces = Math.min(5, limit);
      const share = total / pieces;
      const seedIndices = limit === 7 ? [1, 2, 4, 5, 6] : [5, 12, 18, 24, 28];
      seedIndices.forEach((idx, i) => {
        if (data[idx]) {
          data[idx].amount = parseFloat((share * (1 + (i % 3) * 0.1)).toFixed(4));
        }
      });
    }
    return data;
  };

  const handleSimulateInvite = async () => {
    if (isSimulatingInvite) return;
    setIsSimulatingInvite(true);
    try {
      const mockNames = [
        "Gold_Satoshi", "Web3_Whale", "Yield_Hunter", "Ether_Chef", 
        "Alpha_Surfer", "Staking_King", "USDT_Collector", "DeFi_Ninja"
      ];
      const randomName = mockNames[Math.floor(Math.random() * mockNames.length)] + '_' + Math.random().toString(36).substring(2, 5);
      const mockEmail = `${randomName.toLowerCase()}@w2earntest.net`;
      const mockUserId = `mock-ref-${Math.random().toString(36).substring(2, 11)}`;
      
      const inviteeProfile = {
        id: mockUserId,
        email: mockEmail,
        full_name: randomName,
        balance: 0.1000,
        total_earned: 0.1000,
        total_platform_commission: 0.0250,
        wallet_address: '',
        created_at: new Date().toISOString(),
        referred_by: currentProfile.id,
        referral_code: `ref_${Math.random().toString(36).substring(2, 6)}`,
        referral_earnings: 0.0000,
        referral_count: 0
      };

      // 1. Put this mock profile in localStorage
      localStorage.setItem(`w2e_profile_${mockUserId}`, JSON.stringify(inviteeProfile));

      // 2. Load and add to mock users list
      const usersList = JSON.parse(localStorage.getItem('w2e_users') || '[]');
      usersList.push({
        id: mockUserId,
        email: mockEmail,
        user_metadata: { full_name: randomName },
        profile: inviteeProfile
      });
      localStorage.setItem('w2e_users', JSON.stringify(usersList));

      // 3. Update the inviter's referral count
      const updatedProfile = {
        ...currentProfile,
        referral_count: (currentProfile.referral_count || 0) + 1
      };
      
      localStorage.setItem(`w2e_profile_${currentProfile.id}`, JSON.stringify(updatedProfile));
      onProfileChange(updatedProfile);

      // 4. Create action logs & transactions for the inviter!
      const txKey = `w2e_transactions_${currentProfile.id}`;
      const userTxs = JSON.parse(localStorage.getItem(txKey) || '[]');
      userTxs.unshift({
        id: `tx-invite-joined-${Math.random().toString(36).substring(2, 9)}`,
        user_id: currentProfile.id,
        type: 'microtask',
        amount: 0.0000,
        status: 'completed',
        tx_hash: `0x${Array.from({length: 40}, () => 'abcdef0123456789'[Math.floor(Math.random() * 16)]).join('')}`,
        created_at: new Date().toISOString(),
        description: `🎉 Invitee ${randomName} connected via your link`
      });
      localStorage.setItem(txKey, JSON.stringify(userTxs));
      setTransactions(userTxs);

      // 5. Automatically simulate passive ad-streaming rewards after 4 seconds!
      setTimeout(async () => {
        const adRevenue = 0.5000; // Total advertiser payout
        const userShare = 0.4000; // 80% kept by user
        
        // Update mock invitee balance
        inviteeProfile.balance = parseFloat((inviteeProfile.balance + userShare).toFixed(6));
        inviteeProfile.total_earned = parseFloat((inviteeProfile.total_earned + userShare).toFixed(6));
        localStorage.setItem(`w2e_profile_${mockUserId}`, JSON.stringify(inviteeProfile));

        // Update inviter profile with 5% passive bonus split
        const bonus = parseFloat((userShare * 0.05).toFixed(6)); // 5% of ad payout = 0.02 USDT bonus!
        const latestProfile = JSON.parse(localStorage.getItem(`w2e_profile_${currentProfile.id}`) || JSON.stringify(updatedProfile));
        latestProfile.balance = parseFloat((latestProfile.balance + bonus).toFixed(6));
        latestProfile.total_earned = parseFloat((latestProfile.total_earned + bonus).toFixed(6));
        latestProfile.referral_earnings = parseFloat(((latestProfile.referral_earnings || 0) + bonus).toFixed(6));
        
        localStorage.setItem(`w2e_profile_${currentProfile.id}`, JSON.stringify(latestProfile));
        onProfileChange(latestProfile);

        // Inject referral yield log
        const updatedTxs = JSON.parse(localStorage.getItem(txKey) || '[]');
        updatedTxs.unshift({
          id: `tx-invite-bonus-${Math.random().toString(36).substring(2, 9)}`,
          user_id: currentProfile.id,
          type: 'microtask',
          amount: bonus,
          status: 'completed',
          tx_hash: `0x${Array.from({length: 40}, () => 'abcdef0123456789'[Math.floor(Math.random() * 16)]).join('')}`,
          created_at: new Date().toISOString(),
          description: `⚡ Received 5% Referral Payout from ${randomName}'s High-Yield Stream`
        });
        localStorage.setItem(txKey, JSON.stringify(updatedTxs));
        setTransactions(updatedTxs);
      }, 4000);

    } catch (e) {
      console.error('Failed to simulate referral registration:', e);
    } finally {
      setIsSimulatingInvite(false);
    }
  };

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

  const [isClaimingBonus, setIsClaimingBonus] = useState(false);
  const [bonusClaimError, setBonusClaimError] = useState<string | null>(null);

  const handleClaimDailyBonus = async () => {
    setIsClaimingBonus(true);
    setBonusClaimError(null);
    try {
      const result = await api.profiles.checkAndApplyDailyLoginBonus(currentProfile.id);
      if (result && result.awarded) {
        setShowDailyBonusAlert({
          streak: result.streak,
          reward: result.reward
        });
        onProfileChange(result.profile);
        // Update transaction records with check-in log
        const liveTransactions = await api.transactions.list(currentProfile.id);
        setTransactions(liveTransactions);
      } else if (result && result.message) {
        setBonusClaimError(result.message);
      }
    } catch (e: any) {
      console.warn('Daily check-in verification failed:', e);
      setBonusClaimError(e.message || 'Failed to complete daily check-in.');
    } finally {
      setIsClaimingBonus(false);
    }
  };

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
      // Execute database withdrawal passing the selected network token channel
      const updatedProfile = await api.profiles.withdraw(
        currentProfile.id,
        amount,
        withdrawAddress,
        networkType.toUpperCase()
      );

      onProfileChange(updatedProfile);
      setWithdrawAmount('');
      
      const newTxnId = 'TXN-' + Math.floor(100000 + Math.random() * 900000);
      setActiveReceipt({
        amount: amount,
        network: networkType.toUpperCase(),
        walletAddress: withdrawAddress,
        transactionId: newTxnId,
        date: new Date().toLocaleDateString()
      });

      setWithdrawalStatus({
        type: 'success',
        text: `Payout requested! Your withdrawal of ${amount.toFixed(4)} USDT is pending admin review and will be processed within 24 hours to address ${withdrawAddress.substring(0, 6)}...${withdrawAddress.substring(withdrawAddress.length - 4)} (${networkType.toUpperCase()}).`
      });

      // Synchronize datasets
      await loadDashboardData();
    } catch (err: any) {
      setWithdrawalStatus({ type: 'error', text: err.message || 'Withdrawal failed.' });
    } finally {
      setWithdrawalLoading(false);
    }
  };

  const handleUpdateWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsStatus(null);
    setSettingsLoading(true);
    try {
      const updatedProfile = await api.profiles.updateProfileWallet(currentProfile.id, settingsWallet);
      onProfileChange(updatedProfile);
      setWithdrawAddress(settingsWallet); // Synchronize state with withdrawal form recipient
      setSettingsStatus({ type: 'success', text: 'Decentralized USDT Wallet address updated successfully.' });
    } catch (err: any) {
      setSettingsStatus({ type: 'error', text: err.message || 'Failed to update wallet address.' });
    } finally {
      setSettingsLoading(false);
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

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'offers', label: 'Offers', icon: Play },
    { id: 'tasks', label: 'Task', icon: Smartphone },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'withdraw', label: 'Withdraw', icon: Wallet },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  const renderNavLinks = (closeMobileMenu: boolean) => {
    return (
      <div className="space-y-1.5">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = dashboardTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setDashboardTab(item.id);
                if (closeMobileMenu) {
                  setIsMobileMenuOpen(false);
                }
              }}
              className={`cursor-pointer w-full flex items-center space-x-3 rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                isActive
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/40 border border-transparent'
              }`}
            >
              <IconComponent className={`h-4 w-4 shrink-0 ${isActive ? 'text-cyan-400 animate-pulse' : 'text-slate-400'}`} />
              <span className="font-sans leading-none">{item.label}</span>
            </button>
          );
        })}
      </div>
    );
  };

  const renderAddTaskCTA = (closeMobileMenu: boolean) => {
    return (
      <button
        onClick={() => {
          if (closeMobileMenu) {
            setIsMobileMenuOpen(false);
          }
          setIsAddTaskModalOpen(true);
        }}
        className="group w-full cursor-pointer mt-4 flex items-center space-x-3 rounded-xl border border-dashed border-cyan-500/25 bg-cyan-950/15 hover:bg-cyan-950/30 px-4 py-3.5 text-[10px] font-black uppercase tracking-widest text-cyan-400 hover:border-cyan-400/50 transition-all shadow-lg duration-300"
      >
        <PlusCircle className="h-4.5 w-4.5 shrink-0 text-cyan-300 group-hover:rotate-90 transition-transform duration-300" />
        <span>🚀 Add Your Task</span>
      </button>
    );
  };

  return (
    <div className="relative bg-[#0A0E17] min-h-[calc(100vh-4rem)] flex flex-col md:flex-row select-none">
      {/* Background cyber structures */}
      <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />

      {/* MOBILE NAV BANNER */}
      <div className="md:hidden sticky top-0 z-50 flex h-16 items-center justify-between bg-black border-b border-cyan-950/45 shadow-[0_1px_10px_rgba(0,191,255,0.15)] px-4 w-full shrink-0">
        {/* LEFT: Menu / Hamburger */}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 -ml-1 text-[#00f2fe] hover:text-cyan-300 rounded-lg transition-all cursor-pointer"
        >
          <Menu className="h-6 w-6 text-cyan-400" />
        </button>

        {/* CENTER: Clean app branding */}
        <div className="flex items-center">
          <span className="font-display text-sm font-black uppercase tracking-widest text-[#00f2fe] bg-gradient-to-r from-cyan-400 to-electric-blue bg-clip-text text-transparent">
            EXTREME
          </span>
        </div>

        {/* RIGHT: Glowing user balance */}
        <div className="flex items-center">
          <div className="inline-flex items-center space-x-1.5 rounded-full bg-emerald-950/35 border border-emerald-500/20 px-2.5 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="font-mono text-xs font-extrabold text-emerald-400">
              {currentProfile.balance.toFixed(4)} <span className="text-[9px] text-emerald-500 font-bold">USDT</span>
            </span>
          </div>
        </div>
      </div>

      {/* PERSISTENT SIDEBAR - DESKTOP */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-800/80 bg-[#0C1221]/40 p-6 space-y-8 select-none shrink-0 z-20">
        <div className="space-y-1">
          <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-[#06B6D4]">Control Console</span>
          <p className="text-[10px] text-slate-400 font-medium font-sans">Extreme v2.4 Portal</p>
        </div>

        <nav className="flex-1 space-y-2">
          {renderNavLinks(false)}
          {renderAddTaskCTA(false)}
        </nav>

        <div className="border-t border-slate-900 pt-4 font-mono text-[9px] text-slate-500 space-y-0.5">
          <p className="truncate">User: {currentProfile.full_name}</p>
          {currentProfile.user_pid && (
            <p className="text-amber-500 font-bold">NIN: {currentProfile.user_pid}</p>
          )}
          <p className="text-cyan-500/80">Role: Pro Streamer</p>
        </div>
      </aside>

      {/* SLIDE-OUT MOBILE DRAWER NAV */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop overlay */}
          <div 
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300"
          />

          {/* Drawer content drawer */}
          <div className="relative flex flex-col w-72 max-w-sm h-full bg-[#0A0E17] border-r border-[#161b28] p-6 space-y-8 shadow-2xl z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <span className="font-display text-base font-black text-white">Watch<span className="text-cyan-400 bg-gradient-to-r from-cyan-400 to-electric-blue bg-clip-text text-transparent">2Earn</span></span>
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <nav className="flex-grow space-y-2">
              {renderNavLinks(true)}
              {renderAddTaskCTA(true)}
              
              {/* Mobile Legal Submenu links */}
              <div className="border-t border-[#131924] pt-4 mt-4 space-y-1.5">
                <span className="block font-mono text-[9px] uppercase tracking-wider text-slate-500 font-bold px-3">
                  Resources & Support
                </span>
                <span 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onNavigateToLegal?.('contact');
                  }}
                  className="block w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-400 hover:text-emerald-300 hover:bg-slate-900/60 cursor-pointer transition-colors"
                >
                  Help & Contact Desk
                </span>
                <span 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onNavigateToLegal?.('terms');
                  }}
                  className="block w-full text-left px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-cyan-400 hover:bg-slate-900/60 cursor-pointer transition-colors"
                >
                  Terms & Conditions
                </span>
                <span 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onNavigateToLegal?.('privacy');
                  }}
                  className="block w-full text-left px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-cyan-400 hover:bg-slate-900/60 cursor-pointer transition-colors"
                >
                  Privacy Policy
                </span>
              </div>
            </nav>

            <div className="border-t border-slate-900 pt-4 font-mono text-[9px] text-slate-400 space-y-0.5">
              <p className="truncate">Session: {currentProfile.email}</p>
              {currentProfile.user_pid && (
                <p className="text-amber-500 font-bold">NIN: {currentProfile.user_pid}</p>
              )}
              <p className="text-cyan-600">Secure AES Split Ledger</p>
            </div>
          </div>
        </div>
      )}

      {/* MAIN VIEW CONTENT CONTAINER */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 z-10 w-full">
        {dashboardTab === 'dashboard' && (
          <div className="space-y-8">
            {/* User Greeting Title */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="font-display text-2xl font-black text-white sm:text-3xl">
                  Web3 Earnings Panel
                </h1>
                <p className="text-sm text-slate-400">
                  Welcome back, <span className="text-cyan-400 font-semibold">{currentProfile.full_name}</span>. Trace your attention revenue split from this control panel.
                </p>
              </div>
            </div>

            {/* Triple Summary Cards (Bento style) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Main Balance Display Card (span 6) */}
              <div className="md:col-span-12 xl:col-span-6 bg-[#161B28] rounded-3xl p-6 border border-white/5 flex flex-col justify-between shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 h-40 w-40 bg-cyan-500/5 blur-[80px] rounded-full pointer-events-none" />
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] text-cyan-400 font-mono font-bold uppercase tracking-widest">Available Wallet Balance</span>
                    <span className="text-[10px] px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded font-mono font-bold">80% User Yield</span>
                  </div>
                  <div className="text-4xl font-mono font-black tracking-tighter text-white">
                    {currentProfile.balance.toFixed(4)} <span className="text-sm font-semibold text-cyan-400/80">USDT</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Min. threshold of <strong className="text-white">2.0000 USDT</strong> applies for secure off-chain blockchain routing.
                  </p>
                  
                  <div className="mt-4 flex">
                    <button
                      onClick={() => {
                        setWithdrawalStatus(null);
                        setIsWithdrawModalOpen(true);
                      }}
                      className="cursor-pointer w-full flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-electric-blue hover:brightness-110 active:scale-[0.98] transition-all px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 border border-cyan-400/20 group"
                    >
                      <Wallet className="h-4 w-4 text-cyan-300 group-hover:scale-110 transition-transform" />
                      <span>Request Secure Payout (Modal)</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-white/5 font-mono">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">Accumulated</p>
                    <p className="font-bold text-sm text-slate-200">{aggregateTotalEarned.toFixed(4)} USDT</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">Attention share</p>
                    <p className="font-bold text-sm text-emerald-400 font-bold">80/20 Contract</p>
                  </div>
                </div>
              </div>

              {/* Geolocation Security Anchor Card (span 6) */}
              <div className="md:col-span-12 xl:col-span-6 bg-[#161B28] rounded-3xl p-6 border border-white/5 flex flex-col justify-between shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 h-40 w-40 bg-orange-500/5 blur-[80px] rounded-full pointer-events-none" />
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] text-amber-400 font-mono font-bold uppercase tracking-widest flex items-center gap-1">
                      <Shield className="h-3.5 w-3.5 text-amber-400" />
                      Location Security System
                    </span>
                    <button
                      onClick={() => performLocationDetection(true)}
                      disabled={isDetectingLocation}
                      className="cursor-pointer text-[10px] px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-slate-300 rounded font-mono font-bold flex items-center gap-1 transition-all"
                    >
                      <RefreshCw className={`h-2.5 w-2.5 ${isDetectingLocation ? 'animate-spin' : ''}`} />
                      <span>Refresh Check</span>
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-1">
                    <div>
                      <div className="text-sm font-semibold text-slate-400 flex items-center gap-1.5 font-mono">
                        <Globe className="h-4 w-4 text-cyan-400" />
                        <span>IP: {currentProfile.ip_address || 'Detecting...'}</span>
                      </div>
                      
                      <div className="text-xl font-bold text-white mt-1.5 tracking-tight flex items-center gap-2">
                        <span>{currentProfile.country ? `${currentProfile.city || 'Resolving'}, ${currentProfile.region || ''}` : 'Resolving IP Address...'}</span>
                        {currentProfile.country_code && (
                          <span className="text-xs font-mono py-0.5 px-2 rounded bg-cyan-950 border border-cyan-500/20 text-cyan-400 uppercase font-black">
                            {currentProfile.country_code}
                          </span>
                        )}
                      </div>
                      
                      {currentProfile.country && (
                        <p className="text-[10px] text-slate-400 mt-1 font-sans">
                          Country Verified: <span className="text-slate-200 font-semibold">{currentProfile.country}</span>
                        </p>
                      )}
                    </div>

                    <div className="sm:text-right shrink-0">
                      <span className="text-[10px] text-slate-500 uppercase font-mono block">Security Standard</span>
                      {currentProfile.is_vpn_proxy ? (
                        <span className="inline-flex mt-1 items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 font-mono text-[10px] font-bold">
                          ⚠️ VPN/Proxy Detected
                        </span>
                      ) : (
                        <span className="inline-flex mt-1 items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold">
                          ✓ Secure Direct Node
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {geoError && (
                  <div className="mt-3 p-2 bg-red-950/30 border border-red-500/10 rounded-xl text-[10px] text-red-400">
                    ⚠️ {geoError}
                  </div>
                )}

                {currentProfile.is_vpn_proxy && (
                  <div className="mt-3.5 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-300 leading-normal font-sans">
                    <strong>Proxy/VPN Policy Flagged:</strong> Payout regulations require matching country rules under strict anti-sybil consensus. Ensure your connection does not mask your original ISP to avoid payout review delays.
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/5 font-mono text-[11px]">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">ISP/PROVIDER</span>
                    <span className="font-semibold text-slate-300 truncate block max-w-[150px]">{currentProfile.vpn_provider || 'Local Network Partner'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">STATUS RATING</span>
                    <span className={`font-semibold ${currentProfile.is_vpn_proxy ? 'text-amber-400' : 'text-emerald-400'} block`}>
                      {currentProfile.is_vpn_proxy ? 'Proxy Restriction' : 'A+ Compliant'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cumulative Earned Card (span 2) */}
              <div className="md:col-span-4 xl:col-span-2 bg-[#161B28] rounded-3xl p-6 border border-white/5 flex flex-col justify-between shadow-lg">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest font-mono">All-Time Revenue</span>
                  </div>
                  <p className="text-2xl font-mono font-bold text-white tracking-tight">{aggregateTotalEarned.toFixed(4)}</p>
                  <p className="text-[10px] text-slate-400 mt-1">Total revenue converted via verified video streams & tasks.</p>
                </div>
                
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono">
                  <CheckCircle className="h-3 w-3 shrink-0" />
                  <span>Full Ledger Synced</span>
                </div>
              </div>

              {/* House Platform Fee card (span 2) */}
              <div className="md:col-span-4 xl:col-span-2 bg-[#161B28] rounded-3xl p-6 border border-white/5 flex flex-col justify-between shadow-lg">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest font-mono">Platform Commission</span>
                  </div>
                  <p className="text-2xl font-mono font-bold text-cyan-400 tracking-tight">{aggregateCommissionPaid.toFixed(4)} <span className="text-xs text-slate-400 font-sans">USDT</span></p>
                  <p className="text-[10px] text-slate-400 mt-1 font-sans">20% fee reserved for routing protocols and database servers.</p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-1.5 text-[10px] text-cyan-400 font-mono">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></span>
                  <span>20% Model Verified</span>
                </div>
              </div>

              {/* Dynamic Login Streak Card (span 2) */}
              <div className="md:col-span-4 xl:col-span-2 bg-[#161B28] rounded-3xl p-6 border border-white/5 flex flex-col justify-between shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Flame className="h-10 w-10 text-orange-500" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest font-mono">Daily Login Bonus</span>
                  </div>
                  <p className="text-2xl font-mono font-bold text-orange-500 tracking-tight">
                    {currentProfile.login_streak || 0} <span className="text-xs text-slate-400 font-sans">Days</span>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 font-sans">Streak resets if check-in is missed by 24h.</p>
                  
                  {bonusClaimError && (
                    <div className="mt-2.5 p-2 rounded-xl bg-red-950/40 border border-red-500/20 text-[10px] text-red-400 leading-tight font-sans">
                      ⚠️ {bonusClaimError}
                    </div>
                  )}
                </div>

                <div className="mt-3.5 pt-3 border-t border-white/5">
                  {currentProfile.last_login_date === new Date().toISOString().split('T')[0] ? (
                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono font-extrabold bg-emerald-500/10 py-1.5 px-2.5 rounded-xl border border-emerald-500/10 justify-center w-full">
                      <Check className="h-3.5 w-3.5 shrink-0" />
                      <span>Claimed for Today!</span>
                    </div>
                  ) : (
                    <button
                      onClick={handleClaimDailyBonus}
                      disabled={isClaimingBonus}
                      className="cursor-pointer w-full text-center text-[10px] uppercase font-sans font-bold bg-gradient-to-r from-orange-500 to-amber-500 hover:brightness-110 disabled:brightness-75 py-2.5 px-3 rounded-xl border border-orange-400/20 shadow-md shadow-orange-500/5 transition-all text-white flex items-center justify-center gap-1.5"
                    >
                      {isClaimingBonus ? (
                        <>
                          <span className="w-2.5 h-2.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          <span>Verifying Task...</span>
                        </>
                      ) : (
                        <>
                          <Flame className="h-3.5 w-3.5 shrink-0 animate-pulse text-white" />
                          <span>Claim 0.0001 USDT</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* 30-Day Earnings Trend Chart */}
            <div className="bg-[#161B28] rounded-3xl p-6 border border-white/5 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-cyan-400" />
                    <h3 className="font-display font-extrabold text-lg text-white">USDT Yield Trend</h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 font-sans">
                    Visualizing your authentic attention share performance over the {timeframe === 7 ? 'past week' : 'past month'}.
                  </p>
                </div>
                
                <div className="flex items-center gap-2 bg-[#0C111D] p-1 rounded-xl border border-white/5 w-fit">
                  <button
                    onClick={() => setTimeframe(7)}
                    className={`cursor-pointer text-[10px] uppercase font-mono font-bold px-3 py-1.5 rounded-lg transition-all ${timeframe === 7 ? 'bg-gradient-to-r from-cyan-500 to-sky-500 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                  >
                    Past Week (7D)
                  </button>
                  <button
                    onClick={() => setTimeframe(30)}
                    className={`cursor-pointer text-[10px] uppercase font-mono font-bold px-3 py-1.5 rounded-lg transition-all ${timeframe === 30 ? 'bg-gradient-to-r from-cyan-500 to-sky-500 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                  >
                    Past Month (30D)
                  </button>
                </div>
              </div>

              <div className="h-[230px] w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getTrendData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      stroke="#64748B" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis 
                      stroke="#64748B" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false}
                      dx={-5}
                      tickFormatter={(v) => `${v.toFixed(2)}`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#0F172A', 
                        borderColor: 'rgba(255,255,255,0.08)', 
                        borderRadius: '16px', 
                        fontSize: '11px', 
                        color: '#fff',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)' 
                      }} 
                      labelStyle={{ color: '#22D3EE', fontWeight: 'bold' }}
                      itemStyle={{ color: '#E2E8F0' }}
                      formatter={(value: any) => [`${parseFloat(value).toFixed(4)} USDT`, 'Earnings']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#06B6D4" 
                      strokeWidth={2.5} 
                      dot={{ r: 3, fill: '#06B6D4', stroke: '#151b26', strokeWidth: 1.5 }} 
                      activeDot={{ r: 5, fill: '#22D3EE', strokeWidth: 0 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* DUAL SECTION: GENERAL HISTORY LEDGER & REALTIME LEADERBOARD WIDGET */}
            <div id="dashboard-bottom-row-grid" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* AUDIT CODES / HISTORICAL LOG LIST */}
              <div id="attention-ledger-container" className="lg:col-span-7 rounded-3xl border border-white/5 bg-[#161B28] p-6 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="mb-4 flex items-center justify-between pb-3 border-b border-white/5">
                    <div className="flex items-center space-x-2">
                      <History className="h-5 w-5 text-slate-400" />
                      <h3 className="font-display font-extrabold text-[#E2E8F0] text-base">Attention Ledger History</h3>
                    </div>
                    <BookOpen className="h-4 w-4 text-slate-500" />
                  </div>

                  {isLoading ? (
                    <div className="flex justify-center p-12">
                      <Loader2 className="h-5 w-5 animate-spin text-cyan-400" />
                    </div>
                  ) : transactions.length === 0 ? (
                    <div className="p-6 rounded-2xl bg-slate-950/40 text-center text-slate-600 text-xs font-mono border border-slate-900">
                      No registered database entries yet. Completed videos or withdrawals output details here.
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                      {transactions.map((tx) => (
                        <div key={tx.id} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-900 space-y-1.5 hover:border-slate-800 transition-all">
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="block text-[11px] font-semibold text-slate-200 line-clamp-1">{tx.description}</span>
                              <span className="block text-[9px] font-mono text-slate-500 mt-0.5">
                                {new Date(tx.created_at).toLocaleString()}
                              </span>
                            </div>
                            
                            <div className="text-right">
                              <span className={`block text-[11px] font-mono font-bold ${
                                tx.type === 'withdrawal' ? 'text-red-400' : 'text-emerald-400'
                              }`}>
                                {tx.type === 'withdrawal' ? '-' : '+'}{tx.amount.toFixed(4)} USDT
                              </span>
                              <span className="block text-[8px] font-mono text-slate-500 uppercase tracking-widest leading-none mt-0.5">
                                {tx.type}
                              </span>
                            </div>
                          </div>

                          {tx.tx_hash && (
                            <div className="flex items-center justify-between border-t border-slate-900/60 pt-1.5 text-[9px] font-mono">
                              <span className="text-slate-500">Tx ID: {tx.tx_hash.substring(0, 10)}...{tx.tx_hash.substring(tx.tx_hash.length - 10)}</span>
                              <button
                                onClick={() => copyToClipboard(tx.tx_hash!, tx.id)}
                                className="cursor-pointer text-[9px] text-cyan-500/85 hover:text-cyan-450 hover:underline flex items-center space-x-1"
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

              {/* REAL-TIME TOP EARNERS LEADERBOARD WIDGET */}
              <div id="top-earners-widget-container" className="lg:col-span-5 flex flex-col justify-stretch">
                <LeaderboardWidget 
                  currentProfile={currentProfile}
                  onNavigateTab={(tabId) => setDashboardTab(tabId)}
                />
              </div>
            </div>
          </div>
        )}

        {dashboardTab === 'offers' && (
          <OffersView 
            campaigns={campaigns}
            isLoading={isLoading}
            onWatchAd={handleWatchAd}
          />
        )}

        {dashboardTab === 'tasks' && (
          <TasksView 
            tasks={tasks}
            isLoading={isLoading}
            onCompleteTask={handleCompleteTask}
          />
        )}

        {dashboardTab === 'withdraw' && (
          <WithdrawView 
            currentProfile={currentProfile}
            withdrawAddress={withdrawAddress}
            setWithdrawAddress={setWithdrawAddress}
            withdrawAmount={withdrawAmount}
            setWithdrawAmount={setWithdrawAmount}
            withdrawalLoading={withdrawalLoading}
            withdrawalStatus={withdrawalStatus}
            networkType={networkType}
            setNetworkType={setNetworkType}
            onWithdrawSubmit={handleWithdraw}
            onClearStatus={() => setWithdrawalStatus(null)}
            onViewReceipt={setActiveReceipt}
          />
        )}

        {dashboardTab === 'settings' && (
          <SettingsView 
            currentProfile={currentProfile}
            settingsWallet={settingsWallet}
            setSettingsWallet={setSettingsWallet}
            settingsStatus={settingsStatus}
            settingsLoading={settingsLoading}
            onUpdateWalletSubmit={handleUpdateWallet}
            inviteLink={inviteLink}
            copiedLink={copiedLink}
            onCopyInvite={copyInviteLink}
            isProd={isProd}
            isSimulatingInvite={isSimulatingInvite}
            onSimulateInvite={handleSimulateInvite}
          />
        )}

        {dashboardTab === 'leaderboard' && (
          <LeaderboardView 
            currentProfile={currentProfile}
          />
        )}
      </main>

      {/* CONSECUTIVE DAILY LOGIN STREAK REWARD SUCCESS DIALOG */}
      {showDailyBonusAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div 
            className="relative max-w-sm w-full bg-[#111622] border border-orange-550/30 rounded-3xl p-6 shadow-2xl text-center overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-500" />
            <div className="absolute -right-10 -top-10 h-32 w-32 bg-orange-500/10 blur-2xl rounded-full" />
            
            <button 
              onClick={() => setShowDailyBonusAlert(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/10 border border-orange-500/20 mb-4 text-orange-450 animate-bounce">
              <Flame className="h-7 w-7 text-orange-500" />
            </div>

            <span className="font-mono text-[9px] uppercase tracking-widest text-orange-400 font-bold block">
              Dynamic On-Chain Loyalty Split
            </span>
            <h3 className="font-display text-xl font-bold text-white mt-1">
              Login Streak Awarded!
            </h3>
            
            <div className="bg-slate-950/50 rounded-2xl p-4 my-4 border border-white/5 font-mono">
              <p className="text-xs text-slate-400">Current Login Streak</p>
              <p className="text-2xl font-black text-white mt-0.5">{showDailyBonusAlert.streak} Days</p>
              
              <div className="h-px bg-white/5 my-2" />
              
              <p className="text-xs text-slate-400">Claimed Rewards</p>
              <p className="text-xl font-black text-orange-400 mt-0.5">+{showDailyBonusAlert.reward.toFixed(4)} USDT</p>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed font-sans mt-2">
              Consecutive login bonuses scale automatically up to 7+ days. Keep streaming tomorrow to expand your yield split!
            </p>

            <button
              onClick={() => setShowDailyBonusAlert(null)}
              className="cursor-pointer mt-5 w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:brightness-110 active:scale-[0.98] rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-orange-500/15 border border-orange-400/20 transition-all font-sans"
            >
              Claim & Start Tasks
            </button>
          </div>
        </div>
      )}

      {/* ADVERTISING / ADD TASK CALL-TO-ACTION DIALOG POPUP */}
      {isAddTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-cyan-500/20 bg-[#0C1221] p-6 shadow-2xl">
            <div className="absolute top-0 right-0 h-40 w-40 bg-cyan-500/5 blur-3xl pointer-events-none" />
            
            <div className="flex justify-between items-start mb-4">
              <h4 className="font-display font-extrabold text-[#fff] text-lg uppercase tracking-wide">
                🚀 Advertise In Extreme W2E
              </h4>
              <button 
                onClick={() => setIsAddTaskModalOpen(false)}
                className="p-1 rounded-lg border border-slate-800 text-slate-400 hover:text-white bg-slate-950/60 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed mb-6 font-medium">
              Do you want to add a task? Follow this link:{' '}
              <span className="text-cyan-400 font-bold underline">usdt-addtask.vercel.app</span> to let people do your own tasks!
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <a 
                href="https://usdt-addtask.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsAddTaskModalOpen(false)}
                className="flex-1 cursor-pointer flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-500 to-electric-blue hover:brightness-110 shadow-lg shadow-cyan-500/10 py-3 px-5 text-center text-xs font-extrabold text-white uppercase tracking-wider font-sans transition-all"
              >
                <span>Navigate to usdt-addtask.vercel.app</span>
                <ArrowUpRight className="h-4 w-4" />
              </a>
              <button 
                onClick={() => setIsAddTaskModalOpen(false)}
                className="cursor-pointer py-3 px-5 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-all font-sans"
              >
                Close Dialog
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECURE WITHDRAWAL REQUEST OVERLAY MODAL */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-cyan-500/30 bg-[#0C1221] p-6 shadow-2xl">
            <div className="absolute top-0 right-0 h-40 w-40 bg-cyan-500/5 blur-3xl pointer-events-none" />
            
            {/* Modal Header */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-display font-extrabold text-white text-lg uppercase tracking-wide flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
                  🔐 Secure USDT Payout
                </h4>
                <p className="text-slate-400 text-xs mt-0.5 font-mono">Verified Web3 Decentralized Settlement</p>
              </div>
              <button 
                onClick={() => {
                  setIsWithdrawModalOpen(false);
                  setWithdrawalStatus(null);
                }}
                className="p-1 rounded-lg border border-slate-800 text-slate-400 hover:text-white bg-slate-950/60 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Account Stats Frame */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 mb-5 flex justify-between items-center">
              <div>
                <span className="block text-[10px] text-slate-500 uppercase tracking-widest font-mono">Available Balance</span>
                <span className="text-xl font-mono font-bold text-white">{currentProfile.balance.toFixed(4)} USDT</span>
              </div>
              <button 
                onClick={() => setWithdrawAmount(currentProfile.balance.toString())}
                className="cursor-pointer px-2.5 py-1 text-[10px] uppercase font-mono font-bold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 rounded-md transition-all active:scale-95"
              >
                Max Amount
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleWithdraw} className="space-y-4">
              {/* Wallet Address Input */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider font-sans">Destination Chain Wallet Address</label>
                  {currentProfile.wallet_address && (
                    <button
                      type="button"
                      onClick={() => setWithdrawAddress(currentProfile.wallet_address || '')}
                      className="cursor-pointer text-[10px] text-cyan-400 font-mono hover:underline"
                    >
                      Use Saved
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={withdrawAddress}
                    onChange={(e) => setWithdrawAddress(e.target.value)}
                    placeholder="Enter TRC-20 (T...) or ERC-20 (0x...) wallet"
                    className="w-full bg-slate-950/80 border border-slate-800 focus:border-cyan-500/35 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-650 focus:outline-none transition-all font-mono"
                  />
                </div>
              </div>

              {/* Amount Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider font-sans">Withdrawal Amount (USDT)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    required
                    min="2"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Minimum 2.0000"
                    className="w-full bg-slate-950/80 border border-slate-800 focus:border-cyan-500/35 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-655 focus:outline-none transition-all font-mono"
                  />
                  <div className="absolute right-3 top-3 text-[10px] font-mono font-medium text-slate-550">USDT</div>
                </div>
              </div>

              {/* Network Selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider font-sans">Select Routing Chain Protocol</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'trc20', label: 'TRON / TRC20', speed: 'Ultra Fast', fee: '~0.00 Fee' },
                    { id: 'bep20', label: 'BSC / BEP20', speed: 'Fast Cycle', fee: 'No Gas Fee' },
                    { id: 'erc20', label: 'ETH / ERC20', speed: 'Moderate', fee: 'Platform pays' },
                  ].map((net) => {
                    const isSelected = networkType === net.id;
                    return (
                      <button
                        key={net.id}
                        type="button"
                        onClick={() => setNetworkType(net.id as any)}
                        className={`cursor-pointer p-2.5 rounded-xl border text-left transition-all ${
                          isSelected 
                            ? 'bg-cyan-500/10 border-cyan-500/40 text-white shadow-md font-bold' 
                            : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-900/40'
                        }`}
                      >
                        <span className="block text-[11px] font-bold font-sans">{net.label}</span>
                        <span className="block text-[8px] font-mono text-slate-500 mt-1">{net.speed}</span>
                        <span className="block text-[8px] font-mono text-cyan-400/80 font-semibold">{net.fee}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Warnings / Model Rules description info board */}
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-900 space-y-1">
                <div className="flex gap-1.5 text-[10px] text-slate-400 font-sans">
                  <CheckCircle className="h-3 w-3 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>80% Yield Rule:</strong> You retain 80% with zero hidden operational gas charges.</span>
                </div>
                <div className="flex gap-1.5 text-[10px] text-slate-400 font-sans">
                  <CheckCircle className="h-3 w-3 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Secure Encryption:</strong> Split-ledger ledger synchronization preserves account state.</span>
                </div>
              </div>

              {/* Status notifications */}
              {withdrawalStatus && (
                <div className={`p-4 rounded-xl text-xs font-mono border ${
                  withdrawalStatus.type === 'success' 
                    ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' 
                    : 'bg-red-500/10 border-red-500/25 text-red-400'
                }`}>
                  <div className="flex space-x-2">
                    <Info className="h-4 w-4 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{withdrawalStatus.text}</span>
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              {withdrawalStatus && withdrawalStatus.type === 'success' ? (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsWithdrawModalOpen(false);
                      setWithdrawalStatus(null);
                      setWithdrawAmount('');
                    }}
                    className="w-full cursor-pointer flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-500 hover:brightness-110 shadow-lg shadow-emerald-500/15 py-3.5 px-5 text-center text-xs font-extrabold text-white uppercase tracking-wider font-sans transition-all"
                  >
                    <span>Close Receipt & Done</span>
                  </button>
                </div>
              ) : (
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={withdrawalLoading}
                    className="flex-1 cursor-pointer flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:brightness-110 disabled:opacity-50 shadow-md shadow-emerald-500/15 py-3 px-5 text-center text-xs font-extrabold text-white uppercase tracking-wider font-sans transition-all"
                  >
                    {withdrawalLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Broadcasting Ledger...</span>
                      </>
                    ) : (
                      <span>Broadcast Payout</span>
                    )}
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setIsWithdrawModalOpen(false);
                      setWithdrawalStatus(null);
                    }}
                    className="cursor-pointer py-3 px-5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-850 text-slate-300 text-xs font-bold uppercase tracking-wider transition-all font-sans"
                  >
                    Close
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

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
                  <img 
                    src={activeAd.thumbnail} 
                    alt="Active Playing ad" 
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 h-full w-full object-cover opacity-30 blur-sm pointer-events-none" 
                  />
                  
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
                      Do not refresh or swap the active tab. System attention check algorithms must sign at zero validation.
                    </p>
                  </div>

                  <div className="absolute bottom-0 left-0 h-1 bg-cyan-400 transition-all duration-1000 ease-linear" 
                       style={{ width: `${((activeAd.duration - countdown) / activeAd.duration) * 100}%` }} 
                  />
                </>
              ) : (
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

      {activeReceipt && (
        <NINReceiptCard
          profile={currentProfile}
          amount={activeReceipt.amount}
          network={activeReceipt.network}
          walletAddress={activeReceipt.walletAddress}
          transactionId={activeReceipt.transactionId}
          date={activeReceipt.date}
          onClose={() => setActiveReceipt(null)}
        />
      )}
    </div>
  );
};
