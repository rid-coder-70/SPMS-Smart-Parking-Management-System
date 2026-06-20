# SPMS — Smart Parking Management System
## End-to-End Testing Guide (A to Z)

This guide provides step-by-step instructions for starting the backend, starting the frontend, and testing the entire Authentication & User Profile flow (Module 1) with the new UI/UX.

---

### Phase 1: Start the Backend (Spring Boot)

1. Open a new terminal window.
2. Navigate to the backend directory:
   ```bash
   cd ~/Desktop/SPMS-Smart-Parking-Management-System/backend
   ```
3. Run the Spring Boot application using Maven:
   ```bash
   ./mvnw spring-boot:run
   ```
4. Wait for the application to start. You should see `Started SpmsApplication` in the logs. The backend is now running on `http://localhost:8080`.

---

### Phase 2: Start the Frontend (React / Vite)

1. Open a **second** new terminal window.
2. Navigate to the frontend directory:
   ```bash
   cd ~/Desktop/SPMS-Smart-Parking-Management-System/frontend
   ```
3. Make sure all dependencies are installed:
   ```bash
   npm install
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
5. Look at the terminal output. It will say `Local: http://localhost:5173/` (or `5174` if `5173` was busy). 
6. Ctrl+Click the link in the terminal to open the SPMS application in your browser.

> **Note:** If you experience any weird UI caching issues or missing colors, press `Ctrl + C` in the frontend terminal and run `npm run dev` again to ensure a clean build.

---

### Phase 3: Testing the User Interface & Flow

#### 1. The Landing Page
- **Action:** Open `http://localhost:5173/` (or your active port) in your browser.
- **Expected:** You should see a stunning dark-themed landing page with floating animations, a glassmorphism navigation bar, and sections for Features.
- **Action:** Click the "Get Started" or "Sign In" button in the top right.
- **Expected:** You are redirected to the Login page (`/login`).

#### 2. Registration (Sign Up)
- **Action:** On the Login page, click the "Sign up here" link at the bottom.
- **Expected:** You are redirected to the Registration page (`/register`).
- **Action:** Try to submit the form empty.
- **Expected:** Inline red validation errors should appear (e.g., "Username is required").
- **Action:** Fill out the form with valid details:
  - Username: `testuser`
  - Email: `testuser@example.com`
  - Password: `password123`
  - Confirm: `password123`
  - Vehicle Type: `Standard Car`
  - License Plate: `ABC-1234`
- **Action:** Click "Join SPMS".
- **Expected:** You are redirected back to the Login page with a green success message at the top saying "Account created! Please sign in."

#### 3. Login & JWT Authentication
- **Action:** On the Login page, enter:
  - Username: `testuser`
  - Password: `password123`
- **Action:** Click "Sign In".
- **Expected:** The frontend sends a request to the backend, receives a JWT token, saves it in `localStorage`, and instantly redirects you to the Profile dashboard (`/profile`).

#### 4. The Profile Dashboard
- **Action:** Once logged in, view the `/profile` page.
- **Expected:** You should see a beautiful dark-mode glass card containing your User ID, Username, Email, Phone, Vehicle Type, and Plate Number.
- **Action:** In the "Update Profile" section, change your phone number to `+8801999999999` and click "Save Changes".
- **Expected:** A green success message appears, and the User Info Card at the top instantly updates with your new phone number.

#### 5. Security & Account Lockout
- **Action:** Click the red **"Sign out"** button. You will be redirected to the Login page.
- **Action:** Try to log in with the wrong password (`wrongpass`) **3 times in a row**.
- **Expected:** 
  - Attempt 1: "Invalid username or password."
  - Attempt 2: "Invalid username or password."
  - Attempt 3: "Invalid username or password."
  - Attempt 4: "User account is locked. Please try again after 15 minutes." (This tests the transaction-safe brute force protection we built!).
- **Action:** Log in with the actual Admin account if you want to bypass the lock, or wait 15 minutes to try again.

---

### Phase 4: Validating Security

- Try manually changing the URL to `http://localhost:5173/profile` without being logged in.
- **Expected:** The `ProtectedRoute` instantly redirects you back to `/login` because there is no valid JWT token in your `localStorage`.

---

### Phase 5: Testing the Parking Lot & Slot Management Module

Now that the Parking module is built, you can test the administrative functions and the live grid.

