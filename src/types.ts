export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  balance: number; // USDT users keep (80% of ad revenue)
  total_earned: number; // Cumulative USDT users kept
  total_platform_commission: number; // Platform cumulative earnings (20%)
  wallet_address?: string; // Optinal Web3 wallet address
  created_at: string;
  referred_by?: string; // User ID of the inviter
  referral_code?: string; // Unique referral code of this user
  referral_earnings?: number; // Cumulative passive earnings from invitees (5% bonus)
  referral_count?: number; // Total number of successfully referred users
}

export interface AdCampaign {
  id: string;
  title: string;
  advertiser: string;
  duration: number; // In seconds
  total_revenue: number; // Full cost paid by advertiser
  user_share: number; // User gets 80% (e.g. 0.0500 USDT)
  platform_share: number; // Platform gets 20% (e.g. 0.0125 USDT)
  thumbnail: string;
  video_url: string; // Embed or mock video length
  video_category: string;
}

export interface MicroTask {
  id: string;
  title: string;
  description: string;
  reward: number; // USDT
  platform_share: number;
  total_revenue: number;
  type: 'telegram' | 'twitter' | 'youtube' | 'survey' | 'discord';
  action_url: string;
  completed: boolean;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: 'watch_ad' | 'microtask' | 'withdrawal';
  amount: number; // USDT
  platform_share?: number;
  status: 'pending' | 'completed' | 'failed';
  tx_hash?: string; // Mock or actual txn hash
  created_at: string;
  description: string;
}

export interface SystemStats {
  total_users: number;
  total_withdrawn: number;
  community_rating: number;
  payout_rate_percent: number; // Should be 80%
}
