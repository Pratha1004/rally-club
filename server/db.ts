import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export type UserRole = 'CUSTOMER' | 'STAFF' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  passwordHash: string;
  createdAt: string;
  avatarUrl?: string;
  membershipTier?: 'Standard' | 'Padel Pro' | 'Founders Club';
}

export type SportType = 'padel' | 'pickleball';

export interface Court {
  id: string;
  name: string;
  sport: SportType;
  type: 'Indoor' | 'Outdoor' | 'Covered';
  surface: string;
  glassType?: string;
  lighting: string;
  hourlyRate: number; // e.g. 55 or 75
  peakHourlyRate: number; // e.g. 70 or 95
  image: string;
  features: string[];
  isActive: boolean;
  description: string;
}

export type BookingStatus = 'Confirmed' | 'Checked-In' | 'Completed' | 'Cancelled';
export type PaymentStatus = 'Paid' | 'Pending' | 'Pay at Venue' | 'Refunded';
export type PaymentMethod = 'Razorpay' | 'Card' | 'UPI' | 'Cash at Front Desk' | 'Club Credit';

export interface Booking {
  id: string; // e.g. RC-2026-1042
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  courtId: string;
  courtName: string;
  sport: SportType;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm (e.g. "09:00", "17:30")
  endTime: string; // HH:mm (e.g. "10:30")
  durationMinutes: 60 | 90 | 120;
  playersCount: number;
  racketRentalCount: number;
  ballTubeCount: number;
  notes?: string;
  totalAmount: number;
  peakHourSurcharge: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  transactionReference: string; // e.g. RC-TXN-90218
  status: BookingStatus;
  createdAt: string;
  rescheduledFrom?: string;
}

