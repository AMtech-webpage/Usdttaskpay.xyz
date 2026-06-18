import React from 'react';
import { ArrowLeft, Shield, Lock, Eye, Globe, Database, Scale } from 'lucide-react';

interface PrivacyPolicyViewProps {
  onBack: () => void;
}

export const PrivacyPolicyView: React.FC<PrivacyPolicyViewProps> = ({ onBack }) => {
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
              <Shield className="h-6 w-6 text-cyan-400" />
            </div>
            <span className="font-mono text-xs uppercase tracking-widest text-cyan-400 font-semibold">Legal Agreement</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Privacy Policy
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-400 font-mono">
            Platform Protocol: usdt-task.xyz &bull; Last Revised: June 18, 2026
          </p>
        </div>

        {/* Content sections */}
        <div className="space-y-8 text-sm text-slate-300 leading-relaxed">
          
          <div className="p-6 rounded-xl bg-slate-950/60 border border-slate-900">
            <h2 className="flex items-center space-x-2 text-base font-bold text-white mb-3">
              <Globe className="h-4 w-4 text-cyan-400" />
              <span>1. Overview & General Intent</span>
            </h2>
            <p>
              Extreme ("we," "our," or "the Platform") operates <span className="text-cyan-400">usdt-task.xyz</span>. We are fully committed to protecting your privacy while enabling a robust, secure Watch-to-Earn experience. This Privacy Policy details our practices concerning data collection, IP telemetry, crypto wallet registers, and direct sharing mechanisms engineered to support transparent ad rewards.
            </p>
            <p className="mt-2">
              By accessing, registering, or completing attention tasks on our platform, you explicitly consent to the collection, tracking, storage, and processing of your device metadata in accordance with this specification.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-slate-950/60 border border-slate-900">
            <h2 className="flex items-center space-x-2 text-base font-bold text-white mb-3">
              <Database className="h-4 w-4 text-cyan-400" />
              <span>2. Core Crypto & Blockchain Data We Collect</span>
            </h2>
            <p>
              To process client payouts and enforce programmatic accountability, we collect and store:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-2 text-slate-400">
              <li>
                <strong className="text-slate-200">Public Cryptographic Wallet Addresses:</strong> When initiating payouts, your TRC-20, BEP-20, or ERC-20 public address is recorded in our secure ledger. We never collect or request your private keys, seed phrases, or security prompts.
              </li>
              <li>
                <strong className="text-slate-200">On-Chain Transaction Hashes:</strong> Every completed withdrawal logs its unique programmatic hash to enable decentralized audit trails.
              </li>
              <li>
                <strong className="text-slate-200">User Identification Fields:</strong> Basic credentials, such as Email Addresses and Full Name records, are verified during account setup to establish user identity.
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-xl bg-slate-950/60 border border-slate-900">
            <h2 className="flex items-center space-x-2 text-base font-bold text-white mb-3">
              <Lock className="h-4 w-4 text-cyan-400" />
              <span>3. IP Tracking, Device Telemetry & VPN Restrictions</span>
            </h2>
            <p>
              To defend our reward pools against sybil attacks, scripted farms, and fraudulent bots, we enforce precise environmental telemetry. Our system actively records and analyzes:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-2 text-slate-400">
              <li>
                <strong className="text-slate-200">Your Current Device IP Address:</strong> Automatically verified on every API request.
              </li>
              <li>
                <strong className="text-slate-200">Host, Proxy, and ISP Identifiers:</strong> Fetched via public and commercial security ledgers to block connection manipulation.
              </li>
              <li>
                <strong className="text-slate-200">Geographical Country Rules:</strong> Leveraged to maintain regulatory compliance for localized advertising payouts.
              </li>
            </ul>
            <p className="mt-3 text-slate-400">
              Note: Using VPNs, residential proxies, or virtualized hosting targets to mask your network signature is strictly prohibited under our operational guidelines. Telemetry logs showing these connections will lead to structural lockouts.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-slate-950/60 border border-slate-900">
            <h2 className="flex items-center space-x-2 text-base font-bold text-white mb-3">
              <Eye className="h-4 w-4 text-cyan-400" />
              <span>4. Data Sharing & Third-Party Offerwalls</span>
            </h2>
            <p>
              We do not sell your personal data to traditional marketing brokers. However, to synchronize and attribute Watch-to-Earn payouts, we communicate with third-party advertising partners and interactive offerwalls (including but not limited to <strong className="text-slate-200">ToroX</strong>).
            </p>
            <p className="mt-2">
              For security, verification, and reward tracking, we share:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-2 text-slate-400">
              <li>Anonymized unique identification hashes associated with your user session.</li>
              <li>Your device IP address and country-level location data (for targeted ad qualification).</li>
              <li>Task completion parameters required by ad suppliers to release USDT rewards.</li>
            </ul>
            <p className="mt-3">
              This data sharing is mandatory for the operation of the system; if you wish to prevent this sharing, you must stop utilizing the Watch-to-Earn interactive features of usdt-task.xyz.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-slate-950/60 border border-slate-900">
            <h2 className="flex items-center space-x-2 text-base font-bold text-white mb-3">
              <Scale className="h-4 w-4 text-cyan-400" />
              <span>5. Regulatory Adherence & Updates</span>
            </h2>
            <p>
              Our operations aim to conform with standard crypto compliance models. We hold the right to update this policy at any time to align with regional digital asset frameworks. Any modified policy will be posted on this page with an updated timestamp.
            </p>
          </div>

        </div>

        {/* Footer info banner */}
        <div className="mt-12 p-6 rounded-xl bg-gradient-to-r from-cyan-950/20 to-slate-950 text-center border border-slate-900">
          <p className="text-xs text-slate-400">
            Questions regarding our policy? Direct inquiries to <span className="text-cyan-400">compliance@usdt-task.xyz</span>
          </p>
        </div>
      </div>
    </div>
  );
};
