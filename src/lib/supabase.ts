import { createClient } from '@supabase/supabase-js';
import { UserProfile, Transaction, AdCampaign, MicroTask } from '../types';

export * from '../types';

// Load Supabase environment variables
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase keys are provided and valid (not default placeholders)
export const isSupabaseConfigured = (): boolean => {
  return (
    !!supabaseUrl &&
    supabaseUrl !== 'https://your-supabase-project.supabase.co' &&
    !!supabaseAnonKey &&
    supabaseAnonKey !== 'your-supabase-anon-key'
  );
};

// Initialize the real Supabase client if configured
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

// ==========================================
// MOCK STATE SEEDING (FOR SANDBOX OFFLINE MODE)
// ==========================================
const DEFAULT_CAMPAIGNS: AdCampaign[] = [
  {
    id: 'campaign-1',
    title: 'Solana Mobile Saga 2: The Future of dApp Stores',
    advertiser: 'Solana Labs',
    duration: 15,
    total_revenue: 0.0625,
    user_share: 0.0500, // 80%
    platform_share: 0.0125, // 20%
    thumbnail: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?q=80&w=640&auto=format&fit=crop',
    video_url: 'https://www.w3sheets.com/mock-video-1', 
    video_category: 'Hardware'
  },
  {
    id: 'campaign-2',
    title: 'Uniswap v4 Hooks: Fully Customizable Liquidity Pools',
    advertiser: 'Uniswap Labs',
    duration: 20,
    total_revenue: 0.1000,
    user_share: 0.0800, // 80%
    platform_share: 0.0200, // 20%
    thumbnail: 'https://images.unsplash.com/photo-1622630998477-20aa696ecb05?q=80&w=640&auto=format&fit=crop',
    video_url: 'https://www.w3sheets.com/mock-video-2',
    video_category: 'DeFi Code'
  },
  {
    id: 'campaign-3',
    title: 'Optimism Superchain: Scaling Ethereum Together',
    advertiser: 'Optimism Foundation',
    duration: 12,
    total_revenue: 0.0500,
    user_share: 0.0400, // 80%
    platform_share: 0.0100, // 20%
    thumbnail: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=640&auto=format&fit=crop',
    video_url: 'https://www.w3sheets.com/mock-video-3',
    video_category: 'Layer 2'
  },
  {
    id: 'campaign-4',
    title: 'Chainlink CCIP: Secure Cross-Chain Transfers',
    advertiser: 'Chainlink',
    duration: 18,
    total_revenue: 0.0750,
    user_share: 0.0600, // 80%
    platform_share: 0.0150, // 20%
    thumbnail: 'https://images.unsplash.com/photo-1642104704074-907c0698cbd9?q=80&w=640&auto=format&fit=crop',
    video_url: 'https://www.w3sheets.com/mock-video-4',
    video_category: 'Oracle Infra'
  }
];

const DEFAULT_TASKS: MicroTask[] = [
  {
    id: 'task-1',
    title: 'Join Watch2Earn Official Telegram',
    description: 'Join our telegram channel to get daily booster coupons, network system updates, and USDT airdrops.',
    reward: 0.2500,
    platform_share: 0.0625,
    total_revenue: 0.3125,
    type: 'telegram',
    action_url: 'https://t.me/watch2earn_usdt',
    completed: false
  },
  {
    id: 'task-2',
    title: 'Follow @Watch2EarnUSDT on X',
    description: 'Follow our official X (formerly Twitter) page, like, and retweet our pinned release tweet.',
    reward: 0.1500,
    platform_share: 0.0375,
    total_revenue: 0.1875,
    type: 'twitter',
    action_url: 'https://x.com/watch2earn_usdt',
    completed: false
  },
  {
    id: 'task-3',
    title: 'Retweet CCIP Integration Announcement',
    description: 'Spread the word about our Chainlink CCIP integration for instant high-security USDT withdrawals.',
    reward: 0.1000,
    platform_share: 0.0250,
    total_revenue: 0.1250,
    type: 'twitter',
    action_url: 'https://x.com/watch2earn_usdt/status/123456',
    completed: false
  },
  {
    id: 'task-4',
    title: 'Subscribe to Web3 Education YouTube',
    description: 'Subscribe to our learning partner channel and watch any introductory Web3 development course.',
    reward: 0.3000,
    platform_share: 0.0750,
    total_revenue: 0.3750,
    type: 'youtube',
    action_url: 'https://youtube.com',
    completed: false
  }
];