export interface CourtBlock {
  id: string;
  courtId: string;
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  reason: 'Maintenance' | 'Club Tournament' | 'Pro Coaching Clinic' | 'Staff Reserved';
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export interface ClubSettings {
  clubName: string;
  openingTime: string; // "07:00"
  closingTime: string; // "23:00"
  peakStartHour: string; // "17:00"
  peakEndHour: string; // "22:00"
  peakSurchargePercent: number; // 20
  racketRentalPrice: number; // 6
  ballTubePrice: number; // 8
  cancellationCutoffHours: number; // 6
  whatsappNotificationsEnabled: boolean;
  supportPhone: string;
  address: string;
}

interface DatabaseSchema {
  users: User[];
  sessions: { token: string; userId: string; expiresAt: string }[];
  resetTokens: { token: string; email: string; expiresAt: string }[];
  courts: Court[];
  bookings: Booking[];
  courtBlocks: CourtBlock[];
  settings: ClubSettings;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'rallyclub-db.json');

// Helper to hash passwords using SHA-256 with salt
export function hashPassword(password: string): string {
  const salt = 'rally_club_salt_2026_sec';
  return crypto.createHmac('sha256', salt).update(password).digest('hex');
}

// Generate realistic today/tomorrow dates for seeded bookings
function getDateOffset(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
}

const INITIAL_COURTS: Court[] = [
  {
    id: 'court-padel-1',
    name: 'The Grand Panoramic Court 1',
    sport: 'padel',
    type: 'Indoor',
    surface: 'Mondo Supercourt XN (World Padel Tour Spec)',
    glassType: '12mm Panoramic Tempered Glass',
    lighting: '8-unit Lumiance 3000K Anti-glare LED (1000 Lux)',
    hourlyRate: 65,
    peakHourlyRate: 85,
    image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=1200&q=80',
    features: ['Panoramic 360 Glass', 'World Padel Tour Turf', 'HD Camera & Replay', 'Climate Controlled AC'],
    isActive: true,
    description: 'Our flagship indoor panoramic padel stadium with zero corner pillar obstruction and tournament acoustic dampening.'
  },
  {
    id: 'court-padel-2',
    name: 'The Obsidian Arena Court 2',
    sport: 'padel',
    type: 'Indoor',
    surface: 'Italian Monofilament Blue Turf',
    glassType: '12mm Structural Safety Glass',
    lighting: 'Linear LED Track 850 Lux',
    hourlyRate: 60,
    peakHourlyRate: 78,
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80',
    features: ['Matte Black Steel Frame', 'Acoustic Soundproofing', 'Digital Scoreboard', 'Lounge Seating'],
    isActive: true,
    description: 'A striking dark-aesthetic indoor court designed for high-focus competitive sets and night leagues.'
  },
  {
    id: 'court-padel-3',
    name: 'The Terrace Court 3',
    sport: 'padel',
    type: 'Covered',
    surface: 'Textured Polyethylene Turf with Ceramic Quartz',
    glassType: '10mm Wind-Engineered Glass',
    lighting: 'Phillips High-Bay LEDs',
    hourlyRate: 55,
    peakHourlyRate: 72,
    image: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=1200&q=80',
    features: ['Architectural Timber Canopy', 'Fresh Air Ventilation', 'Sunset Vantage Point', 'Court-side Hydration Bar'],
    isActive: true,
    description: 'Semi-outdoor covered court sheltered by curved timber rafters, combining open fresh air with weather protection.'
  },
  {
    id: 'court-pickle-1',
    name: 'Center Court Pickleball',
    sport: 'pickleball',
    type: 'Indoor',
    surface: 'DecoTurf 5-Layer Pro Cushion System',
    lighting: 'Pro-grade Diffused LED (900 Lux)',
    hourlyRate: 45,
    peakHourlyRate: 60,
    image: 'https://images.unsplash.com/photo-1599474924187-334a4ae5bd3c?auto=format&fit=crop&w=1200&q=80',
    features: ['Cushioned Acrylic Subfloor', 'Permanent Tournament Net', 'Spectator Bleachers', 'Line Precision Sensors'],
    isActive: true,
    description: 'Engineered for optimal ball bounce and zero joint fatigue with multi-layer cushioned tournament acrylic.'
  },
  {
    id: 'court-pickle-2',
    name: 'Skyline Terrace Pickleball',
    sport: 'pickleball',
    type: 'Outdoor',
    surface: 'Plexipave All-Weather Ultra Grip',
    lighting: 'Musco Sports Pole LEDs',
    hourlyRate: 40,
    peakHourlyRate: 55,
    image: 'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?auto=format&fit=crop&w=1200&q=80',
    features: ['Rooftop Panoramic Views', 'Wind Screens', 'Outdoor Audio System', 'Sunset Sessions'],
    isActive: true,
    description: 'Rooftop court overlooking the city skyline with professional wind fencing and twilight accent lighting.'
  },
  {
    id: 'court-pickle-3',
    name: 'The Academy Pickleball Court 3',
    sport: 'pickleball',
    type: 'Indoor',
    surface: 'Sport Court PowerGame+ Modular Surface',
    lighting: '800 Lux Overhead LED',
    hourlyRate: 42,
    peakHourlyRate: 56,
    image: 'https://images.unsplash.com/photo-1526676037777-05a232554f77?auto=format&fit=crop&w=1200&q=80',
    features: ['Lobster Ball Machine Integration', 'Video Coaching Mirroring', 'Target Grid Markers', 'Sound Isolation'],
    isActive: true,
    description: 'Dedicated training studio court equipped for automated drills, ball machine sessions, and certified coaching.'
  }
];

const INITIAL_SETTINGS: ClubSettings = {
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
};

function seedDatabase(): DatabaseSchema {
  const today = getDateOffset(0);
  const tomorrow = getDateOffset(1);
  const yesterday = getDateOffset(-1);

  const users: User[] = [
    {
      id: 'usr-customer-1',
      name: 'Alex Rivera',
      email: 'alex@rallyclub.com',
      phone: '+1 (555) 234-8901',
      role: 'CUSTOMER',
      passwordHash: hashPassword('RallyClub2026!'),
      createdAt: '2026-01-15T09:00:00Z',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      membershipTier: 'Padel Pro'
    },
    {
      id: 'usr-staff-1',
      name: 'Marcus Vance',
      email: 'marcus.staff@rallyclub.com',
      phone: '+1 (555) 456-7890',
      role: 'STAFF',
      passwordHash: hashPassword('RallyStaff2026!'),
      createdAt: '2026-01-10T08:00:00Z',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      membershipTier: 'Founders Club'
    },
    {
      id: 'usr-admin-1',
      name: 'Elena Rostova',
      email: 'elena.admin@rallyclub.com',
      phone: '+1 (555) 890-1234',
      role: 'ADMIN',
      passwordHash: hashPassword('RallyAdmin2026!'),
      createdAt: '2026-01-01T08:00:00Z',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
      membershipTier: 'Founders Club'
    },
    {
      id: 'usr-customer-2',
      name: 'David Chen',
      email: 'david.chen@example.com',
      phone: '+1 (555) 789-3321',
      role: 'CUSTOMER',
      passwordHash: hashPassword('RallyClub2026!'),
      createdAt: '2026-02-10T11:00:00Z',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      membershipTier: 'Standard'
    },
    {
      id: 'usr-customer-3',
      name: 'Sophie Martin',
      email: 'sophie.m@example.com',
      phone: '+1 (555) 654-9812',
      role: 'CUSTOMER',
      passwordHash: hashPassword('RallyClub2026!'),
      createdAt: '2026-02-18T14:30:00Z',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
      membershipTier: 'Padel Pro'
    }
  ];

  const bookings: Booking[] = [
    {
      id: 'RC-BK-2026-801',
      userId: 'usr-customer-1',
      userName: 'Alex Rivera',
      userEmail: 'alex@rallyclub.com',
      userPhone: '+1 (555) 234-8901',
      courtId: 'court-padel-1',
      courtName: 'The Grand Panoramic Court 1',
      sport: 'padel',
      date: today,
      startTime: '18:00',
      endTime: '19:30',
      durationMinutes: 90,
      playersCount: 4,
      racketRentalCount: 2,
      ballTubeCount: 1,
      notes: 'Please keep 2 left-handed Bullpadel rackets ready.',
      totalAmount: 147.5,
      peakHourSurcharge: 27.5,
      paymentStatus: 'Paid',
      paymentMethod: 'Razorpay',
      transactionReference: 'RC-TXN-98421',
      status: 'Confirmed',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: 'RC-BK-2026-802',
      userId: 'usr-customer-2',
      userName: 'David Chen',
      userEmail: 'david.chen@example.com',
      userPhone: '+1 (555) 789-3321',
      courtId: 'court-pickle-1',
      courtName: 'Center Court Pickleball',
      sport: 'pickleball',
      date: today,
      startTime: '10:00',
      endTime: '11:00',
      durationMinutes: 60,
      playersCount: 2,
      racketRentalCount: 0,
      ballTubeCount: 1,
      notes: 'Morning singles warm-up',
      totalAmount: 53.0,
      peakHourSurcharge: 0,
      paymentStatus: 'Pay at Venue',
      paymentMethod: 'Cash at Front Desk',
      transactionReference: 'RC-TXN-98422',
      status: 'Checked-In',
      createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 'RC-BK-2026-803',
      userId: 'usr-customer-3',
      userName: 'Sophie Martin',
      userEmail: 'sophie.m@example.com',
      userPhone: '+1 (555) 654-9812',
      courtId: 'court-padel-2',
      courtName: 'The Obsidian Arena Court 2',
      sport: 'padel',
      date: tomorrow,
      startTime: '19:30',
      endTime: '21:00',
      durationMinutes: 90,
      playersCount: 4,
      racketRentalCount: 0,
      ballTubeCount: 2,
      notes: 'Evening mixed doubles league prep',
      totalAmount: 133.0,
      peakHourSurcharge: 25.0,
      paymentStatus: 'Paid',
      paymentMethod: 'Card',
      transactionReference: 'RC-TXN-98423',
      status: 'Confirmed',
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
    },
    {
      id: 'RC-BK-2026-799',
      userId: 'usr-customer-1',
      userName: 'Alex Rivera',
      userEmail: 'alex@rallyclub.com',
      userPhone: '+1 (555) 234-8901',
      courtId: 'court-pickle-2',
      courtName: 'Skyline Terrace Pickleball',
      sport: 'pickleball',
      date: yesterday,
      startTime: '17:00',
      endTime: '18:00',
      durationMinutes: 60,
      playersCount: 4,
      racketRentalCount: 2,
      ballTubeCount: 1,
      totalAmount: 75.0,
      peakHourSurcharge: 15.0,
      paymentStatus: 'Paid',
      paymentMethod: 'UPI',
      transactionReference: 'RC-TXN-98400',
      status: 'Completed',
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
    }
  ];

  const courtBlocks: CourtBlock[] = [
    {
      id: 'blk-1',
      courtId: 'court-padel-1',
      date: today,
      startTime: '14:00',
      endTime: '16:00',
      reason: 'Pro Coaching Clinic',
      notes: 'Masterclass with head coach Carlos',
      createdBy: 'Marcus Vance',
      createdAt: new Date().toISOString()
    },
    {
      id: 'blk-2',
      courtId: 'court-padel-3',
      date: tomorrow,
      startTime: '08:00',
      endTime: '10:00',
      reason: 'Maintenance',
      notes: 'Turf quartz grooming & net tensioning',
      createdBy: 'Marcus Vance',
      createdAt: new Date().toISOString()
    }
  ];

  return {
    users,
    sessions: [],
    resetTokens: [],
    courts: INITIAL_COURTS,
    bookings,
    courtBlocks,
    settings: INITIAL_SETTINGS
  };
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Ensure courts and users exist
        if (parsed.users && parsed.courts && parsed.bookings) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error loading DB file, re-seeding:', e);
    }

