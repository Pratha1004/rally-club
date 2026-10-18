import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { db, hashPassword, User, Booking, CourtBlock, SportType, PaymentStatus } from './server/db.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// --- Authentication Middleware ---
interface AuthenticatedRequest extends Request {
  user?: User;
}

function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication token required' });
  }

  const user = db.verifySession(token);
  if (!user) {
    return res.status(401).json({ error: 'Session expired or invalid. Please log in again.' });
  }

  req.user = user;
  next();
}

function requireRole(allowedRoles: ('CUSTOMER' | 'STAFF' | 'ADMIN')[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Requires one of: ${allowedRoles.join(', ')}. Current role: ${req.user.role}`
      });
    }
    next();
  };
}

// -------------------------------------------------------------
// AUTHENTICATION API ROUTES
// -------------------------------------------------------------

// Demo accounts endpoint for easy evaluation and seamless role-testing
app.get('/api/auth/demo-accounts', (req, res) => {
  res.json({
    accounts: [
      {
        role: 'CUSTOMER',
        name: 'Alex Rivera',
        email: 'alex@rallyclub.com',
        password: 'RallyClub2026!',
        description: 'Customer account: browse courts, book 60/90/120m sessions, manage bookings, check live availability.'
      },
      {
        role: 'STAFF',
        name: 'Marcus Vance',
        email: 'marcus.staff@rallyclub.com',
        password: 'RallyStaff2026!',
        description: 'Staff account: view master daily schedule, check-in players, block courts for maintenance/clinics, record payments.'
      },
      {
        role: 'ADMIN',
        name: 'Elena Rostova',
        email: 'elena.admin@rallyclub.com',
        password: 'RallyAdmin2026!',
        description: 'Admin account: executive analytics, staff provisioning, court pricing control, operational rules, club settings.'
      }
    ]
  });
});

// Register (Customer only - public registration can NEVER grant Staff/Admin)
app.post('/api/auth/register', (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Full name is required.' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email address is required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const existingUser = db.findUserByEmail(email.trim());
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists. Please log in.' });
    }

    const newUser: User = {
      id: 'usr-' + crypto.randomUUID().slice(0, 8),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || '+1 (555) 000-0000',
      role: 'CUSTOMER', // Strict: always CUSTOMER for public signup
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString(),
      membershipTier: 'Standard',
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}&backgroundColor=0f172a&textColor=ccff00`
    };

    db.createUser(newUser);
    const token = db.createSession(newUser.id);

    const { passwordHash: _, ...userSafe } = newUser;
    return res.status(201).json({
      message: 'Registration successful! Welcome to Rally Club.',
      user: userSafe,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal server error during registration.' });
  }
});

// Login
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email is required.' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Password is required.' });
    }

    const user = db.findUserByEmail(email.trim());
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password. Please check your credentials.' });
    }

    const inputHash = hashPassword(password);
    if (user.passwordHash !== inputHash) {
      return res.status(401).json({ error: 'Invalid email or password. Please check your credentials.' });
    }

    const token = db.createSession(user.id);
    const { passwordHash: _, ...userSafe } = user;

    return res.json({
      message: 'Login successful.',
      user: userSafe,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error during login.' });
  }
});

// Get current logged-in user profile
app.get('/api/auth/me', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const { passwordHash: _, ...userSafe } = req.user!;
  res.json({ user: userSafe });
});

// Forgot password
app.post('/api/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email || !email.trim()) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const user = db.findUserByEmail(email.trim());
  if (!user) {
    // For security, do not leak whether email exists or not
    return res.json({
      message: 'If an account matches that email, a password reset link has been dispatched.'
    });
  }

  const resetToken = db.createPasswordReset(user.email);
  return res.json({
    message: 'Password reset link dispatched.',
    // Returning resetToken in response allows user to immediately click or test the reset flow
    resetToken,
    expiresIn: '60 minutes'
  });
});