// LocalStorage helpers for mock backend state
const getLocalData = <T>(key: string, defaultValue: T): T => {
  const content = localStorage.getItem(key);
  try {
    return content ? JSON.parse(content) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const setLocalData = <T>(key: string, data: T): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

// ==========================================
// DUAL-MODE API CLIENT (REAL CLIENT / LOCAL EMULATOR)
// ==========================================
export const api = {
  // --- AUTH OPERATIONS ---
  auth: {
    async signUp(email: string, password: string, fullName: string) {
      if (isSupabaseConfigured() && supabase) {
        // Safe signup configuration: passing 'full_name' to user_metadata
        // This ensures the custom database trigger can safely parse the raw metadata.
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });
        if (error) throw error;
        return data;
      } else {
        // Mobile fallback / simulated authentication
        const users = getLocalData<any[]>('w2e_users', []);
        
        // Check if user already exists
        if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
          throw new Error('User already exists in simulator.');
        }

        const mockUserId = `mock-user-${Math.random().toString(36).substring(2, 11)}`;
        const newUserProfile: UserProfile = {
          id: mockUserId,
          email,
          full_name: fullName,
          balance: 0.0000,
          total_earned: 0.0000,
          total_platform_commission: 0.0000,
          wallet_address: '',
          created_at: new Date().toISOString()
        };

        const newAuthUser = {
          id: mockUserId,
          email,
          user_metadata: { full_name: fullName }
        };

        users.push({ ...newAuthUser, password, profile: newUserProfile });
        setLocalData('w2e_users', users);
        
        // Log user in automatically
        setLocalData('w2e_current_session', {
          user: newAuthUser,
          profile: newUserProfile,
          token: 'mock-session-jwt-token-string'
        });

        return { user: newAuthUser, profile: newUserProfile };
      }
    },

    async signIn(email: string, password: string) {
      if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        return data;
      } else {
        const users = getLocalData<any[]>('w2e_users', []);
        const matched = users.find(
          (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );
        if (!matched) {
          throw new Error('Invalid email or password.');
        }

        // Fetch current profile, initialize if missing
        const profileKey = `w2e_profile_${matched.id}`;
        let profile = getLocalData<UserProfile | null>(profileKey, null);
        if (!profile) {
          profile = matched.profile || {
            id: matched.id,
            email: matched.email,
            full_name: matched.user_metadata.full_name,
            balance: 0.00,
            total_earned: 0.00,
            total_platform_commission: 0.00,
            created_at: new Date().toISOString()
          };
          setLocalData(profileKey, profile);
        }

        const session = {
          user: matched,
          profile,
          token: 'mock-session-jwt-token-string'
        };
        setLocalData('w2e_current_session', session);
        return session;
      }
    },

    async signOut() {
      localStorage.removeItem('w2e_current_session');
      if (isSupabaseConfigured() && supabase) {
        try {
          await supabase.auth.signOut();
        } catch (e) {
          console.warn('Supabase auth signOut warning: ', e);
        }
      }
    },

    async getSession() {
      const sandboxSession = getLocalData<any>('w2e_current_session', null);
      if (sandboxSession && sandboxSession.is_sandbox_override) {
        const profileKey = `w2e_profile_${sandboxSession.user.id}`;
        const currentProfile = getLocalData<UserProfile>(profileKey, sandboxSession.profile);
        sandboxSession.profile = currentProfile;
        return sandboxSession;
      }

      if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (data.session?.user) {
          // Fetch additional profile data
          const { data: dbProfile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.session.user.id)
            .single();

          if (profileError) {
            console.error('Failed to sync real profile: ', profileError.message);
            // Return base user if profile retrieval fails
            return {
              user: data.session.user,
              profile: {
                id: data.session.user.id,
                email: data.session.user.email || '',
                full_name: data.session.user.user_metadata?.full_name || 'Web3 Earn User',
                balance: 0.00,
                total_earned: 0.00,
                total_platform_commission: 0.00,
                created_at: data.session.user.created_at
              } as UserProfile
            };
          }
          return { user: data.session.user, profile: dbProfile as UserProfile };
        }
        return { user: null, profile: null };
      } else {
        const session = getLocalData<any>('w2e_current_session', null);
        if (session) {
          // Keep profile synced from its dedicated key
          const profileKey = `w2e_profile_${session.user.id}`;
          const currentProfile = getLocalData<UserProfile>(profileKey, session.profile);
          session.profile = currentProfile;
        }
        return session || { user: null, profile: null };
      }
    },

    async bypassIntoSandbox(email: string, fullName: string) {
      const mockUserId = `mock-user-${Math.random().toString(36).substring(2, 11)}`;
      const newUserProfile: UserProfile = {
        id: mockUserId,
        email: email || 'sandbox@w2e.network',
        full_name: fullName || 'Sandbox Pioneer',
        balance: 1.8500, // Seeding with 1.85 USDT makes it incredibly fast to verify video earnings and hit the 2.0 USDT withdrawal threshold!
        total_earned: 1.8500,
        total_platform_commission: 0.4625,
        wallet_address: '',
        created_at: new Date().toISOString()
      };

      const newAuthUser = {
        id: mockUserId,
        email: email || 'sandbox@w2e.network',
        user_metadata: { full_name: fullName || 'Sandbox Pioneer' }
      };

      const session = {
        user: newAuthUser,
        profile: newUserProfile,
        token: 'mock-session-jwt-token-string',
        is_sandbox_override: true
      };

      const profileKey = `w2e_profile_${mockUserId}`;
      setLocalData(profileKey, newUserProfile);
      setLocalData('w2e_current_session', session);

      return session;
    }
  },

  // --- PROFILE OPERATIONS ---
  profiles: {
    async getProfile(userId: string): Promise<UserProfile> {
      if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        if (error) throw error;
        return data as UserProfile;
      } else {
        const profileKey = `w2e_profile_${userId}`;
        return getLocalData<UserProfile>(profileKey, {
          id: userId,
          email: 'anonymous@w2e.network',
          full_name: 'Simulated User',
          balance: 0.0000,
          total_earned: 0.0000,
          total_platform_commission: 0.0000,
          created_at: new Date().toISOString()
        });
      }
    },

    async updateProfileWallet(userId: string, walletAddress: string): Promise<UserProfile> {
      if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase
          .from('profiles')
          .update({ wallet_address: walletAddress })
          .eq('id', userId)
          .select()
          .single();
        if (error) throw error;
        return data as UserProfile;
      } else {
        const profileKey = `w2e_profile_${userId}`;
        const profile = getLocalData<UserProfile>(profileKey, {
          id: userId,
          email: 'anonymous@w2e.network',
          full_name: 'Simulated User',
          balance: 0.00,
          total_earned: 0.00,
          total_platform_commission: 0.00,
          created_at: new Date().toISOString()
        });
        profile.wallet_address = walletAddress;
        setLocalData(profileKey, profile);
        return profile;
      }
    },

    // Earn rewards on frontend, update in public.profiles table
    async addRewards(userId: string, rewardAmount: number, platformCommission: number, description: string, referenceId: string): Promise<UserProfile> {
      if (isSupabaseConfigured() && supabase) {
        // 1. Fetch current profile
        const { data: current, error: getErr } = await supabase
          .from('profiles')
          .select('balance, total_earned, total_platform_commission')
          .eq('id', userId)
          .single();
        if (getErr) throw getErr;

        const newBalance = (current.balance || 0) + rewardAmount;
        const newTotalEarned = (current.total_earned || 0) + rewardAmount;
        const newPlatformCommission = (current.total_platform_commission || 0) + platformCommission;

        // 2. Perform transaction database write (safe multi-step logic)
        const { data, error } = await supabase
          .from('profiles')
          .update({
            balance: parseFloat(newBalance.toFixed(6)),
            total_earned: parseFloat(newTotalEarned.toFixed(6)),
            total_platform_commission: parseFloat(newPlatformCommission.toFixed(6))
          })
          .eq('id', userId)
          .select()
          .single();

        if (error) throw error;

        // 3. Create a transaction audit log in Supabase
        await supabase
          .from('transactions')
          .insert({
            user_id: userId,
            type: description.includes('Ad') ? 'watch_ad' : 'microtask',
            amount: rewardAmount,
            platform_share: platformCommission,
            status: 'completed',
            description,
            tx_hash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`
          });

        return data as UserProfile;
      } else {
        // Simulated local reward update
        const profileKey = `w2e_profile_${userId}`;
        const profile = getLocalData<UserProfile>(profileKey, {
          id: userId,
          email: '',
          full_name: '',
          balance: 0.0000,
          total_earned: 0.0000,
          total_platform_commission: 0.0000,
          created_at: new Date().toISOString()
        });

        profile.balance = parseFloat((profile.balance + rewardAmount).toFixed(6));
        profile.total_earned = parseFloat((profile.total_earned + rewardAmount).toFixed(6));
        profile.total_platform_commission = parseFloat((profile.total_platform_commission + platformCommission).toFixed(6));
        setLocalData(profileKey, profile);

        // Add to mock transaction list
        const txKey = `w2e_transactions_${userId}`;
        const transactions = getLocalData<Transaction[]>(txKey, []);
        const newTx: Transaction = {
          id: `tx-${Math.random().toString(36).substring(2, 9)}`,
          user_id: userId,
          type: description.includes('Ad') ? 'watch_ad' : 'microtask',
          amount: rewardAmount,
          platform_share: platformCommission,
          status: 'completed',
          tx_hash: `0x${Array.from({length: 40}, () => 'abcdef0123456789'[Math.floor(Math.random() * 16)]).join('')}`,
          created_at: new Date().toISOString(),
          description
        };

        transactions.unshift(newTx);
        setLocalData(txKey, transactions);

        return profile;
      }
    },

    // Initiate user withdrawal
    async withdraw(userId: string, amount: number, walletAddress: string): Promise<UserProfile> {
      if (isSupabaseConfigured() && supabase) {
        // 1. Fetch current profile to check balance
        const { data: current, error: getErr } = await supabase
          .from('profiles')
          .select('balance, email, full_name')
          .eq('id', userId)
          .single();
        if (getErr) throw getErr;

        if ((current.balance || 0) < amount) {
          throw new Error('Insufficient balance to withdraw.');
        }

        const newBalance = (current.balance || 0) - amount;

        // 2. Perform update
        const { data, error } = await supabase
          .from('profiles')
          .update({
            balance: parseFloat(newBalance.toFixed(6)),
            wallet_address: walletAddress
          })
          .eq('id', userId)
          .select()
          .single();

        if (error) throw error;

        // 3. Create a pending/completed withdrawal transaction log
        await supabase
          .from('transactions')
          .insert({
            user_id: userId,
            type: 'withdrawal',
            amount: amount,
            status: 'completed',
            description: `USDT Withdrawal to: ${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`,
            tx_hash: `0x${Array.from({length: 64}, () => 'abcdef0123456789'[Math.floor(Math.random() * 16)]).join('')}`
          });

        return data as UserProfile;
      } else {
        const profileKey = `w2e_profile_${userId}`;
        const profile = getLocalData<UserProfile>(profileKey, {
          id: userId,
          email: '',
          full_name: '',
          balance: 0.0000,
          total_earned: 0.0000,
          total_platform_commission: 0.0000,
          created_at: new Date().toISOString()
        });

        if (profile.balance < amount) {
          throw new Error('Insufficient balance in simulator!');
        }

        profile.balance = parseFloat((profile.balance - amount).toFixed(6));
        profile.wallet_address = walletAddress;
        setLocalData(profileKey, profile);

        // Add withdrawal transaction
        const txKey = `w2e_transactions_${userId}`;
        const transactions = getLocalData<Transaction[]>(txKey, []);
        const newTx: Transaction = {
          id: `tx-withdraw-${Math.random().toString(36).substring(2, 9)}`,
          user_id: userId,
          type: 'withdrawal',
          amount: amount,
          status: 'completed',
          tx_hash: `0x${Array.from({length: 64}, () => 'abcdef0123456789'[Math.floor(Math.random() * 16)]).join('')}`,
          created_at: new Date().toISOString(),
          description: `USDT Withdrawal to: ${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`
        };

        transactions.unshift(newTx);
        setLocalData(txKey, transactions);

        return profile;
      }
    }
  },

  // --- AD CAMPAIGN & TASK RETRIEVALS ---
  campaigns: {
    async list(): Promise<AdCampaign[]> {
      return DEFAULT_CAMPAIGNS;
    }
  },

  tasks: {
    async list(userId: string): Promise<MicroTask[]> {
      const storageKey = `w2e_completed_tasks_${userId}`;
      const completedIds = getLocalData<string[]>(storageKey, []);
      return DEFAULT_TASKS.map((t) => ({
        ...t,
        completed: completedIds.includes(t.id)
      }));
    },

    async completeTask(userId: string, taskId: string): Promise<MicroTask> {
      const task = DEFAULT_TASKS.find((t) => t.id === taskId);
      if (!task) throw new Error('Task not found.');

      // Check if already completed
      const storageKey = `w2e_completed_tasks_${userId}`;
      const completedIds = getLocalData<string[]>(storageKey, []);
      if (completedIds.includes(taskId)) {
        throw new Error('Task already completed.');
      }

      // Record completion
      completedIds.push(taskId);
      setLocalData(storageKey, completedIds);

      // Trigger reward logic
      await api.profiles.addRewards(
        userId,
        task.reward,
        task.platform_share,
        `Task Completed: ${task.title}`,
        taskId
      );

      return { ...task, completed: true };
    }
  },

  // --- GENERAL TRANSACTION VIEW ---
  transactions: {
    async list(userId: string): Promise<Transaction[]> {
      if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        if (error) {
          console.error(error);
          return [];
        }
        return data as Transaction[];
      } else {
        const txKey = `w2e_transactions_${userId}`;
        return getLocalData<Transaction[]>(txKey, []);
      }
    }
  }
};

// ==========================================
// SQL CODES FOR EASY DATABASE INITIALIZATION
// ==========================================
export const SUPABASE_SQL_CODE = `-- 1. CREATE USER PROFILES TABLE
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    balance NUMERIC(12, 6) DEFAULT 0.000000 NOT NULL CHECK (balance >= 0),
    total_earned NUMERIC(12, 6) DEFAULT 0.000000 NOT NULL CHECK (total_earned >= 0),
    total_platform_commission NUMERIC(12, 6) DEFAULT 0.000000 NOT NULL CHECK (total_platform_commission >= 0),
    wallet_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. CREATE TRANSACTIONS AUDIT INDEX
CREATE TABLE public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('watch_ad', 'microtask', 'withdrawal')),
    amount NUMERIC(12, 6) NOT NULL,
    platform_share NUMERIC(12, 6) DEFAULT 0.000000,
    status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
    tx_hash TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    description TEXT NOT NULL
);

-- Enable Row Level Security (RLS) on tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- 3. CREATE RLS POLICIES FOR SECURE DATA ACCESS
CREATE POLICY "Users can read their own profiles" 
    ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profiles" 
    ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can read their own transaction history" 
    ON public.transactions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create audit transactions" 
    ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. TRIGGER FUNCTION FOR AUTOMATIC AUTH-PROFILE SYNC
-- This handles secure sync from auth.users (user_metadata.full_name) to public.profiles
-- preventing error 500 signals during raw registration processes
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, balance, total_earned, total_platform_commission)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Web3 Earn Explorer'),
    NEW.email,
    0.000000,
    0.000000,
    0.000000
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_signup();
`;
