# SPMS Architectural Strategy & Roadmap

This document outlines the architectural strategy and technical roadmap for the Smart Parking Management System (SPMS), adhering to clean architecture standards and SOLID design principles.

---

## 1. Full-Stack Directory Structure

The project is organized to decouple presentation and business logic layers while preserving deployment independence.

```text
SPMS/
├── backend/                # Spring Boot REST API
├── frontend/               # Vite + React Client
├── docs/                   # System specifications and architectural docs
└── docker-compose.yml      # Orchestration configuration
```

---

## 2. Monolithic Backend Architecture

The Spring Boot backend utilizes a layered, domain-driven structure with clear modular boundaries:

- **Presentation Layer**: Controllers handling HTTP REST requests and input validation.
- **Service Layer**: Transactional business logic, reservation validation, and fee billing.
- **Repository Layer**: Data persistence and database queries via Spring Data JPA.
- **Security Layer**: Custom JWT filters, BCrypt password encoders, and RBAC rules.

---

## 3. Frontend Feature-Based Architecture

The frontend follows a modular feature-first organization:

```text
frontend/src/features/
├── admin/            # Admin management, users, and audit trail
├── auth/             # Authentication flows and profile management
├── billing/          # Dynamic BDT pricing configuration
├── dashboard/        # User dashboard overview
├── landing/          # System landing page
├── parking/          # Parking map and lot/slot controls
├── reports/          # Analytics dashboard and charts
└── reservations/     # Booking, check-in/out, and receipt modal
```

---

## 4. REST API Endpoint Structure

All API endpoints are versioned under `/api/v1`:

### Authentication & Users
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/users/me`
- `GET /api/v1/users` (Admin)

### Parking Lots & Slots
- `GET /api/v1/lots`
- `POST /api/v1/lots` (Admin)
- `GET /api/v1/lots/{lotId}/slots`
- `POST /api/v1/lots/{lotId}/slots` (Admin)

### Reservations & Check-In/Out
- `POST /api/v1/reservations`
- `GET /api/v1/reservations/me`
- `PUT /api/v1/reservations/{id}/check-in`
- `PUT /api/v1/reservations/{id}/check-out`
- `PUT /api/v1/reservations/{id}/cancel`

### Admin Controls & Analytics
- `GET /api/v1/admin/pricing` (Admin)
- `PUT /api/v1/admin/pricing` (Admin)
- `GET /api/v1/reports/utilization` (Admin)
- `GET /api/v1/reports/revenue` (Admin)
- `GET /api/v1/reports/peak-hours` (Admin)
- `GET /api/v1/admin/audit-logs` (Admin)

---

## 5. Security & Persistence Specifications

- **Stateless JWT**: Secure token authentication with expiration validation.
- **Password Protection**: Cryptographic BCrypt password hashing.
- **Account Lockout**: 3-strike brute-force protection locking accounts for 15 minutes.
- **Session Timeout**: 30-minute inactivity session expiration.
- **Audit Logs**: Administrative action audit logging stored permanently.

---

## 6. Containerization & Deployment

Single-command deployment using Docker Compose:

```bash
docker compose up --build
```