// Reset password
app.post('/api/auth/reset-password', (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Token and new password are required.' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  const email = db.verifyAndConsumeResetToken(token);
  if (!email) {
    return res.status(400).json({ error: 'Invalid or expired password reset link.' });
  }

  const user = db.findUserByEmail(email);
  if (!user) {
    return res.status(404).json({ error: 'User account not found.' });
  }

  db.updateUser(user.id, { passwordHash: hashPassword(newPassword) });
  return res.json({ message: 'Password has been reset successfully. Please log in with your new password.' });
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token) {
    db.revokeSession(token);
  }
  return res.json({ message: 'Logged out successfully.' });
});

// -------------------------------------------------------------
// COURTS API ROUTES
// -------------------------------------------------------------

app.get('/api/courts', (req, res) => {
  const courts = db.getCourts();
  res.json({ courts });
});

app.patch('/api/courts/:id', authenticateToken, requireRole(['ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  const updatedCourt = db.updateCourt(id, updates);
  if (!updatedCourt) {
    return res.status(404).json({ error: 'Court not found' });
  }
  res.json({ court: updatedCourt, message: 'Court details updated successfully.' });
});

// -------------------------------------------------------------
// AVAILABILITY CALCULATION & COLLISION DETECTION
// -------------------------------------------------------------

function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(totalMin: number): string {
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

app.get('/api/availability', (req, res) => {
  const sport = (req.query.sport as SportType) || 'padel';
  const date = (req.query.date as string) || new Date().toISOString().split('T')[0];
  const duration = parseInt((req.query.duration as string) || '60', 10) as 60 | 90 | 120;

  const courts = db.getCourts().filter(c => c.sport === sport && c.isActive);
  const bookings = db.getBookings().filter(b => b.date === date && b.status !== 'Cancelled');
  const blocks = db.getCourtBlocks().filter(blk => blk.date === date);
  const settings = db.getSettings();

  const startMin = timeToMinutes(settings.openingTime); // 07:00 = 420
  const endMin = timeToMinutes(settings.closingTime); // 23:00 = 1380
  const peakStartMin = timeToMinutes(settings.peakStartHour); // 17:00 = 1020
  const peakEndMin = timeToMinutes(settings.peakEndHour); // 22:00 = 1320

  // 30-minute interval slots
  const slots: any[] = [];

  for (let t = startMin; t + duration <= endMin; t += 30) {
    const slotStart = minutesToTime(t);
    const slotEnd = minutesToTime(t + duration);
    const isPeak = t >= peakStartMin && t < peakEndMin;

    const courtAvailability = courts.map(court => {
      // Check collision with bookings
      const bookingConflict = bookings.find(b => {
        if (b.courtId !== court.id) return false;
        const bStart = timeToMinutes(b.startTime);
        const bEnd = timeToMinutes(b.endTime);
        return Math.max(t, bStart) < Math.min(t + duration, bEnd);
      });

      // Check collision with court blocks
      const blockConflict = blocks.find(blk => {
        if (blk.courtId !== court.id) return false;
        const blkStart = timeToMinutes(blk.startTime);
        const blkEnd = timeToMinutes(blk.endTime);
        return Math.max(t, blkStart) < Math.min(t + duration, blkEnd);
      });

      const isAvailable = !bookingConflict && !blockConflict;
      const hourlyRate = isPeak ? court.peakHourlyRate : court.hourlyRate;
      const price = (hourlyRate * (duration / 60));

      return {
        courtId: court.id,
        courtName: court.name,
        courtType: court.type,
        isAvailable,
        reason: blockConflict ? `Blocked: ${blockConflict.reason}` : (bookingConflict ? 'Booked' : null),
        price,
        isPeak
      };
    });

    slots.push({
      startTime: slotStart,
      endTime: slotEnd,
      isPeak,
      availableCourtsCount: courtAvailability.filter(c => c.isAvailable).length,
      totalCourtsCount: courts.length,
      courts: courtAvailability
    });
  }

  res.json({
    sport,
    date,
    duration,
    courts,
    slots,
    settings
  });
});

// -------------------------------------------------------------
// BOOKINGS API ROUTES (Real-time collision guard)
// -------------------------------------------------------------

// List bookings
app.get('/api/bookings', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  let bookings = db.getBookings();

  // If customer, only return their own bookings
  if (user.role === 'CUSTOMER') {
    bookings = bookings.filter(b => b.userId === user.id);
  } else {
    // Staff/Admin can filter by date, sport, status, courtId
    const { date, sport, status, courtId } = req.query;
    if (date) bookings = bookings.filter(b => b.date === date);
    if (sport) bookings = bookings.filter(b => b.sport === sport);
    if (status) bookings = bookings.filter(b => b.status === status);
    if (courtId) bookings = bookings.filter(b => b.courtId === courtId);
  }

  // Sort by date desc, time desc
  bookings.sort((a, b) => {
    const cmp = b.date.localeCompare(a.date);
    if (cmp !== 0) return cmp;
    return b.startTime.localeCompare(a.startTime);
  });

  res.json({ bookings });
});

// Get single booking
app.get('/api/bookings/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const booking = db.getBookingById(id);
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  // Customer can only view their own
  if (req.user!.role === 'CUSTOMER' && booking.userId !== req.user!.id) {
    return res.status(403).json({ error: 'Unauthorized to view this booking' });
  }

  res.json({ booking });
});

