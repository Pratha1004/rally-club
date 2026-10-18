import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  Calendar,
  Grid3X3,
  Shield,
  Layers,
  LogOut,
  Menu,
  X,
  User as UserIcon,
  Clock,
  Sparkles,
  Zap,
  Users
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenAuth: (view: 'login' | 'register') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab, onOpenAuth }) => {
  const { user, logout, isCustomer, isStaff, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (tabId: string) => {
    onSelectTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-40 bg-[#090D14]/95 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Club Identity */}
          <div
            onClick={() => handleNavClick(isAdmin ? 'admin-dashboard' : (isStaff ? 'staff-dashboard' : 'home'))}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-900 to-black border border-slate-700/80 group-hover:border-[#CCFF00] flex items-center justify-center transition-all shadow-[0_0_15px_rgba(204,255,0,0.15)]">
              <div className="relative">
                <span className="font-display font-black text-lg tracking-tighter text-[#CCFF00]">RC</span>
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#CCFF00] animate-ping opacity-75" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-bold text-lg sm:text-xl tracking-tight text-white group-hover:text-slate-100 transition-colors">
                  RALLY CLUB
                </span>
                <span className="text-[10px] font-mono tracking-widest text-[#CCFF00] uppercase font-semibold">
                  PRO
                </span>
              </div>
              <div className="text-[10px] tracking-widest text-slate-400 uppercase font-medium">
                Padel & Pickleball · Private Arenas
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {/* Customer or Public views */}
            {(!user || isCustomer) && (
              <>
                <button
                  onClick={() => handleNavClick('home')}
                  className={`px-3.5 py-2 text-sm font-medium transition-colors border-b-2 ${
                    currentTab === 'home'
                      ? 'border-[#CCFF00] text-white'
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  Courts & Experience
                </button>
                <button
                  onClick={() => handleNavClick('booking')}
                  className={`px-3.5 py-2 text-sm font-medium transition-colors border-b-2 ${
                    currentTab === 'booking'
                      ? 'border-[#CCFF00] text-white'
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  Book Session
                </button>
                {user && (
                  <button
                    onClick={() => handleNavClick('my-bookings')}
                    className={`px-3.5 py-2 text-sm font-medium transition-colors border-b-2 ${
                      currentTab === 'my-bookings'
                        ? 'border-[#CCFF00] text-white'
                        : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    My Reservations
                  </button>
                )}
              </>
            )}

            {/* Staff Views */}
            {isStaff && (
              <>
                <button
                  onClick={() => handleNavClick('staff-dashboard')}
                  className={`px-3.5 py-2 text-sm font-medium transition-colors border-b-2 ${
                    currentTab === 'staff-dashboard'
                      ? 'border-violet-500 text-white'
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  Daily Schedule
                </button>
                <button
                  onClick={() => handleNavClick('staff-checkin')}
                  className={`px-3.5 py-2 text-sm font-medium transition-colors border-b-2 ${
                    currentTab === 'staff-checkin'
                      ? 'border-violet-500 text-white'
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  Front Desk Check-In
                </button>
                <button
                  onClick={() => handleNavClick('staff-blocks')}
                  className={`px-3.5 py-2 text-sm font-medium transition-colors border-b-2 ${
                    currentTab === 'staff-blocks'
                      ? 'border-violet-500 text-white'
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  Court Blocks
                </button>
                <button
                  onClick={() => handleNavClick('booking')}
                  className="px-3 py-2 text-xs text-slate-400 hover:text-slate-200"
                >
                  Customer View
                </button>
              </>
            )}

            {/* Admin Views */}
            {isAdmin && (
              <>
                <button
                  onClick={() => handleNavClick('admin-dashboard')}
                  className={`px-3.5 py-2 text-sm font-medium transition-colors border-b-2 ${
                    currentTab === 'admin-dashboard'
                      ? 'border-amber-400 text-white'
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  Overview & Analytics
                </button>
                <button
                  onClick={() => handleNavClick('admin-users')}
                  className={`px-3.5 py-2 text-sm font-medium transition-colors border-b-2 ${
                    currentTab === 'admin-users'
                      ? 'border-amber-400 text-white'
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  Staff & Users
                </button>
                <button
                  onClick={() => handleNavClick('admin-courts')}
                  className={`px-3.5 py-2 text-sm font-medium transition-colors border-b-2 ${
                    currentTab === 'admin-courts'
                      ? 'border-amber-400 text-white'
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  Courts & Rules
                </button>
                <button
                  onClick={() => handleNavClick('admin-bookings')}
                  className={`px-3.5 py-2 text-sm font-medium transition-colors border-b-2 ${
                    currentTab === 'admin-bookings'
                      ? 'border-amber-400 text-white'
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  All Bookings
                </button>
              </>
            )}
          </div>

          {/* User Profile / Auth Controls */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
                <div className="text-right">
                  <div className="text-xs font-semibold text-white leading-tight">
                    {user.name}
                  </div>
                  <div className="flex items-center justify-end gap-1.5 text-[11px] font-mono">
                    <span
                      className={`font-semibold ${
                        user.role === 'ADMIN'
                          ? 'text-amber-400'
                          : user.role === 'STAFF'
                          ? 'text-violet-400'
                          : 'text-[#CCFF00]'
                      }`}
                    >
                      {user.role}
                    </span>
                    <span className="text-slate-500">·</span>
                    <span className="text-slate-400">{user.membershipTier || 'Member'}</span>
                  </div>
                </div>

                <div className="relative">
                  <img
                    src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                    alt={user.name}
                    className="w-9 h-9 rounded-full object-cover border-2 border-slate-700/80"
                  />
                  <span
                    className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#090D14] ${
                      user.role === 'ADMIN'
                        ? 'bg-amber-400'
                        : user.role === 'STAFF'
                        ? 'bg-violet-400'
                        : 'bg-[#CCFF00]'
                    }`}
                  />
                </div>

                <button
                  onClick={() => logout()}
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors ml-1"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-lg hover:bg-slate-800/80 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="px-4 py-2 text-xs font-semibold bg-[#CCFF00] hover:bg-[#b6e600] text-black rounded-lg transition-all shadow-[0_0_15px_rgba(204,255,0,0.2)]"
                >
                  Join Club
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 md:hidden">
            {user && (
              <span className="text-xs font-mono font-semibold text-[#CCFF00]">
                {user.role}
              </span>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0D121B] border-b border-slate-800 px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-2">
          {user && (
            <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-white">{user.name}</div>
                <div className="text-xs text-slate-400">{user.email}</div>
                <div className="text-xs font-mono text-[#CCFF00] font-semibold mt-0.5">
                  Role: {user.role} ({user.membershipTier || 'Member'})
                </div>
              </div>
              <button
                onClick={() => logout()}
                className="px-3 py-1.5 bg-rose-950/40 border border-rose-900 text-rose-300 text-xs rounded-lg"
              >
                Sign Out
              </button>
            </div>
          )}

          <div className="space-y-1">
            {(!user || isCustomer) && (
              <>
                <button
                  onClick={() => handleNavClick('home')}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  Courts & Experience
                </button>
                <button
                  onClick={() => handleNavClick('booking')}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-[#CCFF00] font-semibold hover:bg-slate-800"
                >
                  Book Session
                </button>
                {user && (
                  <button
                    onClick={() => handleNavClick('my-bookings')}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
                  >
                    My Reservations
                  </button>
                )}
              </>
            )}

            {isStaff && (
              <>
                <button
                  onClick={() => handleNavClick('staff-dashboard')}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-violet-300 font-medium hover:bg-slate-800"
                >
                  Daily Schedule
                </button>
                <button
                  onClick={() => handleNavClick('staff-checkin')}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800"
                >
                  Front Desk Check-In
                </button>
                <button
                  onClick={() => handleNavClick('staff-blocks')}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800"
                >
                  Court Blocks
                </button>
              </>
            )}

            {isAdmin && (
              <>
                <button
                  onClick={() => handleNavClick('admin-dashboard')}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-amber-300 font-medium hover:bg-slate-800"
                >
                  Executive Analytics
                </button>
                <button
                  onClick={() => handleNavClick('admin-users')}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800"
                >
                  Staff & User Accounts
                </button>
                <button
                  onClick={() => handleNavClick('admin-courts')}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800"
                >
                  Courts & Rules
                </button>
                <button
                  onClick={() => handleNavClick('admin-bookings')}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800"
                >
                  All Club Bookings
                </button>
              </>
            )}
          </div>

          {!user && (
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth('login');
                }}
                className="w-full py-2.5 bg-slate-800 text-white rounded-lg text-sm font-medium"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth('register');
                }}
                className="w-full py-2.5 bg-[#CCFF00] text-black rounded-lg text-sm font-semibold"
              >
                Join Rally Club
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
