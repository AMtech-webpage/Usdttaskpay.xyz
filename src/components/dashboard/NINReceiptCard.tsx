import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { Download, ShieldCheck, Cpu, ArrowDownToLine, RefreshCw, Layers } from 'lucide-react';
import { UserProfile } from '../../types';

interface NINReceiptCardProps {
  profile: UserProfile;
  amount: number;
  network: string;
  walletAddress: string;
  transactionId?: string;
  date?: string;
  onClose?: () => void;
}

// Generates a fully-reproducible, 100% CORS-proof biometric security card photo
// using pure SVG and CSS. This avoids html2canvas external source blocks and oklch parsing errors.
const BiometricAvatar: React.FC<{ id: string; name: string }> = ({ id, name }) => {
  // Use a simple hash code of ID to decide geometric seeds, colors, and features
  const getHash = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
  };

  const seed = getHash(id || 'default');
  const baseColors = [
    { bg: 'linear-gradient(to bottom, #2563eb, #1e1b4b)', secondary: '#38bdf8', accent: '#a5b4fc', fill: '#2563eb' },
    { bg: 'linear-gradient(to bottom, #0d9488, #022c22)', secondary: '#2dd4bf', accent: '#6ee7b7', fill: '#0d9488' },
    { bg: 'linear-gradient(to bottom, #7c3aed, #4a044e)', secondary: '#c084fc', accent: '#f5d0fe', fill: '#7c3aed' },
    { bg: 'linear-gradient(to bottom, #0891b2, #172554)', secondary: '#22d3ee', accent: '#93c5fd', fill: '#0891b2' },
    { bg: 'linear-gradient(to bottom, #e11d48, #450a0a)', secondary: '#f43f5e', accent: '#fde047', fill: '#e11d48' },
  ];
  const color = baseColors[seed % baseColors.length];

  // Head/Body variants
  const headShape = (seed % 3) === 0 ? { rx: 16 } : (seed % 3) === 1 ? { rx: 24 } : { rx: 8 };
  const eyesVariant = (seed % 2) === 0 
    ? <><rect x="18" y="22" width="6" height="6" rx="1" fill="#fff" /><rect x="36" y="22" width="6" height="6" rx="1" fill="#fff" /></>
    : <><circle cx="21" cy="25" r="3" fill="#fff" /><circle cx="39" cy="25" r="3" fill="#fff" /></>;

  return (
    <div 
      className="relative w-24 h-28 border-2 rounded-md overflow-hidden flex flex-col items-center justify-end shrink-0 group"
      style={{
        background: color.bg,
        borderColor: 'rgba(148, 163, 184, 0.4)',
        boxShadow: 'inset 0 0 10px rgba(0,0,0,0.4)'
      }}
    >
      {/* Background Matrix lines */}
      <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#ffffff" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Abstract Head & Shoulder Biometric SVG */}
      <svg width="60" height="80" viewBox="0 0 60 80" className="relative z-10 drop-shadow-md">
        {/* Hair/Helmet background */}
        <path d="M12,30 C12,12 48,12 48,30" fill={color.accent} opacity="0.8" />
        
        {/* Head */}
        <rect x="14" y="16" width="32" height="32" {...headShape} fill="#e2e8f0" />
        
        {/* Eyes */}
        {eyesVariant}
        
        {/* Cheeks/Mouth */}
        <rect x="25" y="38" width="10" height="3" rx="1" fill={color.secondary} opacity="0.9" />

        {/* Neck */}
        <rect x="24" y="44" width="12" height="10" fill="#cbd5e1" />

        {/* Shoulders / Body Jacket */}
        <path d="M6,54 C10,50 18,48 24,52 L36,52 C42,48 50,50 54,54 L54,78 L6,78 Z" fill={color.fill} />
        <path d="M22,52 L38,52 L30,78 Z" fill="#475569" />
        <circle cx="30" cy="58" r="2" fill="#fff" />
      </svg>

      {/* Holographic Security Overlay lines */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(34, 211, 238, 0.1), transparent)'
        }}
      />
      
      {/* Laser Signature Text overlay */}
      <div 
        className="absolute top-1 left-1.5 font-mono text-[6px] tracking-widest pointer-events-none uppercase"
        style={{ color: '#cbd5e1' }}
      >
        {name.substring(0, 9).replace(/\s+/g, '')}
      </div>

      {/* Holographic Biometrics overlay */}
      <div 
        className="absolute bottom-1 right-1 rounded-full px-1 py-[1px] font-mono text-[5px]"
        style={{
          backgroundColor: 'rgba(34, 211, 238, 0.2)',
          border: '1px solid rgba(34, 211, 238, 0.35)',
          color: '#e0f2fe'
        }}
      >
        VERIFIED
      </div>
    </div>
  );
};