// Create booking with server-side double booking prevention
app.post('/api/bookings', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const {
      courtId,
      date,
      startTime,
      durationMinutes,
      playersCount = 4,
      racketRentalCount = 0,
      ballTubeCount = 0,
      notes = '',
      paymentMethod = 'Razorpay'
    } = req.body;

    if (!courtId || !date || !startTime || !durationMinutes) {
      return res.status(400).json({ error: 'Court, date, start time, and duration are required.' });
    }

    const court = db.getCourtById(courtId);
    if (!court || !court.isActive) {
      return res.status(404).json({ error: 'Selected court is invalid or inactive.' });
    }

    const parsedDuration = parseInt(durationMinutes, 10);
    if (![60, 90, 120].includes(parsedDuration)) {
      return res.status(400).json({ error: 'Duration must be 60, 90, or 120 minutes.' });
    }

    const startMin = timeToMinutes(startTime);
    const endMin = startMin + parsedDuration;
    const endTime = minutesToTime(endMin);

    const settings = db.getSettings();
    const clubOpenMin = timeToMinutes(settings.openingTime);
    const clubCloseMin = timeToMinutes(settings.closingTime);

    if (startMin < clubOpenMin || endMin > clubCloseMin) {
      return res.status(400).json({
        error: `Bookings are only permitted within club operating hours (${settings.openingTime} - ${settings.closingTime}).`
      });
    }

    // SERVER-SIDE CONCURRENCY & DOUBLE-BOOKING PREVENTION
    const existingBookings = db.getBookings().filter(b => b.date === date && b.courtId === courtId && b.status !== 'Cancelled');
    const hasBookingConflict = existingBookings.some(b => {
      const bStart = timeToMinutes(b.startTime);
      const bEnd = timeToMinutes(b.endTime);
      return Math.max(startMin, bStart) < Math.min(endMin, bEnd);
    });

    if (hasBookingConflict) {
      return res.status(409).json({
        error: `Conflict detected: Court ${court.name} is already reserved during ${startTime} - ${endTime} on ${date}. Please select an alternate slot or court.`
      });
    }

    // Check staff blocks
    const existingBlocks = db.getCourtBlocks().filter(blk => blk.date === date && blk.courtId === courtId);
    const hasBlockConflict = existingBlocks.some(blk => {
      const blkStart = timeToMinutes(blk.startTime);
      const blkEnd = timeToMinutes(blk.endTime);
      return Math.max(startMin, blkStart) < Math.min(endMin, blkEnd);
    });

    if (hasBlockConflict) {
      return res.status(409).json({
        error: `Court is reserved by club staff for maintenance or private coaching at that time.`
      });
    }

    // Pricing calculation
    const peakStartMin = timeToMinutes(settings.peakStartHour);
    const peakEndMin = timeToMinutes(settings.peakEndHour);
    const isPeak = startMin >= peakStartMin && startMin < peakEndMin;

    const hourlyRate = isPeak ? court.peakHourlyRate : court.hourlyRate;
    const courtSubtotal = hourlyRate * (parsedDuration / 60);
    const peakSurcharge = isPeak ? (court.peakHourlyRate - court.hourlyRate) * (parsedDuration / 60) : 0;
    const rentalsTotal = (racketRentalCount * settings.racketRentalPrice) + (ballTubeCount * settings.ballTubePrice);
    const totalAmount = parseFloat((courtSubtotal + rentalsTotal).toFixed(2));

    const bookingId = 'RC-BK-2026-' + Math.floor(1000 + Math.random() * 9000);
    const transactionRef = 'RC-TXN-' + Math.floor(10000 + Math.random() * 90000);

    const paymentStatus = paymentMethod === 'Cash at Front Desk' ? 'Pay at Venue' : 'Paid';

    const newBooking: Booking = {
      id: bookingId,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      userPhone: user.phone || '',
      courtId: court.id,
      courtName: court.name,
      sport: court.sport,
      date,
      startTime,
      endTime,
      durationMinutes: parsedDuration as 60 | 90 | 120,
      playersCount: Number(playersCount),
      racketRentalCount: Number(racketRentalCount),
      ballTubeCount: Number(ballTubeCount),
      notes: notes?.trim() || undefined,
      totalAmount,
      peakHourSurcharge: parseFloat(peakSurcharge.toFixed(2)),
      paymentStatus,
      paymentMethod,
      transactionReference: transactionRef,
      status: 'Confirmed',
      createdAt: new Date().toISOString()
    };

    db.createBooking(newBooking);

    return res.status(201).json({
      message: 'Booking confirmed successfully!',
      booking: newBooking
    });
  } catch (error) {
    console.error('Create booking error:', error);
    return res.status(500).json({ error: 'Failed to process booking.' });
  }
});

