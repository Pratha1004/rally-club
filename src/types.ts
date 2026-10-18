export type UserRole = 'CUSTOMER' | 'STAFF' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
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
  hourlyRate: number;
  peakHourlyRate: number;
  image: string;
  features: string[];
  isActive: boolean;
  description: string;
}

export type BookingStatus = 'Confirmed' | 'Checked-In' | 'Completed' | 'Cancelled';
export type PaymentStatus = 'Paid' | 'Pending' | 'Pay at Venue' | 'Refunded';
export type PaymentMethod = 'Razorpay' | 'Card' | 'UPI' | 'Cash at Front Desk' | 'Club Credit';

export interface Booking {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  courtId: string;
  courtName: string;
  sport: SportType;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  durationMinutes: 60 | 90 | 120;
  playersCount: number;
  racketRentalCount: number;
  ballTubeCount: number;
  notes?: string;
  totalAmount: number;
  peakHourSurcharge: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  transactionReference: string;
  status: BookingStatus;
  createdAt: string;
  rescheduledFrom?: string;
}

export interface CourtBlock {
  id: string;
  courtId: string;
  date: string;
  startTime: string;
  endTime: string;
  reason: 'Maintenance' | 'Club Tournament' | 'Pro Coaching Clinic' | 'Staff Reserved';
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export interface ClubSettings {
  clubName: string;
  openingTime: string;
  closingTime: string;
  peakStartHour: string;
  peakEndHour: string;
  peakSurchargePercent: number;
  racketRentalPrice: number;
  ballTubePrice: number;
  cancellationCutoffHours: number;
  whatsappNotificationsEnabled: boolean;
  supportPhone: string;
  address: string;
}

export interface SlotCourtAvailability {
  courtId: string;
  courtName: string;
  courtType: string;
  isAvailable: boolean;
  reason: string | null;
  price: number;
  isPeak: boolean;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  isPeak: boolean;
  availableCourtsCount: number;
  totalCourtsCount: number;
  courts: SlotCourtAvailability[];
}

export interface AvailabilityResponse {
  sport: SportType;
  date: string;
  duration: number;
  courts: Court[];
  slots: TimeSlot[];
  settings: ClubSettings;
}

export interface DemoAccount {
  role: UserRole;
  name: string;
  email: string;
  password: string;
  description: string;
}
