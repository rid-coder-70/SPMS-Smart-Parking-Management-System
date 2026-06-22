# SPMS — Smart Parking Management System

<div align="center">
  <img src="https://img.shields.io/badge/Spring%20Boot-3.x-brightgreen?logo=spring" />
  <img src="https://img.shields.io/badge/React-18-blue?logo=react" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?logo=typescript" />
  <img src="https://img.shields.io/badge/Tailwind%20CSS-3-38bdf8?logo=tailwindcss" />
  <img src="https://img.shields.io/badge/JWT-Auth-orange?logo=jsonwebtokens" />
  <img src="https://img.shields.io/badge/License-MIT-lightgrey" />
</div>

<br />

> A full-stack parking management platform with real-time slot tracking, advance reservations, automated billing, and an admin analytics dashboard.

---

## 📸 Screenshots

| Landing Page | Login (Split-Screen) | User Dashboard |
|---|---|---|
| Dark glassmorphism hero | Branded left panel + form | Live stats & quick actions |

| Register Page | Admin Dashboard | Billing Page |
|---|---|---|
| Split-screen with feature list | Occupancy bars + management | Transaction history + checkout |

---

## 🏗 Architecture Overview

```
SPMS/
├── backend/          # Spring Boot 3 REST API
│   └── src/main/java/com/spms/
│       ├── auth/         # Registration, login, JWT
│       ├── parking/      # Lots & slots management
│       ├── reservation/  # Reservation lifecycle
│       ├── billing/      # Check-in/out & fee calculation
│       └── reporting/    # Revenue & occupancy reports
│
└── frontend/         # Vite + React 18 + TypeScript
    └── src/
        ├── common/        # api.ts, types.ts, DashboardLayout
        └── features/
            ├── auth/          # Login, Register, Profile, AuthContext
            ├── landing/       # Landing page
            ├── dashboard/     # User dashboard
            ├── parking/       # Slot grid, lot selector, admin pages
            ├── reservations/  # Booking, my reservations, check-in/out
            ├── billing/       # Transaction history
            └── admin/         # Admin dashboard, reports
```

---

## 🚀 Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Spring Boot 3 | REST API framework |
| Spring Security | JWT authentication & RBAC |
| Spring Data JPA | Database ORM |
| PostgreSQL / H2 | Primary / test database |
| Maven | Dependency management |

### Frontend
| Technology | Purpose |
|---|---|
| React 18 + TypeScript | UI framework |
| Vite 5 | Build tool & dev server |
| Tailwind CSS 3 | Utility-first styling |
| Framer Motion | Animations |
| Axios | HTTP client with JWT interceptor |
| React Router v6 | Client-side routing |
| Lucide React | Icon library |

---

## ⚙️ Environment Setup

### Prerequisites
- **Java 17+**
- **Node.js 18+** and npm
- **PostgreSQL** (or use the embedded H2 for dev)
- **Maven 3.8+**

### 1 — Clone the Repository
```bash
git clone https://github.com/your-username/SPMS-Smart-Parking-Management-System.git
cd SPMS-Smart-Parking-Management-System
```

### 2 — Backend Configuration
```bash
# Navigate to backend
cd backend

# Edit application.properties
nano src/main/resources/application.properties
```

Key properties to set:
```properties
# Server
server.port=8080

# Database (PostgreSQL)
spring.datasource.url=jdbc:postgresql://localhost:5432/spms_db
spring.datasource.username=postgres
spring.datasource.password=your_password

# JPA
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false

# JWT
jwt.secret=your-256-bit-secret-key-here
jwt.expiration=86400000

# CORS
cors.allowed-origins=http://localhost:5173
```

### 3 — Start the Backend
```bash
# From /backend directory
mvn spring-boot:run

# Or build and run the jar
mvn clean package -DskipTests
java -jar target/spms-*.jar
```
Backend runs on: **http://localhost:8080**

### 4 — Frontend Configuration
```bash
# Navigate to frontend
cd ../frontend

# Install dependencies
npm install
```

Verify the API base URL in `src/common/api.ts`:
```typescript
const BASE_URL = 'http://localhost:8080/api/v1';
```

### 5 — Start the Frontend
```bash
npm run dev
```
Frontend runs on: **http://localhost:5173**

---

## 🔑 Default Credentials (Seeded Data)

If your backend seeds initial data, use these:

| Role | Username | Password |
|---|---|---|
| Admin | `admin` | `admin123` |
| User | `user1` | `password` |

> **Note:** Create your own accounts via the Register page if no seed data exists.

