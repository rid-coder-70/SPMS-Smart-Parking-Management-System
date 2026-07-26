# SPMS Backend REST API

The Spring Boot backend service for the Smart Parking Management System handles authentication, lot and slot management, reservation processing, automated fee billing in BDT (৳), reporting analytics, and audit logging.

---

## Technical Specifications

- **Framework**: Spring Boot 3.2 (Java 17)
- **Security**: Spring Security with JWT (stateless sessions) & BCrypt password hashing
- **Data Access**: Spring Data JPA with Hibernate ORM
- **Database Support**: Embedded H2 (development) / PostgreSQL or MySQL (production)
- **Architecture**: Layered domain-driven design

---

## Package Architecture

```text
src/main/java/com/spms/
├── audit/          # Administrative action audit logging
├── auth/           # User authentication, JWT filter, and user management
├── billing/        # Fee calculation engine, pricing config, transactions, payments
├── common/         # Security configuration, exception handling, and utilities
├── parking/        # Parking lot and parking slot domain logic
├── report/         # Utilization, revenue, and peak-hours analytics
└── reservation/    # Booking lifecycle, check-in, and check-out logic
```

---

## Running the Backend

### Via Maven
```bash
./mvnw spring-boot:run
```
The server listens on `http://localhost:8080/api/v1`.

### Via Docker
```bash
docker compose up --build
```

---

## Key Features

- JWT Authentication with 3-strike account lockout protection.
- Check-in and check-out endpoints with automated tiered fee calculation (BDT ৳).
- Dynamic pricing configuration managed by administrators.
- Reporting analytics for utilization, daily revenue, and peak hours.
- Administrative audit trail recording system actions.
