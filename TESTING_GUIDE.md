# SPMS - Smart Parking Management System
## System Verification & Testing Guide

This guide provides step-by-step instructions for running, testing, and verifying the complete Smart Parking Management System (SPMS), including Docker deployment, user workflows, check-in/out processing, fee calculations, and administrative analytics.

---

### Execution Option A: Docker Compose (Single Command)

1. Open a terminal window in the project root directory.
2. Run the following command:
   ```bash
   docker compose up --build
   ```
3. Wait for the containers to build and start.
4. Access the web application at `http://localhost` (or `http://localhost:3000`).

---

### Execution Option B: Local Manual Start

#### 1. Start the Backend
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Launch Spring Boot:
   ```bash
   ./mvnw spring-boot:run
   ```
3. Backend starts at `http://localhost:8080/api/v1`.

#### 2. Start the Frontend
1. Open a second terminal window and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies and launch Vite:
   ```bash
   npm install
   npm run dev
   ```
3. Frontend starts at `http://localhost:5173`.

---

### Testing Workflows

#### 1. User Registration & Authentication
- **Registration**: Navigate to `/register` and submit the form with valid details (username, email, password, phone, vehicle type, and plate number). Verify inline validation works on invalid entries.
- **Login**: Navigate to `/login` and sign in with your credentials. Verify JWT token issuance and automatic redirect to `/dashboard`.
- **Brute-Force Protection**: Attempt to log in with an invalid password 3 consecutive times. Verify that on the 3rd failed attempt, the account enters a 15-minute locked state.

#### 2. Slot Selection & Reservation
- **Parking Map**: Go to `/parking`, select a parking lot, and choose an `AVAILABLE` (green) slot.
- **Booking**: Pick a date, start time, and duration (minimum 30 minutes, up to 30 days in advance). Submit the booking.
- **Conflict Prevention**: Try booking the exact same time window on the same slot with another account to confirm overlap rejection.

#### 3. Check-In & Check-Out Operations
- **Check-In**: Open `/reservations`, locate the active reservation, and click **Check In**. Verify that the slot status changes to `OCCUPIED` (red).
- **Check-Out & Receipt**: Click **Check Out & Pay**. Verify that:
  - Total parking duration is rounded up to the nearest hour.
  - Base hourly rate (৳40/hr for first 3h) and extended rate (৳30/hr) are applied.
  - Vehicle type multiplier (Motorcycle 0.5x, Standard 1.0x, Large 1.5x) is factored in.
  - An itemized digital receipt modal appears displaying the total fee in BDT (৳).
  - Slot status returns to `AVAILABLE` (green).

#### 4. Administrative Features
- **Login as Admin**: Sign in using username `admin` and password `admin123`.
- **Manage Lots & Slots**: Access `/admin/lots` and `/admin/slots` to create lots, add single or bulk slots, and set slots out-of-service.
- **Manage Users**: Access `/admin/users` to search accounts, toggle active/inactive status, or execute password resets.
- **Dynamic Pricing Configuration**: Access `/admin/pricing` to view and update base rates, extended rates, multipliers, and daily caps in BDT (৳).
- **Reporting & Analytics**: Access `/admin/reports` to inspect utilization metrics, revenue distribution, and 24-hour peak usage patterns.
- **Audit Logs**: Access `/admin/audit` to verify that administrative actions are recorded with timestamps and admin IDs.

#### 5. Session Timeout Verification
- Remain inactive without mouse or keyboard input on an authenticated session for 30 minutes. Verify that the session automatically expires and redirects to the login screen.
