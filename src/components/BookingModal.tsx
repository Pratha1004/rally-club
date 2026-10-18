import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Court, ClubSettings, Booking } from '../types.ts';
import {
  X,
  Clock,
  Calendar,
  Users,
  ShieldCheck,
  CreditCard,
  Building,
  Check,
  Loader2,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { api } from '../lib/api.ts';

interface BookingModalProps {
  court: Court;
  date: string;
  startTime: string;
  durationMinutes: 60 | 90 | 120;
  isPeak: boolean;
  settings: ClubSettings;
  onClose: () => void;
  onSuccess: (booking: Booking) => void;
  onRequireAuth: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  court,
  date,
  startTime,
  durationMinutes,
  isPeak,
  settings,
  onClose,
  onSuccess,
  onRequireAuth
}) => {
  const { user } = useAuth();

  const [playersCount, setPlayersCount] = useState<number>(4);
  const [racketRentals, setRacketRentals] = useState<number>(0);
  const [ballTubes, setBallTubes] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'Razorpay' | 'Card' | 'Cash at Front Desk'>('Razorpay');

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Compute end time
  const [h, m] = startTime.split(':').map(Number);
  const totalEndMin = h * 60 + m + durationMinutes;
  const endHours = Math.floor(totalEndMin / 60);
  const endMinutes = totalEndMin % 60;
  const endTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;

  // Pricing calculations
  const hourlyRate = isPeak ? court.peakHourlyRate : court.hourlyRate;
  const baseCourtPrice = hourlyRate * (durationMinutes / 60);
  const peakSurcharge = isPeak ? (court.peakHourlyRate - court.hourlyRate) * (durationMinutes / 60) : 0;
  const equipmentTotal = (racketRentals * settings.racketRentalPrice) + (ballTubes * settings.ballTubePrice);
  const grandTotal = baseCourtPrice + equipmentTotal;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onRequireAuth();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.bookings.create({
        courtId: court.id,
        date,
        startTime,
        durationMinutes,
        playersCount,
        racketRentalCount: racketRentals,
        ballTubeCount: ballTubes,
        notes,
        paymentMethod
      });

      onSuccess(res.booking);
    } catch (err: any) {
      setError(err.message || 'Booking conflict or server error. Please try another slot.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#0F141F] border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-7 text-slate-100 my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          aria-label="Close booking modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#CCFF00] font-semibold mb-1">
            <span>{court.sport.toUpperCase()} COURT RESERVATION</span>
            <span aria-hidden="true">·</span>
            <span>REAL-TIME CONFIRMATION</span>
          </div>
          <h2 className="text-2xl font-bold font-display text-white">
            {court.name}
          </h2>
          <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-[#CCFF00]" />
              {date}
            </span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-[#CCFF00]" />
              {startTime} – {endTime} ({durationMinutes} mins)
            </span>
            {isPeak && (
              <>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="text-amber-400 font-semibold">Peak Hours</span>
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-200 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-rose-300">Booking Reservation Error</div>
              <div className="mt-0.5 text-rose-200/90">{error}</div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Players & Equipment Section */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
              Match Setup & Add-ons
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Players Count */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Players
                </label>
                <select
                  value={playersCount}
                  onChange={(e) => setPlayersCount(Number(e.target.value))}
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-[#CCFF00] outline-none"
                >
                  <option value={2}>2 Players (Singles)</option>
                  <option value={3}>3 Players</option>
                  <option value={4}>4 Players (Doubles)</option>
                </select>
              </div>

              {/* Rackets */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Pro Rackets (+${settings.racketRentalPrice}/ea)
                </label>
                <select
                  value={racketRentals}
                  onChange={(e) => setRacketRentals(Number(e.target.value))}
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-[#CCFF00] outline-none"
                >
                  <option value={0}>None (Bring own)</option>
                  <option value={1}>1 Racket</option>
                  <option value={2}>2 Rackets</option>
                  <option value={4}>4 Rackets</option>
                </select>
              </div>

              {/* Ball Tubes */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Fresh Can Balls (+${settings.ballTubePrice}/can)
                </label>
                <select
                  value={ballTubes}
                  onChange={(e) => setBallTubes(Number(e.target.value))}
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-[#CCFF00] outline-none"
                >
                  <option value={0}>None</option>
                  <option value={1}>1 Can (3 New Balls)</option>
                  <option value={2}>2 Cans</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Special Requests or Locker Requirements (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Left-handed paddles, coaching ball bucket, birthday session"
                className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-[#CCFF00] outline-none"
              />
            </div>
          </div>

          {/* Payment Method Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono mb-2">
              Payment Method
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setPaymentMethod('Razorpay')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  paymentMethod === 'Razorpay'
                    ? 'border-[#CCFF00] bg-[#CCFF00]/10 text-white'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-xs text-white">Razorpay / UPI</span>
                  {paymentMethod === 'Razorpay' && <Check className="w-3.5 h-3.5 text-[#CCFF00]" />}
                </div>
                <div className="text-[10px] text-slate-400">Instant online booking guarantee</div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('Card')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  paymentMethod === 'Card'
                    ? 'border-[#CCFF00] bg-[#CCFF00]/10 text-white'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-xs text-white">Credit Card</span>
                  {paymentMethod === 'Card' && <Check className="w-3.5 h-3.5 text-[#CCFF00]" />}
                </div>
                <div className="text-[10px] text-slate-400">Visa, Mastercard, Amex</div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('Cash at Front Desk')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  paymentMethod === 'Cash at Front Desk'
                    ? 'border-[#CCFF00] bg-[#CCFF00]/10 text-white'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-xs text-white">Pay at Venue</span>
                  {paymentMethod === 'Cash at Front Desk' && <Check className="w-3.5 h-3.5 text-[#CCFF00]" />}
                </div>
                <div className="text-[10px] text-slate-400">Front desk payment upon arrival</div>
              </button>
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1.5">
            <div className="flex justify-between text-slate-400">
              <span>Court Rate ({durationMinutes} mins @ ${court.hourlyRate}/hr)</span>
              <span>${(court.hourlyRate * (durationMinutes / 60)).toFixed(2)}</span>
            </div>
            {isPeak && (
              <div className="flex justify-between text-amber-400 font-medium">
                <span>Peak Hour Adjustment</span>
                <span>+${peakSurcharge.toFixed(2)}</span>
              </div>
            )}
            {equipmentTotal > 0 && (
              <div className="flex justify-between text-slate-400">
                <span>Equipment Rentals ({racketRentals} racquets, {ballTubes} cans)</span>
                <span>+${equipmentTotal.toFixed(2)}</span>
              </div>
            )}
            <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-sm font-bold text-white">
              <span>Total Session Investment</span>
              <span className="text-[#CCFF00] font-mono text-base">${grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Auth Check Notice */}
          {!user && (
            <div className="p-3 bg-violet-950/40 border border-violet-900/80 rounded-xl text-xs text-violet-200 flex items-center justify-between">
              <span>Please sign in or use demo account to confirm this reservation.</span>
              <button
                type="button"
                onClick={onRequireAuth}
                className="px-3 py-1 bg-[#CCFF00] text-black font-semibold rounded text-xs"
              >
                Sign In
              </button>
            </div>
          )}

          {/* Action Button */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || !user}
              className="flex-[2] py-3 px-4 bg-[#CCFF00] hover:bg-[#b6e600] text-black rounded-lg text-xs font-bold transition-all shadow-[0_0_20px_rgba(204,255,0,0.25)] flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Availability & Reserving...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>
                    Confirm {paymentMethod === 'Cash at Front Desk' ? 'Reservation (Pay at Venue)' : `& Pay $${grandTotal.toFixed(2)}`}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
