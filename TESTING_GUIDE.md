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
