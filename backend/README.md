# SPMS Backend

Built with:
- Spring Boot 3+ (Java 17)
- Spring Security (JWT-based)
- Spring Data JPA
- MySQL
- RESTful APIs

## 📂 Architecture (Microservice-Ready)

Even as a monolith, we follow a domain-driven, layered approach to make it microservice-ready:

```
src/main/java/com/spms/api/
│
├── core/
│   ├── security/        # JWT, Role management, BCrypt
│   ├── config/          # Bean, DB, CORS, Swagger configs
│   ├── exceptions/      # Global handler, Custom exceptions
│   └── util/            # Helpers, Constants
│
├── modules/ (Feature-Based Modules)
│   ├── auth/            # Controllers, Services, Repos
│   ├── reservation/     # Entities, Billing logic
│   ├── parking/         # Slot tracking logic
│   └── billing/         # Revenue & payment processing
│
├── dto/                 # Data Transfer Objects
└── mapper/              # Object mapping logic
```

## 🚀 Run Application

```bash
./mvnw spring-boot:run
```

Runs on:
[http://localhost:8080](http://localhost:8080)

## 🔌 API Base URL

`/api/v1/`

## 📊 Core Modules

- 🔐 Authentication & RBAC Module
- 🅿️ Parking Reservation & Billing
- 📈 Admin Reporting & Analytics
- 🛠 User & Profile management
