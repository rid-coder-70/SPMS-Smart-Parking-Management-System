# SPMS - Smart Parking Management System

A full-stack parking management platform with real-time slot tracking, advance reservations, and an admin dashboard.

---

| Landing Page | Login | User Dashboard |
|---|---|---|
| Dark theme hero section | Authentication form | Live statistics & actions |

| Register Page | Admin Dashboard |
|---|---|
| User registration form | Occupancy tracking & management |

---

## Architecture Overview

```text
SPMS/
├── backend/          # Spring Boot 3 REST API
│   └── src/main/java/com/spms/
│       ├── auth/         # Authentication and user management
│       ├── common/       # Shared configurations and utilities
│       ├── parking/      # Parking lots and slots management
│       └── reservation/  # Reservation lifecycle and booking
│
└── frontend/         # Vite + React 18 + TypeScript
    └── src/
        ├── common/        # Shared components, types, and API logic
        └── features/
            ├── admin/         # Admin dashboard and reports
            ├── auth/          # Authentication flows
            ├── dashboard/     # User dashboard interface
            ├── landing/       # Landing page view
            ├── parking/       # Parking slot and lot selection
            └── reservations/  # Reservation booking and history
```

---

## Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Spring Boot 3 | REST API framework |
| Spring Security | JWT authentication |
| Spring Data JPA | Database ORM |
| PostgreSQL / H2 | Database |
| Maven | Dependency management |

### Frontend
| Technology | Purpose |
|---|---|
| React 18 + TypeScript | UI framework |
| Vite 5 | Build tool & dev server |
| Tailwind CSS 3 | Utility-first styling |
| Framer Motion | Animations |
| Axios | HTTP client |
| React Router v6 | Client-side routing |

---

## Environment Setup

### Prerequisites
- Java 17+
- Node.js 18+ and npm
- PostgreSQL (or use embedded H2 for development)
- Maven 3.8+

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/SPMS-Smart-Parking-Management-System.git
cd SPMS-Smart-Parking-Management-System
```

### 2. Backend Configuration
Navigate to the `backend` directory and edit `src/main/resources/application.properties`.

Key properties to configure:
```properties
server.port=8080

spring.datasource.url=jdbc:postgresql://localhost:5432/spms_db
spring.datasource.username=postgres
spring.datasource.password=your_password

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false

jwt.secret=your-256-bit-secret-key-here
jwt.expiration=86400000

cors.allowed-origins=http://localhost:5173
```

### 3. Start the Backend
```bash
cd backend
mvn spring-boot:run
```
The backend will run on `http://localhost:8080`.

### 4. Frontend Configuration
Navigate to the `frontend` directory and install dependencies.
```bash
cd frontend
npm install
```

### 5. Start the Frontend
```bash
npm run dev
```
The frontend will run on `http://localhost:5173`.

---

## Default Credentials

If the backend seeds initial data, the following credentials may be used:

| Role | Username | Password |
|---|---|---|
| Admin | admin | admin123 |
| User | user1 | password |

Note: If no seed data is present, create an account via the registration page.

---

## API Reference

All endpoints are prefixed with `/api/v1`.

### Authentication & Users
| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| POST | `/auth/register` | No | Create new user account |
| POST | `/auth/login` | No | Login and receive JWT |
| GET | `/users/me` | User | Get current user profile |
| GET | `/users` | Admin | List all users |

### Parking
| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| GET | `/lots` | No | List active parking lots |
| POST | `/lots` | Admin | Create new parking lot |
| GET | `/lots/{lotId}/slots` | User | Get slots for a specific lot |
| POST | `/lots/{lotId}/slots` | Admin | Add a slot to a parking lot |

### Reservations
| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| POST | `/reservations` | User | Create a new reservation |
| GET | `/reservations/me` | User | List user's reservations |
| GET | `/reservations/{id}` | User | Get single reservation details |
| PUT | `/reservations/{id}/cancel` | User | Cancel a reservation |
| DELETE | `/reservations/{id}/admin` | Admin | Admin cancellation |

---

## Frontend Routes

| Route | Access | Component/Page |
|---|---|---|
| `/` | Public | Landing Page |
| `/login` | Public | Login Page |
| `/register` | Public | Register Page |
| `/dashboard` | User | User Dashboard |
| `/parking` | User | Parking Selection |
| `/reservations` | User | Reservations History |
| `/admin` | Admin | Admin Dashboard |

---

## Building for Production

### Frontend
```bash
cd frontend
npm run build
```
The production files will be output to `frontend/dist/`.

### Backend
```bash
cd backend
mvn clean package -DskipTests
```
The compiled JAR file will be output to the `backend/target/` directory.

---

## Security

- Passwords are hashed using BCrypt.
- Authentication relies on JWT tokens.
- Administrative endpoints are restricted to users with the `ADMIN` role.

---

## License

MIT License - Smart Parking Management System
