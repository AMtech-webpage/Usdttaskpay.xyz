import React from 'react';
import { ArrowLeft, Users, Shield, Cpu, Code, BarChart3, Mail, Heart } from 'lucide-react';

interface TeamsViewProps {
  onBack: () => void;
}

export const TeamsView: React.FC<TeamsViewProps> = ({ onBack }) => {
  const teamMembers = [
    {
      name: 'Alexander Vane',
      role: 'Co-Founder & Chief Executive',
      bio: 'Former senior smart contract architecture engineer with over 8 years of algorithmic advertising router designs. Alexander drives the strategic growth of the Watch-to-Earn liquidity pools.',
      icon: Cpu,
      accent: 'text-cyan-400 bg-cyan-950/40 border-cyan-500/20'
    },
    {
      name: 'Dr. Sarah K. Chen',
      role: 'Head of Operational Compliance',
      bio: 'Expert in international digital assets compliance and anti-sibyl auditing models. Sarah oversees the risk management pipelines and automated proxy-defensive triggers.',
      icon: Shield,
      accent: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/20'
    },
    {
      name: 'Marcus Brody',
      role: 'Lead Full-Stack Web3 Developer',
      bio: 'Core system build architect. Marcus oversees the automated attention ledger sync, high-throughput RPC connections, and defensive frontend authentication mechanics.',
      icon: Code,
      accent: 'text-blue-400 bg-blue-950/40 border-blue-500/20'
    },
    {
      name: 'Elena Rostova',
      role: 'Global Pools Liquidity Officer',
      bio: 'Elena handles smart pool balances, supplier payouts, and direct advertiser billing relationships to secure a consistent 80/20 revenue distribution.',
      icon: BarChart3,
      accent: 'text-purple-400 bg-purple-950/40 border-purple-500/20'
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
          <span>Exit Team & Return</span>
        </button>

        {/* Hero title */}
        <div className="relative mb-12 p-8 rounded-2xl bg-gradient-to-br from-slate-950 to-[#0c1220] border border-slate-800/60 overflow-hidden">
          <div className="absolute right-0 top-0 h-[150px] w-[150px] bg-cyan-500/5 blur-[80px]" />
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 rounded-lg bg-cyan-950/40 border border-cyan-500/20">
              <Users className="h-6 w-6 text-cyan-400" />
            </div>
            <span className="font-mono text-xs uppercase tracking-widest text-cyan-400 font-semibold">Our Identity</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Meet the Core Team
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-400 font-mono">
            Builders, Engineers, and Compliance Personnel &bull; Establishing Trust & Transparency
          </p>
        </div>

        {/* Introduction */}
        <div className="mb-10 p-6 rounded-xl bg-slate-950/60 border border-slate-900 leading-relaxed text-sm text-slate-300">
          <p>
            At <span className="text-cyan-400 font-bold">Watch2Earn Global Networks LTD</span>, our mission is to build highly robust web systems that connect consumers and global advertisers transparently. By replacing inefficient traditional intermediaries, we route 80% of generated attention values directly back to decentralized wallet owners. Meet the talented team based in our international office.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {teamMembers.map((member) => {
            const MemberIcon = member.icon;
            return (
              <div key={member.name} className="p-6 rounded-xl bg-slate-950/70 border border-slate-900 flex flex-col justify-between hover:border-slate-800 transition-all duration-300">
                <div>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`p-2 rounded-lg border ${member.accent}`}>
                      <MemberIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-white font-display">{member.name}</h3>
                      <p className="text-xs text-cyan-400 font-mono uppercase tracking-wider">{member.role}</p>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Core Values banner */}
        <div className="mt-12 p-6 rounded-xl bg-gradient-to-r from-cyan-950/20 to-slate-950 border border-slate-900 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-slate-200 flex items-center space-x-2">
            <Heart className="h-4 w-4 text-cyan-400" />
            <span>Our Core Commitments</span>
          </h3>
          <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono text-slate-400">
            <li className="bg-slate-950/40 p-3 rounded-lg border border-slate-900">
              <strong className="text-white block mb-1">100% Audit Logs</strong>
              Every transaction hash is verifiable transparently under current profiles ledger indexes.
            </li>
            <li className="bg-slate-950/40 p-3 rounded-lg border border-slate-900">
              <strong className="text-white block mb-1">Strict Fair-Play</strong>
              Enforcing advanced proxy detection blocks automated crawler/bot farms to secure advertiser ROI.
            </li>
            <li className="bg-slate-950/40 p-3 rounded-lg border border-slate-900">
              <strong className="text-white block mb-1">80% User Profit</strong>
              We operate strictly under a 20% platform commission model, returning 80% to active streamers.
            </li>
          </ul>
        </div>

        {/* Footer info banner */}
        <div className="mt-12 p-6 rounded-xl bg-gradient-to-r from-cyan-950/20 to-slate-950 text-center border border-slate-900">
          <p className="text-xs text-slate-400">
            Want to join our global engineering network? Contact us at <span className="text-cyan-400">careers@usdt-task.xyz</span>
          </p>
        </div>
      </div>
    </div>
  );
};
