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
