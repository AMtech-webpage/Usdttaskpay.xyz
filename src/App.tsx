import { useState, useEffect } from 'react';
import { api, UserProfile, isSupabaseConfigured } from './lib/supabase';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { AuthModal } from './components/AuthModal';
import { EarningsDashboard } from './components/EarningsDashboard';
import FAQSection from './components/FAQSection';
import { PrivacyPolicyView } from './components/PrivacyPolicyView';
import { TermsOfServiceView } from './components/TermsOfServiceView';
import { verifyUserSecurity, SecurityTelemetry } from './lib/security';
import { ShieldAlert, BookOpen, ExternalLink, Mail, Github, Compass, Sparkles, Database, ShieldCheck, HelpCircle, RefreshCw, AlertOctagon } from 'lucide-react';

export default function App() {
  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(null);
  const [currentPage, setCurrentPage] = useState<'home' | 'dashboard' | 'auth' | 'privacy' | 'terms'>('home');
  const [authInitialTab, setAuthInitialTab] = useState<'login' | 'signup'>('login');
  const [isSessionLoading, setIsSessionLoading] = useState(true);

  // Cybersecurity VPN Protection state parameters
  const [isSecurityChecking, setIsSecurityChecking] = useState(true);
  const [securityBlock, setSecurityBlock] = useState<{
    blocked: boolean;
    telemetry: SecurityTelemetry | null;
  }>({
    blocked: false,
    telemetry: null
  });

  // Check active sessions, run security sweeps, and record referrers on mount
  useEffect(() => {
    // Capture referral code if present in physical browser address
    const params = new URLSearchParams(window.location.search);
    const referralCode = params.get('ref') || params.get('invite') || params.get('referral');
    if (referralCode) {
      localStorage.setItem('w2e_referrer_code', referralCode);
      console.log('Captured inviter referral code:', referralCode);
    }

    const runSecurityAudit = async () => {
      try {
        const telemetry = await verifyUserSecurity();
        if (telemetry.isProxyOrVpn) {
          setSecurityBlock({ blocked: true, telemetry });
        } else {
          setSecurityBlock({ blocked: false, telemetry });
        }
      } catch (err) {
        console.error('Core network audit check crash: ', err);
      } finally {
        setIsSecurityChecking(false);
      }
    };

    const syncSession = async () => {
      setIsSessionLoading(true);
      try {
        const session = await api.auth.getSession();
        if (session && session.profile) {
          setCurrentProfile(session.profile);
          setCurrentPage('dashboard');
        }
      } catch (err) {
        console.error('Session loading failed: ', err);
      } finally {
        setIsSessionLoading(false);
      }
    };

    // Execute concurrently.
    runSecurityAudit();
    syncSession();
  }, []);

  const handleAuthSuccess = (session: any) => {
    if (session && session.profile) {
      setCurrentProfile(session.profile);
      setCurrentPage('dashboard');
    }
  };

  const handleLogout = async () => {
    try {
      await api.auth.signOut();
      setCurrentProfile(null);
      setCurrentPage('home');
    } catch (err) {
      console.error('Logout error: ', err);
    }
  };

  const handleNavigateToAuth = (tab: 'login' | 'signup') => {
    setAuthInitialTab(tab);
    setCurrentPage('auth');
  };

  // Cybersecurity VPN Protection screen block pre-empting standard interface
  if (isSecurityChecking) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0A0E17] text-white p-4 font-sans selection:bg-cyan-500/20">
        <div className="text-center space-y-4 max-w-sm">
          <div className="relative mx-auto flex h-16 w-16 items-center justify-center">
            <span className="absolute inset-0 h-full w-full rounded-full border-2 border-cyan-400/10 border-t-cyan-400 animate-spin" />
            <ShieldCheck className="h-6 w-6 text-cyan-400 animate-pulse" />
          </div>
          <p className="font-mono text-[10px] text-cyan-400 uppercase tracking-widest leading-relaxed">
            Running Secure Telemetry Sweep...
          </p>
          <p className="text-xs text-slate-500 font-mono">
            Scanning for VPN, proxy channels, or virtual farms
          </p>
        </div>
      </div>
    );
  }

  if (securityBlock.blocked) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#070A10] text-slate-100 p-6 sm:p-12 font-sans selection:bg-red-500/30">
        <div className="relative max-w-xl w-full p-8 rounded-2xl bg-gradient-to-b from-red-950/10 to-slate-950 border border-red-500/30 overflow-hidden shadow-2xl">
          <div className="absolute right-0 top-0 h-[180px] w-[180px] bg-red-500/5 blur-[90px]" />
          
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2.5 rounded-xl bg-red-950/30 border border-red-500/20">
              <AlertOctagon className="h-7 w-7 text-red-500" />
            </div>
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-red-400 font-bold">Security Ingress Firewalled</span>
              <h2 className="text-xl sm:text-2xl font-black text-white">Access Denied</h2>
            </div>
          </div>

          <p className="text-sm text-slate-300 mb-6 leading-relaxed">
            Access Denied: VPN, Proxy, or Unverified Location Detected. Please disable your VPN to access <strong className="text-cyan-400 font-mono">usdt-task.xyz</strong>.
          </p>

          <div className="space-y-4 bg-slate-950/90 border border-slate-900 rounded-xl p-5 font-mono text-[11px] text-slate-400 leading-relaxed">
            <div className="border-b border-slate-900 pb-2.5 mb-2.5 text-xs text-red-450 font-bold tracking-tight">
              CYBER_TELEMETRY_LOGS:
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Physical IP Address:</span>
              <span className="text-emerald-400 font-semibold">{securityBlock.telemetry?.ip}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Geographical Origin:</span>
              <span className="text-white">{securityBlock.telemetry?.city}, {securityBlock.telemetry?.country_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Autonomous System (ASN):</span>
              <span className="text-slate-300 font-semibold max-w-[200px] truncate">{securityBlock.telemetry?.asn}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Network Organization:</span>
              <span className="text-slate-300 font-semibold max-w-[200px] truncate">{securityBlock.telemetry?.org}</span>
            </div>
            <div className="border-t border-slate-900 pt-2.5 mt-2.5 text-[10px] text-slate-500">
              <span className="text-red-400/95 font-bold">Reason Code:</span> {securityBlock.telemetry?.reason || 'Dynamic proxy flag mismatch'}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button 
              onClick={() => window.location.reload()}
              className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-mono text-xs font-semibold rounded-xl transition-all duration-300 cursor-pointer flex items-center justify-center space-x-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Retry Validation Sync</span>
            </button>
            <span className="text-[10px] text-slate-500 font-mono text-center sm:text-right">
              Device Handshake SEC_ERR_403
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-cyber-black text-slate-100 selection:bg-cyan-500/30 selection:text-white">
      {/* Dynamic Header */}
      <Header
        currentProfile={currentProfile}
        onLogout={handleLogout}
        onNavigate={(page) => setCurrentPage(page)}
        currentPage={currentPage}
        onOpenDeveloperPane={() => {}}
      />

      {/* Main Content Router */}
      <main className="flex-grow">
        {isSessionLoading ? (
          <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-cyber-black">
            <div className="text-center space-y-4">
              <div className="relative mx-auto flex h-12 w-12 items-center justify-center">
                <span className="absolute inset-0 h-full w-full rounded-full border-2 border-cyan-400/20 border-t-cyan-400 animate-spin" />
              </div>
              <p className="font-mono text-xs text-slate-400 uppercase tracking-widest tracking-wide">
                Verifying Decentralized Sessions...
              </p>
            </div>
          </div>
        ) : currentPage === 'home' ? (
          <>
            <HeroSection 
              onStart={() => {
                if (currentProfile) {
                  setCurrentPage('dashboard');
                } else {
                  handleNavigateToAuth('signup');
                }
              }}
              onNavigateToAuth={() => handleNavigateToAuth('login')}
            />
            <FAQSection />
          </>
        ) : currentPage === 'auth' ? (
          <AuthModal 
            initialState={authInitialTab}
            onSuccess={handleAuthSuccess}
            onNavigateHome={() => setCurrentPage('home')}
          />
        ) : currentPage === 'privacy' ? (
          <PrivacyPolicyView 
            onBack={() => setCurrentPage(currentProfile ? 'dashboard' : 'home')}
          />
        ) : currentPage === 'terms' ? (
          <TermsOfServiceView 
            onBack={() => setCurrentPage(currentProfile ? 'dashboard' : 'home')}
          />
        ) : currentPage === 'dashboard' && currentProfile ? (
          <EarningsDashboard 
            currentProfile={currentProfile}
            onProfileChange={(updated) => setCurrentProfile(updated)}
            onLogout={handleLogout}
            onOpenDeveloperPane={() => {}}
            onNavigateToLegal={(targetPage) => setCurrentPage(targetPage)}
          />
        ) : (
          <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
            <p className="text-sm text-slate-400">Route not resolved or session unauthorized.</p>
          </div>
        )}
      </main>

      {/* Aesthetic Web3 Page Footer */}
      <footer className="border-t border-slate-900 bg-[#060a12] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            {/* Brand column */}
            <div className="md:col-span-2 space-y-4">
              <span className="font-display text-lg font-black tracking-tight text-white sm:text-xl">
                Watch<span className="bg-gradient-to-r from-cyan-400 to-electric-blue bg-clip-text text-transparent">2Earn</span>
              </span>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                The world's premium Watch-to-Earn portal routing attention values directly from global ad suppliers back into decentralized wallet owners. Clean, honest, and auditable 80/20 split model.
              </p>
            </div>

            {/* Platform links */}
            <div>
              <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">
                Supported Blockchains
              </h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-center space-x-1.5 hover:text-cyan-400 cursor-pointer">
                  <span className="h-1 w-1 rounded-full bg-cyan-400" />
                  <span>TRON (TRC-20)</span>
                </li>
                <li className="flex items-center space-x-1.5 hover:text-cyan-400 cursor-pointer">
                  <span className="h-1 w-1 rounded-full bg-cyan-400" />
                  <span>BSC Smart Chain (BEP-20)</span>
                </li>
                <li className="flex items-center space-x-1.5 hover:text-cyan-400 cursor-pointer">
                  <span className="h-1 w-1 rounded-full bg-cyan-400" />
                  <span>Ethereum Mainnet (ERC-20)</span>
                </li>
              </ul>
            </div>

            {/* Auditing note */}
            <div>
              <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">
                Auditing
              </h4>
              <p className="text-[11px] text-slate-400 leading-normal">
                All transaction logs and stream actions are transparently verifiable on our integrated ledgers, ensuring prompt client-to-pool liquidity split flows.
              </p>
            </div>
          </div>

          <div className="border-t border-slate-900 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-slate-500">
            <span>© 2026 Watch2Earn Global Networks LTD. All rights reserved.</span>
            <div className="flex items-center space-x-4">
              <span onClick={() => setCurrentPage('terms')} className="hover:text-slate-300 hover:text-cyan-400 cursor-pointer transition-colors duration-200">Terms of Service</span>
              <span onClick={() => setCurrentPage('privacy')} className="hover:text-slate-300 hover:text-cyan-400 cursor-pointer transition-colors duration-200">Privacy Policy</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
