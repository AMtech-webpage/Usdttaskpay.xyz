import React from 'react';
import { AdCampaign } from '../../lib/supabase';
import { Play, Loader2 } from 'lucide-react';

interface OffersViewProps {
  campaigns: AdCampaign[];
  isLoading: boolean;
  onWatchAd: (campaign: AdCampaign) => void;
}

export const OffersView: React.FC<OffersViewProps> = ({
  campaigns,
  isLoading,
  onWatchAd,
}) => {
  return (
    <div className="space-y-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <Play className="h-5 w-5 text-cyan-400" />
          <h2 className="font-display text-lg sm:text-xl font-bold text-white">Watch-to-Earn (Ad Streams)</h2>
        </div>
        <span className="rounded-full bg-cyan-950/50 border border-cyan-500/20 px-2.5 py-1 text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest leading-none w-fit">
          Available Streams
        </span>
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/10">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
        </div>
      ) : campaigns.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 p-8 text-center text-slate-500 text-sm bg-slate-950/20">
          No active ad campaigns available at this hour. Check back shortly.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {campaigns.map((camp) => (
            <div 
              key={camp.id} 
              className="group overflow-hidden rounded-xl border border-white/5 bg-slate-950/60 hover:scale-[1.01] transition-all duration-300 shadow-lg hover:shadow-cyan-500/[0.02]"
            >
              {/* Image Thumbnail wrapper */}
              <div className="relative h-40 overflow-hidden bg-slate-900">
                <img 
                  src={camp.thumbnail} 
                  alt={camp.title}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                
                <span className="absolute bottom-3 left-3 rounded bg-slate-900/90 border border-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-cyan-400">
                  {camp.video_category}
                </span>

                <span className="absolute bottom-3 right-3 rounded bg-slate-950/90 border border-slate-800/80 px-1.5 py-0.5 text-[10px] font-mono text-slate-300">
                  {camp.duration} seconds
                </span>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="line-clamp-2 text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {camp.title}
                </h3>
                <p className="mt-1 text-xs text-slate-500 font-mono">By: {camp.advertiser}</p>

                {/* Split values */}
                <div className="mt-4 flex items-center justify-between border-t border-slate-900 pt-3">
                  <div className="flex flex-col text-slate-400">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Your Clean Yield (80%)</span>
                    <span className="font-display text-sm font-black text-emerald-400">+{camp.user_share.toFixed(4)} USDT</span>
                  </div>

                  <button
                    onClick={() => onWatchAd(camp)}
                    className="cursor-pointer flex items-center space-x-1.5 rounded-lg bg-gradient-to-r from-electric-blue to-cyan-500 px-3.5 py-2 text-xs font-bold text-white hover:brightness-110 transition-all shadow-md shadow-electric-blue/10"
                  >
                    <Play className="h-3 w-3 shrink-0" />
                    <span>Watch Ad</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
