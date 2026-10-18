import React from 'react';
import { Shield, Sparkles, MapPin, Phone, Clock, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#070A0F] border-t border-slate-800/80 text-slate-400 text-xs py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Brand */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold text-base tracking-tight text-white">
                RALLY CLUB
              </span>
              <span className="font-mono text-[10px] text-[#CCFF00] font-bold">
                PRO
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              Private Padel and Pickleball arenas with World Padel Tour-certified Mondo turf, panoramic tempered glass, and luxury locker suites.
            </p>
            <div className="text-[11px] text-slate-500 font-mono">
              EST. 2026 · PRIVATE SPORTS CLUB
            </div>
          </div>

          {/* Location & Hours */}
          <div className="space-y-2">
            <div className="text-white font-semibold font-mono uppercase text-[11px] tracking-wider mb-2">
              Arena Sanctuary
            </div>
            <div className="flex items-start gap-2 text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-[#CCFF00] flex-shrink-0 mt-0.5" />
              <span>450 Grand Pavilion Way, Sports District, Suite 100</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Clock className="w-3.5 h-3.5 text-[#CCFF00] flex-shrink-0" />
              <span>Open 07:00 – 23:00 Daily</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Phone className="w-3.5 h-3.5 text-[#CCFF00] flex-shrink-0" />
              <span>+1 (555) 725-5928</span>
            </div>
          </div>

          {/* Court Arenas */}
          <div className="space-y-2">
            <div className="text-white font-semibold font-mono uppercase text-[11px] tracking-wider mb-2">
              Arenas & Surfaces
            </div>
            <div className="space-y-1">
              <div>Court 1 · Grand Panoramic Padel (Indoor)</div>
              <div>Court 2 · Obsidian Arena Padel (Indoor)</div>
              <div>Court 3 · The Terrace Padel (Covered)</div>
              <div>Court 4 · Center Court Pickleball (DecoTurf)</div>
              <div>Court 5 · Skyline Rooftop Pickleball</div>
              <div>Court 6 · The Academy Coaching Court</div>
            </div>
          </div>

          {/* System & Roles */}
          <div className="space-y-2">
            <div className="text-white font-semibold font-mono uppercase text-[11px] tracking-wider mb-2">
              Role-Based Access
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              Equipped with real persistent authentication, server-side collision prevention, front desk check-in, and administrative financial analytics.
            </p>
            <div className="pt-2 text-[11px] text-[#CCFF00] font-mono">
              Demo logins available in header bar
            </div>
          </div>

        </div>

        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px]">
          <div>
            © 2026 Rally Club Private Arenas. All rights reserved.
          </div>
          <div className="flex items-center gap-3">
            <span>Server Double-Booking Guard: Active</span>
            <span aria-hidden="true">·</span>
            <span>Razorpay Gateway: Ready</span>
            <span aria-hidden="true">·</span>
            <span>WhatsApp Sync: Enabled</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
