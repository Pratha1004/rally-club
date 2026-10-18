import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Court, ClubSettings, User } from '../types.ts';
import {
  DollarSign,
  Users,
  Shield,
  Activity,
  Award,
  Settings,
  TrendingUp,
  Plus,
  CheckCircle2,
  Calendar,
  Lock,
  Edit2,
  Save,
  Clock,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { api } from '../lib/api.ts';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'courts' | 'settings'>('analytics');
  const [analytics, setAnalytics] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [courts, setCourts] = useState<Court[]>([]);
  const [settings, setSettings] = useState<ClubSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // User Provisioning modal
  const [showProvisionModal, setShowProvisionModal] = useState(false);
  const [provName, setProvName] = useState('');
  const [provEmail, setProvEmail] = useState('');
  const [provPassword, setProvPassword] = useState('RallyPass2026!');
  const [provRole, setProvRole] = useState<'STAFF' | 'ADMIN' | 'CUSTOMER'>('STAFF');
  const [provPhone, setProvPhone] = useState('+1 (555) ');

  // Court editing modal / inline state
  const [editingCourt, setEditingCourt] = useState<Court | null>(null);

  // Settings form state
  const [settingsForm, setSettingsForm] = useState<ClubSettings | null>(null);

  // Feedback banner
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, usersRes, courtsRes, settingsRes] = await Promise.all([
        api.admin.getAnalytics(),
        api.admin.getUsers(),
        api.courts.list(),
        api.admin.getSettings()
      ]);
      setAnalytics(analyticsRes);
      setUsers(usersRes.users);
      setCourts(courtsRes.courts);
      setSettings(settingsRes.settings);
      setSettingsForm(settingsRes.settings);
    } catch (err: any) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  // Provision user handler
  const handleProvisionUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.admin.provisionUser({
        name: provName,
        email: provEmail,
        password: provPassword,
        role: provRole,
        phone: provPhone
      });
      setShowProvisionModal(false);
      setProvName('');
      setProvEmail('');
      setFeedback({ type: 'success', message: res.message });
      loadAllAdminData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to provision user.' });
    }
  };

  // Role update handler
  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await api.admin.updateUser(userId, { role: newRole });
      setFeedback({ type: 'success', message: res.message });
      loadAllAdminData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update user role' });
    }
  };

  // Save court updates
  const handleSaveCourt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourt) return;
    try {
      await api.courts.update(editingCourt.id, {
        hourlyRate: Number(editingCourt.hourlyRate),
        peakHourlyRate: Number(editingCourt.peakHourlyRate),
        isActive: editingCourt.isActive
      });
      setFeedback({ type: 'success', message: `Updated court ${editingCourt.name}` });
      setEditingCourt(null);
      loadAllAdminData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update court' });
    }
  };

  // Save club settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsForm) return;
    try {
      const res = await api.admin.updateSettings(settingsForm);
      setSettings(res.settings);
      setFeedback({ type: 'success', message: 'Club settings and booking policies updated successfully.' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to save settings' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase text-amber-400 font-semibold mb-1">
            <Shield className="w-3.5 h-3.5" />
            <span>EXECUTIVE CLUB ADMINISTRATION</span>
          </div>
          <h1 className="text-3xl font-bold font-display text-white">
            Club Command & Operations
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Logged in as {user?.name} (Admin). Financial ledgers, staff provisioning, and facility rules.
          </p>
        </div>

        <button
          onClick={() => setShowProvisionModal(true)}
          className="py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs rounded-xl transition-all shadow-[0_0_20px_rgba(251,191,36,0.25)] flex items-center gap-2 self-start md:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Provision Staff / Admin</span>
        </button>
      </div>

      {/* Feedback Banner */}
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

      {/* Admin Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-4">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'analytics'
              ? 'bg-amber-400 text-black'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          Executive Analytics
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'users'
              ? 'bg-amber-400 text-black'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          Users & Staff Directory ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('courts')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'courts'
              ? 'bg-amber-400 text-black'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          Court Pricing & Arena Control ({courts.length})
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'settings'
              ? 'bg-amber-400 text-black'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          Operating Rules & Policies
        </button>
      </div>

      {/* TAB 1: EXECUTIVE ANALYTICS */}
      {activeTab === 'analytics' && analytics && (
        <div className="space-y-8">
          
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#0D121B] border border-slate-800">
              <div className="text-[11px] text-slate-400 font-mono uppercase">Total Paid Revenue</div>
              <div className="text-3xl font-extrabold font-display text-[#CCFF00] mt-1">
                ${analytics.totalRevenue.toFixed(2)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Verified settled bookings</div>
            </div>

            <div className="p-5 rounded-2xl bg-[#0D121B] border border-slate-800">
              <div className="text-[11px] text-slate-400 font-mono uppercase">Pay at Venue / Pending</div>
              <div className="text-3xl font-extrabold font-display text-amber-400 mt-1">
                ${analytics.pendingRevenue.toFixed(2)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Collect at front desk check-in</div>
            </div>

            <div className="p-5 rounded-2xl bg-[#0D121B] border border-slate-800">
              <div className="text-[11px] text-slate-400 font-mono uppercase">Total Sessions Booked</div>
              <div className="text-3xl font-extrabold font-display text-white mt-1">
                {analytics.totalBookingsCount}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {analytics.padelBookingsCount} Padel · {analytics.pickleballBookingsCount} Pickleball
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#0D121B] border border-slate-800">
              <div className="text-[11px] text-slate-400 font-mono uppercase">Registered Members</div>
              <div className="text-3xl font-extrabold font-display text-violet-400 mt-1">
                {analytics.totalMembers}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Active customer & staff profiles</div>
            </div>
          </div>

          {/* Court Revenue & Utilization Breakdown */}
          <div className="p-6 rounded-3xl bg-[#0D121B] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold font-display text-white">
                  Court Utilization & Revenue Matrix
                </h3>
                <p className="text-xs text-slate-400">
                  Performance metrics across all 6 private arenas.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase text-[11px]">
                    <th className="py-3 px-4">Court Arena</th>
                    <th className="py-3 px-4">Sport</th>
                    <th className="py-3 px-4">Total Sessions</th>
                    <th className="py-3 px-4">Hours Booked</th>
                    <th className="py-3 px-4 text-right">Revenue Generated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {analytics.courtStats.map((stat: any) => (
                    <tr key={stat.courtId} className="hover:bg-slate-900/40">
                      <td className="py-3 px-4 font-semibold text-white">
                        {stat.courtName}
                      </td>
                      <td className="py-3 px-4 uppercase text-[#CCFF00] font-mono">
                        {stat.sport}
                      </td>
                      <td className="py-3 px-4 text-slate-300 font-mono">
                        {stat.bookingCount} matches
                      </td>
                      <td className="py-3 px-4 text-slate-300 font-mono">
                        {stat.totalHours.toFixed(1)} hrs
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-white">
                        ${stat.revenue.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: USER DIRECTORY & PROVISIONING */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-400">
              Administrative role assignment and account auditing. Public signups are strictly granted Customer status.
            </div>
            <button
              onClick={() => setShowProvisionModal(true)}
              className="py-2 px-3 bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold rounded-lg flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Provision User</span>
            </button>
          </div>

          <div className="rounded-2xl bg-[#0D121B] border border-slate-800 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase text-[11px] bg-slate-900/50">
                  <th className="py-3.5 px-4">Member Name</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Membership Tier</th>
                  <th className="py-3.5 px-4">Bookings</th>
                  <th className="py-3.5 px-4">Total Spent</th>
                  <th className="py-3.5 px-4 text-right">Role Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-900/40">
                    <td className="py-3.5 px-4 font-semibold text-white flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center font-bold text-[10px]">
                        {u.name.slice(0, 1)}
                      </div>
                      <span>{u.name}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-mono">{u.email}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`font-semibold font-mono uppercase ${
                          u.role === 'ADMIN'
                            ? 'text-amber-400'
                            : u.role === 'STAFF'
                            ? 'text-violet-400'
                            : 'text-[#CCFF00]'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">{u.membershipTier || 'Standard'}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">{u.bookingCount || 0}</td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-white">
                      ${(u.totalSpent || 0).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {u.id !== user?.id && (
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[11px] text-slate-200 outline-none"
                        >
                          <option value="CUSTOMER">Customer</option>
                          <option value="STAFF">Staff</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: COURT PRICING & ARENA CONTROL */}
      {activeTab === 'courts' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-400">
            Set standard and peak hourly pricing for Padel and Pickleball courts. Modifications update availability calculations in real-time.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {courts.map((court) => (
              <div
                key={court.id}
                className="p-5 rounded-2xl bg-[#0D121B] border border-slate-800 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase text-[#CCFF00] font-semibold">
                    {court.sport} · {court.type}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                      court.isActive
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                        : 'bg-rose-950/80 text-rose-300 border border-rose-800'
                    }`}
                  >
                    {court.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-bold text-white font-display">
                    {court.name}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {court.surface}
                  </p>
                </div>

                <div className="p-3 bg-slate-900/80 rounded-xl space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Standard Rate:</span>
                    <span className="font-mono font-bold text-white">${court.hourlyRate}/hr</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-amber-400">Peak Rate (17:00-22:00):</span>
                    <span className="font-mono font-bold text-amber-300">${court.peakHourlyRate}/hr</span>
                  </div>
                </div>

                <button
                  onClick={() => setEditingCourt({ ...court })}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Rates & Status</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: OPERATIONAL RULES & POLICIES */}
      {activeTab === 'settings' && settingsForm && (
        <form onSubmit={handleSaveSettings} className="p-6 rounded-3xl bg-[#0D121B] border border-slate-800 space-y-6 max-w-2xl">
          <div>
            <h3 className="text-lg font-bold font-display text-white">
              Club Operating Rules & Booking Engine Policies
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Configure hours of operation, peak hour windows, equipment rental rates, and cancellation policies.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Club Opening Time
              </label>
              <input
                type="time"
                value={settingsForm.openingTime}
                onChange={(e) => setSettingsForm({ ...settingsForm, openingTime: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Club Closing Time
              </label>
              <input
                type="time"
                value={settingsForm.closingTime}
                onChange={(e) => setSettingsForm({ ...settingsForm, closingTime: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Peak Window Start
              </label>
              <input
                type="time"
                value={settingsForm.peakStartHour}
                onChange={(e) => setSettingsForm({ ...settingsForm, peakStartHour: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Peak Window End
              </label>
              <input
                type="time"
                value={settingsForm.peakEndHour}
                onChange={(e) => setSettingsForm({ ...settingsForm, peakEndHour: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Pro Racket Rental ($)
              </label>
              <input
                type="number"
                value={settingsForm.racketRentalPrice}
                onChange={(e) => setSettingsForm({ ...settingsForm, racketRentalPrice: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Ball Can Price ($)
              </label>
              <input
                type="number"
                value={settingsForm.ballTubePrice}
                onChange={(e) => setSettingsForm({ ...settingsForm, ballTubePrice: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Reschedule Cutoff (Hours)
              </label>
              <input
                type="number"
                value={settingsForm.cancellationCutoffHours}
                onChange={(e) => setSettingsForm({ ...settingsForm, cancellationCutoffHours: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Club Concierge & Support Phone
            </label>
            <input
              type="text"
              value={settingsForm.supportPhone}
              onChange={(e) => setSettingsForm({ ...settingsForm, supportPhone: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
            />
          </div>

          <button
            type="submit"
            className="py-3 px-6 bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Operational Rules</span>
          </button>
        </form>
      )}

      {/* Edit Court Rates Modal */}
      {editingCourt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-[#0F141F] border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-2xl">
            <h3 className="text-xl font-bold font-display text-white mb-1">
              Edit {editingCourt.name}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Update hourly rates and operational status.
            </p>

            <form onSubmit={handleSaveCourt} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Standard Hourly Rate ($)
                </label>
                <input
                  type="number"
                  value={editingCourt.hourlyRate}
                  onChange={(e) => setEditingCourt({ ...editingCourt, hourlyRate: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Peak Hourly Rate ($)
                </label>
                <input
                  type="number"
                  value={editingCourt.peakHourlyRate}
                  onChange={(e) => setEditingCourt({ ...editingCourt, peakHourlyRate: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="court-active"
                  checked={editingCourt.isActive}
                  onChange={(e) => setEditingCourt({ ...editingCourt, isActive: e.target.checked })}
                  className="rounded border-slate-700 text-[#CCFF00] focus:ring-0"
                />
                <label htmlFor="court-active" className="text-xs text-slate-200">
                  Court is Active for Public Bookings
                </label>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingCourt(null)}
                  className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-400 text-black font-bold rounded-lg text-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Provision Staff / Admin Modal */}
      {showProvisionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-[#0F141F] border border-amber-900/60 rounded-2xl p-6 text-slate-100 shadow-2xl">
            <h3 className="text-xl font-bold font-display text-white mb-1">
              Provision Staff or Admin Account
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Securely grant administrative and court operational credentials.
            </p>

            <form onSubmit={handleProvisionUser} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={provName}
                  onChange={(e) => setProvName(e.target.value)}
                  placeholder="e.g. Carlos Mendoza"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={provEmail}
                  onChange={(e) => setProvEmail(e.target.value)}
                  placeholder="carlos.staff@rallyclub.com"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Assigned Application Role
                </label>
                <select
                  value={provRole}
                  onChange={(e) => setProvRole(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                >
                  <option value="STAFF">STAFF (Court operations, front desk, check-ins)</option>
                  <option value="ADMIN">ADMIN (Full club authority, pricing, analytics)</option>
                  <option value="CUSTOMER">CUSTOMER (Standard player)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Initial Password
                </label>
                <input
                  type="text"
                  value={provPassword}
                  onChange={(e) => setProvPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProvisionModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-400 text-black font-bold rounded-lg text-xs"
                >
                  Authorize & Provision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
