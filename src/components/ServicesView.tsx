import React from 'react';
import { ArrowLeft, Cpu, ShieldAlert, Coins, Share2, Server, HelpCircle } from 'lucide-react';

interface ServicesViewProps {
  onBack: () => void;
}

export const ServicesView: React.FC<ServicesViewProps> = ({ onBack }) => {
  const servicesList = [
    {
      title: 'Attention Routing Pools',
      description: 'Programmatic delivery mechanisms routing high-retention video streams from authorized global advertising networks (e.g., ToroX) straight to interested users, splitting revenues under an 80/20 layout.',
      icon: Share2,
      accent: 'text-cyan-400 bg-cyan-950/40 border-cyan-500/20'
    },
    {
      title: 'Decentralized Microtask Auditing',
      description: 'Our automated attention ledger records each verified task action with distinct transaction records. This preserves transparency and provides instantly claimable USDT rewards for participants.',
      icon: Coins,
      accent: 'text-blue-400 bg-blue-950/40 border-blue-500/20'
    },
    {
      title: 'Sybil Defense Ingress Firewall',
      description: 'An advanced, high-performance API system that checks user geolocations, IP signatures, hosting identifiers, and proxy signatures to block coordinated robot farming and double-spend exploits.',
      icon: Server,
      accent: 'text-purple-400 bg-purple-950/40 border-purple-500/20'
    },
    {
      title: 'Multi-Chain Liquidity Channels',
      description: 'Highly robust manual payout nodes connected with TRON, Binance Smart Chain, and Ethereum mainnets, enabling rapid and secure withdrawals when account limits cross 2.0000 USDT.',
      icon: Cpu,
      accent: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/20'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0A0E17] text-slate-100 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Back navigation button */}
        <button
          onClick={onBack}
          className="group mb-8 flex items-center space-x-2 text-xs sm:text-sm font-mono text-slate-400 hover:text-cyan-400 bg-slate-900/40 border border-slate-800/80 px-4 py-2 rounded-xl transition-all duration-300 hover:border-cyan-500/30 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span>Exit Services & Return</span>
        </button>

        {/* Hero title */}
        <div className="relative mb-12 p-8 rounded-2xl bg-gradient-to-br from-slate-950 to-[#0c1220] border border-slate-800/60 overflow-hidden">
          <div className="absolute right-0 top-0 h-[150px] w-[150px] bg-cyan-500/5 blur-[80px]" />
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 rounded-lg bg-cyan-950/40 border border-cyan-500/20">
              <Server className="h-6 w-6 text-cyan-400" />
            </div>
            <span className="font-mono text-xs uppercase tracking-widest text-cyan-400 font-semibold">Services Protocol</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Our Automated Services
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-400 font-mono">
            Platform Engine: usdt-task.xyz &bull; Professional Attention Infrastructure
          </p>
        </div>

        {/* Introduction */}
        <div className="mb-10 p-6 rounded-xl bg-slate-950/60 border border-slate-900 leading-relaxed text-sm text-slate-300">
          <p>
            We deploy multiple layers of server and blockchain technologies to host a reliable and legitimate Web3 Watch-to-Earn ecosystem. Below is a deep description of our core functional platforms and API services designed for both advertisers and active earners.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {servicesList.map((service) => {
            const ServiceIcon = service.icon;
            return (
              <div key={service.title} className="p-6 rounded-xl bg-slate-950/70 border border-slate-900 flex flex-col justify-between hover:border-slate-800 transition-all duration-300">
                <div>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`p-2 rounded-lg border ${service.accent}`}>
                      <ServiceIcon className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-extrabold text-white font-display">{service.title}</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ note */}
        <div className="mt-12 p-6 rounded-xl bg-gradient-to-r from-red-500/5 to-slate-950 border border-red-500/10 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-red-400 flex items-center space-x-2">
            <ShieldAlert className="h-4 w-4" />
            <span>Operational Integrity Warning</span>
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            All services are provided under tight compliance procedures. Because of high fraud parameters inside the advertising networks, any user utilizing multi-accounts, virtual machine emulators, residential proxies, or virtual private networks (VPN) is flagged automatically and removed from our active databases. Payouts are systematically voided in these states.
          </p>
        </div>

        {/* Footer info banner */}
        <div className="mt-12 p-6 rounded-xl bg-gradient-to-r from-cyan-950/20 to-slate-950 text-center border border-slate-900">
          <p className="text-xs text-slate-400 font-mono flex items-center justify-center space-x-1.5">
            <HelpCircle className="h-4 w-4 text-cyan-400" />
            <span>Need Custom Advertiser API Integration? Contact <span className="text-cyan-400 underline ml-1 cursor-pointer">partners@usdt-task.xyz</span></span>
          </p>
        </div>
      </div>
    </div>
  );
};
