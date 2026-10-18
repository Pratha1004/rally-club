import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  X,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  Sparkles,
  Loader2
} from 'lucide-react';
import { api } from '../lib/api.ts';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: 'login' | 'register' | 'forgot';
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialView = 'login',
  onSuccess
}) => {
  const { login, register, demoLogin } = useAuth();

  const [view, setView] = useState<'login' | 'register' | 'forgot' | 'reset'>(initialView);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setPhone('');
    setResetToken('');
    setNewPassword('');
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const switchView = (newView: 'login' | 'register' | 'forgot' | 'reset') => {
    resetForm();
    setView(newView);
  };

  // 1-Click Demo Fill
  const fillDemo = (role: 'CUSTOMER' | 'STAFF' | 'ADMIN') => {
    setErrorMessage(null);
    if (role === 'CUSTOMER') {
      setEmail('alex@rallyclub.com');
      setPassword('RallyClub2026!');
    } else if (role === 'STAFF') {
      setEmail('marcus.staff@rallyclub.com');
      setPassword('RallyStaff2026!');
    } else if (role === 'ADMIN') {
      setEmail('elena.admin@rallyclub.com');
      setPassword('RallyAdmin2026!');
    }
  };

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setErrorMessage('Please provide a valid email format.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      await login(cleanEmail, password);
      setSuccessMessage('Authentication verified. Welcome!');
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Register
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanName = name.trim();
    const cleanEmail = email.trim();

    if (!cleanName) {
      setErrorMessage('Full name is required.');
      return;
    }
    if (!cleanEmail) {
      setErrorMessage('Email address is required.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    try {
      await register({
        name: cleanName,
        email: cleanEmail,
        password,
        phone: phone.trim()
      });
      setSuccessMessage('Account created successfully! Welcome to Rally Club.');
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 600);
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Forgot Password
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim()) {
      setErrorMessage('Please enter your account email.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.auth.forgotPassword(email.trim());
      if (res.resetToken) {
        setResetToken(res.resetToken);
        setSuccessMessage('Password reset token generated. Proceed to reset password below.');
        setView('reset');
      } else {
        setSuccessMessage(res.message);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to dispatch reset request.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!resetToken.trim()) {
      setErrorMessage('Reset token is required.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.auth.resetPassword(resetToken.trim(), newPassword);
      setSuccessMessage(res.message);
      setTimeout(() => {
        switchView('login');
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-[#0F141D] border border-violet-900/40 rounded-2xl shadow-2xl p-6 sm:p-8 text-slate-100"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/80 transition-colors"
          aria-label="Close authentication modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Kicker */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#CCFF00] mb-1">
            <span>Rally Club</span>
            <span aria-hidden="true">·</span>
            <span>Est. 2026</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white font-display">
            {view === 'login' && 'Sign In to Your Account'}
            {view === 'register' && 'Join Rally Club Membership'}
            {view === 'forgot' && 'Reset Your Password'}
            {view === 'reset' && 'Create New Password'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {view === 'login' && 'Enter your credentials to manage courts, bookings, and operations.'}
            {view === 'register' && 'Book luxury Padel and Pickleball courts across the club.'}
            {view === 'forgot' && 'Enter your email to receive a password recovery link.'}
            {view === 'reset' && 'Enter your authorization token and choose a secure new password.'}
          </p>
        </div>

        {/* Demo Credentials Quick-Select Pill (Available on Login view) */}
        {view === 'login' && (
          <div className="mb-5 p-3 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
              <span className="flex items-center gap-1 font-semibold text-slate-300">
                <Sparkles className="w-3 h-3 text-[#CCFF00]" />
                Demo Credentials Fill:
              </span>
              <span>1-click fill</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillDemo('CUSTOMER')}
                className="py-1.5 px-2 bg-slate-800/90 hover:bg-slate-700/80 border border-slate-700 hover:border-[#CCFF00]/50 rounded text-[11px] font-medium text-slate-200 transition-colors text-center"
              >
                Customer
              </button>
              <button
                type="button"
                onClick={() => fillDemo('STAFF')}
                className="py-1.5 px-2 bg-slate-800/90 hover:bg-slate-700/80 border border-slate-700 hover:border-violet-500/50 rounded text-[11px] font-medium text-slate-200 transition-colors text-center"
              >
                Staff
              </button>
              <button
                type="button"
                onClick={() => fillDemo('ADMIN')}
                className="py-1.5 px-2 bg-slate-800/90 hover:bg-slate-700/80 border border-slate-700 hover:border-amber-400/50 rounded text-[11px] font-medium text-slate-200 transition-colors text-center"
              >
                Admin
              </button>
            </div>
          </div>
        )}

        {/* Feedback Messages */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-lg bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs flex items-start gap-2 animate-in fade-in">
            <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-950/60 border border-emerald-800/80 text-emerald-200 text-xs flex items-start gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* View 1: LOGIN */}
        {view === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@rallyclub.com"
                  required
                  disabled={loading}
                  className="w-full bg-slate-900/80 border border-slate-700/80 focus:border-[#CCFF00] focus:ring-1 focus:ring-[#CCFF00] rounded-lg pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all disabled:opacity-60"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => switchView('forgot')}
                  className="text-xs text-slate-400 hover:text-[#CCFF00] transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  disabled={loading}
                  className="w-full bg-slate-900/80 border border-slate-700/80 focus:border-[#CCFF00] focus:ring-1 focus:ring-[#CCFF00] rounded-lg pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-[#CCFF00] hover:bg-[#b6e600] text-black font-semibold text-sm rounded-lg transition-all shadow-[0_0_20px_rgba(204,255,0,0.25)] hover:shadow-[0_0_25px_rgba(204,255,0,0.4)] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center text-xs text-slate-400 pt-3 border-t border-slate-800">
              New to Rally Club?{' '}
              <button
                type="button"
                onClick={() => switchView('register')}
                className="font-medium text-[#CCFF00] hover:underline underline-offset-2 ml-1"
              >
                Create Customer Account
              </button>
            </div>
          </form>
        )}

        {/* View 2: REGISTER */}
        {view === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jordan Hayes"
                  required
                  disabled={loading}
                  className="w-full bg-slate-900/80 border border-slate-700/80 focus:border-[#CCFF00] focus:ring-1 focus:ring-[#CCFF00] rounded-lg pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all disabled:opacity-60"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jordan@example.com"
                  required
                  disabled={loading}
                  className="w-full bg-slate-900/80 border border-slate-700/80 focus:border-[#CCFF00] focus:ring-1 focus:ring-[#CCFF00] rounded-lg pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all disabled:opacity-60"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Phone Number (for booking SMS/WhatsApp)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 019-2834"
                  disabled={loading}
                  className="w-full bg-slate-900/80 border border-slate-700/80 focus:border-[#CCFF00] focus:ring-1 focus:ring-[#CCFF00] rounded-lg pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all disabled:opacity-60"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 chars"
                    required
                    disabled={loading}
                    className="w-full bg-slate-900/80 border border-slate-700/80 focus:border-[#CCFF00] focus:ring-1 focus:ring-[#CCFF00] rounded-lg pl-9 pr-9 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    aria-label="Toggle password"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm"
                    required
                    disabled={loading}
                    className="w-full bg-slate-900/80 border border-slate-700/80 focus:border-[#CCFF00] focus:ring-1 focus:ring-[#CCFF00] rounded-lg pl-9 pr-9 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    aria-label="Toggle confirm password"
                  >
                    {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-400">
              By registering, you agree to club court etiquette and cancellation terms. Public registrations are granted Customer status.
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-[#CCFF00] hover:bg-[#b6e600] text-black font-semibold text-sm rounded-lg transition-all shadow-[0_0_20px_rgba(204,255,0,0.25)] flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Registering Member...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center text-xs text-slate-400 pt-3 border-t border-slate-800">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => switchView('login')}
                className="font-medium text-[#CCFF00] hover:underline underline-offset-2 ml-1"
              >
                Sign In
              </button>
            </div>
          </form>
        )}

        {/* View 3: FORGOT PASSWORD */}
        {view === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Account Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@rallyclub.com"
                  required
                  disabled={loading}
                  className="w-full bg-slate-900/80 border border-slate-700/80 focus:border-[#CCFF00] focus:ring-1 focus:ring-[#CCFF00] rounded-lg pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all disabled:opacity-60"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-[#CCFF00] hover:bg-[#b6e600] text-black font-semibold text-sm rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating Reset Request...</span>
                </>
              ) : (
                <span>Send Password Reset</span>
              )}
            </button>

            <div className="text-center text-xs text-slate-400 pt-2">
              <button
                type="button"
                onClick={() => switchView('login')}
                className="text-slate-300 hover:text-white underline underline-offset-2"
              >
                Back to Sign In
              </button>
            </div>
          </form>
        )}

        {/* View 4: RESET PASSWORD */}
        {view === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Reset Verification Token
              </label>
              <input
                type="text"
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
                placeholder="rc_reset_..."
                required
                disabled={loading}
                className="w-full bg-slate-900/80 border border-slate-700/80 focus:border-[#CCFF00] focus:ring-1 focus:ring-[#CCFF00] rounded-lg px-3.5 py-2.5 text-xs font-mono text-white placeholder-slate-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                New Password (minimum 6 characters)
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                disabled={loading}
                className="w-full bg-slate-900/80 border border-slate-700/80 focus:border-[#CCFF00] focus:ring-1 focus:ring-[#CCFF00] rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-[#CCFF00] hover:bg-[#b6e600] text-black font-semibold text-sm rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <span>Confirm New Password</span>
              )}
            </button>

            <div className="text-center text-xs text-slate-400 pt-2">
              <button
                type="button"
                onClick={() => switchView('login')}
                className="text-slate-300 hover:text-white underline underline-offset-2"
              >
                Back to Sign In
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
