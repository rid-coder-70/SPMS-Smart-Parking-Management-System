# Software Engineering Principles & Design Patterns in SPMS

This document details the core **Software Engineering (SWE) Principles**, specifically the **SOLID** principles, and the **Design Patterns** applied in the **Smart Parking Management System (SPMS)**.

Architecture flows demonstrating SOLID principles and Gang of Four Design Patterns:

---

## 1. Feature: User Registration

- **Facade Pattern**: `AuthController` serves as a Facade. The frontend submits user registration details, while `AuthController` encapsulates the underlying workflow (checking duplicates, password hashing, and user creation).
- **Prototype Pattern (via Builder)**: User entity instantiation utilizes `User.builder()`, applying the Builder pattern to create domain objects cleanly.
- **Command Pattern**: The `RegisterRequest` JSON payload encapsulates request data as a Command object.
- **Adapter Pattern**: Spring Security requires the `UserDetails` contract. `User` implements `UserDetails`, adapting domain user attributes to Spring Security framework interfaces.

---

## 2. Feature: Parking Reservation Booking

- **Single Responsibility Principle (SRP)**: `ReservationService` handles booking windows and slot availability. Fee calculations and financial transaction processing are isolated in `BillingService`.
- **Facade Pattern**: `ReservationController` acts as a Facade, hiding slot validation, overlap checks, and database persistence behind a clean endpoint.
- **Command Pattern**: `CreateReservationRequest` encapsulates user booking inputs as a Command object.

---

## 3. Feature: Check-In, Check-Out & Fee Calculation

- **Single Responsibility Principle (SRP)**: Check-out lifecycle transitions are separated from fee calculation formulas. `BillingService` encapsulates tiered rates, vehicle multipliers, and daily cap rules.
- **Strategy Pattern (Fee Calculation)**: Pricing strategies adjust dynamically based on `VehicleType` (Motorcycle, Standard, Large) and duration windows (base vs extended rates).
- **Factory Pattern**: `CheckOutResponse` maps fee breakdowns and receipt information into clean transfer objects returned to the client.

---

## 4. Feature: Parking Slot Availability Grid

- **Dependency Inversion Principle (DIP)**: `ParkingSlotService` depends on the `ParkingSlotRepository` interface rather than concrete data access mechanisms.
- **Adapter Pattern**: Spring Data JPA maps entity objects to database queries transparently.

---

## 5. Feature: Dynamic Pricing & Audit Logging

- **Singleton Pattern**: Spring `@Service` components (`PricingService`, `AuditService`) execute as singletons managed by the Spring IoC container.
- **Single Responsibility Principle (SRP)**: `AuditService` logs administrative actions independently using `REQUIRES_NEW` transaction propagation, ensuring audit logging succeeds without altering primary business transactions.