#### 1. Creating a Parking Lot
- **Action:** Ensure you are logged in. For these admin actions, you must use an account with the `ADMIN` role. (If testing locally, you may need to update your registered user's role to `ADMIN` directly in the H2 database).
- **Action:** Navigate to `http://localhost:5173/admin/lots` (Manage Parking Lots).
- **Expected:** You should see the Admin Lots page with a form and a table.
- **Action:** Fill out the "Add New Lot" form (e.g., Lot Name: "Main Street", Location: "Downtown", Capacity: 50).
- **Action:** Click "Add Lot".
- **Expected:** The table instantly updates to show the new lot with an "ACTIVE" status.

#### 2. Creating Parking Slots
- **Action:** Navigate to `http://localhost:5173/admin/slots` (Manage Parking Slots).
- **Expected:** You see a dropdown to "Select Parking Lot".
- **Action:** Select the "Main Street" lot you just created.
- **Expected:** The "Add New Slot" form and the "Current Slots Overview" grid appear.
- **Action:** Add a few slots of different types (e.g., Slot Number: "A1", Type: "Standard"; Slot Number: "M1", Type: "Motorcycle").
- **Expected:** As you add slots, they instantly appear in the live grid and the table below. They will be color-coded green (`AVAILABLE`) with their slot type.

#### 3. Duplicate Slot Rejection
- **Action:** Try to add a slot with the exact same slot number (e.g., "A1") to the same lot.
- **Expected:** The backend throws a 409 Conflict, and the frontend displays a red error message: "Slot number already exists in this lot".

#### 4. Managing Slot Status (Out of Service)
- **Action:** In the slots table, find one of the slots you just created (e.g., "A1") and click the "Mark Out of Service" button.
- **Expected:** The slot's status in the table changes to "OUT_OF_SERVICE", the action button disappears, and in the live grid above, the slot card instantly updates to a grey color, indicating it is no longer available.

---

### Phase 6: Testing the Reservation & Booking Engine

#### 1. Making a Reservation
- **Action:** Navigate to `http://localhost:5173/reservations/new`.
- **Expected:** You see a 3-step wizard to book a slot.
- **Action:** Select the "Main Street" lot, then click an available green slot in the grid.
- **Action:** Choose a date, time, and duration (e.g., 1 hr) and click "Confirm Booking".
- **Expected:** The backend validates the duration and checks for overlaps. On success, you are redirected to the `My Reservations` page.
- **Action:** Check the Admin Slots page or go back to book another.
- **Expected:** The slot you booked now appears YELLOW (RESERVED) in the live grid.

#### 2. Conflict & Overlap Handling
- **Action:** Try to book the exact same slot at the same time.
- **Expected:** A 409 Conflict error displays on the form: "Slot is already reserved for this time. Please pick another."

#### 3. Checking In and Out
- **Action:** Navigate to `http://localhost:5173/reservations/check-in-out`.
- **Expected:** Your pending reservation is shown.
- **Action:** Click "Check In Now".
- **Expected:** The reservation status changes to CONFIRMED. If you check the live grid, the slot is now RED (OCCUPIED).
- **Action:** Click "Check Out".
- **Expected:** The checkout processes immediately. You are shown a green success message with your Receipt ID and Total Fee, calculated instantly. The slot returns to GREEN (AVAILABLE).

---

### Phase 7: Testing Billing & Payments

- **Action:** Navigate to `http://localhost:5173/billing`.
- **Expected:** A history of all your completed reservations and their computed fees.
- **Action:** Click "View Receipt" on your recent transaction.
- **Expected:** A clean, printable digital receipt displays, breaking down the exact check-in/out times, duration, and the total fee applied by the dynamic `FeeCalculator`.

---

### Phase 8: Testing Pricing Config & Analytics

- **Action:** Log in as an `ADMIN` and navigate to `http://localhost:5173/admin/pricing`.
- **Expected:** You can view and edit the dynamic base rates, multipliers, and daily caps used by the Billing engine.
- **Action:** Navigate to `http://localhost:5173/admin/reports`.
- **Expected:** A comprehensive dashboard powered by Recharts showing:
  - Total Reservations, Avg Duration, and Occupancy.
  - A bar chart of total Revenue (switchable between Daily and Monthly).
  - A bar chart of Peak Hours (showing the busiest times of the week).
