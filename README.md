# SPMS - Smart Parking Management System

🚀 **Live Demo:** [https://spms-smart-parking-management-syste.vercel.app/](https://spms-smart-parking-management-syste.vercel.app/)

A full-stack parking management platform featuring real-time slot tracking, advance reservations, check-in and check-out processing, tiered fee billing in Bangladeshi Taka (BDT ৳), administrative pricing configuration, audit logging, and reporting analytics.

---

## Architecture Overview

```text
SPMS/
├── backend/          # Spring Boot 3 REST API (Java 17)
│   └── src/main/java/com/spms/
│       ├── audit/        # Admin action audit logging
│       ├── auth/         # Authentication and user management
│       ├── billing/      # Fee calculation engine and transactions
│       ├── common/       # Security, CORS, and shared utilities
│       ├── parking/      # Parking lots and slots management
│       ├── report/       # Utilization, revenue, and peak hours analytics
│       └── reservation/  # Reservation lifecycle, check-in, check-out
│
└── frontend/         # Vite + React 18 + TypeScript
    └── src/
        ├── common/        # Dashboard layout, types, and API client
        └── features/
            ├── admin/         # Admin management, users, and audit logs
            ├── auth/          # Authentication and user profile
            ├── billing/       # Admin pricing configuration
            ├── dashboard/     # User dashboard interface
            ├── landing/       # Landing page view
            ├── parking/       # Parking map and lot/slot controls
            ├── reports/       # Analytics dashboard and charts
            └── reservations/  # Booking, check-in/out, and receipt modal
```

---

## Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Spring Boot 3 | REST API framework (Java 17) |
| Spring Security | JWT authentication & role-based authorization |
| Spring Data JPA | Relational database ORM |
| H2 / MySQL | In-memory development and persistent production databases |
| Maven | Dependency management and build tool |

### Frontend
| Technology | Purpose |
|---|---|
| React 18 + TypeScript | Component-based user interface |
| Vite 5 | Fast build tool and dev server |
| Tailwind CSS 3 | Modern utility-first styling |
| Framer Motion | Smooth UI transitions and micro-animations |
| Axios | HTTP API client |
| React Router v6 | Client-side application routing |

---

## Quick Start (Single Command with Docker)

The recommended way to run the complete SPMS application (backend, frontend, and database) is using Docker Compose.

### Prerequisites
- Docker Desktop or Docker Engine with Docker Compose plugin

### Execution Command
First, clone the repository and navigate into the project directory:

```bash
git clone https://github.com/rid-coder-70/SPMS-Smart-Parking-Management-System.git
cd SPMS-Smart-Parking-Management-System
```

Then, run the following single command (the `-d` flag runs it in the background):

```bash
sudo docker compose up --build -d
```

*To stop the application later, run:* `sudo docker compose down`

### Application URLs
- Frontend Web App: `http://localhost` (or `http://localhost:3000`)
- Backend REST API: `http://localhost:8080/api/v1`
- H2 Database Console: `http://localhost:8080/api/v1/h2-console`

---

## Local Development Setup (Without Docker)

### Prerequisites
- Java 17 or higher
- Node.js 18 or higher and npm
- Maven 3.8 or higher

### 1. Clone the Repository
```bash
git clone https://github.com/rid-coder-70/SPMS-Smart-Parking-Management-System.git
cd SPMS-Smart-Parking-Management-System
```

### 2. Start the Backend
Navigate to the `backend` directory and start the Spring Boot application:
```bash
cd backend
./mvnw spring-boot:run
```
The backend server starts at `http://localhost:8080/api/v1`.

### 3. Start the Frontend
Open a new terminal window, navigate to the `frontend` directory, install dependencies, and start Vite:
```bash
cd frontend
npm install
npm run dev
```
The frontend web application runs at `http://localhost:5173`.

---

## Default Administrator Credentials

Upon first startup, the backend automatically seeds a default administrative account and initial BDT pricing rules.

| Role | Username | Password | Default Pricing Rules |
|---|---|---|---|
| Admin | admin | admin123 | Base: ৳40/hr (first 3h) • Extended: ৳30/hr • Daily Cap: ৳300 |

Additional user accounts can be registered through the registration page.

---

## Fee Calculation & Pricing Rules (BDT ৳)

The system applies automated fee calculation upon check-out based on the following business rules:
- **Base Rate**: ৳40.00 per hour for the first 3 hours.
- **Extended Rate**: ৳30.00 per hour for any additional time beyond 3 hours.
- **Vehicle Type Multipliers**:
  - Standard Vehicle: 1.0x (100%)
  - Motorcycle: 0.5x (50%)
  - Large Vehicle (SUV/Truck/Van): 1.5x (150%)
- **Partial Hour Rounding**: Any fraction of an hour is rounded up to the next full hour.
- **Daily Cap**: Maximum charge is capped at ৳300.00 per continuous 24-hour period.

### Payment Processing & Checkout

The system currently simulates a physical "Cash counter" or "Point of Sale (POS)" checkout at the parking facility's exit. When a vehicle checks out, the backend automatically calculates the tiered fee, records the transaction, and immediately marks it as `PAID`. **There is no external digital payment gateway (e.g., Stripe, PayPal, bKash) integrated by default.**

---

## API Reference

All REST endpoints are prefixed with `/api/v1`.

### Authentication & Users
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register a new user account |
| POST | `/auth/login` | Public | Authenticate and obtain JWT token |
| GET | `/users/me` | Authenticated | Retrieve current user profile |
| PUT | `/users/me` | Authenticated | Update user profile details |
| PUT | `/users/me/password` | Authenticated | Change account password |
| GET | `/users` | Admin | List all registered user accounts |
| PUT | `/users/{id}/activate` | Admin | Activate a user account |
| PUT | `/users/{id}/deactivate` | Admin | Deactivate a user account |
| PUT | `/users/{id}/reset-password` | Admin | Administrative password reset |

### Parking Lots & Slots
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/lots` | Public | List all active parking lots |
| POST | `/lots` | Admin | Create a new parking lot |
| PUT | `/lots/{id}` | Admin | Update parking lot details |
| PUT | `/lots/{id}/deactivate` | Admin | Deactivate a parking lot |
| GET | `/lots/{lotId}/slots` | Public | List slots in a parking lot |
| POST | `/lots/{lotId}/slots` | Admin | Add a slot to a parking lot |
| POST | `/lots/{lotId}/slots/bulk` | Admin | Bulk create parking slots |
| PUT | `/slots/{id}/out-of-service` | Admin | Mark a slot out of service |

### Reservations & Check-In/Out
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/reservations` | Authenticated | Create a new parking slot reservation |
| GET | `/reservations/me` | Authenticated | List reservations for current user |
| GET | `/reservations/{id}` | Authenticated | Get reservation details |
| PUT | `/reservations/{id}/check-in` | Authenticated | Check in vehicle arrival |
| PUT | `/reservations/{id}/check-out` | Authenticated | Check out vehicle, calculate fee, & generate receipt |
| PUT | `/reservations/{id}/cancel` | Authenticated | Cancel a reservation |
| DELETE | `/reservations/{id}/admin` | Admin | Administrative cancellation |

### Admin Controls, Pricing & Reports
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/admin/pricing` | Admin | Fetch dynamic pricing configuration |
| PUT | `/admin/pricing` | Admin | Update BDT rates, multipliers, and daily cap |
| GET | `/reports/utilization` | Admin | Retrieve slot utilization statistics |
| GET | `/reports/revenue` | Admin | Retrieve revenue distribution analytics |
| GET | `/reports/peak-hours` | Admin | Retrieve 24-hour peak usage patterns |
| GET | `/admin/audit-logs` | Admin | Retrieve administrative audit log trail |

---

## Frontend Navigation Routes

| Route | Access | Purpose |
|---|---|---|
| `/` | Public | Landing Page |
| `/login` | Public | Login Page |
| `/register` | Public | Registration Page |
| `/dashboard` | Authenticated | User Dashboard Overview |
| `/parking` | Authenticated | Interactive Parking Slot Map |
| `/reservations` | Authenticated | My Reservations & Check-In/Out |
| `/profile` | Authenticated | User Account & Vehicle Profile |
| `/admin` | Admin | Admin Dashboard Overview |
| `/admin/lots` | Admin | Manage Parking Lots |
| `/admin/slots` | Admin | Manage Parking Slots |
| `/admin/users` | Admin | Manage User Accounts |
| `/admin/pricing` | Admin | Dynamic BDT Pricing Config |
| `/admin/reports` | Admin | Reporting & Analytics Dashboard |
| `/admin/audit` | Admin | Administrative Audit Log Viewer |

---

## Security Specifications

- Passwords stored strictly as cryptographic BCrypt hashes.
- Stateless authentication using JWT tokens passed via Authorization headers.
- 3-strike brute-force account lock mechanism (15-minute lock after 3 consecutive failed logins).
- 30-minute automatic inactivity session timeout.
- Role-Based Access Control (RBAC) enforced on backend controllers and frontend routes.
- Parameterized JPA database queries to prevent SQL injection.


---