# 🚗 Smart Parking Management System (SPMS)

A full-stack Smart Parking Management System built using:

- ⚡ Next.js (Frontend)
- 🎨 Tailwind CSS
- ☕ Spring Boot (Backend)
- 🗄 MySQL Database
- 🔐 JWT Authentication + RBAC

---

## 📌 Project Overview

SPMS is a full-stack parking reservation and management platform that allows:

- Users to register, reserve slots, check-in/check-out
- Automated billing system
- Admin dashboard for monitoring & reporting
- Real-time slot tracking

---

## 🏗 Architecture

Frontend (Next.js)
        ↓ REST API
Backend (Spring Boot)
        ↓
MySQL Database

---

## 📂 Project Structure

SPMS/
│
├── frontend/ # Next.js App
├── backend/ # Spring Boot API
├── database/ # SQL scripts
├── docs/ # SRS, UML diagrams
└── README.md

---

## 👥 Team Members & Responsibilities

| Name | Role | Responsibility |
|------|------|----------------|
| Ridoy Baidya | Backend Lead | Authentication, Security (JWT), RBAC |
| Priom Chakraborty | Backend Dev | Reservation & Slot APIs |
| Nahid Gazi | Frontend Lead | Dashboard & UI |
| Rahat Ahmed | Backend Dev | Reporting & Analytics APIs |
| Mahdiul Hasan | Database Engineer | Schema Design, ER Model, JPA Entities |

---

## 🌿 Branch Strategy

We follow **Feature Branch Workflow**

### Main Branches

- `main` → Production-ready code
- `develop` → Integration branch

### Feature Branches

- `feature/auth`
- `feature/reservation`
- `feature/admin`
- `feature/reporting`
- `feature/database`
- `feature/frontend-ui`
- `feature/frontend-auth`

---

## 🔀 How to Create New Branch

```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
git push origin feature/your-feature-name
```

After development:

```bash
git add .
git commit -m "Added new feature"
git push origin feature/your-feature-name
```

Then create Pull Request → Merge into `develop`

---

## 🔐 Security Features

- JWT Authentication
- Role-Based Access Control (USER, ADMIN)
- Password hashing (BCrypt)
- CORS protection
- SQL Injection prevention (JPA)

---

## 📊 Core Features

- User Authentication
- Parking Slot Management
- Reservation System
- Automated Billing
- Admin Panel
- Reporting & Analytics

---

## 🚀 Future Improvements

- Dockerization
- CI/CD Pipeline
- Cloud Deployment
- Real-time WebSocket updates

---

## 📄 Documentation

- SRS Document (docs/)
- UML Diagrams (docs/)
- ER Diagram

---

## 📜 License

MIT License
