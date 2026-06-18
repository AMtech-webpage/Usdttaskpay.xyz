-- SECURE MANUAL WITHDRAWAL SYSTEM (SUPABASE POSTGRES TRANSACTION RPC)
-- Execute this script inside your Supabase SQL Editor.
-- This function automatically runs inside an isolated atomic transaction, preventing double-spending.

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
