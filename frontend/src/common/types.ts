// ─── Domain types (mirror com.spms.common.enums) ─────────────

export type VehicleType   = 'STANDARD' | 'MOTORCYCLE' | 'LARGE';
export type SlotStatus    = 'AVAILABLE' | 'RESERVED' | 'OCCUPIED' | 'OUT_OF_SERVICE';
export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
export type Role          = 'USER' | 'ADMIN';
export type AccountStatus = 'ACTIVE' | 'INACTIVE' | 'LOCKED';
export type PaymentStatus = 'PAID' | 'PENDING' | 'FAILED' | 'REFUNDED';

// ─── Auth / User ──────────────────────────────────────────────

export interface User {
  id:            number;
  username:      string;
  email:         string;
  phone?:        string;
  role:          Role;
  vehicleType?:  VehicleType;
  vehicleNumber?: string;
  accountStatus: AccountStatus;
}

// ─── Auth API shapes ──────────────────────────────────────────

export interface RegisterPayload {
  username:      string;
  password:      string;
  email:         string;
  phone?:        string;
  vehicleType?:  VehicleType;
  vehicleNumber?: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface AuthResponse {
  token:     string;
  tokenType: string;   // "Bearer"
  expiresIn: number;   // seconds
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

// ─── Error envelope (backend: { error, message }) ────────────

export interface ApiError {
  error:   string;
  message: string;
}

// ─── Paginated response wrapper ───────────────────────────────

export interface Page<T> {
  content:          T[];
  totalElements:    number;
  totalPages:       number;
  number:           number;   // current page (0-indexed)
  size:             number;
}

// ─── Parking Module ───────────────────────────────────────────

export interface ParkingLot {
  id: number;
  lotName: string;
  location: string;
  totalCapacity: number;
  status: string;
}

export interface ParkingSlot {
  id: number;
  lotId: number;
  slotNumber: string;
  slotType: VehicleType;
  status: SlotStatus;
}

// ─── Reservation Module ──────────────────────────────────────

export interface Reservation {
  id:            number;
  userId:        number;
  slotId:        number;
  slotNumber:    string;
  lotName:       string;
  startTime:     string;   // ISO 8601
  endTime:       string;
  status:        ReservationStatus;
  vehicleNumber?: string;
  createdDate:   string;
}

export interface CreateReservationPayload {
  slotId:         number;
  startTime:      string;
  endTime:        string;
  vehicleNumber?: string;
}

// ─── Billing Module ──────────────────────────────────────────

export interface Transaction {
  id:              number;
  reservationId:   number;
  userId:          number;
  slotNumber:      string;
  lotName:         string;
  checkInTime:     string;
  checkOutTime?:   string;
  durationMinutes?: number;
  amount?:         number;
  paymentStatus:   PaymentStatus;
  createdDate:     string;
}

// ─── Reporting Module ────────────────────────────────────────

export interface RevenueReport {
  totalRevenue:      number;
  totalTransactions: number;
  averageFee:        number;
  fromDate:          string;
  toDate:            string;
}

export interface OccupancyReport {
  lotId:           number;
  lotName:         string;
  totalCapacity:   number;
  occupiedSlots:   number;
  availableSlots:  number;
  occupancyPercent: number;
}
// ─── Reservation Module ───────────────────────────────────────

export interface Reservation {
  id: number;
  slotId: number;
  startTime: string;
  endTime: string;
  checkInTime: string | null;
  status: ReservationStatus;
  createdDate: string;
}

export interface CreateReservationPayload {
  slotId: number;
  startTime: string;        // ISO-8601
  durationMinutes: number;
}

export interface CancelResponse {
  cancelled: boolean;
  feeApplied: boolean;
}

export interface TransactionResult {
  totalFee: number;
  receiptId: number;
}

export interface CheckOutResponse {
  reservation: Reservation;
  transaction: TransactionResult;
}

