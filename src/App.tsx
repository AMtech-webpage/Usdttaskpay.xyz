import { useState, useEffect } from 'react';
import { api, UserProfile, isSupabaseConfigured } from './lib/supabase';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { AuthModal } from './components/AuthModal';
import { EarningsDashboard } from './components/EarningsDashboard';
import { DeveloperConsole } from './components/DeveloperConsole';
import { ShieldAlert, BookOpen, ExternalLink, Mail, Github, Compass, Sparkles, Database } from 'lucide-react';

export default function App() {
  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(null);
  const [currentPage, setCurrentPage] = useState<'home' | 'dashboard' | 'auth'>('home');
  const [isDevConsoleOpen, setIsDevConsoleOpen] = useState(false);
  const [authInitialTab, setAuthInitialTab] = useState<'login' | 'signup'>('login');
  const [isSessionLoading, setIsSessionLoading] = useState(true);

  // Check active user sessions on start
  useEffect(() => {
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

  return (
    <div className="flex min-h-screen flex-col bg-cyber-black text-slate-100 selection:bg-cyan-500/30 selection:text-white">
      {/* Dynamic Header */}
      <Header
        currentProfile={currentProfile}
        onLogout={handleLogout}
        onNavigate={(page) => setCurrentPage(page)}
        currentPage={currentPage}
        onOpenDeveloperPane={() => setIsDevConsoleOpen(true)}
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
        ) : currentPage === 'auth' ? (
          <AuthModal 
            initialState={authInitialTab}
            onSuccess={handleAuthSuccess}
            onNavigateHome={() => setCurrentPage('home')}
          />
        ) : currentPage === 'dashboard' && currentProfile ? (
          <EarningsDashboard 
            currentProfile={currentProfile}
            onProfileChange={(updated) => setCurrentProfile(updated)}
            onLogout={handleLogout}
            onOpenDeveloperPane={() => setIsDevConsoleOpen(true)}
          />
        ) : (
          <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
            <p className="text-sm text-slate-400">Route not resolved or session unauthorized.</p>
          </div>
        )}
      </main>

      {/* Integrated Developer Setup Drawer */}
      <DeveloperConsole 
        isOpen={isDevConsoleOpen}
        onClose={() => setIsDevConsoleOpen(false)}
      />

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

            {/* Code setup note */}
            <div>
              <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">
                Integration
              </h4>
              <p className="text-[11px] text-slate-400 leading-normal">
                Easily scale this system into production inside your private infrastructure. Click <strong onClick={() => setIsDevConsoleOpen(true)} className="text-cyan-400 cursor-pointer hover:underline">Database Rules</strong> in the headers to trace schema setups.
              </p>
            </div>
          </div>

          <div className="border-t border-slate-900 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-slate-500">
            <span>© 2026 Watch2Earn Global Networks LTD. All attention rights secured.</span>
            <div className="flex items-center space-x-4">
              <span className="hover:text-slate-300 cursor-pointer">Attention Manifesto</span>
              <span className="hover:text-slate-300 cursor-pointer" onClick={() => setIsDevConsoleOpen(true)}>Supabase Trigger Setup</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
