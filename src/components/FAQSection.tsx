import React, { useState } from 'react';
import { HelpCircle, ChevronDown, Coins, Lock, Wallet, ArrowUpRight, ShieldCheck, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FAQItem {
  question: string;
  answer: string;
  category: 'withdraw' | 'earnings' | 'security';
  icon: React.ReactNode;
}

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<'all' | 'withdraw' | 'earnings' | 'security'>('all');

  const faqs: FAQItem[] = [
    {
      category: 'earnings',
      icon: <Coins className="h-4 w-4 text-cyan-400" />,
      question: "How does the Extreme 80/20 revenue split work?",
      answer: "Every time you watch a sponsored ad stream or complete a micro-task, advertisers pay us in real-time. Exteme operates on a transparent, auditable 80/20 split model: 80% of that advertising revenue is directly credited to your user balance, while a small 20% commission is retained by the platform to power server infrastructure, smart contracts, and secure backend operations."
    },
    {
      category: 'withdraw',
      icon: <Wallet className="h-4 w-4 text-cyan-400" />,
      question: "Which networks are supported for USDT withdrawals?",
      answer: "We support three major blockchain networks for prompt withdrawals: TRON (TRC-20) for the lowest fees and maximum compatibility, Binance Smart Chain (BEP-20) for cost-efficient fast routing, and Ethereum Mainnet (ERC-20) for enterprise-grade security. You can update your designated wallet address at any time in your Settings tab."
    },
    {
      category: 'withdraw',
      icon: <ArrowUpRight className="h-4 w-4 text-cyan-400" />,
      question: "Is there a minimum withdrawal limit or any fees?",
      answer: "To keep high-liquidity operations smooth, the minimum withdrawal threshold is 10.0000 USDT. Gas fees depend entirely on your chosen blockchain network: TRC-20 and BEP-20 withdrawals enjoy near-zero network fees (usually under 0.5 USDT), whereas ERC-20 withdrawals are subject to live Ethereum gas rates at the time of your transacting epoch."
    },
    {
      category: 'security',
      icon: <Lock className="h-4 w-4 text-cyan-400" />,
      question: "How is my account security and cryptographic funds locked?",
      answer: "All user auth credentials and password layers are fully encrypted and managed securely via Supabase Auth services. Balance transfers and tasks-earned states are continuously synced on a secure PostgreSQL relational ledger. Withdrawal transactions must pass our strict internal fraud-detector checks (e.g. ad completion verification hashes) before the blockchain node triggers output dispatch."
    },
    {
      category: 'earnings',
      icon: <Sparkles className="h-4 w-4 text-cyan-400" />,
      question: "Can I earn more by inviting friends (Referral Program)?",
      answer: "Yes, absolutely! Extreme features an integrated crypto affiliate program. By sharing your unique referral link from your dashboard, you will receive an automatic 10% commission on all of your referred users' lifetime earnings. This payout comes directly from the protocol's house share, ensuring your referred partner still retains their full 80% yield intact."
    },
    {
      category: 'security',
      icon: <ShieldCheck className="h-4 w-4 text-cyan-400" />,
      question: "Can I run multiple tabs or standard browser macros to farm USDT?",
      answer: "No. Our anti-sybil and streaming validator scripts continuously track active user focuses and response times. Attempting to use automated browser scripts, farming macros, or multi-tab bots will trigger an automatic security lock on your wallet profile, resulting in immediate forfeiture of accrued non-withdrawn balances. Real human attention fuels the 80/20 pool."
    }
  ];

  const filteredFaqs = activeCategory === 'all' 
    ? faqs 
    : faqs.filter(faq => faq.category === activeCategory);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq-section" className="relative py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-900 bg-cyber-black overflow-hidden">
      {/* Background ambient radial gradients */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full bg-cyan-900/5 blur-[100px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 -translate-y-1/2 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] rounded-full bg-electric-blue/5 blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Section Heading */}
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex items-center space-x-1.5 rounded-full bg-cyan-950/40 border border-cyan-500/20 px-3 py-1">
            <HelpCircle className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-cyan-400">
              Protocol Documentation
            </span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Frequently Asked <span className="bg-gradient-to-r from-cyan-400 to-electric-blue bg-clip-text text-transparent">Questions</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
            Everything you need to know about watching ad nodes, withdraw operations, and security protocols on the Extreme platform.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {[
            { id: 'all', label: 'All Questions' },
            { id: 'earnings', label: '80/20 Revenue Split' },
            { id: 'withdraw', label: 'USDT Withdrawals' },
            { id: 'security', label: 'Security Protocols' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id as any);
                setOpenIndex(null);
              }}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold cursor-pointer transition-all duration-300 border ${
                activeCategory === cat.id
                  ? 'bg-gradient-to-r from-electric-blue/15 to-cyan-500/15 text-cyan-400 border-cyan-500/40 shadow-sm'
                  : 'bg-slate-950/40 text-slate-400 border-slate-900 hover:text-white hover:border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* FAQ Accordion Grid */}
        <div className="space-y-3">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`overflow-hidden rounded-xl border transition-all duration-300 ${
                  isOpen 
                    ? 'border-cyan-500/25 bg-slate-950/40' 
                    : 'border-slate-900 bg-slate-950/20 hover:border-slate-800/60'
                }`}
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="flex w-full items-center justify-between p-4 sm:p-5 text-left cursor-pointer transition-colors duration-200"
                >
                  <div className="flex items-center space-x-3 pr-4">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                      isOpen 
                        ? 'border-cyan-500/30 bg-cyan-950/25' 
                        : 'border-slate-900 bg-slate-950'
                    }`}>
                      {faq.icon}
                    </div>
                    <span className="font-sans text-sm font-semibold text-slate-200 hover:text-white transition-colors">
                      {faq.question}
                    </span>
                  </div>
                  
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-slate-500 shrink-0"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                      <div className="px-4 sm:px-5 pb-5 pt-0 border-t border-slate-900/60 mt-1">
                        <p className="text-xs text-slate-400 leading-relaxed font-sans pt-3">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Bottom Contact callout */}
        <div className="mt-10 rounded-xl bg-slate-950/30 border border-slate-900 p-4 text-center">
          <p className="text-[11px] font-mono text-slate-500">
            Have a technical query about node distribution or custom smart integrations? Reach us via the developer console rules.
          </p>
        </div>

      </div>
    </section>
  );
}
