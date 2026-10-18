import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Booking, Court, CourtBlock } from '../types.ts';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Phone,
  MessageCircle,
  Filter,
  DollarSign,
  UserCheck,
  Search,
  Shield,
  Layers,
  Sparkles
} from 'lucide-react';
import { api } from '../lib/api.ts';
import { RescheduleModal } from '../components/RescheduleModal.tsx';

export const StaffDashboard: React.FC = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [blocks, setBlocks] = useState<CourtBlock[]>([]);
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [sportFilter, setSportFilter] = useState<'all' | 'padel' | 'pickleball'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & action states
  const [rescheduleTarget, setRescheduleTarget] = useState<Booking | null>(null);
  const [showBlockModal, setShowBlockModal] = useState<boolean>(false);
  const [blockCourtId, setBlockCourtId] = useState<string>('');
  const [blockStartTime, setBlockStartTime] = useState<string>('08:00');
  const [blockEndTime, setBlockEndTime] = useState<string>('10:00');
  const [blockReason, setBlockReason] = useState<'Maintenance' | 'Club Tournament' | 'Pro Coaching Clinic' | 'Staff Reserved'>('Maintenance');
  const [blockNotes, setBlockNotes] = useState<string>('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchCourts();
  }, []);

  useEffect(() => {
    fetchDailyOperations();
  }, [selectedDate]);

  const fetchCourts = async () => {
    try {
      const res = await api.courts.list();
      setCourts(res.courts);
      if (res.courts.length > 0 && !blockCourtId) {
        setBlockCourtId(res.courts[0].id);
      }
    } catch (err) {
      console.error('Failed to load courts', err);
    }
  };

  const fetchDailyOperations = async () => {
    setLoading(true);
    try {
      const [bookingsRes, blocksRes] = await Promise.all([
        api.bookings.list({ date: selectedDate }),
        api.courtBlocks.list(selectedDate)
      ]);
      setBookings(bookingsRes.bookings);
      setBlocks(blocksRes.blocks);
    } catch (err: any) {
      console.error('Failed to load daily schedule', err);
    } finally {
      setLoading(false);
    }
  };

  // Staff Action: Check in player
  const handleCheckIn = async (bookingId: string) => {
    try {
      const res = await api.bookings.checkIn(bookingId);
      setFeedback({ type: 'success', message: res.message });
      fetchDailyOperations();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Check-in failed' });
    }
  };

  // Staff Action: Collect payment / Mark Paid
  const handleMarkPaid = async (bookingId: string) => {
    try {
      const res = await api.bookings.updatePayment(bookingId, 'Paid', 'Cash at Front Desk');
      setFeedback({ type: 'success', message: 'Payment recorded: Marked as Paid' });
      fetchDailyOperations();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Payment update failed' });
    }
  };

  // Staff Action: Cancel booking
  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Cancel this customer booking? This slot will immediately become available for other players.')) return;
    try {
      const res = await api.bookings.cancel(bookingId);
      setFeedback({ type: 'success', message: res.message });
      fetchDailyOperations();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Cancellation failed' });
    }
  };

  // Staff Action: Add court block
  const handleCreateBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.courtBlocks.create({
        courtId: blockCourtId,
        date: selectedDate,
        startTime: blockStartTime,
        endTime: blockEndTime,
        reason: blockReason,
        notes: blockNotes
      });
      setShowBlockModal(false);
      setBlockNotes('');
      setFeedback({ type: 'success', message: 'Court block reserved on the schedule.' });
      fetchDailyOperations();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to block court.' });
    }
  };

  // Staff Action: Remove court block
  const handleRemoveBlock = async (blockId: string) => {
    try {
      await api.courtBlocks.remove(blockId);
      setFeedback({ type: 'success', message: 'Court block released.' });
      fetchDailyOperations();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to remove block.' });
    }
  };

  // Filtering
  const filteredBookings = bookings.filter(b => {
    if (sportFilter !== 'all' && b.sport !== sportFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchName = b.userName.toLowerCase().includes(query);
      const matchCourt = b.courtName.toLowerCase().includes(query);
      const matchId = b.id.toLowerCase().includes(query);
      return matchName || matchCourt || matchId;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header & Date Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase text-violet-400 font-semibold mb-1">
            <Shield className="w-3.5 h-3.5" />
            <span>STAFF OPERATIONS & FRONT DESK CONSOLE</span>
          </div>
          <h1 className="text-3xl font-bold font-display text-white">
            Daily Court Command
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Logged in as {user?.name} (Staff). Check in players, verify payments, and manage court blocks.
          </p>
        </div>

        {/* Date Selector & Action buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2">
            <Calendar className="w-4 h-4 text-violet-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs text-white outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={() => setShowBlockModal(true)}
            className="py-2.5 px-4 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(139,92,246,0.25)]"
          >
            <Plus className="w-4 h-4" />
            <span>Block Court Slot</span>
          </button>
        </div>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between ${
            feedback.type === 'success'
              ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-200'
              : 'bg-rose-950/60 border border-rose-800 text-rose-200'
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#0D121B] border border-slate-800">
          <div className="text-[11px] text-slate-400 font-mono uppercase">Total Sessions Today</div>
          <div className="text-2xl font-bold font-display text-white mt-1">
            {bookings.filter(b => b.status !== 'Cancelled').length}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0D121B] border border-slate-800">
          <div className="text-[11px] text-slate-400 font-mono uppercase">Checked In Players</div>
          <div className="text-2xl font-bold font-display text-emerald-400 mt-1">
            {bookings.filter(b => b.status === 'Checked-In').length}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0D121B] border border-slate-800">
          <div className="text-[11px] text-slate-400 font-mono uppercase">Pay at Venue Pending</div>
          <div className="text-2xl font-bold font-display text-amber-400 mt-1">
            {bookings.filter(b => b.paymentStatus === 'Pay at Venue' && b.status !== 'Cancelled').length}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0D121B] border border-slate-800">
          <div className="text-[11px] text-slate-400 font-mono uppercase">Active Court Blocks</div>
          <div className="text-2xl font-bold font-display text-violet-400 mt-1">
            {blocks.length}
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#0D121B] border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by player, booking ID, or court..."
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-violet-500"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setSportFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
              sportFilter === 'all' ? 'bg-white text-black font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Sports
          </button>
          <button
            onClick={() => setSportFilter('padel')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
              sportFilter === 'padel' ? 'bg-[#CCFF00] text-black font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Padel
          </button>
          <button
            onClick={() => setSportFilter('pickleball')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
              sportFilter === 'pickleball' ? 'bg-[#CCFF00] text-black font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Pickleball
          </button>
        </div>
      </div>

      {/* Active Court Blocks Section */}
      {blocks.length > 0 && (
        <div className="space-y-3">
          <div className="text-xs font-mono uppercase text-violet-400 font-semibold flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            <span>Active Operational Blocks for {selectedDate}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {blocks.map((blk) => {
              const court = courts.find(c => c.id === blk.courtId);
              return (
                <div
                  key={blk.id}
                  className="p-4 rounded-xl bg-violet-950/20 border border-violet-900/60 flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-white">
                      {court ? court.name : blk.courtId}
                    </div>
                    <div className="text-xs text-violet-300 font-mono mt-0.5">
                      {blk.startTime} – {blk.endTime} · {blk.reason}
                    </div>
                    {blk.notes && (
                      <div className="text-[11px] text-slate-400 mt-1 italic">
                        "{blk.notes}"
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleRemoveBlock(blk.id)}
                    className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800"
                    title="Release Block"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Daily Reservations Master List */}
      <div className="space-y-3">
        <div className="text-xs font-mono uppercase text-slate-400 font-semibold flex items-center justify-between">
          <span>SCHEDULED SESSIONS ({filteredBookings.length})</span>
          <span className="text-slate-500">Sorted chronologically</span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            Loading scheduled sessions...
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="py-16 text-center rounded-2xl bg-slate-900/30 border border-slate-800 text-xs text-slate-400">
            No bookings recorded for {selectedDate}.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBookings.map((b) => {
              const isCheckedIn = b.status === 'Checked-In';
              const isCancelled = b.status === 'Cancelled';
              const isPendingPayment = b.paymentStatus === 'Pay at Venue' || b.paymentStatus === 'Pending';
              const waLink = `https://wa.me/${b.userPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${b.userName}, this is Marcus from Rally Club Front Desk regarding your reservation today on ${b.courtName}.`)}`;

              return (
                <div
                  key={b.id}
                  className={`p-4 sm:p-5 rounded-2xl bg-[#0D121B] border transition-all ${
                    isCancelled
                      ? 'border-slate-800/40 opacity-50'
                      : isCheckedIn
                      ? 'border-emerald-800/60 bg-emerald-950/10'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    
                    {/* Time & Court Info */}
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                        <span className="font-bold text-[#CCFF00] bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          {b.startTime} - {b.endTime}
                        </span>
                        <span className="text-slate-400 font-bold">{b.id}</span>
                        <span aria-hidden="true" className="text-slate-600">·</span>
                        <span className="uppercase text-slate-300 font-semibold">{b.sport}</span>
                        <span aria-hidden="true" className="text-slate-600">·</span>
                        <span
                          className={`font-semibold ${
                            isCheckedIn
                              ? 'text-emerald-400'
                              : isCancelled
                              ? 'text-rose-400'
                              : 'text-slate-300'
                          }`}
                        >
                          {b.status}
                        </span>
                      </div>

                      <div className="text-base font-bold font-display text-white">
                        {b.courtName}
                      </div>

                      {/* Player Contact Details */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                        <span className="font-semibold text-white">{b.userName}</span>
                        <span aria-hidden="true" className="text-slate-600">·</span>
                        <span className="text-slate-400">{b.userEmail}</span>
                        <span aria-hidden="true" className="text-slate-600">·</span>
                        <span className="text-slate-400">{b.userPhone}</span>
                        <span aria-hidden="true" className="text-slate-600">·</span>
                        <span>{b.playersCount} players</span>
                        {b.racketRentalCount > 0 && (
                          <span className="text-amber-400">({b.racketRentalCount} rentals)</span>
                        )}
                      </div>

                      {b.notes && (
                        <div className="text-xs text-slate-400 italic bg-slate-900/60 p-2 rounded-lg">
                          Player Note: "{b.notes}"
                        </div>
                      )}
                    </div>

                    {/* Operational Actions */}
                    <div className="flex flex-wrap items-center gap-2.5 lg:pl-6 lg:border-l lg:border-slate-800">
                      
                      {/* Payment info */}
                      <div className="text-right pr-2">
                        <div className="text-sm font-bold font-mono text-white">
                          ${b.totalAmount.toFixed(2)}
                        </div>
                        <div
                          className={`text-[11px] font-semibold ${
                            b.paymentStatus === 'Paid'
                              ? 'text-emerald-400'
                              : 'text-amber-400'
                          }`}
                        >
                          {b.paymentStatus}
                        </div>
                      </div>

                      {/* Contact Player via WhatsApp */}
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/80 rounded-xl text-xs transition-colors"
                        title="Contact customer via WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>

                      {!isCancelled && (
                        <>
                          {/* Check In Button */}
                          {!isCheckedIn && (
                            <button
                              onClick={() => handleCheckIn(b.id)}
                              className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
                            >
                              <UserCheck className="w-4 h-4" />
                              <span>Check In</span>
                            </button>
                          )}

                          {/* Collect Payment Button */}
                          {isPendingPayment && (
                            <button
                              onClick={() => handleMarkPaid(b.id)}
                              className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl transition-colors flex items-center gap-1"
                            >
                              <DollarSign className="w-3.5 h-3.5" />
                              <span>Mark Paid</span>
                            </button>
                          )}

                          {/* Reschedule Button */}
                          <button
                            onClick={() => setRescheduleTarget(b)}
                            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium"
                          >
                            Reschedule
                          </button>

                          {/* Cancel Button */}
                          <button
                            onClick={() => handleCancelBooking(b.id)}
                            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-xl"
                            title="Cancel Reservation"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}

                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Block Court Modal */}
      {showBlockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-[#0F141F] border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-2xl">
            <h2 className="text-xl font-bold font-display text-white mb-1">
              Block Court Slot
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Prevent public bookings for maintenance, coaching masterclasses, or private club tournaments.
            </p>

            <form onSubmit={handleCreateBlock} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Select Court
                </label>
                <select
                  value={blockCourtId}
                  onChange={(e) => setBlockCourtId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  required
                >
                  {courts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.sport.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={blockStartTime}
                    onChange={(e) => setBlockStartTime(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={blockEndTime}
                    onChange={(e) => setBlockEndTime(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Reason for Block
                </label>
                <select
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                >
                  <option value="Maintenance">Maintenance & Turf Grooming</option>
                  <option value="Pro Coaching Clinic">Pro Coaching Clinic</option>
                  <option value="Club Tournament">Club Tournament / League</option>
                  <option value="Staff Reserved">Staff Reserved</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Operational Notes (Optional)
                </label>
                <input
                  type="text"
                  value={blockNotes}
                  onChange={(e) => setBlockNotes(e.target.value)}
                  placeholder="e.g. Italian turf replacement"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBlockModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-bold"
                >
                  Apply Block
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleTarget && (
        <RescheduleModal
          booking={rescheduleTarget}
          onClose={() => setRescheduleTarget(null)}
          onSuccess={(updated) => {
            setFeedback({ type: 'success', message: `Rescheduled ${updated.id} to ${updated.date} ${updated.startTime}` });
            fetchDailyOperations();
          }}
        />
      )}

    </div>
  );
};
