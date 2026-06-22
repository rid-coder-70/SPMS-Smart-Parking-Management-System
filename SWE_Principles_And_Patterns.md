# Software Engineering Principles & Design Patterns in SPMS

This document outlines the core **Software Engineering (SWE) Principles**, specifically the **SOLID** principles, and the **Design Patterns** that have been applied in the development of the **Smart Parking Management System (SPMS)**.

By adhering to these patterns, the project maintains high cohesion, loose coupling, and scalability, fulfilling modern software engineering best practices.

---

## 1. SOLID Principles

### S - Single Responsibility Principle (SRP)
*A class should have one, and only one, reason to change.*

**Implementation in SPMS:**
- **`AuthService.java`**: Responsible *solely* for authenticating users, generating JWT tokens, and handling registration logic. It does not handle database persistence details directly or parking slot management.
- **`LoginLockService.java`**: Dedicated exclusively to tracking failed login attempts and locking/unlocking accounts. It offloads this responsibility from the `AuthService` to keep the authentication logic clean.
- **`FeeCalculator.java` (Billing Module)**: Has a single reason to change—if the pricing algorithm or business rules for calculating parking fees change.

### O - Open/Closed Principle (OCP)
*Software entities should be open for extension but closed for modification.*

**Implementation in SPMS:**
- **Spring Security Configuration**: We configure our security filters (`JwtAuthenticationFilter`) without modifying the core internal classes of Spring Security. We extend the framework's capabilities through configuration and filter chaining.
- **DTOs & Controllers**: If a new type of vehicle is added, we don't need to rewrite the `ReservationService`. We simply extend the `VehicleType` enum. The business logic gracefully handles the new type because it relies on abstractions rather than hardcoded vehicle strings.

### L - Liskov Substitution Principle (LSP)
*Objects of a superclass should be replaceable with objects of its subclasses without breaking the application.*

**Implementation in SPMS:**
- **`JpaRepository` Interfaces**: In our persistence layer (e.g., `ReservationRepository`, `UserRepository`), we use interfaces that extend Spring Data's `JpaRepository`. Any underlying database implementation provided by Spring Data JPA can be substituted at runtime without breaking our application logic. We code to the interface, not the concrete implementation.

### I - Interface Segregation Principle (ISP)
*No client should be forced to depend on methods it does not use.*

**Implementation in SPMS:**
- **API Segregation**: We divide our REST APIs into distinct controllers (`AuthController`, `ParkingSlotController`, `ReservationController`). The frontend mobile map component only calls the `ParkingSlotController` and does not need to know about the `BillingController`.
- **Repository Segregation**: Rather than a single massive `DatabaseRepository`, we have specific, segregated repositories (`UserRepository`, `LotRepository`, `SlotRepository`).

### D - Dependency Inversion Principle (DIP)
*High-level modules should not depend on low-level modules. Both should depend on abstractions.*

**Implementation in SPMS:**
- **Constructor Injection**: Throughout the project (e.g., in `ReservationService`), dependencies are injected via constructors (using Lombok's `@RequiredArgsConstructor`). The controllers depend on the `Service` layer abstractions, and the services depend on `Repository` interfaces, rather than instantiating concrete database connections themselves. This allows us to inject mock repositories easily during Unit Testing (e.g., `ReservationServiceTest`).

---

## 2. Design Patterns

The SPMS architecture utilizes several classic Gang of Four (GoF) design patterns, either explicitly in our custom code or implicitly through the Spring Boot framework that powers the backend.

### 1. Facade Pattern
- **Where:** The Controller Layer (e.g., `ReservationController`, `AuthController`).
- **How:** The controllers act as a unified, simplified interface (Facade) for the complex subsystems behind them. For example, when calling `/api/reservations`, the controller hides the complexity of checking slot availability, validating time windows, interacting with the database, and calculating durations. The client (frontend) only sees a clean, simple REST endpoint.

### 2. Singleton Pattern
- **Where:** Spring Beans (`@Service`, `@Repository`, `@RestController`).
- **How:** In SPMS, classes like `AuthService`, `ParkingSlotService`, and `JwtUtil` are singletons. The Spring IoC (Inversion of Control) container guarantees that only one shared instance of these classes is created during application startup. This prevents massive memory overhead since these services don't hold conversational state and are safely reused across thousands of requests.

### 3. Simple Factory Pattern
- **Where:** Entity & DTO Creation / Spring's `ResponseEntity`.
- **How:** We use static factory methods to create objects. For instance, when returning HTTP responses, we use `ResponseEntity.ok(data)` or `ResponseEntity.badRequest().body(error)` rather than manually instantiating response objects. Additionally, mapping methods like `AuthResponse.from(user)` serve as simple factories that take raw entities and construct formatted DTOs for the client.

### 4. Adapter Pattern
- **Where:** Spring Security Authentication (`UserDetails` interface).
- **How:** Spring Security expects user information to be provided in a very specific format (`UserDetails`). Our internal `User` entity doesn't match this natively. We implemented an adapter (either extending our `User` or wrapping it via a `CustomUserDetails` class) to adapt our internal database schema so that the Spring Security framework can understand and authenticate it seamlessly.

### 5. Command Pattern
- **Where:** API Endpoints and Database Transactions.
- **How:** Every HTTP request to the backend represents a "Command" (e.g., `CreateReservationRequest`). The controller delegates this command object to the `Service` layer, which executes the specific business logic. Furthermore, Spring Data JPA encapsulates database operations (`save`, `delete`, `update`) as executable commands sent to the database driver, abstracting away the complex SQL syntax.

### 6. Prototype Pattern
- **Where:** Entity Instances and DTOs.
- **How:** Unlike Services which are Singletons, our data objects (`Reservation`, `User`, `ParkingSlot`) are created repeatedly. While we don't explicitly call `clone()`, we use the Builder pattern (e.g., `Reservation.builder().build()`) to rapidly stamp out new instances of data objects for every single web request, effectively mirroring the Prototype pattern's goal of creating new objects efficiently when needed.

---

## Conclusion
By combining the **SOLID principles** with robust **Design Patterns**, the SPMS codebase is highly modular. The separation of concerns allows the frontend developers to work purely with DTO API contracts, while backend developers can swap out logic, write decoupled unit tests via mocking, and easily extend functionality without breaking existing systems.
