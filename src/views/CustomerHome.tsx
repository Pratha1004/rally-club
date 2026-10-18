import React, { useState, useEffect } from 'react';
import { Court, SportType, TimeSlot, AvailabilityResponse } from '../types.ts';
import { CourtCard } from '../components/CourtCard.tsx';
import {
  Calendar,
  Clock,
  Sparkles,
  Zap,
  Shield,
  ArrowRight,
  CheckCircle,
  Activity,
  Flame,
  Award,
  ChevronRight,
  Filter
} from 'lucide-react';
import { api } from '../lib/api.ts';

interface CustomerHomeProps {
  onSelectSlot: (court: Court, date: string, startTime: string, duration: 60 | 90 | 120, isPeak: boolean) => void;
  onOpenBookingTab: () => void;
  onOpenAuth: (view: 'login' | 'register') => void;
}

export const CustomerHome: React.FC<CustomerHomeProps> = ({
  onSelectSlot,
  onOpenBookingTab,
  onOpenAuth
}) => {
  const [sport, setSport] = useState<SportType>('padel');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [duration, setDuration] = useState<60 | 90 | 120>(90);

  const [availability, setAvailability] = useState<AvailabilityResponse | null>(null);
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Quick dates (Today, Tomorrow, Day after)
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const dayAfter = new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];

  useEffect(() => {
    fetchCourts();
  }, []);

  useEffect(() => {
    fetchAvailability();
  }, [sport, selectedDate, duration]);

  const fetchCourts = async () => {
    try {
      const res = await api.courts.list();
      setCourts(res.courts);
    } catch (err) {
      console.error('Failed to load courts', err);
    }
  };

  const fetchAvailability = async () => {
    setLoading(true);
    try {
      const res = await api.availability.get(sport, selectedDate, duration);
      setAvailability(res);
    } catch (err) {
      console.error('Failed to load availability', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourts = courts.filter(c => c.sport === sport);

  const handleSlotClick = (slot: TimeSlot, courtId?: string) => {
    const targetCourt = courtId
      ? courts.find(c => c.id === courtId)
      : courts.find(c => slot.courts.find(sc => sc.courtId === c.id && sc.isAvailable));

    if (targetCourt) {
      onSelectSlot(targetCourt, selectedDate, slot.startTime, duration, slot.isPeak);
    }
  };

  return (
    <div className="space-y-20 pb-20">
      
      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-violet-600/15 via-[#CCFF00]/10 to-transparent blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            
            {/* Kicker */}
            <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-widest text-[#CCFF00] mb-4">
              <span className="w-2 h-2 rounded-full bg-[#CCFF00] animate-pulse" />
              <span>Rally Club · Private Padel & Pickleball Arenas</span>
            </div>

            {/* Editorial Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold font-display text-white tracking-tight leading-[1.05]">
              PRECISION COURTS. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400">
                ELEVATED PLAY.
              </span>
            </h1>

            {/* Description */}
            <p className="mt-6 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
              World Padel Tour-certified Mondo turf, panoramic glass, tournament-spec pickleball cushioning, and private lounge suites. Book your session with verified live slot synchronization.
            </p>

            {/* Quick CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#availability"
                className="py-3.5 px-6 bg-[#CCFF00] hover:bg-[#b6e600] text-black font-bold text-sm rounded-xl transition-all shadow-[0_0_25px_rgba(204,255,0,0.3)] hover:shadow-[0_0_35px_rgba(204,255,0,0.5)] flex items-center gap-2 cursor-pointer"
              >
                <span>Reserve Court Now</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <button
                onClick={() => onOpenAuth('register')}
                className="py-3.5 px-6 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-slate-500 font-semibold text-sm rounded-xl transition-all cursor-pointer"
              >
                Join As Member
              </button>
            </div>

            {/* Club Credentials (Zero-pill discipline: unboxed text with separators) */}
            <div className="mt-12 flex flex-wrap items-center gap-3 text-xs text-slate-400 border-t border-slate-800/80 pt-6">
              <span className="text-white font-medium">3 Panoramic Padel Arenas</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-white font-medium">3 Pro Pickleball Courts</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-white font-medium">07:00 – 23:00 Daily</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-[#CCFF00] font-medium font-mono">Zero Double-Booking Guarantee</span>
            </div>

          </div>
        </div>
      </section>

      {/* REAL-TIME AVAILABILITY MATRIX */}
      <section id="availability" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0D121B] border border-slate-800/90 shadow-2xl relative">
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800/80">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#CCFF00] font-semibold mb-1">
                <Activity className="w-3.5 h-3.5" />
                <span>Live Availability Feed</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">
                Book by Time & Duration
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Select your preferred sport, date, and 60 / 90 / 120-minute match session.
              </p>
            </div>

            {/* Interactive Filters: Sport, Date, Duration */}
            <div className="flex flex-wrap items-center gap-3">
              
              {/* Sport Segmented Selector */}
              <div className="p-1 rounded-xl bg-slate-900 border border-slate-800 flex items-center">
                <button
                  type="button"
                  onClick={() => setSport('padel')}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                    sport === 'padel'
                      ? 'bg-[#CCFF00] text-black shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Padel Courts
                </button>
                <button
                  type="button"
                  onClick={() => setSport('pickleball')}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                    sport === 'pickleball'
                      ? 'bg-[#CCFF00] text-black shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Pickleball Courts
                </button>
              </div>

              {/* Duration Selector */}
              <div className="p-1 rounded-xl bg-slate-900 border border-slate-800 flex items-center">
                <button
                  type="button"
                  onClick={() => setDuration(60)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    duration === 60 ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  60m
                </button>
                <button
                  type="button"
                  onClick={() => setDuration(90)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    duration === 90 ? 'bg-slate-700 text-white font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  90m
                </button>
                <button
                  type="button"
                  onClick={() => setDuration(120)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    duration === 120 ? 'bg-slate-700 text-white font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  120m
                </button>
              </div>

            </div>
          </div>

          {/* Date Selector Row */}
          <div className="flex flex-wrap items-center gap-2 pt-6 pb-6">
            <button
              onClick={() => setSelectedDate(today)}
              className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all ${
                selectedDate === today
                  ? 'bg-white text-black font-semibold border-white'
                  : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setSelectedDate(tomorrow)}
              className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all ${
                selectedDate === tomorrow
                  ? 'bg-white text-black font-semibold border-white'
                  : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              Tomorrow
            </button>
            <button
              onClick={() => setSelectedDate(dayAfter)}
              className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all ${
                selectedDate === dayAfter
                  ? 'bg-white text-black font-semibold border-white'
                  : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              {new Date(dayAfter).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </button>
            <div className="relative">
              <input
                type="date"
                value={selectedDate}
                min={today}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:border-[#CCFF00] outline-none"
              />
            </div>
            <span className="text-xs text-slate-500 ml-auto hidden sm:inline">
              Peak hours: 17:00 - 22:00
            </span>
          </div>

          {/* Time Slots Grid */}
          {loading ? (
            <div className="py-16 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-[#CCFF00] border-t-transparent rounded-full animate-spin" />
              <span>Calculating real-time arena availability...</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {availability?.slots.map((slot) => {
                const hasAvailability = slot.availableCourtsCount > 0;
                return (
                  <div
                    key={slot.startTime}
                    className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                      hasAvailability
                        ? 'bg-slate-900/90 border-slate-800 hover:border-[#CCFF00] group cursor-pointer'
                        : 'bg-slate-950/50 border-slate-900 opacity-40 cursor-not-allowed'
                    }`}
                    onClick={() => hasAvailability && handleSlotClick(slot)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-white group-hover:text-[#CCFF00]">
                        {slot.startTime}
                      </span>
                      {slot.isPeak && (
                        <span className="text-[10px] text-amber-400 font-mono">PEAK</span>
                      )}
                    </div>

                    <div className="mt-2 text-[11px]">
                      {hasAvailability ? (
                        <span className="text-[#CCFF00] font-medium">
                          {slot.availableCourtsCount} {slot.availableCourtsCount === 1 ? 'court' : 'courts'} open
                        </span>
                      ) : (
                        <span className="text-slate-500">Fully Booked</span>
                      )}
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                      <span>{duration}m session</span>
                      {hasAvailability && (
                        <span className="text-slate-300 group-hover:text-white font-semibold">
                          Select →
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </section>

      {/* COURT SPECIFICATIONS SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-xs font-mono uppercase text-[#CCFF00] font-semibold mb-1">
              THE CLUB FACILITY
            </div>
            <h2 className="text-3xl font-bold font-display text-white">
              Signature Arenas & Specifications
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Each court features architectural acoustic buffering, tournament-grade bounce metrics, and integrated HD camera replay stations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSport('padel')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                sport === 'padel'
                  ? 'bg-[#CCFF00] text-black border-[#CCFF00]'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              Padel Arenas (3)
            </button>
            <button
              onClick={() => setSport('pickleball')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                sport === 'pickleball'
                  ? 'bg-[#CCFF00] text-black border-[#CCFF00]'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              Pickleball Courts (3)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourts.map((court) => (
            <CourtCard
              key={court.id}
              court={court}
              onSelectCourt={(c) => {
                onSelectSlot(c, selectedDate, '18:00', duration, true);
              }}
            />
          ))}
        </div>
      </section>

      {/* CLUB AMENITIES & EXPERIENCE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-b from-[#111622] to-[#0A0E15] border border-slate-800 p-8 sm:p-12">
          <div className="max-w-2xl mb-10">
            <span className="text-xs font-mono uppercase text-[#CCFF00] font-semibold">
              BEYOND THE NET
            </span>
            <h2 className="text-3xl font-bold font-display text-white mt-1">
              The Luxury Athletic Experience
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Designed for competitive athletes and social clubs who demand world-class standards before, during, and after play.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
              <div className="w-10 h-10 rounded-xl bg-violet-950/60 border border-violet-800/60 flex items-center justify-center text-violet-300 mb-4">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-1">Eucalyptus Locker Suites</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Rainfall showers, sauna suites, cold plunge recovery tubs, and Malin+Goetz grooming essentials.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
              <div className="w-10 h-10 rounded-xl bg-[#CCFF00]/10 border border-[#CCFF00]/30 flex items-center justify-center text-[#CCFF00] mb-4">
                <Zap className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-1">Instant Replay & Streaming</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every court is outfitted with high-speed 4K cameras. Download your match rallies with one tap after match finish.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
              <div className="w-10 h-10 rounded-xl bg-amber-950/60 border border-amber-800/60 flex items-center justify-center text-amber-300 mb-4">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-1">Pro Equipment Vault</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Demo racquets from Babolat, Bullpadel, Wilson, and Franklin. Fresh pressurized tubes provided on request.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
              <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-300 mb-4">
                <Shield className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-1">Courtside Lounge Bar</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Specialty cold-pressed juices, artisanal espresso, electrolyte draft taps, and post-match craft social seating.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
