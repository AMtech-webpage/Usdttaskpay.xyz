import express from "express";
import path from "path";
import crypto from "crypto";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";

// Load environment variables for backend securely
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize backend Supabase client if configured
const supabaseUrl = process.env.VITE_SUPABASE_URL;
// Use service role key if available, else anonymous key
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const isSupabaseConfigured = supabaseUrl && supabaseServiceKey && 
  supabaseUrl !== "https://your-supabase-project.supabase.co" && 
  supabaseServiceKey !== "your-supabase-anon-key";

const supabaseAdmin = isSupabaseConfigured 
  ? createClient(supabaseUrl!, supabaseServiceKey!) 
  : null;

// ==========================================
// CRYPTOMUS PAYOUT CONTROLLER (/api/process-payout)
// ==========================================
app.post("/api/process-payout", async (req, res) => {
  const { amount, network, wallet_address, userId: clientUserId, user_email } = req.body;

  // Basic sanity validation
  if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) < 2.0) {
    return res.status(400).json({ 
      error: "Minimum withdrawal limit is 2.0000 USDT." 
    });
  }

  if (!wallet_address || (!wallet_address.startsWith("0x") && !wallet_address.startsWith("T"))) {
    return res.status(400).json({ 
      error: "Please specify a valid ERC20 or TRC20 wallet address." 
    });
  }

  const numericAmount = parseFloat(amount);
  const targetUserId = clientUserId || "mock-user-id";
  
  // Decide processing flow based on security guidelines
  // If amount > 5.000000 USDT, flag as manual review
  const flowType = numericAmount > 5.0 ? "manual_review" : "automatic";

  try {
    if (isSupabaseConfigured && supabaseAdmin) {
      // 1. Fetch live user profile to verify balance
      const { data: profile, error: profileErr } = await supabaseAdmin
        .from("profiles")
        .select("balance, full_name, email")
        .eq("id", targetUserId)
        .maybeSingle();

      if (profileErr) throw profileErr;
      if (!profile) return res.status(404).json({ error: "User profile not found." });

      if ((profile.balance || 0) < numericAmount) {
        return res.status(400).json({ error: "Insufficient balance to initiate withdrawal." });
      }

      // 2. Insert into public.withdrawal_requests
      const { data: request, error: insertErr } = await supabaseAdmin
        .from("withdrawal_requests")
        .insert({
          user_id: targetUserId,
          amount: numericAmount,
          network: network,
          wallet_address: wallet_address,
          status: flowType === "manual_review" ? "manual_review" : "pending",
          processing_type: flowType,
        })
        .select()
        .single();

      if (insertErr) throw insertErr;

      // If manual review, freeze and succeed with warning
      if (flowType === "manual_review") {
        return res.json({
          status: "manual_review",
          message: `payout exceeding 5.0000 USDT flagged. Saved ticket ID ${request.id} for security audit.`,
          requestId: request.id,
          processingType: "manual_review"
        });
      }

      // 3. Fire real Cryptomus Payout API Call (automatic path)
      const merchantId = process.env.CRYPTOMUS_MERCHANT_ID;
      const apiKey = process.env.CRYPTOMUS_PAYOUT_API_KEY;

      if (!merchantId || !apiKey) {
        // Missing Cryptomus keys - trigger graceful local simulation log
        const errorMsg = "Cryptomus API key or Merchant UUID not configured in secrets.";
        await supabaseAdmin
          .from("withdrawal_requests")
          .update({ 
            status: "pending", 
            error_log: errorMsg 
          })
          .eq("id", request.id);

        return res.status(500).json({
          error: "Payout system offline: Cryptomus credentials missing.",
          requestId: request.id,
          processingType: "automatic"
        });
      }

      // Map network code: match TRC20 -> TRX, BEP20 -> BSC, ERC20 -> ETH
      let cryptomusNetwork = "TRX"; // Default
      if (network === "BEP20") cryptomusNetwork = "BSC";
      if (network === "ERC20") cryptomusNetwork = "ETH";

      // Build payload matching Cryptomus standard payout creation format
      const payload = {
        amount: numericAmount.toFixed(6),
        currency: "USDT",
        network: cryptomusNetwork,
        address: wallet_address,
        order_id: request.id
      };

      // Create authentication headers
      const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString("base64");
      const signature = crypto.createHash("md5").update(payloadBase64 + apiKey).digest("hex");

      const response = await fetch("https://api.cryptomus.com/v1/payout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "userId": merchantId,
          "sign": signature
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok && result?.state === "success") {
        // 4. Update withdrawal block with completed state & deduct profile balance
        await supabaseAdmin
          .from("withdrawal_requests")
          .update({ status: "completed" })
          .eq("id", request.id);

        const newBalance = parseFloat(((profile.balance || 0) - numericAmount).toFixed(6));
        await supabaseAdmin
          .from("profiles")
          .update({ balance: newBalance })
          .eq("id", targetUserId);

        // Record a transaction receipt
        await supabaseAdmin
          .from("transactions")
          .insert({
            user_id: targetUserId,
            type: "withdrawal",
            amount: numericAmount,
            status: "completed",
            description: `USDT Automated Payout via Cryptomus on ${network}`,
            tx_hash: result.tx_hash || `0x${crypto.randomBytes(32).toString("hex")}`
          });

        return res.json({
          status: "completed",
          message: `Payout of ${numericAmount.toFixed(4)} USDT complete on ${network}!`,
          requestId: request.id,
          txHash: result.tx_hash,
          processingType: "automatic"
        });
      } else {
        // Cryptomus payout creation rejected
        const errorLogText = result?.message || `Cryptomus status code: ${response.status}`;
        await supabaseAdmin
          .from("withdrawal_requests")
          .update({ 
            status: "pending", 
            error_log: errorLogText 
          })
          .eq("id", request.id);

        return res.status(502).json({
          error: `Cryptomus Gateway Reject: ${errorLogText}`,
          requestId: request.id,
          processingType: "automatic"
        });
      }
    } else {
      // ==========================================
      // SIMULATOR MOCK FLOW (NO SUPABASE DETECTED)
      // ==========================================
      if (flowType === "manual_review") {
        return res.json({
          status: "manual_review",
          message: `[MOCK WARNING] Flagged payout of ${numericAmount.toFixed(4)} USDT for Manual Admin Review (threshold > 5.0).`,
          requestId: `mock-${crypto.randomBytes(8).toString("hex")}`,
          processingType: "manual_review"
        });
      }

      // Check Cryptomus credentials in Mock mode to warn developers gracefully
      const isCryptomusMissing = !process.env.CRYPTOMUS_MERCHANT_ID || !process.env.CRYPTOMUS_PAYOUT_API_KEY;

      if (isCryptomusMissing) {
        console.warn("[Cryptomus Config Missing] Continuing sandbox execution using simulated payouts.");
      }

      return res.json({
        status: "completed",
        message: `[SANDBOX SUCCEEDED] Automatic checkout of ${numericAmount.toFixed(4)} USDT completed successfully via Cryptomus simulation on ${network}.`,
        requestId: `mock-${crypto.randomBytes(8).toString("hex")}`,
        txHash: `0x${crypto.randomBytes(32).toString("hex")}`,
        processingType: "automatic"
      });
    }
  } catch (error: any) {
    console.error("[Payout Dispatch Interrupted]", error);
    return res.status(500).json({ 
      error: `Payout execution backend failure: ${error.message || error}` 
    });
  }
});

// Serve static assets out of client distribution
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[WATCH2EARN] Full-stack application running globally on http://localhost:${PORT}`);
  });
}

startServer();