// Reschedule booking
app.patch('/api/bookings/:id/reschedule', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { newDate, newStartTime, durationMinutes } = req.body;
  const user = req.user!;

  const booking = db.getBookingById(id);
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  // Authorization check
  if (user.role === 'CUSTOMER' && booking.userId !== user.id) {
    return res.status(403).json({ error: 'Unauthorized to modify this reservation' });
  }

  // Cancellation / Reschedule policy check for customers
  if (user.role === 'CUSTOMER') {
    const bookingDateTime = new Date(`${booking.date}T${booking.startTime}:00`);
    const diffHours = (bookingDateTime.getTime() - Date.now()) / (1000 * 60 * 60);
    const settings = db.getSettings();
    if (diffHours < settings.cancellationCutoffHours) {
      return res.status(400).json({
        error: `Rescheduling is permitted up to ${settings.cancellationCutoffHours} hours before start time. Please call the front desk.`
      });
    }
  }

  const duration = durationMinutes || booking.durationMinutes;
  const startMin = timeToMinutes(newStartTime);
  const endMin = startMin + duration;
  const newEndTime = minutesToTime(endMin);

  // Check collision on new slot
  const conflicts = db.getBookings().filter(b =>
    b.id !== id &&
    b.courtId === booking.courtId &&
    b.date === newDate &&
    b.status !== 'Cancelled'
  );

  const hasConflict = conflicts.some(b => {
    const bStart = timeToMinutes(b.startTime);
    const bEnd = timeToMinutes(b.endTime);
    return Math.max(startMin, bStart) < Math.min(endMin, bEnd);
  });

  if (hasConflict) {
    return res.status(409).json({ error: 'The newly requested time slot is not available. Please choose another time.' });
  }

  const updated = db.updateBooking(id, {
    date: newDate,
    startTime: newStartTime,
    endTime: newEndTime,
    durationMinutes: duration,
    rescheduledFrom: `${booking.date} ${booking.startTime}`
  });

  res.json({ message: 'Reservation rescheduled successfully!', booking: updated });
});

