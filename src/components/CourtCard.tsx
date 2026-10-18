import React from 'react';
import { Court } from '../types.ts';
import { Check, Sparkles, Shield, ArrowUpRight } from 'lucide-react';

interface CourtCardProps {
  court: Court;
  onSelectCourt: (court: Court) => void;
}

export const CourtCard: React.FC<CourtCardProps> = ({ court, onSelectCourt }) => {
  return (
    <div className="group rounded-2xl bg-[#0D121B] border border-slate-800/80 hover:border-violet-500/50 transition-all duration-300 flex flex-col overflow-hidden hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
      {/* Immersive Court Image */}
      <div className="relative h-56 sm:h-64 overflow-hidden bg-slate-900">
        <img
          src={court.image}
          alt={court.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D121B] via-transparent to-black/30" />
        
        {/* Top Badges / Sport Spec */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-xs font-mono">
          <span className="bg-black/75 backdrop-blur-md text-[#CCFF00] font-semibold px-2.5 py-1 rounded border border-white/10 uppercase tracking-wider">
            {court.sport} · {court.type}
          </span>
          <span className="bg-black/75 backdrop-blur-md text-white font-mono px-2.5 py-1 rounded border border-white/10">
            ${court.hourlyRate}/hr
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Unboxed Metadata (Zero-pill discipline) */}
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
            <span>{court.type} Arena</span>
            <span aria-hidden="true">·</span>
            <span>{court.surface.split('(')[0].trim()}</span>
          </div>

          <h3 className="text-xl font-bold text-white font-display tracking-tight group-hover:text-[#CCFF00] transition-colors">
            {court.name}
          </h3>

          <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
            {court.description}
          </p>
        </div>

        {/* Feature bullets */}
        <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
          {court.features.slice(0, 3).map((feat, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00]" />
              <span>{feat}</span>
            </div>
          ))}
        </div>

        {/* Pricing & Booking Action */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-4">
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Standard / Peak</div>
            <div className="text-sm font-mono font-bold text-white">
              ${court.hourlyRate} <span className="text-xs text-slate-500 font-normal">/</span> ${court.peakHourlyRate}
              <span className="text-[11px] text-slate-400 font-normal"> hr</span>
            </div>
          </div>

          <button
            onClick={() => onSelectCourt(court)}
            className="py-2.5 px-4 bg-slate-800 hover:bg-[#CCFF00] text-slate-200 hover:text-black font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5 group/btn"
          >
            <span>Book Slot</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
