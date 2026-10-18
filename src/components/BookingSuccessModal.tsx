import React from 'react';
import { Booking } from '../types.ts';
import {
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Share2,
  Download,
  X,
  Sparkles,
  ExternalLink,
  MessageCircle
} from 'lucide-react';

interface BookingSuccessModalProps {
  booking: Booking;
  onClose: () => void;
  onViewMyBookings: () => void;
}

export const BookingSuccessModal: React.FC<BookingSuccessModalProps> = ({
  booking,
  onClose,
  onViewMyBookings
}) => {
  // WhatsApp Share URL
  const whatsappText = encodeURIComponent(
    `🎾 *Rally Club Court Reservation Confirmed!*\n\n` +
    `• *Court:* ${booking.courtName} (${booking.sport.toUpperCase()})\n` +
    `• *Date:* ${booking.date}\n` +
    `• *Time:* ${booking.startTime} - ${booking.endTime} (${booking.durationMinutes} mins)\n` +
    `• *Players:* ${booking.playersCount}\n` +
    `• *Booking ID:* ${booking.id}\n` +
    `• *Status:* ${booking.paymentStatus}\n\n` +
    `See you on the court! Location: 450 Grand Pavilion Way, Sports District.`
  );
  const whatsappUrl = `https://wa.me/?text=${whatsappText}`;

  // Google Calendar URL
  const calendarTitle = encodeURIComponent(`Rally Club ${booking.sport.toUpperCase()}: ${booking.courtName}`);
  const calendarDetails = encodeURIComponent(`Booking Ref: ${booking.id}\nTransaction: ${booking.transactionReference}`);
  const calendarStart = `${booking.date.replace(/-/g, '')}T${booking.startTime.replace(':', '')}00`;
  const calendarEnd = `${booking.date.replace(/-/g, '')}T${booking.endTime.replace(':', '')}00`;
  const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${calendarTitle}&dates=${calendarStart}/${calendarEnd}&details=${calendarDetails}&location=Rally+Club+Grand+Pavilion`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-[#0F141F] border border-[#CCFF00]/40 rounded-2xl shadow-[0_0_50px_rgba(204,255,0,0.15)] p-6 sm:p-8 text-slate-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          aria-label="Close confirmation"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero badge */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-full bg-[#CCFF00]/10 border border-[#CCFF00]/30 text-[#CCFF00] mb-3">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="text-xs font-mono uppercase tracking-widest text-[#CCFF00] font-semibold">
            RESERVATION GUARANTEED
          </div>
          <h2 className="text-2xl font-bold font-display text-white mt-1">
            Court Booked Successfully
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Your court has been locked into the club schedule.
          </p>
        </div>

        {/* Receipt Box */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3 mb-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <div className="text-xs text-slate-400">Booking Reference</div>
              <div className="text-sm font-mono font-bold text-white">{booking.id}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400">Transaction ID</div>
              <div className="text-xs font-mono text-slate-300">{booking.transactionReference}</div>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Court Arena:</span>
              <span className="font-semibold text-white">{booking.courtName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Date & Slot:</span>
              <span className="font-semibold text-white">
                {booking.date} · {booking.startTime} - {booking.endTime}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Sport & Players:</span>
              <span className="font-semibold text-white">
                {booking.sport.toUpperCase()} ({booking.playersCount} players)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Payment Status:</span>
              <span
                className={`font-semibold ${
                  booking.paymentStatus === 'Paid'
                    ? 'text-emerald-400'
                    : 'text-amber-400'
                }`}
              >
                {booking.paymentStatus} ({booking.paymentMethod})
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-800 text-sm font-bold">
              <span className="text-slate-300">Total Billed:</span>
              <span className="text-[#CCFF00] font-mono">${booking.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* WhatsApp & Calendar Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-6">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-3 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-700/60 text-emerald-200 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            <span>WhatsApp Confirmation</span>
          </a>

          <a
            href={gcalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-3 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <Calendar className="w-4 h-4 text-[#CCFF00]" />
            <span>Add to Calendar</span>
          </a>
        </div>

        {/* Bottom Navigation */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              onClose();
              onViewMyBookings();
            }}
            className="flex-1 py-3 px-4 bg-[#CCFF00] hover:bg-[#b6e600] text-black font-bold text-xs rounded-lg transition-all"
          >
            View in My Reservations
          </button>
          <button
            onClick={onClose}
            className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
