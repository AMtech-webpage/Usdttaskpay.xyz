-- SQL additions for public.withdrawal_requests table & safety trigger
-- You can run these commands directly inside your Supabase SQL Editor workspace.

-- 1. Create the withdrawal_requests table if not exists with processing columns
CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount NUMERIC(16, 6) NOT NULL CHECK (amount >= 2.000000),
    network TEXT NOT NULL,
    wallet_address TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'completed', 'rejected', 'manual_review')),
    processing_type TEXT NOT NULL DEFAULT 'automatic',
    error_log TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure RLS is configured or public access is matching your target security model
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- Dynamic Policy: Allow logged-in users to read their own withdrawals
CREATE POLICY "Users can query their own withdrawal history."
    ON public.withdrawal_requests FOR SELECT
    USING (auth.uid() = user_id);

-- Dynamic Policy: Allow logged-in users to submit fresh withdrawal requests
CREATE POLICY "Users can insert fresh withdrawal requests."
    ON public.withdrawal_requests FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 2. Create the enforce_payout_safety trigger function
CREATE OR REPLACE FUNCTION public.enforce_payout_safety()
RETURNS TRIGGER AS $$
BEGIN
    -- If amount is greater than 5.000000 USDT, override to manual_review to safeguard hot wallet reserves
    IF NEW.amount > 5.000000 THEN
        NEW.processing_type := 'manual_review';
        NEW.status := 'manual_review'; -- Ensure status updates to manual holding
    ELSE
        NEW.processing_type := 'automatic';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Attach the trigger to the table as a BEFORE INSERT guard
DROP TRIGGER IF EXISTS trg_payout_safety ON public.withdrawal_requests;
CREATE TRIGGER trg_payout_safety
    BEFORE INSERT ON public.withdrawal_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_payout_safety();