// Cancel booking
app.post('/api/bookings/:id/cancel', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const user = req.user!;
  const booking = db.getBookingById(id);

  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  if (user.role === 'CUSTOMER' && booking.userId !== user.id) {
    return res.status(403).json({ error: 'Unauthorized to cancel this booking' });
  }

  let refundStatus: PaymentStatus = booking.paymentStatus;
  if (booking.paymentStatus === 'Paid') {
    refundStatus = 'Refunded';
  }

  const updated = db.updateBooking(id, {
    status: 'Cancelled',
    paymentStatus: refundStatus
  });

  res.json({
    message: 'Booking cancelled successfully. Refund/Credit logged to account.',
    booking: updated
  });
});

// Update payment status (Staff/Admin)
app.patch('/api/bookings/:id/payment', authenticateToken, requireRole(['STAFF', 'ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { paymentStatus, paymentMethod } = req.body;

  const booking = db.getBookingById(id);
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  const updated = db.updateBooking(id, {
    paymentStatus: paymentStatus || booking.paymentStatus,
    paymentMethod: paymentMethod || booking.paymentMethod
  });

  res.json({ message: 'Payment status updated', booking: updated });
});

// Check-in player (Staff/Admin)
app.post('/api/bookings/:id/check-in', authenticateToken, requireRole(['STAFF', 'ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const booking = db.getBookingById(id);
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  const updated = db.updateBooking(id, { status: 'Checked-In' });
  res.json({ message: `Player ${booking.userName} checked in for Court ${booking.courtName}`, booking: updated });
});

// -------------------------------------------------------------
// COURT BLOCKS API (Staff & Admin)
// -------------------------------------------------------------

app.get('/api/court-blocks', authenticateToken, requireRole(['STAFF', 'ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  const { date } = req.query;
  let blocks = db.getCourtBlocks();
  if (date) {
    blocks = blocks.filter(b => b.date === date);
  }
  res.json({ blocks });
});

app.post('/api/court-blocks', authenticateToken, requireRole(['STAFF', 'ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  const { courtId, date, startTime, endTime, reason, notes } = req.body;
  if (!courtId || !date || !startTime || !endTime || !reason) {
    return res.status(400).json({ error: 'Court, date, start time, end time, and reason are required.' });
  }

  const newBlock: CourtBlock = {
    id: 'blk-' + crypto.randomUUID().slice(0, 8),
    courtId,
    date,
    startTime,
    endTime,
    reason,
    notes,
    createdBy: req.user!.name,
    createdAt: new Date().toISOString()
  };

  db.addCourtBlock(newBlock);
  res.status(201).json({ message: 'Court slot blocked successfully', block: newBlock });
});

app.delete('/api/court-blocks/:id', authenticateToken, requireRole(['STAFF', 'ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const removed = db.removeCourtBlock(id);
  if (!removed) {
    return res.status(404).json({ error: 'Block record not found' });
  }
  res.json({ message: 'Court block lifted successfully' });
});

// -------------------------------------------------------------
// ADMIN OPERATIONS & USER MANAGEMENT
// -------------------------------------------------------------

// List all users (Admin only)
app.get('/api/admin/users', authenticateToken, requireRole(['ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  const raw = db.getRawData();
  const bookings = db.getBookings();

  const usersWithStats = raw.users.map(u => {
    const { passwordHash: _, ...safe } = u;
    const userBookings = bookings.filter(b => b.userId === u.id);
    const totalSpent = userBookings
      .filter(b => b.paymentStatus === 'Paid')
      .reduce((sum, b) => sum + b.totalAmount, 0);

    return {
      ...safe,
      bookingCount: userBookings.length,
      totalSpent
    };
  });

  res.json({ users: usersWithStats });
});

// Provision new Staff or Admin user (Admin only)
app.post('/api/admin/users', authenticateToken, requireRole(['ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  const { name, email, password, role, phone } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Name, email, password, and role are required' });
  }

  if (!['STAFF', 'ADMIN', 'CUSTOMER'].includes(role)) {
    return res.status(400).json({ error: 'Role must be STAFF, ADMIN, or CUSTOMER' });
  }

  const existing = db.findUserByEmail(email);
  if (existing) {
    return res.status(409).json({ error: 'A user with this email already exists' });
  }

  const newUser: User = {
    id: 'usr-' + crypto.randomUUID().slice(0, 8),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone || '',
    role,
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
    membershipTier: role === 'ADMIN' ? 'Founders Club' : 'Padel Pro'
  };

  db.createUser(newUser);
  const { passwordHash: _, ...userSafe } = newUser;
  res.status(201).json({ message: `${role} account provisioned successfully!`, user: userSafe });
});

// Update user role or profile (Admin only)
app.patch('/api/admin/users/:id', authenticateToken, requireRole(['ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { role, membershipTier } = req.body;

  if (id === req.user!.id && role && role !== 'ADMIN') {
    return res.status(400).json({ error: 'You cannot demote your own administrator account.' });
  }

  const updated = db.updateUser(id, { role, membershipTier });
  if (!updated) {
    return res.status(404).json({ error: 'User not found' });
  }

  const { passwordHash: _, ...userSafe } = updated;
  res.json({ message: 'User updated successfully', user: userSafe });
});

// Admin Analytics
app.get('/api/admin/analytics', authenticateToken, requireRole(['ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  const bookings = db.getBookings();
  const courts = db.getCourts();
  const users = db.getRawData().users;

  const validBookings = bookings.filter(b => b.status !== 'Cancelled');
  const totalRevenue = validBookings
    .filter(b => b.paymentStatus === 'Paid')
    .reduce((sum, b) => sum + b.totalAmount, 0);

  const pendingRevenue = validBookings
    .filter(b => b.paymentStatus === 'Pending' || b.paymentStatus === 'Pay at Venue')
    .reduce((sum, b) => sum + b.totalAmount, 0);

  const padelBookings = validBookings.filter(b => b.sport === 'padel');
  const pickleballBookings = validBookings.filter(b => b.sport === 'pickleball');

  // Utilization per court
  const courtStats = courts.map(court => {
    const courtBks = validBookings.filter(b => b.courtId === court.id);
    const revenue = courtBks.reduce((sum, b) => sum + b.totalAmount, 0);
    const totalHours = courtBks.reduce((sum, b) => sum + b.durationMinutes / 60, 0);
    return {
      courtId: court.id,
      courtName: court.name,
      sport: court.sport,
      bookingCount: courtBks.length,
      totalHours,
      revenue
    };
  });

  res.json({
    totalRevenue,
    pendingRevenue,
    totalBookingsCount: validBookings.length,
    padelBookingsCount: padelBookings.length,
    pickleballBookingsCount: pickleballBookings.length,
    totalMembers: users.length,
    courtStats
  });
});

// Club Settings
app.get('/api/admin/settings', authenticateToken, requireRole(['ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  res.json({ settings: db.getSettings() });
});

app.patch('/api/admin/settings', authenticateToken, requireRole(['ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  const updated = db.updateSettings(req.body);
  res.json({ message: 'Club settings updated successfully', settings: updated });
});

// -------------------------------------------------------------
// VITE INTEGRATION & SERVER STARTUP
// -------------------------------------------------------------

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🎾 Rally Club Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
