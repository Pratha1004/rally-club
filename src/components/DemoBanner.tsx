import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Shield, Sparkles, UserCheck, KeyRound, LogOut } from 'lucide-react';
import { UserRole } from '../types.ts';

interface DemoBannerProps {
  onOpenAuth: (view: 'login' | 'register') => void;
}

export const DemoBanner: React.FC<DemoBannerProps> = ({ onOpenAuth }) => {
  const { user, demoLogin, logout, loading } = useAuth();

  const handleQuickLogin = async (role: UserRole) => {
    try {
      await demoLogin(role);
    } catch (err) {
      console.error('Demo login failed', err);
    }
  };

  return (
    <aside aria-label="Demo role selector" className="bg-[#0B0F17] border-b border-violet-950/60 text-xs py-2 px-4 transition-all">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-slate-300">
          <span className="flex items-center gap-1 font-semibold text-[#CCFF00] tracking-wider uppercase text-[11px]">
            <Sparkles className="w-3.5 h-3.5" />
            Evaluation Demo Bar
          </span>
          <span className="text-slate-600 hidden sm:inline" aria-hidden="true">·</span>
          <span className="text-slate-400 hidden sm:inline">
            Test any of the 3 real authenticated roles:
          </span>
        </div>

        <div className="flex items-center flex-wrap gap-1.5">
          {/* Customer button */}
          <button
            onClick={() => handleQuickLogin('CUSTOMER')}
            disabled={loading}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-all flex items-center gap-1.5 ${
              user?.role === 'CUSTOMER'
                ? 'bg-[#CCFF00] text-black font-semibold shadow-[0_0_12px_rgba(204,255,0,0.3)]'
                : 'bg-slate-900/90 text-slate-300 border border-slate-700/60 hover:border-slate-500 hover:text-white'
            }`}
            title="Login as Alex Rivera (Customer)"
          >
            <UserCheck className="w-3 h-3" />
            <span>Customer Demo</span>
          </button>

          {/* Staff button */}
          <button
            onClick={() => handleQuickLogin('STAFF')}
            disabled={loading}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-all flex items-center gap-1.5 ${
              user?.role === 'STAFF'
                ? 'bg-violet-500 text-white font-semibold shadow-[0_0_12px_rgba(139,92,246,0.35)]'
                : 'bg-slate-900/90 text-slate-300 border border-slate-700/60 hover:border-violet-500/50 hover:text-white'
            }`}
            title="Login as Marcus Vance (Staff/Court Director)"
          >
            <KeyRound className="w-3 h-3" />
            <span>Staff Demo</span>
          </button>

          {/* Admin button */}
          <button
            onClick={() => handleQuickLogin('ADMIN')}
            disabled={loading}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-all flex items-center gap-1.5 ${
              user?.role === 'ADMIN'
                ? 'bg-amber-400 text-black font-semibold shadow-[0_0_12px_rgba(251,191,36,0.35)]'
                : 'bg-slate-900/90 text-slate-300 border border-slate-700/60 hover:border-amber-400/50 hover:text-white'
            }`}
            title="Login as Elena Rostova (General Manager & Admin)"
          >
            <Shield className="w-3 h-3" />
            <span>Admin Demo</span>
          </button>

          {user ? (
            <button
              onClick={() => logout()}
              className="px-2 py-1 text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 rounded border border-transparent hover:border-rose-900/40 ml-1 transition-colors flex items-center gap-1"
              title="Logout current session"
            >
              <LogOut className="w-3 h-3" />
              <span className="hidden md:inline">Sign Out</span>
            </button>
          ) : (
            <button
              onClick={() => onOpenAuth('login')}
              className="px-2.5 py-1 text-slate-300 hover:text-white underline underline-offset-2 ml-1"
            >
              Manual Sign In
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