    const seeded = seedDatabase();
    this.saveData(seeded);
    return seeded;
  }

  private saveData(data: DatabaseSchema): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  public getRawData(): DatabaseSchema {
    return this.data;
  }

  public persist(): void {
    this.saveData(this.data);
  }

  // --- Users & Auth ---
  public findUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public findUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public createUser(user: User): void {
    this.data.users.push(user);
    this.persist();
  }

  public updateUser(id: string, updates: Partial<User>): User | undefined {
    const user = this.findUserById(id);
    if (!user) return undefined;
    Object.assign(user, updates);
    this.persist();
    return user;
  }

  // --- Sessions ---
  public createSession(userId: string): string {
    const token = 'rc_sess_' + crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(); // 14 days
    // Remove stale sessions for user
    this.data.sessions = this.data.sessions.filter(s => s.userId !== userId || new Date(s.expiresAt) > new Date());
    this.data.sessions.push({ token, userId, expiresAt });
    this.persist();
    return token;
  }

  public verifySession(token: string): User | undefined {
    const session = this.data.sessions.find(s => s.token === token);
    if (!session) return undefined;
    if (new Date(session.expiresAt) <= new Date()) {
      this.data.sessions = this.data.sessions.filter(s => s.token !== token);
      this.persist();
      return undefined;
    }
    return this.findUserById(session.userId);
  }

  public revokeSession(token: string): void {
    this.data.sessions = this.data.sessions.filter(s => s.token !== token);
    this.persist();
  }

  // --- Password Reset ---
  public createPasswordReset(email: string): string {
    const token = 'rc_reset_' + crypto.randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour
    this.data.resetTokens = this.data.resetTokens.filter(r => r.email !== email);
    this.data.resetTokens.push({ token, email, expiresAt });
    this.persist();
    return token;
  }

  public verifyAndConsumeResetToken(token: string): string | null {
    const record = this.data.resetTokens.find(r => r.token === token);
    if (!record) return null;
    if (new Date(record.expiresAt) <= new Date()) {
      this.data.resetTokens = this.data.resetTokens.filter(r => r.token !== token);
      this.persist();
      return null;
    }
    this.data.resetTokens = this.data.resetTokens.filter(r => r.token !== token);
    this.persist();
    return record.email;
  }

  // --- Courts ---
  public getCourts(): Court[] {
    return this.data.courts;
  }

  public getCourtById(id: string): Court | undefined {
    return this.data.courts.find(c => c.id === id);
  }

  public updateCourt(id: string, updates: Partial<Court>): Court | undefined {
    const court = this.getCourtById(id);
    if (!court) return undefined;
    Object.assign(court, updates);
    this.persist();
    return court;
  }

  // --- Bookings ---
  public getBookings(): Booking[] {
    return this.data.bookings;
  }

  public getBookingById(id: string): Booking | undefined {
    return this.data.bookings.find(b => b.id === id);
  }

  public createBooking(booking: Booking): void {
    this.data.bookings.push(booking);
    this.persist();
  }

  public updateBooking(id: string, updates: Partial<Booking>): Booking | undefined {
    const booking = this.getBookingById(id);
    if (!booking) return undefined;
    Object.assign(booking, updates);
    this.persist();
    return booking;
  }

  // --- Court Blocks ---
  public getCourtBlocks(): CourtBlock[] {
    return this.data.courtBlocks;
  }

  public addCourtBlock(block: CourtBlock): void {
    this.data.courtBlocks.push(block);
    this.persist();
  }

  public removeCourtBlock(id: string): boolean {
    const initialLen = this.data.courtBlocks.length;
    this.data.courtBlocks = this.data.courtBlocks.filter(b => b.id !== id);
    if (this.data.courtBlocks.length !== initialLen) {
      this.persist();
      return true;
    }
    return false;
  }

  // --- Settings ---
  public getSettings(): ClubSettings {
    return this.data.settings;
  }

  public updateSettings(settings: Partial<ClubSettings>): ClubSettings {
    Object.assign(this.data.settings, settings);
    this.persist();
    return this.data.settings;
  }
}

export const db = new Database();