// CSS bar widths generator for the card barcode
const FakeBarcode: React.FC = () => {
  const bars = [4, 1, 2, 3, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 4, 3, 1, 2, 4];
  return (
    <div className="flex items-end h-6 opacity-80" style={{ gap: '1px' }}>
      {bars.map((weight, idx) => (
        <span 
          key={idx} 
          className="border-none inline-block h-full" 
          style={{ width: `${weight * 0.75}px`, backgroundColor: '#0f172a' }} 
        />
      ))}
    </div>
  );
};

const cleanOklchAndOklab = (cssText: string): string => {
  if (!cssText) return cssText;
  let result = '';
  let i = 0;
  while (i < cssText.length) {
    if (cssText.substring(i, i + 6) === 'oklch(' || cssText.substring(i, i + 6) === 'oklab(') {
      i += 6; // skip "oklch(" or "oklab("
      let depth = 1;
      while (i < cssText.length && depth > 0) {
        const char = cssText[i];
        if (char === '(') {
          depth++;
        } else if (char === ')') {
          depth--;
        }
        i++;
      }
      result += 'rgb(15, 23, 42)'; // solid neutral dark-slate fallback
    } else {
      result += cssText[i];
      i++;
    }
  }
  return result;
};

export const NINReceiptCard: React.FC<NINReceiptCardProps> = ({
  profile,
  amount,
  network,
  walletAddress,
  transactionId = 'TXN-' + Math.floor(100000 + Math.random() * 900000),
  date = new Date().toLocaleDateString(),
  onClose
}) => {
  const captureRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Setup Tiering styling based on target amount using strict inline CSS colors to bypass oklch parsing crashes under html2canvas:
  // <= 49.99 USDT -> Silver Card
  // 50 - 199.99 USDT -> Golden Card
  // 200+ USDT -> Bronze Card
  const isGold = amount >= 50.0 && amount < 200.0;
  const isBronze = amount >= 200.0;
  
  let themeAbbrev = "W2E-SLV";

  const cardStyle = {
    background: isGold
      ? 'linear-gradient(135deg, #fef3c7 0%, #fde047 50%, #f59e0b 100%)'
      : isBronze
      ? 'linear-gradient(135deg, #1c1917 0%, #292524 50%, #0c0a09 100%)'
      : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
    borderColor: isGold ? '#fbbf24' : isBronze ? '#78350f' : '#94a3b8',
    color: isGold ? '#78350f' : isBronze ? '#ffedd5' : '#1e293b',
  };

  const badgeStyle = {
    backgroundColor: isGold ? '#fef3c7' : isBronze ? '#1c1917' : '#e2e8f0',
    borderColor: isGold ? '#f59e0b' : isBronze ? '#78350f' : '#cbd5e1',
    color: isGold ? '#78350f' : isBronze ? '#fdba74' : '#1e293b',
  };

  const textStyle = {
    color: isGold ? '#451a03' : isBronze ? '#ffedd5' : '#0f172a',
  };

  const softLabelStyle = {
    color: isGold ? '#78350f' : isBronze ? '#a8a29e' : '#475569',
  };

  const lightBorderStyle = {
    borderColor: isGold ? 'rgba(217, 119, 6, 0.25)' : isBronze ? 'rgba(120, 53, 15, 0.4)' : 'rgba(148, 163, 184, 0.35)',
  };

  const mrzStyle = {
    backgroundColor: isGold ? 'rgba(251, 191, 36, 0.2)' : isBronze ? 'rgba(0, 0, 0, 0.4)' : 'rgba(203, 213, 225, 0.4)',
    color: isGold ? '#78350f' : isBronze ? '#fdba74' : '#334155',
  };

  if (isGold) {
    themeAbbrev = "W2E-GLD";
  } else if (isBronze) {
    themeAbbrev = "W2E-BRZ";
  }

  // Generate a plausible National ID format string
  const formattedId = profile.id 
    ? profile.id.replace(/[^0-9]/g, '').substring(0, 11).padEnd(11, '0').replace(/(\d{3})(\d{4})(\d{4})/, '$1 $2 $3')
    : Math.floor(10000000000 + Math.random() * 90000000000).toString().replace(/(\d{3})(\d{4})(\d{4})/, '$1 $2 $3');

  // Format date of registration
  const formattedRegDate = profile.created_at 
    ? new Date(profile.created_at).toLocaleDateString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' })
    : date;

  // Process short Wallet format
  const shortWallet = walletAddress 
    ? `${walletAddress.substring(0, 9)}...${walletAddress.substring(walletAddress.length - 8)}`
    : 'None Registered';

  const downloadScreenshot = async () => {
    if (!captureRef.current) return;
    setDownloading(true);

    const originalGetComputedStyle = window.getComputedStyle;
    const stylesToRestore: { element: HTMLStyleElement; originalText: string }[] = [];
    const linksToRestore: { link: HTMLLinkElement; tempStyle: HTMLStyleElement | null }[] = [];

    try {
      // 1. Temporarily patch window.getComputedStyle
      window.getComputedStyle = function (elt, pseudoElt) {
        const originalStyle = originalGetComputedStyle.call(this, elt, pseudoElt);
        return new Proxy(originalStyle, {
          get(target, prop, receiver) {
            const val = Reflect.get(target, prop, receiver);
            if (typeof val === 'string' && (val.includes('oklch') || val.includes('oklab'))) {
              return cleanOklchAndOklab(val);
            }
            if (typeof val === 'function') {
              return val.bind(target);
            }
            return target && typeof target === 'object' && prop in target 
              ? Reflect.get(target, prop, receiver) 
              : val;
          }
        });
      };

      // 2. Temporarily clean oklch/oklab from inline <style> tags
      try {
        const styleElements = Array.from(document.querySelectorAll('style'));
        for (const style of styleElements) {
          if (style.textContent && (style.textContent.includes('oklch') || style.textContent.includes('oklab'))) {
            stylesToRestore.push({ element: style, originalText: style.textContent });
            style.textContent = cleanOklchAndOklab(style.textContent);
          }
        }
      } catch (styleErr) {
        console.warn('Failed inline style clean:', styleErr);
      }

      // 3. Temporarily find and inline same-origin/fetchable <link> stylesheets
      try {
        const linkElements = Array.from(document.querySelectorAll('link[rel="stylesheet"]')) as HTMLLinkElement[];
        for (const link of linkElements) {
          try {
            const response = await fetch(link.href);
            if (response.ok) {
              const cssContent = await response.text();
              if (cssContent.includes('oklch') || cssContent.includes('oklab')) {
                const cleanedCss = cleanOklchAndOklab(cssContent);
                const tempStyle = document.createElement('style');
                tempStyle.textContent = cleanedCss;
                document.head.appendChild(tempStyle);
                
                link.disabled = true;
                linksToRestore.push({ link, tempStyle });
              }
            } else {
              link.disabled = true;
              linksToRestore.push({ link, tempStyle: null });
            }
          } catch (linkFetchErr) {
            console.warn('Could not clean link sheet, disabling to prevent crash:', link.href, linkFetchErr);
            link.disabled = true;
            linksToRestore.push({ link, tempStyle: null });
          }
        }
      } catch (linkAllErr) {
        console.warn('Failed link style clean:', linkAllErr);
      }

      // Delay briefly to allow rendering structures to settle
      await new Promise((resolve) => setTimeout(resolve, 350));

      const canvas = await html2canvas(captureRef.current, {
        useCORS: true,
        scale: 3, // Premium high-DPI scaling
        backgroundColor: null,
        logging: false,
      });

      const fileSafeName = profile.full_name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
      const link = document.createElement('a');
      link.download = `W2E_NIN_Receipt_${fileSafeName}_${amount.toFixed(0)}_USDT.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Error generating screenshot receipt card:', err);
    } finally {
      // 4. Restore original styles and computed styles
      window.getComputedStyle = originalGetComputedStyle;

      for (const item of stylesToRestore) {
        item.element.textContent = item.originalText;
      }

      for (const item of linksToRestore) {
        item.link.disabled = false;
        if (item.tempStyle && item.tempStyle.parentNode) {
          item.tempStyle.parentNode.removeChild(item.tempStyle);
        }
      }

      setDownloading(false);
    }
  };

  const copyToClipboard = () => {
    const textToCopy = `W2E Verified Withdrawal:
Name: ${profile.full_name}
Registration ID: ${formattedId}
Amount: ${amount.toFixed(4)} USDT
Network: ${network.toUpperCase()}
Wallet: ${walletAddress}
Date: ${date}
Transaction hash: ${transactionId}
Status: PENDING REVIEW`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
        
        {/* Modal headers */}
        <div className="mb-5 text-center">
          <h3 className="text-base font-display font-extrabold text-white flex items-center justify-center space-x-2">
            <ShieldCheck className="h-5 w-5 text-cyan-400" />
            <span>Withdrawal Signature Authenticated</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Your premium NIN-style digital payout proof has been minted. Download it to claim your verified USDT ledger share!
          </p>
        </div>

        {/* Capture Container: Keeps pristine dimensions */}
        <div className="overflow-x-auto py-2">
          <div 
            ref={captureRef}
            id="nin-card-capture"
            className="w-[500px] h-[315px] mx-auto shrink-0 relative rounded-2xl border-2 p-3 flex flex-col justify-between font-sans select-none overflow-hidden"
            style={{
              background: cardStyle.background,
              borderColor: cardStyle.borderColor,
              color: cardStyle.color,
              boxShadow: 'inset 0 0 40px rgba(0,0,0,0.06)',
            }}
          >
            {/* Top Security Line Pattern Background */}
            <div className="absolute top-12 left-0 right-0 h-[2px]" style={{ backgroundColor: 'rgba(6, 182, 212, 0.15)' }} />
            <div className="absolute top-24 left-0 right-0 h-[1px]" style={{ backgroundColor: 'rgba(6, 182, 212, 0.05)' }} />

            {/* Holographic Watermark Circle in Background */}
            <div className="absolute top-1/2 left-[55%] -translate-y-1/2 w-48 h-48 rounded-full border pointer-events-none flex items-center justify-center" style={{ borderColor: 'rgba(6, 182, 212, 0.1)' }}>
              <div className="w-36 h-36 rounded-full border border-dashed flex items-center justify-center" style={{ borderColor: 'rgba(6, 182, 212, 0.1)' }}>
                <ShieldCheck className="h-16 w-16" style={{ color: 'rgba(6, 182, 212, 0.05)' }} />
              </div>
            </div>

            {/* 1. Header (NIN Style National Layout) */}
            <div className="flex items-center justify-between border-b pb-1.5" style={{ borderColor: 'rgba(15, 23, 42, 0.1)' }}>
              <div className="flex items-center space-x-2">
                <span 
                  className="flex items-center justify-center h-6 w-6 rounded-full text-[10px] font-bold text-white shrink-0 border border-white/20"
                  style={{ backgroundColor: '#0f172a' }}
                >
                  W2E
                </span>
                <div>
                  <h4 className="text-[10px] font-black tracking-wider uppercase leading-none" style={{ color: '#0f172a' }}>
                    WATCH-to-EARN USDT PROTOCOL
                  </h4>
                  <p className="text-[6px] font-bold tracking-widest mt-0.5" style={{ color: '#475569' }}>
                    FEDERAL REPUBLIC OF WEB3 • SMART CONTRACT LEDGER
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block text-[8px] font-black px-1.5 py-0.5 rounded-md border" style={badgeStyle}>
                  {themeAbbrev}
                </span>
              </div>
            </div>

            {/* 2. Body Area (Biometric Photo, Chip + Data fields) */}
            <div className="flex-1 grid grid-cols-12 gap-3.5 pt-2.5 items-start">
              
              {/* Left Column: Biometrics, Microchip, and Authority signature */}
              <div className="col-span-4 flex flex-col items-center space-y-1.5">
                <BiometricAvatar id={profile.id} name={profile.full_name} />
                                {/* Contact Smartcard Gold Chip */}
                <div className="flex items-center space-x-2 w-full px-1">
                  <div 
                    className="w-8 h-6 rounded border flex flex-col justify-between p-[2px] items-center shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, #ca8a04, #fbbf24, #ca8a04)',
                      borderColor: 'rgba(217, 119, 6, 0.5)'
                    }}
                  >
                    <div className="grid grid-cols-3 gap-[1px] w-full h-full opacity-70">
                      {[1,2,3,4,5,6,7,8,9].map((n) => (
                        <div key={n} style={{ border: '0.5px solid rgba(146, 64, 14, 0.4)' }} />
                      ))}
                    </div>
                  </div>
                  
                  {/* Hologram Circle */}
                  <div 
                    className="w-5 h-5 rounded-full opacity-85 border animate-pulse shrink-0 flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(90deg, #2dd4bf, #22d3ee, #6366f1)',
                      borderColor: 'rgba(255, 255, 255, 0.2)'
                    }}
                  >
                    <Layers className="h-2 w-2" style={{ color: 'rgba(255, 255, 255, 0.8)' }} />
                  </div>
                </div>
              </div>

              {/* Right Column: NIN Personal Details Grid */}
              <div className="col-span-8 space-y-1.5 select-text">
                
                {/* National Identification Code Title */}
                <div>
                  <span className="text-[7px] font-bold block uppercase tracking-wider" style={softLabelStyle}>
                    National User Payout ID (NIN)
                  </span>
                  <span className="font-mono text-sm leading-none font-bold tracking-wider" style={{ color: '#090d16' }}>
                    {formattedId}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[6px] font-bold block uppercase leading-none" style={softLabelStyle}>
                      SURNAME / NAME
                    </span>
                    <span className="text-[9px] font-black leading-tight block truncate uppercase" style={textStyle}>
                      {profile.full_name}
                    </span>
                  </div>
                  <div>
                    <span className="text-[6px] font-bold block uppercase leading-none" style={softLabelStyle}>
                      REGISTRY DATE
                    </span>
                    <span className="text-[9px] font-extrabold leading-tight block" style={textStyle}>
                      {formattedRegDate}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[6px] font-bold block uppercase leading-none" style={softLabelStyle}>
                      PAYOUT AMOUNT (USDT)
                    </span>
                    <span className="text-[11px] font-black block leading-none" style={{ color: isGold ? '#0f766e' : isBronze ? '#10b981' : '#047857' }}>
                      +{amount.toFixed(4)} USDT
                    </span>
                  </div>
                  <div>
                    <span className="text-[6px] font-bold block uppercase leading-none" style={softLabelStyle}>
                      BLOCKCHAIN CHANNEL
                    </span>
                    <span className="text-[10px] font-mono font-black block leading-none uppercase" style={{ color: isGold ? '#047857' : isBronze ? '#22d3ee' : '#0e7490' }}>
                      {network} (TRON)
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[6px] font-bold block uppercase leading-none" style={softLabelStyle}>
                    DESTINATION CRYPTO WALLET
                  </span>
                  <span className="text-[8px] font-mono font-bold leading-tight block uppercase truncate" style={textStyle} title={walletAddress}>
                    {shortWallet}
                  </span>
                </div>

                {/* Micro-ledger audit trail lines */}
                <div className="grid grid-cols-2 gap-2 pt-0.5 border-t" style={{ borderColor: 'rgba(15, 23, 42, 0.1)' }}>
                  <div>
                    <span className="text-[5.5px] font-bold block uppercase" style={softLabelStyle}>
                      Audit Hash ID
                    </span>
                    <span className="font-mono text-[7px] block uppercase truncate" style={{ color: '#1e293b' }}>
                      {transactionId}
                    </span>
                  </div>
                  <div>
                    <span className="text-[5.5px] font-bold block uppercase" style={softLabelStyle}>
                      Verification State
                    </span>
                    <span className="text-[7.5px] font-bold block uppercase leading-tight flex items-center space-x-1" style={{ color: '#1d4ed8' }}>
                      <span className="inline-block w-1 h-1 rounded-full animate-ping mr-1" style={{ backgroundColor: '#2563eb' }} />
                      Pending Auth
                    </span>
                  </div>
                </div>

              </div>

            </div>

            {/* 3. Footer (Barcode, Machine-Readable MRZ Line, Stamp) */}
            <div className="mt-1 border-t pt-1.5 flex items-center justify-between" style={lightBorderStyle}>
              <div className="flex items-center space-x-2">
                <FakeBarcode />
                <span className="font-mono text-[7px]" style={{ color: '#0f172a' }}>
                  *W2E-20-COMMISSION-OK*
                </span>
              </div>
              
              {/* MRZ Zone representing standardized visual scanner formats */}
              <div className="flex-1 mx-2.5">
                <div 
                  className="font-mono text-[6px] tracking-tight leading-none py-1 px-1.5 rounded text-center whitespace-nowrap overflow-hidden"
                  style={mrzStyle}
                >
                  I&lt;W2EPAY&lt;&lt;NGR{formattedId.replace(/\s+/g, '')}&lt;&lt;&lt;&lt;&lt;{amount.toFixed(0)}USDT&lt;&lt;&lt;{profile.email.toUpperCase().replace(/[^A-Z]/g, '').substring(0,6)}&lt;8
                </div>
              </div>

              {/* Platform Seal stamp badge */}
              <div 
                className="rotate-[-8deg] px-1 py-[2px] rounded font-mono text-[5px] font-black uppercase text-center shrink-0"
                style={{
                  backgroundColor: 'rgba(153, 27, 27, 0.1)',
                  border: '1px dashed rgba(153, 27, 27, 0.25)',
                  color: '#991b1b'
                }}
              >
                SLA 20% COMPLIANT
              </div>
            </div>

          </div>
        </div>

        {/* Modal Controls / Share-save-download toolbar */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={downloadScreenshot}
            disabled={downloading}
            className="cursor-pointer flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-mono text-xs font-bold py-3 px-4 rounded-xl shadow-lg transition-transform active:scale-98 disabled:opacity-55"
          >
            {downloading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Minting Image...</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span>Download Screenshot Card</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={copyToClipboard}
            className="cursor-pointer flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-mono text-xs font-bold py-3 px-4 rounded-xl transition-all"
          >
            {copied ? (
              <span className="text-emerald-400">Copied text!</span>
            ) : (
              <>
                <span>Copy Ledger Text</span>
              </>
            )}
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer bg-slate-950 border border-slate-900 text-slate-400 hover:text-white font-mono text-xs font-bold py-3 px-4 rounded-xl transition-all"
            >
              Back to App
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
