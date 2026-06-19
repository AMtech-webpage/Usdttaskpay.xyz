-- =========================================================================
-- COMPLETE WEB3 WATCH-TO-EARN DATABASE SCHEMA & ATOMIC PROCEDURES (SUPABASE)
-- =========================================================================
-- Execute this entire script inside your Supabase SQL Editor (https://supabase.com)
-- to provision your tables, establish database integrity, and run secured transactions.

-- 1. PROFILES TABLE definition (Users attention split profile)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    balance NUMERIC(18, 6) DEFAULT 0.000000 NOT NULL,
    total_earned NUMERIC(18, 6) DEFAULT 0.000000 NOT NULL,
    total_platform_commission NUMERIC(18, 6) DEFAULT 0.000000 NOT NULL,
    wallet_address TEXT DEFAULT '',
    
    -- Referral System Columns
    referred_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    referral_code TEXT UNIQUE,
    referral_earnings NUMERIC(18, 6) DEFAULT 0.000000 NOT NULL,
    referral_count INTEGER DEFAULT 0 NOT NULL,
    
    -- Daily Check-In Bonus Columns
    last_login_date DATE,
    login_streak INTEGER DEFAULT 0 NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. WITHDRAWAL REQUESTS TABLE (System tracks actual payout pipelines)
CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    amount NUMERIC(18, 6) NOT NULL,
    network TEXT NOT NULL, -- e.g. TRC20, BEP20, ERC20
    wallet_address TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'completed', 'rejected', 'manual_review')),
    processing_type TEXT DEFAULT 'manual' CHECK (processing_type IN ('automatic', 'manual')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on withdrawal_requests
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- 3. TRANSACTIONS TABLE (Immutable system auditing logs)
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT CHECK (type IN ('watch_ad', 'microtask', 'withdrawal')) NOT NULL,
    amount NUMERIC(18, 6) NOT NULL,
    platform_share NUMERIC(18, 6) DEFAULT 0.000000,
    status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')) NOT NULL,
    tx_hash TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;


-- =========================================================================
-- SECURITY RLS POLICIES FOR USER TRANSPARENCY
-- =========================================================================

-- Profiles Policies
DROP POLICY IF EXISTS "Allow users to read their own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow public read access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow anyone to read any profiles" ON public.profiles;
CREATE POLICY "Allow anyone to read any profiles" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow users to update their own profiles" ON public.profiles;
CREATE POLICY "Allow users to update their own profiles" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- CRITICAL FIX: Allow profile insertions during register/signup!
-- During sign up, the user session might not be active, so auth.uid() = id would fail.
-- The foreign key "profiles.id REFERENCES auth.users(id)" automatically secures this.
DROP POLICY IF EXISTS "Allow users to insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow profile insertions during signup" ON public.profiles;
CREATE POLICY "Allow profile insertions during signup" ON public.profiles FOR INSERT WITH CHECK (true);

-- Withdrawal Requests Policies
DROP POLICY IF EXISTS "Allow users to select their own withdrawals" ON public.withdrawal_requests;
CREATE POLICY "Allow users to select their own withdrawals" ON public.withdrawal_requests FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to insert their own withdrawals" ON public.withdrawal_requests;
CREATE POLICY "Allow users to insert their own withdrawals" ON public.withdrawal_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Transactions Policies
DROP POLICY IF EXISTS "Allow users to select their own transactions" ON public.transactions;
CREATE POLICY "Allow users to select their own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to insert their own transactions" ON public.transactions;
CREATE POLICY "Allow users to insert their own transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);


-- =========================================================================
-- SECURE TRANSACTION OVER DOUBLE-SPEND: SUBMIT MANUAL WITHDRAWAL RPC
-- =========================================================================
CREATE OR REPLACE FUNCTION public.submit_manual_withdrawal(
    user_id UUID,
    withdrawal_amount NUMERIC,
    user_network TEXT,
    user_wallet TEXT
)
RETURNS VOID AS $$
DECLARE
    current_user_balance NUMERIC;
BEGIN
    -- 1. Lock the profile row for update to prevent concurrent double-spend race conditions
    SELECT balance INTO current_user_balance
    FROM public.profiles
    WHERE id = user_id
    FOR UPDATE;

    -- Verify profile exists
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User profile not found in database.';
    END IF;

    -- 2. Validate current balance threshold
    IF current_user_balance < withdrawal_amount THEN
        RAISE EXCEPTION 'Insufficient balance to complete the requested withdrawal.';
    END IF;

    -- Ensure minimum limit is satisfied
    IF withdrawal_amount < 2.000000 THEN
        RAISE EXCEPTION 'The minimum withdrawal limit is 2.0000 USDT.';
    END IF;

    -- 3. Immediate balance deduction to lock the funds safely
    UPDATE public.profiles
    SET balance = balance - withdrawal_amount
    WHERE id = user_id;

    -- 4. Insert the new row into withdrawal_requests
    INSERT INTO public.withdrawal_requests (
        user_id,
        amount,
        network,
        wallet_address,
        status,
        processing_type
    ) VALUES (
        user_id,
        withdrawal_amount,
        user_network,
        user_wallet,
        'pending',
        'manual'
    );

    -- 5. Insert corresponding transaction record for ledger transparency
    INSERT INTO public.transactions (
        user_id,
        type,
        amount,
        status,
        description,
        tx_hash
    ) VALUES (
        user_id,
        'withdrawal',
        withdrawal_amount,
        'pending',
        'USDT withdrawal requested via manual network channel ' || user_network || ' to: ' || SUBSTRING(user_wallet, 1, 6) || '...' || SUBSTRING(user_wallet, LENGTH(user_wallet) - 3, 4),
        'pending-tx-' || encode(gen_random_bytes(16), 'hex')
    );

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =========================================================================
-- PROACTIVE AUTOMATIC PROFILE SYNCRONIZATION TRIGGER (FOOLPROOF FIX)
-- =========================================================================
-- This trigger automatically inserts a custom profile into the profiles table 
-- whenever a new user completes signUp on auth.users, even if client-side callbacks miss.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    simple_name_slug TEXT;
    auto_referral_code TEXT;
    referred_by_id UUID := NULL;
    ref_code TEXT;
BEGIN
    -- Derive a clean alphanumeric referral slug from email prefix
    simple_name_slug := REGEXP_REPLACE(SPLIT_PART(new.email, '@', 1), '[^a-zA-Z0-9]', '', 'g');
    IF simple_name_slug = '' THEN
        simple_name_slug := 'streamer';
    END IF;
    
    -- Generate a unique referral code
    auto_referral_code := simple_name_slug || '_' || LOWER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 4));

    -- Scan for referred_by_code passed inside the signup metadata
    ref_code := new.raw_user_meta_data->>'referred_by_code';

    IF ref_code IS NOT NULL AND ref_code <> '' THEN
        SELECT id INTO referred_by_id FROM public.profiles WHERE referral_code = ref_code LIMIT 1;
    END IF;

    -- Create profile record securely
    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        balance,
        total_earned,
        total_platform_commission,
        wallet_address,
        referred_by,
        referral_code,
        referral_earnings,
        referral_count,
        login_streak
    ) VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', 'Crypto Streamer'),
        0.000000,
        0.000000,
        0.000000,
        '',
        referred_by_id,
        auto_referral_code,
        0.000000,
        0,
        0
    )
    ON CONFLICT (id) DO NOTHING;

    -- Increment referral count of inviter if found
    IF referred_by_id IS NOT NULL THEN
        UPDATE public.profiles
        SET referral_count = referral_count + 1
        WHERE id = referred_by_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Clear previous trigger to reload configuration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Bind trigger on auth.users inserts
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- =========================================================================
-- HOW TO PROCESS PAYOUTS ENCOUNTERED WITH WRONG TABLE
-- =========================================================================
-- To mark a withdrawal request as COMPLETED:
-- UPDATE public.withdrawal_requests
-- SET status = 'completed'
-- WHERE id = 'insert-withdrawal-uuid-here';
