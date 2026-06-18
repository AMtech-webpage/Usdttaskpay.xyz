import React from 'react';
import { ArrowLeft, Scale, AlertTriangle, Coins, Ban, Layers, RefreshCw } from 'lucide-react';

interface TermsOfServiceViewProps {
  onBack: () => void;
}

export const TermsOfServiceView: React.FC<TermsOfServiceViewProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-[#0A0E17] text-slate-100 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Back navigation button */}
        <button
          onClick={onBack}
          className="group mb-8 flex items-center space-x-2 text-xs sm:text-sm font-mono text-slate-400 hover:text-cyan-400 bg-slate-900/40 border border-slate-800/80 px-4 py-2 rounded-xl transition-all duration-300 hover:border-cyan-500/30 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span>Exit Legal & Return</span>
        </button>

        {/* Hero title */}
        <div className="relative mb-12 p-8 rounded-2xl bg-gradient-to-br from-slate-950 to-[#0c1220] border border-slate-800/60 overflow-hidden">
          <div className="absolute right-0 top-0 h-[150px] w-[150px] bg-cyan-500/5 blur-[80px]" />
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 rounded-lg bg-cyan-950/40 border border-cyan-500/20">
              <Scale className="h-6 w-6 text-cyan-400" />
            </div>
            <span className="font-mono text-xs uppercase tracking-widest text-cyan-400 font-semibold">User Protocol Agreement</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Terms of Service
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-400 font-mono">
            Platform Protocol: usdt-task.xyz &bull; Last Revised: June 18, 2026
          </p>
        </div>

        {/* Content sections */}
        <div className="space-y-8 text-sm text-slate-300 leading-relaxed">
          
          <div className="p-6 rounded-xl bg-slate-950/60 border border-slate-900">
            <h2 className="flex items-center space-x-2 text-base font-bold text-white mb-3">
              <Layers className="h-4 w-4 text-cyan-400" />
              <span>1. Intellectual Framework & Acceptance</span>
            </h2>
            <p>
              Welcome to Extreme (usdt-task.xyz). By interacting with our interface, completing attention campaigns, routing streams, or submitting withdrawal commands, you commit to these Terms of Service. If you do not accept these policies in full, you must instantly terminate your access.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-red-950/15 border border-red-500/10">
            <h2 className="flex items-center space-x-2 text-base font-bold text-red-400 mb-3">
              <Ban className="h-4 w-4 text-red-500" />
              <span>2. Absolute Network Restrictions (Anti-VPN & Anti-Tor)</span>
            </h2>
            <p className="text-slate-300">
              To defend our system, prevent regional ad bypasses, and secure payout pools from malicious actors, we apply strict anti-network modification criteria:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-2 text-slate-400">
              <li>
                <strong className="text-red-300">No VPNs or Proxies:</strong> Users are strictly prohibited from visiting the site whilst routing traffic through Virtual Private Networks (VPNs), physical proxy servers, or any network-masking device.
              </li>
              <li>
                <strong className="text-red-300">No Tor Nodes:</strong> Connections initiating from virtualized Tor exit nodes, residential proxies, or darknet directories are strictly blocked.
              </li>
              <li>
                <strong className="text-red-300">Automatic Telemetry Validation:</strong> Our security framework automated scripts analyze connections. Accounts flagged as masking their geographical location will be locked out and their accrued balances destroyed.
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-xl bg-slate-950/60 border border-slate-900">
            <h2 className="flex items-center space-x-2 text-base font-bold text-white mb-3">
              <AlertTriangle className="h-4 w-4 text-cyan-400" />
              <span>3. Anti-Farming & Sybil Multi-Account Prohibition</span>
            </h2>
            <p>
              We pride ourselves on distributing exact attention revenue. To combat "farming" syndicates, the following limits are enforced on EVERY client:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-2 text-slate-400">
              <li>
                <strong className="text-slate-200">One Account Per Person / Network / IP:</strong> Registering more than one profile per household, person, IP layout, or physical device is strictly illegal on this portal.
              </li>
              <li>
                <strong className="text-slate-200">Device Handshake Checks:</strong> Scripted browser bots, emulators, automated clickers, or headless virtual machines used to play ads automatically will trigger terminal security bans.
              </li>
              <li>
                <strong className="text-slate-200">Asset Confiscation:</strong> Any user found farming multiple slots will face structural platform bans, and their integrated balances will be returned to our general task pool.
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-xl bg-slate-950/60 border border-slate-900">
            <h2 className="flex items-center space-x-2 text-base font-bold text-white mb-3">
              <RefreshCw className="h-4 w-4 text-cyan-400" />
              <span>4. Third-Party Ad Network Fraud Guard & Withhold Clause</span>
            </h2>
            <p>
              Extreme matches stream supplies from global decentralized ad systems, including ToroX and related offerwall hubs. 
            </p>
            <p className="mt-2 text-slate-300">
              If an external ad network provider flags your task completion, survey submit, or ad view as fraudulent, invalid, or suspicious:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-2 text-slate-400">
              <li>We hold the exclusive right to instantly withhold reward completions.</li>
              <li>Accrued USDT balances linked with disputed ad transactions will be deducted without warning.</li>
              <li>Extreme is not responsible for reversals, delays, or unpaid actions initiated by third-party ad providers.</li>
            </ul>
          </div>

          <div className="p-6 rounded-xl bg-slate-950/60 border border-slate-900">
            <h2 className="flex items-center space-x-2 text-base font-bold text-white mb-3">
              <Coins className="h-4 w-4 text-cyan-400" />
              <span>5. Programmatic Minimum Withdrawal Threshold ($2.000000 USDT)</span>
            </h2>
            <p>
              To structure network transaction costs (gas) effectively and support micro-incentive splits, we enforce a strict programmatic lock on payouts:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-2 text-slate-400">
              <li>
                <strong className="text-slate-200">The Minimum Withdrawal Threshold:</strong> You must possess a verified current balance of at least <strong className="text-cyan-400">$2.000000 USDT</strong> to initiate a withdrawal to your external wallet destination.
              </li>
              <li>
                No user can submit withdrawal requests, smart contract dispatches, or pool triggers until their balance is mathematically greater than or equal to this limit.
              </li>
            </ul>
          </div>

        </div>

        {/* Footer info banner */}
        <div className="mt-12 p-6 rounded-xl bg-gradient-to-r from-cyan-950/20 to-slate-950 text-center border border-slate-900">
          <p className="text-xs text-slate-400">
            Concerns with our code policies? Contact our security officers at <span className="text-cyan-400">terms@usdt-task.xyz</span>
          </p>
        </div>
      </div>
    </div>
  );
};
