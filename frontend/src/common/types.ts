export type VehicleType   = 'STANDARD' | 'MOTORCYCLE' | 'LARGE';
export type SlotStatus    = 'AVAILABLE' | 'RESERVED' | 'OCCUPIED' | 'OUT_OF_SERVICE';
export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
export type Role          = 'USER' | 'ADMIN';
export type AccountStatus = 'ACTIVE' | 'INACTIVE' | 'LOCKED';
export type PaymentStatus = 'PAID' | 'PENDING' | 'FAILED' | 'REFUNDED';

export interface User {
  id:             number;
  username:       string;
  email:          string;
  phone?:         string;
  role:           Role;
  vehicleType?:   VehicleType;
  vehicleNumber?: string;
  accountStatus:  AccountStatus;
}

export interface RegisterPayload {
  username:       string;
  password:       string;
  email:          string;
  phone?:         string;
  vehicleType?:   VehicleType;
  vehicleNumber?: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface AuthResponse {
  token:     string;
  tokenType: string;
  expiresIn: number;
  user:      User;
}

export interface UpdateProfilePayload {
  email?:         string;
  phone?:         string;
  vehicleType?:   VehicleType;
  vehicleNumber?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword:     string;
  confirmPassword: string;
}

export interface ApiError {
  error:   string;
  message: string;
}

export interface Page<T> {
  content:       T[];
  totalElements: number;
  totalPages:    number;
  number:        number;
  size:          number;
}

export interface ParkingLot {
  id:            number;
  lotName:       string;
  location:      string;
  totalCapacity: number;
  status:        string;
}

export interface ParkingSlot {
  id:         number;
  lotId:      number;
  slotNumber: string;
  slotType:   VehicleType;
  status:     SlotStatus;
}

export interface CreateParkingLotPayload {
  lotName:       string;
  location:      string;
  totalCapacity: number;
}

export interface UpdateParkingLotPayload {
  lotName?:       string;
  location?:      string;
  totalCapacity?: number;
}

export interface CreateParkingSlotPayload {
  slotNumber: string;
  slotType:   VehicleType;
}

export interface UpdateSlotStatusPayload {
  status: SlotStatus;
}

export interface Reservation {
  id:             number;
  userId:         number;
  slotId:         number;
  slotNumber:     string;
  lotName:        string;
  startTime:      string;
  endTime:        string;
  checkInTime?:   string | null;
  checkOutTime?:  string | null;
  status:         ReservationStatus;
  vehicleNumber?: string;
  vehicleType?:   VehicleType;
  totalFee?:      number | null;
  createdDate:    string;
}

export interface CreateReservationPayload {
  slotId:         number;
  startTime:      string;
  endTime:        string;
  vehicleNumber?: string;
}

export interface CancelResponse {
  cancelled:  boolean;
  feeApplied: boolean;
}

export interface CheckOutResponse {
  reservationId:     number;
  transactionId:     number;
  slotNumber:        string;
  lotName:           string;
  vehicleNumber?:    string;
  vehicleType:       string;
  checkInTime:       string;
  checkOutTime:      string;
  durationMinutes:   number;
  billedHours:       number;
  baseRate:          number;
  extendedRate:      number;
  vehicleMultiplier: number;
  subtotal:          number;
  dailyCap:          number;
  totalFee:          number;
  currency:          string;
}

export interface PricingConfig {
  id:                   number;
  baseHourlyRate:       number;
  extendedHourlyRate:   number;
  baseHoursThreshold:   number;
  dailyMaxCap:          number;
  motorcycleMultiplier: number;
  standardMultiplier:   number;
  largeMultiplier:      number;
}

export interface AuditLog {
  id:            number;
  adminId:       number;
  adminUsername: string;
  actionType:    string;
  targetEntity:  string;
  details:       string;
  timestamp:     string;
}

export interface UtilizationReport {
  totalReservations:     number;
  completedReservations: number;
  cancelledReservations: number;
  noShowReservations:    number;
  avgDurationMinutes:    number;
  occupancyRatePercent:  number;
}

export interface RevenueReport {
  totalRevenue:        number;
  totalTransactions:   number;
  avgTransactionValue: number;
  dailyRevenue:        Record<string, number>;
}

export interface PeakHoursReport {
  hourlyDistribution:     Record<number, number>;
  dayOfWeekDistribution: Record<string, number>;
  peakHour:               number;
  peakDay:                string;
}

export interface AdminResetPasswordPayload {
  newPassword: string;
}
