import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { DemoBanner } from './components/DemoBanner.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { BookingModal } from './components/BookingModal.tsx';
import { BookingSuccessModal } from './components/BookingSuccessModal.tsx';

import { CustomerHome } from './views/CustomerHome.tsx';
import { CustomerDashboard } from './views/CustomerDashboard.tsx';
import { StaffDashboard } from './views/StaffDashboard.tsx';
import { AdminDashboard } from './views/AdminDashboard.tsx';

import { Court, ClubSettings, Booking } from './types.ts';
import { api } from './lib/api.ts';

function MainApp() {
  const { user, isCustomer, isStaff, isAdmin, loading } = useAuth();

  // Active view tab
  const [currentTab, setCurrentTab] = useState<string>('home');

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalView, setAuthModalView] = useState<'login' | 'register' | 'forgot'>('login');

  const [bookingModalState, setBookingModalState] = useState<{
    isOpen: boolean;
    court: Court | null;
    date: string;
    startTime: string;
    durationMinutes: 60 | 90 | 120;
    isPeak: boolean;
  }>({
    isOpen: false,
    court: null,
    date: new Date().toISOString().split('T')[0],
    startTime: '18:00',
    durationMinutes: 90,
    isPeak: true
  });

  const [successBooking, setSuccessBooking] = useState<Booking | null>(null);
  const [clubSettings, setClubSettings] = useState<ClubSettings>({
    clubName: 'Rally Club Padel & Pickleball',
    openingTime: '07:00',
    closingTime: '23:00',
    peakStartHour: '17:00',
    peakEndHour: '22:00',
    peakSurchargePercent: 25,
    racketRentalPrice: 6,
    ballTubePrice: 8,
    cancellationCutoffHours: 6,
    whatsappNotificationsEnabled: true,
    supportPhone: '+1 (555) 725-5928',
    address: '450 Grand Pavilion Way, Sports District, Suite 100'
  });

  // Automatically adjust default view tab when user role changes
  useEffect(() => {
    if (isAdmin) {
      if (!currentTab.startsWith('admin')) {
        setCurrentTab('admin-dashboard');
      }
    } else if (isStaff) {
      if (!currentTab.startsWith('staff')) {
        setCurrentTab('staff-dashboard');
      }
    } else if (isCustomer) {
      // If customer was on staff/admin tab, redirect to home
      if (currentTab.startsWith('admin') || currentTab.startsWith('staff')) {
        setCurrentTab('home');
      }
    }
  }, [user?.role, isAdmin, isStaff, isCustomer]);

  // Load club settings on boot
  useEffect(() => {
    api.admin.getSettings()
      .then(res => setClubSettings(res.settings))
      .catch(() => {
        // use default fallback
      });
  }, []);

  const handleOpenAuth = (view: 'login' | 'register' = 'login') => {
    setAuthModalView(view);
    setAuthModalOpen(true);
  };

  const handleSelectSlot = (
    court: Court,
    date: string,
    startTime: string,
    duration: 60 | 90 | 120,
    isPeak: boolean
  ) => {
    setBookingModalState({
      isOpen: true,
      court,
      date,
      startTime,
      durationMinutes: duration,
      isPeak
    });
  };

  const handleBookingConfirmed = (booking: Booking) => {
    setBookingModalState(prev => ({ ...prev, isOpen: false }));
    setSuccessBooking(booking);
  };

  return (
    <div className="min-h-screen bg-[#080B10] text-slate-100 flex flex-col font-sans">
      
      {/* Demo Persona Bar */}
      <DemoBanner onOpenAuth={handleOpenAuth} />

      {/* Main Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenAuth={handleOpenAuth}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        
        {/* Loading state indicator during initial session restoration */}
        {loading && (
          <div className="py-20 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-[#CCFF00] border-t-transparent rounded-full animate-spin" />
            <span>Verifying club session credentials...</span>
          </div>
        )}

        {/* CUSTOMER VIEWS */}
        {(!user || isCustomer) && (
          <>
            {(currentTab === 'home' || currentTab === 'booking') && (
              <CustomerHome
                onSelectSlot={handleSelectSlot}
                onOpenBookingTab={() => setCurrentTab('booking')}
                onOpenAuth={handleOpenAuth}
              />
            )}

            {currentTab === 'my-bookings' && (
              <CustomerDashboard
                onNewBookingClick={() => setCurrentTab('booking')}
              />
            )}
          </>
        )}

        {/* STAFF VIEWS */}
        {isStaff && (
          <>
            {currentTab.startsWith('staff') && (
              <StaffDashboard />
            )}

            {/* Staff can also preview customer booking view */}
            {currentTab === 'booking' && (
              <CustomerHome
                onSelectSlot={handleSelectSlot}
                onOpenBookingTab={() => setCurrentTab('booking')}
                onOpenAuth={handleOpenAuth}
              />
            )}
          </>
        )}

        {/* ADMIN VIEWS */}
        {isAdmin && (
          <>
            {currentTab.startsWith('admin') && (
              <AdminDashboard />
            )}
          </>
        )}

      </main>

      {/* Footer */}
      <Footer />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialView={authModalView}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          // Keep current view or reload user
        }}
      />

      {/* Booking Slot Modal */}
      {bookingModalState.isOpen && bookingModalState.court && (
        <BookingModal
          court={bookingModalState.court}
          date={bookingModalState.date}
          startTime={bookingModalState.startTime}
          durationMinutes={bookingModalState.durationMinutes}
          isPeak={bookingModalState.isPeak}
          settings={clubSettings}
          onClose={() => setBookingModalState(prev => ({ ...prev, isOpen: false }))}
          onSuccess={handleBookingConfirmed}
          onRequireAuth={() => handleOpenAuth('login')}
        />
      )}

      {/* Booking Success / Receipt Modal */}
      {successBooking && (
        <BookingSuccessModal
          booking={successBooking}
          onClose={() => setSuccessBooking(null)}
          onViewMyBookings={() => {
            setSuccessBooking(null);
            setCurrentTab('my-bookings');
          }}
        />
      )}

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
