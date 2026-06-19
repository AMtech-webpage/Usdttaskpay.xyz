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
// DYNAMIC SCHEMA AUTO-ADAPTATION ENGINE
// ==========================================
// Handles environments where newer columns (e.g. referred_by, referral_code) are missing.
// If an operation fails with a Postgres 42703 (undefined_column) error, we dynamically blacklist it and retry!
const OPTIONAL_COLUMNS = [
  'referred_by',
  'referral_code',
  'referral_earnings',
  'referral_count',
  'total_platform_commission',
  'wallet_address',
  'last_login_date',
  'login_streak'
];

const detectedMissingColumns = new Set<string>();

export function filterSelectFields(allWanted: string[]): string {
  return allWanted.filter(col => !detectedMissingColumns.has(col)).join(', ');
}

export function cleanPayload(payload: Record<string, any>): Record<string, any> {
  const result = { ...payload };
  detectedMissingColumns.forEach(col => {
    delete result[col];
  });
  return result;
}

export function handleDatabaseError(error: any): boolean {
  if (!error) return false;
  const errMsg = error.message || '';
  const errCode = error.code || '';
  if (errCode === '42703' || errMsg.includes('does not exist') || errMsg.includes('column')) {
    let newlyDetected = false;
    for (const col of OPTIONAL_COLUMNS) {
      if (!detectedMissingColumns.has(col) && errMsg.includes(col)) {
        console.warn(`[Supabase Schema Auto-Adapt] Detected missing column: "${col}". Adding to blacklist and adapt.`);
        detectedMissingColumns.add(col);
        newlyDetected = true;
      }
    }
    if (!newlyDetected) {
      const match = errMsg.match(/column\s+["']?([a-zA-Z0-9_]+)["']?/i);
      const colName = match ? match[1] : null;
      if (colName && OPTIONAL_COLUMNS.includes(colName) && !detectedMissingColumns.has(colName)) {
        console.warn(`[Supabase Schema Auto-Adapt] Regexp-matched missing column: "${colName}". Adding to blacklist.`);
        detectedMissingColumns.add(colName);
        newlyDetected = true;
      }
    }
    return newlyDetected;
  }
  return false;
}

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

// Dynamic column detector to handle variations in Supabase database schemas gracefully
let detectedColumns: string[] | null = null;
async function getAvailableProfileColumns(): Promise<string[]> {
  if (detectedColumns) return detectedColumns;
  
  const defaultFields = ['id', 'email', 'full_name', 'balance', 'total_earned', 'created_at'];
  if (!supabase) {
    detectedColumns = [...defaultFields, 'total_platform_commission', 'wallet_address', 'referred_by', 'referral_code', 'referral_earnings', 'referral_count', 'last_login_date', 'login_streak'];
    return detectedColumns;
  }
  
  try {
    // Check available columns by inspecting the profiles table structure on a quick select
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (!error && data && data.length > 0) {
      detectedColumns = Object.keys(data[0]);
      console.log('Detected profiles columns from database:', detectedColumns);
      return detectedColumns;
    }
  } catch (err) {
    console.warn('Failed to detect columns via select *:', err);
  }
  
  // Proactively test presence of optional/referral related columns
  const finalFields = [...defaultFields];
  const testFields = ['total_platform_commission', 'wallet_address', 'referred_by', 'referral_code', 'referral_earnings', 'referral_count', 'last_login_date', 'login_streak'];
  
  for (const field of testFields) {
    try {
      const { error } = await supabase
        .from('profiles')
        .select(field)
        .limit(1);
        
      if (!error) {
        finalFields.push(field);
      } else {
        const isColumnMissing = error.code === '42703' || error.message?.includes('does not exist');
        if (!isColumnMissing) {
          finalFields.push(field);
        }
      }
    } catch {
      // Omit if fails completely
    }
  }
  
  detectedColumns = finalFields;
  console.log('Dynamic schema profiles columns cached:', detectedColumns);
  return detectedColumns;
}

export function blacklistProfileColumn(colName: string): void {
  if (detectedColumns) {
    detectedColumns = detectedColumns.filter(c => c !== colName);
  } else {
    detectedColumns = ['id', 'email', 'full_name', 'balance', 'total_earned', 'created_at'];
  }
  console.log(`[Supabase Auto-Adapt] Column "${colName}" blacklisted. Remaining columns:`, detectedColumns);
}

async function ensureProfileExists(
  userId: string,
  userEmail: string,
  userFullName: string,
  referredByCode?: string
): Promise<UserProfile> {
  if (!supabase) {
    throw new Error('Supabase client is not initialized');
  }

  const columns = await getAvailableProfileColumns();

  // 1. Fetch current profile gracefully using maybeSingle
  const { data: dbProfile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (profileError) {
    console.error('Database error in ensureProfileExists:', profileError.message);
    throw profileError;
  }

  if (dbProfile) {
    // If profile exists but is missing its own referral_code, update it (if referral system is present in DB)
    if (columns.includes('referral_code') && !dbProfile.referral_code) {
      const simpleNameSlug = (dbProfile.email || 'user').split('@')[0].replace(/[^a-zA-Z0-9]/g, '') || 'user';
      const autoReferralCode = `${simpleNameSlug}_${Math.random().toString(36).substring(2, 6)}`;
      
      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update({ referral_code: autoReferralCode })
        .eq('id', userId)
        .select()
        .maybeSingle();

      if (!updateError && updatedProfile) {
        return updatedProfile as UserProfile;
      }
    }
    return dbProfile as UserProfile;
  }

  // 2. Profile is completely missing, build and insert a new row
  console.log('Real profile missing in DB. Proactively creating profile for: ', userId);
  const simpleNameSlug = userEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, '') || 'user';
  const autoReferralCode = `${simpleNameSlug}_${Math.random().toString(36).substring(2, 6)}`;

  // Find inviter user-id if referred_by_code is supplied & supported by DB
  let resolvedReferredBy: string | null = null;
  if (referredByCode && columns.includes('referral_code') && columns.includes('referred_by')) {
    const { data: referrer, error: refError } = await supabase
      .from('profiles')
      .select('id')
      .eq('referral_code', referredByCode)
      .maybeSingle();
    
    if (!refError && referrer) {
      resolvedReferredBy = referrer.id;
    }
  }

  const newProfile: any = {
    id: userId,
    email: userEmail,
    full_name: userFullName,
    balance: 0.0000,
    total_earned: 0.0000,
    total_platform_commission: 0.0000,
    wallet_address: '',
    created_at: new Date().toISOString()
  };

  if (columns.includes('referred_by')) {
    newProfile.referred_by = resolvedReferredBy;
  }
  if (columns.includes('referral_code')) {
    newProfile.referral_code = autoReferralCode;
  }
  if (columns.includes('referral_earnings')) {
    newProfile.referral_earnings = 0.0000;
  }
  if (columns.includes('referral_count')) {
    newProfile.referral_count = 0;
  }

  const { data: insertedProfile, error: insertError } = await supabase
    .from('profiles')
    .insert(newProfile)
    .select()
    .maybeSingle();

  if (insertError) {
    console.error('Failed to insert new profile row:', insertError.message);
    throw insertError;
  }

  // Successfully inserted! Bump referred_count of inviter if applicable
  if (resolvedReferredBy && columns.includes('referral_count')) {
    try {
      const { data: rProfile, error: rError } = await supabase
        .from('profiles')
        .select('referral_count')
        .eq('id', resolvedReferredBy)
        .maybeSingle();
      
      if (!rError && rProfile) {
        await supabase
          .from('profiles')
          .update({ referral_count: (rProfile.referral_count || 0) + 1 })
          .eq('id', resolvedReferredBy);
      }
    } catch (err) {
      console.error('Failed to increment referrer count:', err);
    }
  }

  return (insertedProfile || newProfile) as UserProfile;
}

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
        const referralCode = localStorage.getItem('w2e_referrer_code') || '';
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              referred_by_code: referralCode,
            },
          },
        });
        if (error) throw error;

        if (data.user) {
          try {
            const profile = await ensureProfileExists(
              data.user.id,
              data.user.email || email,
              fullName,
              referralCode
            );
            return {
              user: data.user,
              session: data.session,
              profile
            };
          } catch (profileError) {
            console.error("Failed to build profile during signUp:", profileError);
            return {
              user: data.user,
              session: data.session,
              profile: {
                id: data.user.id,
                email: data.user.email || email,
                full_name: fullName,
                balance: 0.0000,
                total_earned: 0.0000,
                total_platform_commission: 0.0000,
                wallet_address: '',
                referral_code: '',
                referral_earnings: 0.0000,
                referral_count: 0,
                created_at: new Date().toISOString()
              } as UserProfile
            };
          }
        }

        return data;
      } else {
        // Mobile fallback / simulated authentication
        const users = getLocalData<any[]>('w2e_users', []);
        
        // Check if user already exists
        if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
          throw new Error('User already exists in simulator.');
        }

        const mockUserId = `mock-user-${Math.random().toString(36).substring(2, 11)}`;

        // Generate custom shareable invite link code for the new account
        const simpleNameSlug = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
        const autoReferralCode = `${simpleNameSlug}_${Math.random().toString(36).substring(2, 4)}`;

        const localReferrerCode = localStorage.getItem('w2e_referrer_code') || undefined;
        let resolvedReferredBy: string | undefined = undefined;

        if (localReferrerCode) {
          // Resolve referrer
          const inviter = users.find((u) => u.profile?.referral_code === localReferrerCode || u.profile?.id === localReferrerCode || u.id === localReferrerCode);
          if (inviter) {
            resolvedReferredBy = inviter.id;
            
            // Bump referrer's count
            const inviterProfileKey = `w2e_profile_${inviter.id}`;
            const inviterProfile = getLocalData<UserProfile>(inviterProfileKey, inviter.profile);
            if (inviterProfile) {
              inviterProfile.referral_count = (inviterProfile.referral_count || 0) + 1;
              setLocalData(inviterProfileKey, inviterProfile);
              inviter.profile = inviterProfile;
            }
          }
        }

        const newUserProfile: UserProfile = {
          id: mockUserId,
          email,
          full_name: fullName,
          balance: 0.0000,
          total_earned: 0.0000,
          total_platform_commission: 0.0000,
          wallet_address: '',
          created_at: new Date().toISOString(),
          referred_by: resolvedReferredBy,
          referral_code: autoReferralCode,
          referral_earnings: 0.0000,
          referral_count: 0
        };

        const newAuthUser = {
          id: mockUserId,
          email,
          user_metadata: { full_name: fullName }
        };

        const profileKey = `w2e_profile_${mockUserId}`;
        setLocalData(profileKey, newUserProfile);

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
            created_at: new Date().toISOString(),
            referral_earnings: 0.00,
            referral_count: 0
          };
        }
        
        if (!profile.referral_code) {
          const simpleNameSlug = (profile.email || 'user').split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
          profile.referral_code = `${simpleNameSlug}_${Math.random().toString(36).substring(2, 6)}`;
        }
        setLocalData(profileKey, profile);

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
        if (!currentProfile.referral_code) {
          const simpleNameSlug = (currentProfile.email || 'user').split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
          currentProfile.referral_code = `${simpleNameSlug}_${Math.random().toString(36).substring(2, 6)}`;
          currentProfile.referral_earnings = currentProfile.referral_earnings || 0;
          currentProfile.referral_count = currentProfile.referral_count || 0;
          setLocalData(profileKey, currentProfile);
        }
        sandboxSession.profile = currentProfile;
        return sandboxSession;
      }

      if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (data.session?.user) {
          try {
            // Fetch and ensure profile row exists synchronously/safely
            const profile = await ensureProfileExists(
              data.session.user.id,
              data.session.user.email || '',
              data.session.user.user_metadata?.full_name || 'Web3 Earn User',
              data.session.user.user_metadata?.referred_by_code
            );
            return { user: data.session.user, profile };
          } catch (profileError: any) {
            console.error('Failed to sync real profile: ', profileError.message || profileError);
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
                created_at: data.session.user.created_at,
                referral_earnings: 0.00,
                referral_count: 0
              } as UserProfile
            };
          }
        }
        return { user: null, profile: null };
      } else {
        const session = getLocalData<any>('w2e_current_session', null);
        if (session) {
          // Keep profile synced from its dedicated key
          const profileKey = `w2e_profile_${session.user.id}`;
          const currentProfile = getLocalData<UserProfile>(profileKey, session.profile);
          if (!currentProfile.referral_code) {
            const simpleNameSlug = (currentProfile.email || 'user').split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
            currentProfile.referral_code = `${simpleNameSlug}_${Math.random().toString(36).substring(2, 6)}`;
            currentProfile.referral_earnings = currentProfile.referral_earnings || 0;
            currentProfile.referral_count = currentProfile.referral_count || 0;
            setLocalData(profileKey, currentProfile);
          }
          session.profile = currentProfile;
        }
        return session || { user: null, profile: null };
      }
    },

    async bypassIntoSandbox(email: string, fullName: string) {
      const mockUserId = `mock-user-${Math.random().toString(36).substring(2, 11)}`;
      const emailLocal = email || 'sandbox@w2e.network';
      const simpleNameSlug = emailLocal.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
      const autoReferralCode = `${simpleNameSlug}_${Math.random().toString(36).substring(2, 4)}`;

      const localReferrerCode = localStorage.getItem('w2e_referrer_code') || undefined;
      let resolvedReferredBy: string | undefined = undefined;

      if (localReferrerCode) {
        const users = getLocalData<any[]>('w2e_users', []);
        const inviter = users.find((u) => u.profile?.referral_code === localReferrerCode || u.profile?.id === localReferrerCode || u.id === localReferrerCode);
        if (inviter) {
          resolvedReferredBy = inviter.id;
          
          const inviterProfileKey = `w2e_profile_${inviter.id}`;
          const inviterProfile = getLocalData<UserProfile>(inviterProfileKey, inviter.profile);
          if (inviterProfile) {
            inviterProfile.referral_count = (inviterProfile.referral_count || 0) + 1;
            setLocalData(inviterProfileKey, inviterProfile);
            inviter.profile = inviterProfile;
            setLocalData('w2e_users', users);
          }
        }
      }

      const newUserProfile: UserProfile = {
        id: mockUserId,
        email: emailLocal,
        full_name: fullName || 'Sandbox Pioneer',
        balance: 1.8500, // Seeding with 1.85 USDT makes it incredibly fast to verify video earnings and hit the 2.0 USDT withdrawal threshold!
        total_earned: 1.8500,
        total_platform_commission: 0.4625,
        wallet_address: '',
        created_at: new Date().toISOString(),
        referred_by: resolvedReferredBy,
        referral_code: autoReferralCode,
        referral_earnings: 0.0000,
        referral_count: 0
      };

      const newAuthUser = {
        id: mockUserId,
        email: emailLocal,
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
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();
          if (error) throw error;
          
          if (data) {
            return data as UserProfile;
          }
          
          // Fallback: proactively load auth session state to seed profile metadata
          const { data: sessionData } = await supabase.auth.getSession();
          const authUser = sessionData?.session?.user;
          return await ensureProfileExists(
            userId,
            authUser?.email || 'anonymous@w2e.network',
            authUser?.user_metadata?.full_name || 'Web3 Earn User'
          );
        } catch (e) {
          console.error('getProfile catch-on-error:', e);
          throw e;
        }
      } else {
        const profileKey = `w2e_profile_${userId}`;
        const profile = getLocalData<UserProfile>(profileKey, {
          id: userId,
          email: 'anonymous@w2e.network',
          full_name: 'Simulated User',
          balance: 0.0000,
          total_earned: 0.0000,
          total_platform_commission: 0.0000,
          created_at: new Date().toISOString()
        });

        if (!profile.referral_code) {
          const simpleNameSlug = (profile.email || 'user').split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
          profile.referral_code = `${simpleNameSlug}_${Math.random().toString(36).substring(2, 6)}`;
          profile.referral_earnings = profile.referral_earnings || 0;
          profile.referral_count = profile.referral_count || 0;
          setLocalData(profileKey, profile);
        }
        return profile;
      }
    },

    async updateProfileWallet(userId: string, walletAddress: string): Promise<UserProfile> {
      if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase
          .from('profiles')
          .update({ wallet_address: walletAddress })
          .eq('id', userId)
          .select()
          .maybeSingle();
        if (error) throw error;
        if (!data) throw new Error('UserProfile not found during wallet update');
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
        let columns = await getAvailableProfileColumns();

        const runTransaction = async (): Promise<UserProfile> => {
          // 1. Fetch current profile
          const colsToSelect = ['balance', 'total_earned', 'full_name'];
          if (columns.includes('total_platform_commission')) {
            colsToSelect.push('total_platform_commission');
          }
          if (columns.includes('referred_by')) {
            colsToSelect.push('referred_by');
          }

          const { data: current, error: getErr } = await supabase
            .from('profiles')
            .select(colsToSelect.join(', '))
            .eq('id', userId)
            .maybeSingle();
            
          if (getErr) throw getErr;
          if (!current) throw new Error('UserProfile not found during reward fetching');

          const currentAny = current as any;
          const newBalance = (currentAny.balance || 0) + rewardAmount;
          const newTotalEarned = (currentAny.total_earned || 0) + rewardAmount;
          const newPlatformCommission = (currentAny.total_platform_commission || 0) + platformCommission;

          // 2. Perform transaction database write (safe multi-step logic)
          const updatePayload: any = {
            balance: parseFloat(newBalance.toFixed(6)),
            total_earned: parseFloat(newTotalEarned.toFixed(6))
          };
          if (columns.includes('total_platform_commission')) {
            updatePayload.total_platform_commission = parseFloat(newPlatformCommission.toFixed(6));
          }

          const { data, error } = await supabase
            .from('profiles')
            .update(updatePayload)
            .eq('id', userId)
            .select()
            .maybeSingle();

          if (error) throw error;
          if (!data) throw new Error('UserProfile not found during rewards update');

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

          // 4. Dispatch 5% passive referral reward bonus to inviter if referred_by is set and supported
          if (columns.includes('referred_by') && currentAny.referred_by) {
            try {
              const referralBonus = parseFloat((rewardAmount * 0.05).toFixed(6));
              const refColsToSelect = ['balance', 'total_earned'];
              if (columns.includes('referral_earnings')) {
                refColsToSelect.push('referral_earnings');
              }
              
              const { data: referrer, error: refErr } = await supabase
                .from('profiles')
                .select(refColsToSelect.join(', '))
                .eq('id', currentAny.referred_by)
                .maybeSingle();

              if (!refErr && referrer) {
                const referrerAny = referrer as any;
                const updatedRefBalance = (referrerAny.balance || 0) + referralBonus;
                const updatedRefTotal = (referrerAny.total_earned || 0) + referralBonus;
                const updatedRefEarnings = (referrerAny.referral_earnings || 0) + referralBonus;

                const refUpdatePayload: any = {
                  balance: parseFloat(updatedRefBalance.toFixed(6)),
                  total_earned: parseFloat(updatedRefTotal.toFixed(6))
                };
                if (columns.includes('referral_earnings')) {
                  refUpdatePayload.referral_earnings = parseFloat(updatedRefEarnings.toFixed(6));
                }

                await supabase
                  .from('profiles')
                  .update(refUpdatePayload)
                  .eq('id', currentAny.referred_by);

                // Register transaction log for inviter's referral payout split
                await supabase
                  .from('transactions')
                  .insert({
                    user_id: currentAny.referred_by,
                    type: 'microtask',
                    amount: referralBonus,
                    status: 'completed',
                    description: `5% Invite Yield from ${currentAny.full_name || 'Invitee'} ad-stream`,
                    tx_hash: `0x${Math.random().toString(36).substring(2, 15)}`
                  });
              }
            } catch (e) {
              console.warn('Real Supabase Referral system split failure: ', e);
            }
          }

          return data as UserProfile;
        };

        try {
          return await runTransaction();
        } catch (txnError: any) {
          console.error('[Supabase Self-Healing Txn Error]', txnError);
          const errorMsg = txnError.message || '';
          if (txnError.code === '42703' || errorMsg.includes('does not exist') || errorMsg.includes('column')) {
            let matchedCol = '';
            const testCols = ['referred_by', 'referral_code', 'referral_earnings', 'referral_count', 'total_platform_commission', 'wallet_address'];
            for (const col of testCols) {
              if (errorMsg.includes(col)) {
                matchedCol = col;
                break;
              }
            }
            if (matchedCol) {
              blacklistProfileColumn(matchedCol);
              columns = await getAvailableProfileColumns();
              console.log(`[Supabase Self-Healing] Retrying addRewards after blacklisting column: "${matchedCol}"...`);
              return await runTransaction();
            }
          }
          throw txnError;
        }
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

        // Simulated passive referral payout to inviter
        if (profile.referred_by) {
          try {
            const referrerId = profile.referred_by;
            const referrerKey = `w2e_profile_${referrerId}`;
            const referrerProfile = getLocalData<UserProfile | null>(referrerKey, null);

            if (referrerProfile) {
              const referralBonus = parseFloat((rewardAmount * 0.05).toFixed(6));
              referrerProfile.balance = parseFloat((referrerProfile.balance + referralBonus).toFixed(6));
              referrerProfile.total_earned = parseFloat((referrerProfile.total_earned + referralBonus).toFixed(6));
              referrerProfile.referral_earnings = parseFloat(((referrerProfile.referral_earnings || 0) + referralBonus).toFixed(6));
              setLocalData(referrerKey, referrerProfile);

              // Inject referral bonus item into inviter's transaction ledger
              const refTxKey = `w2e_transactions_${referrerId}`;
              const refTransactions = getLocalData<Transaction[]>(refTxKey, []);
              refTransactions.unshift({
                id: `tx-bonus-${Math.random().toString(36).substring(2, 9)}`,
                user_id: referrerId,
                type: 'microtask',
                amount: referralBonus,
                status: 'completed',
                tx_hash: `0x${Array.from({length: 40}, () => 'abcdef0123456789'[Math.floor(Math.random() * 16)]).join('')}`,
                created_at: new Date().toISOString(),
                description: `5% Invite Yield from ${profile.full_name || 'Invitee'} watch`
              });
              setLocalData(refTxKey, refTransactions);
              console.log('Passive 5% referral bonus of', referralBonus, 'USDT credited to inviter:', referrerId);
            }
          } catch (refSimErr) {
            console.error('Error applying simulated referral bonus:', refSimErr);
          }
        }

        return profile;
      }
    },

    // Initiate user withdrawal
    async withdraw(userId: string, amount: number, walletAddress: string, network: string = 'TRC20'): Promise<UserProfile> {
      if (isSupabaseConfigured() && supabase) {
        // Call the transactional RPC function on Supabase to safely process without race conditions
        const { error } = await supabase.rpc('submit_manual_withdrawal', {
          user_id: userId,
          withdrawal_amount: amount,
          user_network: network,
          user_wallet: walletAddress
        });

        if (error) {
          throw new Error(error.message || 'Manual payout registration rejected by transaction gate.');
        }

        // Fetch current updated profile to synchronize frontend context
        const { data: current, error: getErr } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (getErr) throw getErr;
        if (!current) throw new Error('UserProfile not found after processing.');

        return current as UserProfile;
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
          status: 'pending',
          tx_hash: `pending-tx-${Array.from({length: 32}, () => 'abcdef0123456789'[Math.floor(Math.random() * 16)]).join('')}`,
          created_at: new Date().toISOString(),
          description: `USDT Withdrawal to: ${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`
        };

        transactions.unshift(newTx);
        setLocalData(txKey, transactions);

        return profile;
      }
    },

    // Get the top 10 earners of the platform
    async getLeaderboard(): Promise<UserProfile[]> {
      const mockLeaderboard: UserProfile[] = [
        { id: 'mock-u1', email: 'satoshi@w2e.io', full_name: 'Satoshi_Earn', balance: 1450.5500, total_earned: 2850.4000, total_platform_commission: 712.6000, wallet_address: '0x71C...8971', referral_count: 42, referral_earnings: 142.5000, created_at: new Date().toISOString() },
        { id: 'mock-u2', email: 'vitalik@w2e.io', full_name: 'Vitalik_Fan', balance: 920.1200, total_earned: 1980.8500, total_platform_commission: 495.2100, wallet_address: '0x3dc...fa21', referral_count: 19, referral_earnings: 58.1000, created_at: new Date().toISOString() },
        { id: 'mock-u3', email: 'cz@w2e.io', full_name: 'CZ_Watch_Daily', balance: 680.4000, total_earned: 1420.3000, total_platform_commission: 355.0750, wallet_address: '0x99a...ee34', referral_count: 31, referral_earnings: 99.4200, created_at: new Date().toISOString() },
        { id: 'mock-u4', email: 'solana_maxi@w2e.io', full_name: 'Solana_Maxi', balance: 410.9500, total_earned: 980.5000, total_platform_commission: 245.1250, wallet_address: '0x1c4...ad45', referral_count: 12, referral_earnings: 34.2000, created_at: new Date().toISOString() },
        { id: 'mock-u5', email: 'crypto_babe@w2e.io', full_name: 'Crypto_Queen', balance: 350.2205, total_earned: 875.4055, total_platform_commission: 218.8514, wallet_address: '0xf8e...9005', referral_count: 8, referral_earnings: 19.5000, created_at: new Date().toISOString() },
        { id: 'mock-u6', email: 'usdt_miner@w2e.io', full_name: 'USDT_Vortex', balance: 290.4100, total_earned: 765.1200, total_platform_commission: 191.2800, wallet_address: '0xab2...bc88', referral_count: 15, referral_earnings: 44.5000, created_at: new Date().toISOString() },
        { id: 'mock-u7', email: 'giga_chad@w2e.io', full_name: 'GigaEarn_99', balance: 180.0500, total_earned: 620.9500, total_platform_commission: 155.2375, wallet_address: '0xe22...dd11', referral_count: 7, referral_earnings: 12.0500, created_at: new Date().toISOString() },
        { id: 'mock-u8', email: 'node_runner@w2e.io', full_name: 'NodeStreamer', balance: 142.1120, total_earned: 495.3400, total_platform_commission: 123.8350, wallet_address: '0xba9...88fe', referral_count: 5, referral_earnings: 8.4420, created_at: new Date().toISOString() },
        { id: 'mock-u9', email: 'alpha_hunter@w2e.io', full_name: 'AlphaWatcher', balance: 95.8800, total_earned: 382.4500, total_platform_commission: 95.6125, wallet_address: '0xd7a...92cf', referral_count: 3, referral_earnings: 4.5000, created_at: new Date().toISOString() },
        { id: 'mock-u10', email: 'ether_earner@w2e.io', full_name: 'Ether_Harvest', balance: 82.5040, total_earned: 310.2500, total_platform_commission: 77.5625, wallet_address: '0xcc1...aa22', referral_count: 2, referral_earnings: 2.1000, created_at: new Date().toISOString() }
      ];

      if (isSupabaseConfigured() && supabase) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('total_earned', { ascending: false })
            .limit(10);
            
          if (error) throw error;
          
          if (data && data.length > 0) {
            if (data.length < 5) {
              const ids = new Set(data.map(p => p.id));
              const extra = mockLeaderboard.filter(m => !ids.has(m.id));
              return [...data, ...extra].slice(0, 10) as UserProfile[];
            }
            return data as UserProfile[];
          }
        } catch (e) {
          console.error('Failed to fetch real leaderboard, using mock data:', e);
        }
      }
      return mockLeaderboard;
    },

    // Daily consecutive check-in login streak & rewards engine (Strict: 0.0001 USDT, once per day, requires at least 1 task/ad-watch completed today)
    async checkAndApplyDailyLoginBonus(userId: string): Promise<{ profile: UserProfile; streak: number; reward: number; awarded: boolean; message?: string }> {
      const todayStr = new Date().toISOString().split('T')[0];
      
      const getYesterdayStr = () => {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        return d.toISOString().split('T')[0];
      };
      const yesterdayStr = getYesterdayStr();

      const rewardAmount = 0.0001; // Strict: Exactly 0.0001 USDT reward

      if (isSupabaseConfigured() && supabase) {
        try {
          const columns = await getAvailableProfileColumns();
          
          const { data: profile, error: getErr } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();

          if (getErr) throw getErr;
          if (!profile) throw new Error('UserProfile not found during login check');

          const lastLogin = profile.last_login_date || '';
          const currentStreak = profile.login_streak || 0;

          if (lastLogin === todayStr) {
            return { 
              profile: profile as UserProfile, 
              streak: currentStreak, 
              reward: 0, 
              awarded: false, 
              message: 'You have already claimed your daily check-in bonus today!' 
            };
          }

          // Strict boundary: Fetch transactions for the current user created today to verify task completion
          const startOfToday = new Date();
          startOfToday.setHours(0, 0, 0, 0);

          const { data: todayTxs, error: txsErr } = await supabase
            .from('transactions')
            .select('id')
            .eq('user_id', userId)
            .in('type', ['watch_ad', 'microtask'])
            .gte('created_at', startOfToday.toISOString());

          if (txsErr) {
            console.warn('Prerequisite check error from transactions:', txsErr);
          }

          const completedTaskToday = todayTxs && todayTxs.length > 0;

          if (!completedTaskToday) {
            return {
              profile: profile as UserProfile,
              streak: currentStreak,
              reward: 0,
              awarded: false,
              message: 'Task Prerequisite Required: You must complete at least one task or watch an ad today before you can claim your daily check-in reward!'
            };
          }

          let newStreak = 1;
          if (lastLogin === yesterdayStr) {
            newStreak = currentStreak + 1;
          }

          const updatePayload: any = {
            balance: parseFloat(((profile.balance || 0) + rewardAmount).toFixed(6)),
            total_earned: parseFloat(((profile.total_earned || 0) + rewardAmount).toFixed(6))
          };

          if (columns.includes('last_login_date')) {
            updatePayload.last_login_date = todayStr;
          }
          if (columns.includes('login_streak')) {
            updatePayload.login_streak = newStreak;
          }

          const { data: updated, error: updateErr } = await supabase
            .from('profiles')
            .update(updatePayload)
            .eq('id', userId)
            .select()
            .maybeSingle();

          if (updateErr) throw updateErr;

          // Insert audit trail
          await supabase
            .from('transactions')
            .insert({
              user_id: userId,
              type: 'microtask',
              amount: rewardAmount,
              status: 'completed',
              description: `USDT Daily Bonus Check-in (Day ${newStreak} Streak Boost)`,
              tx_hash: `0xcheckin-${Math.random().toString(16).substring(2, 10)}`
            });

          // Dispatch 5% referral bonus if referred_by is set and supported
          if (columns.includes('referred_by') && profile.referred_by) {
            try {
              const referralBonus = parseFloat((rewardAmount * 0.05).toFixed(6));
              const refColsToSelect = ['balance', 'total_earned'];
              if (columns.includes('referral_earnings')) {
                refColsToSelect.push('referral_earnings');
              }
              
              const { data: referrer, error: refErr } = await supabase
                .from('profiles')
                .select(refColsToSelect.join(', '))
                .eq('id', profile.referred_by)
                .maybeSingle();

              if (!refErr && referrer) {
                const referrerAny = referrer as any;
                const updatedRefBalance = (referrerAny.balance || 0) + referralBonus;
                const updatedRefTotal = (referrerAny.total_earned || 0) + referralBonus;
                const updatedRefEarnings = (referrerAny.referral_earnings || 0) + referralBonus;

                const refUpdatePayload: any = {
                  balance: parseFloat(updatedRefBalance.toFixed(6)),
                  total_earned: parseFloat(updatedRefTotal.toFixed(6))
                };
                if (columns.includes('referral_earnings')) {
                  refUpdatePayload.referral_earnings = parseFloat(updatedRefEarnings.toFixed(6));
                }

                await supabase
                  .from('profiles')
                  .update(refUpdatePayload)
                  .eq('id', profile.referred_by);

                // Register transaction log for inviter
                await supabase
                  .from('transactions')
                  .insert({
                    user_id: profile.referred_by,
                    type: 'microtask',
                    amount: referralBonus,
                    status: 'completed',
                    description: `5% Invite Yield from ${profile.full_name || 'Invitee'} Daily check-in`,
                    tx_hash: `0xbonus-checkin-${Math.random().toString(36).substring(2, 12)}`
                  });
              }
            } catch (err) {
              console.warn('[Referral Daily Bonus Split Failed]', err);
            }
          }

          return { 
            profile: (updated || profile) as UserProfile, 
            streak: newStreak, 
            reward: rewardAmount, 
            awarded: true 
          };
        } catch (e) {
          console.error('[Daily Bonus Database Failed, Falling back]', e);
        }
      }

      // Simulated local offline path
      const profileKey = `w2e_profile_${userId}`;
      const profile = getLocalData<UserProfile>(profileKey, {
        id: userId,
        email: 'sandbox@w2e.network',
        full_name: 'Simulated User',
        balance: 0,
        total_earned: 0,
        total_platform_commission: 0,
        created_at: new Date().toISOString()
      });

      const lastLogin = profile.last_login_date || '';
      const currentStreak = profile.login_streak || 0;

      if (lastLogin === todayStr) {
        return { 
          profile, 
          streak: currentStreak, 
          reward: 0, 
          awarded: false, 
          message: 'You have already claimed your daily check-in bonus today!' 
        };
      }

      // Local storage check for tasks completed today
      const txKey = `w2e_transactions_${userId}`;
      const transactions = getLocalData<Transaction[]>(txKey, []);
      const startOfTodayLocal = new Date();
      startOfTodayLocal.setHours(0, 0, 0, 0);

      const completedTaskLocal = transactions.some(t => 
        (t.type === 'watch_ad' || t.type === 'microtask') && 
        new Date(t.created_at) >= startOfTodayLocal
      );

      if (!completedTaskLocal) {
        return {
          profile,
          streak: currentStreak,
          reward: 0,
          awarded: false,
          message: 'Task Prerequisite Required: You must complete at least one task or watch an ad today before you can claim your daily check-in reward!'
        };
      }

      let newStreak = 1;
      if (lastLogin === yesterdayStr) {
        newStreak = currentStreak + 1;
      }

      profile.balance = parseFloat((profile.balance + rewardAmount).toFixed(6));
      profile.total_earned = parseFloat((profile.total_earned + rewardAmount).toFixed(6));
      profile.last_login_date = todayStr;
      profile.login_streak = newStreak;
      setLocalData(profileKey, profile);

      transactions.unshift({
        id: `tx-login-${Math.random().toString(36).substring(2, 9)}`,
        user_id: userId,
        type: 'microtask',
        amount: rewardAmount,
        status: 'completed',
        tx_hash: `0xsim-login-${Math.random().toString(16).substring(2, 12)}`,
        created_at: new Date().toISOString(),
        description: `USDT Daily Bonus Check-in (Day ${newStreak} Streak Boost)`
      });
      setLocalData(txKey, transactions);

      // Invite referral split simulation
      if (profile.referred_by) {
        try {
          const referrerId = profile.referred_by;
          const referrerKey = `w2e_profile_${referrerId}`;
          const referrerProfile = getLocalData<UserProfile | null>(referrerKey, null);

          if (referrerProfile) {
            const referralBonus = parseFloat((rewardAmount * 0.05).toFixed(6));
            referrerProfile.balance = parseFloat((referrerProfile.balance + referralBonus).toFixed(6));
            referrerProfile.total_earned = parseFloat((referrerProfile.total_earned + referralBonus).toFixed(6));
            referrerProfile.referral_earnings = parseFloat(((referrerProfile.referral_earnings || 0) + referralBonus).toFixed(6));
            setLocalData(referrerKey, referrerProfile);

            const refTxKey = `w2e_transactions_${referrerId}`;
            const refTransactions = getLocalData<Transaction[]>(refTxKey, []);
            refTransactions.unshift({
              id: `tx-ref-login-${Math.random().toString(36).substring(2, 9)}`,
              user_id: referrerId,
              type: 'microtask',
              amount: referralBonus,
              status: 'completed',
              tx_hash: `0xsim-ref-login-${Math.random().toString(16).substring(2, 12)}`,
              created_at: new Date().toISOString(),
              description: `5% Invite Yield from ${profile.full_name || 'Invitee'} Daily Streak`
            });
            setLocalData(refTxKey, refTransactions);
          }
        } catch (simRefErr) {
          console.error(simRefErr);
        }
      }

      return { profile, streak: newStreak, reward: rewardAmount, awarded: true };
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
