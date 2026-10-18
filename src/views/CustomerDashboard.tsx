import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Booking } from '../types.ts';
import {
  Calendar,
  Clock,
  MapPin,
  Share2,
  CalendarDays,
  XCircle,
  RefreshCw,
  MessageCircle,
  ChevronRight,
  ShieldCheck,
  CreditCard,
  User,
  Plus
} from 'lucide-react';
import { api } from '../lib/api.ts';
import { RescheduleModal } from '../components/RescheduleModal.tsx';

interface CustomerDashboardProps {
  onNewBookingClick: () => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ onNewBookingClick }) => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');

  const [rescheduleTarget, setRescheduleTarget] = useState<Booking | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.bookings.list();
      setBookings(res.bookings);
    } catch (err: any) {
      console.error('Failed to load customer bookings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this court reservation?')) return;
    setActionError(null);
    try {
      const res = await api.bookings.cancel(bookingId);
      setActionSuccess(res.message);
      fetchBookings();
    } catch (err: any) {
      setActionError(err.message || 'Failed to cancel booking.');
    }
  };

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const upcomingBookings = bookings.filter(b => {
    if (b.status === 'Cancelled') return false;
    return b.date >= todayStr;
  });

  const pastBookings = bookings.filter(b => {
    return b.date < todayStr || b.status === 'Cancelled';
  });

  const displayedList = tab === 'upcoming' ? upcomingBookings : pastBookings;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Top Banner / Member Status */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#111723] via-[#0E131C] to-[#0A0D14] border border-slate-800 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
            alt={user?.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-[#CCFF00]"
          />
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#CCFF00] font-semibold">
              <span>{user?.membershipTier || 'Member'}</span>
              <span aria-hidden="true">·</span>
              <span>CUSTOMER PORTAL</span>
            </div>
            <h1 className="text-2xl font-bold font-display text-white mt-0.5">
              Welcome Back, {user?.name}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {user?.email} · {upcomingBookings.length} upcoming match reservations
            </p>
          </div>
        </div>

        <button
          onClick={onNewBookingClick}
          className="py-3 px-5 bg-[#CCFF00] hover:bg-[#b6e600] text-black font-bold text-xs rounded-xl transition-all shadow-[0_0_20px_rgba(204,255,0,0.25)] flex items-center justify-center gap-2 self-start md:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Book New Session</span>
        </button>
      </div>

      {/* Notifications */}
      {actionSuccess && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-xs">
          {actionSuccess}
        </div>
      )}
      {actionError && (
        <div className="mb-6 p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs">
          {actionError}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setTab('upcoming')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              tab === 'upcoming'
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Upcoming Reservations ({upcomingBookings.length})
          </button>
          <button
            onClick={() => setTab('past')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              tab === 'past'
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Past & Cancelled ({pastBookings.length})
          </button>
        </div>

        <button
          onClick={fetchBookings}
          className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-xs">
          Loading your court sessions...
        </div>
      ) : displayedList.length === 0 ? (
        <div className="py-20 text-center rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 p-8">
          <CalendarDays className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">
            {tab === 'upcoming' ? 'No Upcoming Reservations' : 'No Past Reservations'}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-5">
            {tab === 'upcoming'
              ? 'Select an open slot across our 3 Padel arenas or 3 Pickleball courts to reserve your match time.'
              : 'Completed and cancelled match sessions will appear here.'}
          </p>
          {tab === 'upcoming' && (
            <button
              onClick={onNewBookingClick}
              className="py-2.5 px-4 bg-[#CCFF00] text-black font-semibold text-xs rounded-xl hover:bg-[#b6e600]"
            >
              Check Court Availability
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {displayedList.map((booking) => {
            const isCancelled = booking.status === 'Cancelled';
            const whatsappText = encodeURIComponent(
              `🎾 Rally Club Reservation Ref ${booking.id}\nCourt: ${booking.courtName}\nDate: ${booking.date} at ${booking.startTime}`
            );
            const waUrl = `https://wa.me/?text=${whatsappText}`;

            return (
              <div
                key={booking.id}
                className={`p-5 rounded-2xl bg-[#0D121B] border transition-all ${
                  isCancelled
                    ? 'border-slate-800/50 opacity-60'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  
                  {/* Left Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="font-bold text-white">{booking.id}</span>
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      <span className="text-[#CCFF00] uppercase font-semibold">
                        {booking.sport}
                      </span>
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      <span className="text-slate-400">{booking.status}</span>
                      {booking.rescheduledFrom && (
                        <span className="text-[10px] text-amber-400">
                          (Rescheduled from {booking.rescheduledFrom})
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold font-display text-white">
                      {booking.courtName}
                    </h3>

                    {/* Meta Specs */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {booking.date}
                      </span>
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        {booking.startTime} – {booking.endTime} ({booking.durationMinutes} mins)
                      </span>
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      <span>{booking.playersCount} Players</span>
                      {booking.racketRentalCount > 0 && (
                        <>
                          <span aria-hidden="true" className="text-slate-600">·</span>
                          <span>{booking.racketRentalCount} Rackets</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Right Actions & Payment */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:pl-6 lg:border-l lg:border-slate-800">
                    <div className="text-left sm:text-right">
                      <div className="text-base font-bold font-mono text-white">
                        ${booking.totalAmount.toFixed(2)}
                      </div>
                      <div className="text-[11px] font-medium mt-0.5">
                        <span
                          className={
                            booking.paymentStatus === 'Paid'
                              ? 'text-emerald-400'
                              : booking.paymentStatus === 'Refunded'
                              ? 'text-slate-400'
                              : 'text-amber-400'
                          }
                        >
                          {booking.paymentStatus} ({booking.paymentMethod})
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        Txn: {booking.transactionReference}
                      </div>
                    </div>

                    {/* Operational Buttons */}
                    {!isCancelled && tab === 'upcoming' && (
                      <div className="flex items-center gap-2">
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 bg-slate-800/80 hover:bg-emerald-950/60 text-slate-300 hover:text-emerald-400 border border-slate-700 rounded-xl transition-colors"
                          title="Share with players via WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>

                        <button
                          onClick={() => setRescheduleTarget(booking)}
                          className="px-3 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium transition-colors"
                        >
                          Reschedule
                        </button>

                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="px-3 py-2 bg-rose-950/30 hover:bg-rose-900/50 text-rose-300 border border-rose-900/60 rounded-xl text-xs font-medium transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleTarget && (
        <RescheduleModal
          booking={rescheduleTarget}
          onClose={() => setRescheduleTarget(null)}
          onSuccess={(updated) => {
            setActionSuccess(`Booking ${updated.id} successfully rescheduled to ${updated.date} at ${updated.startTime}`);
            fetchBookings();
          }}
        />
      )}

    </div>
  );
};