---

## 📡 API Reference

All endpoints are prefixed with `/api/v1`.

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Create new user account |
| POST | `/auth/login` | Public | Login, returns JWT token |

### Users
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/users/me` | User | Get own profile |
| PUT | `/users/me` | User | Update profile |
| PUT | `/users/me/password` | User | Change password |
| GET | `/users` | Admin | List all users (paginated) |
| PUT | `/users/{id}/activate` | Admin | Activate user account |
| PUT | `/users/{id}/deactivate` | Admin | Deactivate user account |
| PUT | `/users/{id}/reset-password` | Admin | Reset a user's password |

### Parking Lots
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/lots` | Public | List all active lots |
| POST | `/lots` | Admin | Create new parking lot |
| PUT | `/lots/{id}` | Admin | Update lot details |
| PUT | `/lots/{id}/deactivate` | Admin | Deactivate a lot |

### Parking Slots
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/lots/{lotId}/slots` | User | Get slots for a lot |
| POST | `/lots/{lotId}/slots` | Admin | Add a slot to a lot |
| PUT | `/slots/{id}/out-of-service` | Admin | Mark slot out of service |

### Reservations
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/reservations` | User | Create a reservation |
| GET | `/reservations/me` | User | List own reservations |
| GET | `/reservations/{id}` | User | Get single reservation |
| PUT | `/reservations/{id}/cancel` | User | Cancel a reservation |
| PUT | `/reservations/{id}/check-in` | User | Check in |
| PUT | `/reservations/{id}/check-out` | User | Check out (triggers billing) |
| DELETE | `/reservations/{id}/admin` | Admin | Admin cancel |

### Billing
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/billing/check-in/{reservationId}` | User | Create transaction on check-in |
| POST | `/billing/check-out/{transactionId}` | User | Compute fee on check-out |
| GET | `/billing/transactions/{id}` | User | Get a single receipt |
| GET | `/billing/my` | User | List own transactions |

### Reports (Admin Only)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/reports/revenue?from=&to=` | Admin | Revenue report for date range |
| GET | `/reports/occupancy` | Admin | Live occupancy across all lots |

---

## 🗂 Frontend Route Map

| Route | Auth Guard | Component |
|---|---|---|
| `/` | Public | `LandingPage` |
| `/login` | Public | `LoginPage` |
| `/register` | Public | `RegisterPage` |
| `/dashboard` | User | `UserDashboard` |
| `/profile` | User | `ProfilePage` |
| `/parking` | User | `ParkingMapPage` |
| `/reservations` | User | `ReservationsPage` |
| `/billing` | User | `BillingPage` |
| `/admin` | Admin | `AdminDashboard` |
| `/admin/lots` | Admin | `AdminLotsPage` |
| `/admin/slots` | Admin | `AdminSlotsPage` |
| `/admin/reports` | Admin | `ReportsPage` |

---

## 🎨 Design System

The UI uses a **dark glassmorphism** aesthetic inspired by 21st.dev:

- **Font:** Inter (Google Fonts)
- **Primary colour:** Indigo `#6366f1` (brand-500)
- **Background:** Deep navy `#050814`
- **Glass cards:** `rgba(255,255,255,0.04)` + `backdrop-filter: blur(20px)`
- **Border:** `rgba(255,255,255,0.10)`

### Utility Classes (`src/index.css`)
| Class | Purpose |
|---|---|
| `.card` | Glass morphism card surface |
| `.input` | Styled glass input field |
| `.btn-primary` | Indigo filled button |
| `.btn-secondary` | Ghost/outline button |
| `.btn-danger` | Red destructive action |
| `.btn-success` | Emerald confirm action |
| `.badge-*` | Status badges (active, pending, etc.) |
| `.alert-*` | Alert banners (error, success, warning) |
| `.table-dark` | Dark-themed data table |
| `.sidebar-link` | Navigation link |
| `.sidebar-link-active` | Active nav state |

---

## 🏗 Building for Production

```bash
# Frontend production build
cd frontend
npm run build
# Output in frontend/dist/

# Backend production jar
cd backend
mvn clean package -DskipTests
# Output: backend/target/spms-*.jar
```

---

## 🔒 Security Notes

- Passwords are hashed with **BCrypt**
- JWT tokens expire after 24 hours (configurable)
- Accounts are locked after N failed login attempts
- All admin endpoints require `ROLE_ADMIN`
- CORS is locked to the frontend origin

---

## 📄 License

MIT © 2026 — Smart Parking Management System
