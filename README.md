# Smart Parking Management System (SPMS)

**Live Demo:** [https://spms-smart-parking-management-syste.vercel.app](https://spms-smart-parking-management-syste.vercel.app)

Welcome to **SPMS (Smart Parking Management System)** — a full-stack, enterprise-ready parking management platform built to streamline facility operations, real-time slot tracking, advance reservations, check-in/check-out processing, dynamic fee calculation in Bangladeshi Taka (BDT), and administrative analytics.

---

## Key Features

- **Interactive Parking Grid**: Real-time slot status tracking (`AVAILABLE`, `RESERVED`, `OCCUPIED`, `OUT_OF_SERVICE`).
- **Advance Reservations**: Reserve parking slots up to 30 days ahead with automatic conflict prevention and no-show expiration.
- **Automated Billing Engine**: Dynamic fee calculation considering base rates, extended rates, vehicle type multipliers (Motorcycle, Standard, Large), and 24-hour daily caps.
- **Digital POS & Receipt Generation**: Itemized breakdowns generated instantly upon vehicle checkout.
- **Security & Access Control**: JWT stateless authentication, BCrypt password hashing, 3-strike brute-force account lockout (15-minute window), and session inactivity auto-logout.
- **Admin Command Center**: Complete management of parking lots, slots, user permissions, dynamic pricing rules, revenue/utilization analytics, and audit logging.

---

## System Architecture & Directory Structure

```text
SPMS-Smart-Parking-Management-System/
├── backend/                  # Spring Boot 3 REST API (Java 17)
│   ├── src/main/java/com/spms/
│   │   ├── audit/            # Admin action audit logging
│   │   ├── auth/             # JWT authentication & account management
│   │   ├── billing/          # Fee engine, pricing rules & transactions
│   │   ├── common/           # Security, CORS, utilities & error handling
│   │   ├── parking/          # Lots & slot grid management
│   │   ├── report/           # Utilization, revenue & peak hours analytics
│   │   └── reservation/      # Reservation lifecycle & check-in/out processing
│   └── src/main/resources/  # Database profiles & application config
│
├── frontend/                 # Vite + React 18 + TypeScript + Tailwind CSS
│   └── src/
│       ├── common/           # Dashboard layouts, routes & API client
│       ├── components/ui/    # Reusable UI components & animations
│       └── features/         # Modular feature views (auth, parking, admin, etc.)
│
├── docker-compose.yml        # Orchestration manifest for multi-container deployment
└── docs/                     # SRS specification & architectural documentation
```

---

## Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **Java 17** | Core backend runtime |
| **Spring Boot 3** | Application framework & REST API engine |
| **Spring Security** | JWT stateless auth & Role-Based Access Control (RBAC) |
| **Spring Data JPA** | Relational ORM & persistence abstraction |
| **H2 / MySQL** | Fast in-memory development & persistent production storage |
| **Lombok & SLF4J** | Boilerplate reduction & structured logging |

### Frontend
| Technology | Purpose |
|---|---|
| **React 18 + TypeScript** | Declarative, type-safe user interface |
| **Vite 5** | High-performance build tool & dev server |
| **Tailwind CSS 3** | Modern utility-first styling |
| **Framer Motion** | Smooth micro-animations & transitions |
| **Axios** | HTTP client with automatic JWT bearer headers |
| **React Router v6** | Client-side routing and protected navigation |

---

## Deployment & How to Run

You can run SPMS using **Docker Compose** (recommended for single-command setup) or manually as a **Dockerless Local Environment**.

---

### Option A: Quick Start with Docker (Recommended)

Run the full system (Backend, Frontend, and Database) with a single command.

#### 1. Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) or Docker Engine with the Docker Compose plugin.

#### 2. Launch Containers
Clone the repository and start the services in detached mode (`-d`):

```bash
git clone https://github.com/rid-coder-70/SPMS-Smart-Parking-Management-System.git
cd SPMS-Smart-Parking-Management-System
sudo docker compose up --build -d
```

#### 3. Access Applications
- **Frontend App**: [http://localhost](http://localhost) (or [http://localhost:3000](http://localhost:3000))
- **Backend REST API**: [http://localhost:8080/api/v1](http://localhost:8080/api/v1)
- **H2 Database Console**: [http://localhost:8080/api/v1/h2-console](http://localhost:8080/api/v1/h2-console)

#### 4. Stop Containers
```bash
sudo docker compose down
```

---

### Option B: Local Manual Setup (Dockerless Run)

If you prefer running the backend and frontend services directly on your host machine:

#### 1. Prerequisites
- **Java 17 SDK** or higher (`java -version`)
- **Node.js 18** or higher and npm (`node -v`, `npm -v`)
- **Maven 3.8+** (or use the included `./mvnw` wrapper)

#### 2. Start the Backend Server
```bash
cd backend

# Make Maven wrapper executable (Linux/macOS)
chmod +x mvnw

# Start Spring Boot backend using the default H2 profile
./mvnw spring-boot:run
```
*The backend server will start at `http://localhost:8080/api/v1`.*

#### 3. Start the Frontend Web App
Open a second terminal window:

```bash
cd frontend

# Install node dependencies
npm install

# Start Vite development server
npm run dev
```
*The frontend web application will start at `http://localhost:5173`.*

---

## Default Credentials & Initial Data

Upon startup, SPMS seeds an administrator account and initial Bangladesh Taka (BDT) pricing configuration.

| Role | Username | Password | Default Pricing Rules |
|---|---|---|---|
| **Admin** | `admin` | `admin123` | Base: **40 BDT/hr** (first 3h) • Extended: **30 BDT/hr** • Daily Cap: **300 BDT** |

> **Note:** You can register new driver/user accounts directly through the `/register` page in the web app.

---

## Dynamic Fee Calculation Rules (BDT)

The system automatically calculates parking charges at check-out based on configurable business rules:

- **Base Hourly Rate**: 40.00 BDT / hour for the first 3 hours.
- **Extended Hourly Rate**: 30.00 BDT / hour for every hour beyond 3 hours.
- **Vehicle Type Multipliers**:
  - `MOTORCYCLE`: 0.5x (50%)
  - `STANDARD`: 1.0x (100%)
  - `LARGE` (SUV / Truck / Van): 1.5x (150%)
- **Partial Hour Policy**: Fractions of an hour are rounded up to the next full hour.
- **Daily Max Cap**: Total fee per continuous 24-hour window is capped at 300.00 BDT (adjusted by vehicle multiplier).

---

## Configuration & Profiles

### Spring Boot Database Profiles
Backend configuration files reside in `backend/src/main/resources/`:
- `application-h2.properties`: Active by default. Uses an in-memory database with H2 console enabled at `/api/v1/h2-console` (JDBC URL: `jdbc:h2:mem:spmsdb`, Username: `sa`, Password: *empty*).
- `application-mysql.properties`: Production profile configured for MySQL connectivity.

To run with MySQL locally:
```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=mysql
```

---

## API Reference Overview

All backend endpoints are prefixed with `/api/v1`.

### Authentication & Account Management
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Register a new user account |
| `POST` | `/auth/login` | Public | Authenticate user & receive JWT token |
| `GET` | `/users/me` | User | Fetch current authenticated profile |
| `PUT` | `/users/me` | User | Update personal profile details |
| `PUT` | `/users/me/password` | User | Change account password |
| `GET` | `/users` | Admin | List all registered users (paginated) |
| `PUT` | `/users/{id}/activate` | Admin | Activate account |
| `PUT` | `/users/{id}/deactivate` | Admin | Deactivate account |
| `PUT` | `/users/{id}/reset-password` | Admin | Administrative password reset |

### Parking Lots & Slots
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/lots` | Public | List active parking lots |
| `POST` | `/lots` | Admin | Create a new parking lot |
| `PUT` | `/lots/{id}` | Admin | Update lot details |
| `PUT` | `/lots/{id}/deactivate` | Admin | Deactivate lot |
| `GET` | `/lots/{lotId}/slots` | Public | List slots in a lot |
| `POST` | `/lots/{lotId}/slots` | Admin | Add a single parking slot |
| `POST` | `/lots/{lotId}/slots/bulk` | Admin | Bulk create parking slots |
| `PUT` | `/slots/{id}/out-of-service` | Admin | Mark slot out of service |

### Reservations & Billing
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/reservations` | User | Reserve a parking slot |
| `GET` | `/reservations/me` | User | List reservation history for current user |
| `GET` | `/reservations/{id}` | User | Fetch reservation details |
| `PUT` | `/reservations/{id}/check-in` | User | Check in vehicle arrival |
| `PUT` | `/reservations/{id}/check-out` | User | Check out vehicle, calculate fee & generate receipt |
| `PUT` | `/reservations/{id}/cancel` | User | Cancel active reservation |
| `DELETE` | `/reservations/{id}/admin` | Admin | Administrative cancellation |

### Admin Pricing & Analytics
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/admin/pricing` | Admin | View current dynamic pricing configuration |
| `PUT` | `/admin/pricing` | Admin | Update rates, thresholds & multipliers |
| `GET` | `/reports/utilization` | Admin | Fetch slot utilization metrics |
| `GET` | `/reports/revenue` | Admin | Fetch revenue analytics & daily breakdowns |
| `GET` | `/reports/peak-hours` | Admin | Fetch 24-hour occupancy peak analysis |
| `GET` | `/admin/audit-logs` | Admin | View audit trail of admin operations |

---

## Troubleshooting Guide

| Issue | Possible Cause | Solution |
|---|---|---|
| `Port 8080 already in use` | Another process is listening on port 8080 | Stop the conflicting process or change `server.port` in `application.properties`. |
| `./mvnw: Permission denied` | Script lacks execution permissions | Run `chmod +x backend/mvnw` in terminal. |
| `vite: command not found` | Frontend dependencies not installed | Run `cd frontend && npm install` before running `npm run dev`. |
| CORS Error on API calls | Frontend origin not whitelisted | Ensure `cors.allowed-origins` in `application.properties` includes `http://localhost:5173`. |

---

## License & Software Architecture Documentation

- **Principles & Patterns**: See [SWE_Principles_And_Patterns.md](SWE_Principles_And_Patterns.md) for a detailed breakdown of SOLID principles and Gang of Four (GoF) design patterns applied across SPMS.
- **Testing Guide**: See [TESTING_GUIDE.md](TESTING_GUIDE.md) for step-by-step test scenarios and verification instructions.
- **License**: Released under the [MIT License](LICENSE).
