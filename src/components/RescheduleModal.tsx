import React, { useState } from 'react';
import { Booking } from '../types.ts';
import { X, Calendar, Clock, AlertTriangle, Loader2, Check } from 'lucide-react';
import { api } from '../lib/api.ts';

interface RescheduleModalProps {
  booking: Booking;
  onClose: () => void;
  onSuccess: (updated: Booking) => void;
}

export const RescheduleModal: React.FC<RescheduleModalProps> = ({
  booking,
  onClose,
  onSuccess
}) => {
  const [newDate, setNewDate] = useState<string>(booking.date);
  const [newStartTime, setNewStartTime] = useState<string>(booking.startTime);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const availableHours = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
    '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.bookings.reschedule(booking.id, {
        newDate,
        newStartTime
      });
      onSuccess(res.booking);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Rescheduling error. Please choose a different date or time.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-[#0F141F] border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          aria-label="Close reschedule dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-5">
          <div className="text-xs font-mono uppercase text-[#CCFF00] font-semibold mb-1">
            CHANGE RESERVATION TIME
          </div>
          <h2 className="text-xl font-bold font-display text-white">
            Reschedule Booking {booking.id}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Current: {booking.courtName} on {booking.date} at {booking.startTime}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Select New Date
            </label>
            <input
              type="date"
              value={newDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-[#CCFF00] outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Select New Start Time ({booking.durationMinutes} mins)
            </label>
            <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
              {availableHours.map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => setNewStartTime(time)}
                  className={`py-2 px-1 text-xs font-mono rounded border transition-colors ${
                    newStartTime === time
                      ? 'bg-[#CCFF00] text-black font-bold border-[#CCFF00]'
                      : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 text-[11px] text-slate-400">
            Rescheduling policy: Up to 6 hours before start time. Subject to court availability.
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-[#CCFF00] text-black rounded-lg text-xs font-bold hover:bg-[#b6e600] flex items-center justify-center gap-1.5"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Checking...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Confirm New Slot</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
