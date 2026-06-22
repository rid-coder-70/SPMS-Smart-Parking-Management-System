# Software Engineering Principles & Design Patterns in SPMS

This document outlines the core **Software Engineering (SWE) Principles**, specifically the **SOLID** principles, and the **Design Patterns** applied in the **Smart Parking Management System (SPMS)**.

To demonstrate our architecture, we highlight four core flows: **Registering a User, Booking a Reservation, Viewing the Parking Map, and Adding a Slot**. These flows perfectly demonstrate our adherence to SOLID principles (like SRP and DIP) and our use of Gang of Four Design Patterns (Facade, Command, Singleton, Prototype, Simple Factory, Adapter).

---

## 1. Feature: User Registration (Creating a New Account)
*Demonstrating this is as easy as typing a name and password into the sign-up form and clicking "Register".*

**Why it's easy but strong:** The flow is simple (Frontend -> Controller -> Service -> DB), making it very easy to trace and explain to the teacher.

* **Facade Pattern:** The `AuthController` acts as a Facade. The frontend just says "Here is the user info, register them!" and the Controller hides the complex steps (checking if the email exists, hashing the password, saving to the database).
* **Prototype Pattern (via Builder):** We create the new user using `User.builder().username(...).build()`. We use the Builder pattern to easily stamp out a new Prototype of a user object.
* **Command Pattern:** The JSON payload (`RegisterPayload`) sent from the React frontend acts as a Command object that tells the backend exactly what to execute.
* **Adapter Pattern:** Spring Security requires a very specific `UserDetails` object format to log someone in. We used the Adapter Pattern to take our newly registered `User` and adapt it so the security framework can understand it.

---

## 2. Feature: Booking a Parking Slot (Reservation Only)
*To demonstrate, a user selects a green slot on the map, picks a start/end time, and clicks "Confirm Reservation".*

**Why it's easy but strong:** We get to show off core system functionality while clearly defining boundaries in the code.

* **Single Responsibility Principle (SRP):** Our `ReservationService` has a single responsibility: booking the time slot. Notice that it does *not* handle the payment or fee calculation. We strictly separated the Billing logic into its own service to follow SRP.
* **Facade Pattern:** The `ReservationController` acts as a Facade. The frontend simply sends a request to book slot A-101, and the Controller hides all the complex backend checks (verifying the slot is available, parsing the dates, saving to the database).
* **Command Pattern:** The JSON data sent from the frontend (`CreateReservationRequest`) acts as a Command object that tells the backend exactly what action to execute.

---

## 3. Feature: Viewing the Parking Map (Fetching Slots)
*To demonstrate, just click on "Parking Map" in the sidebar and watch the dynamic grid of available and occupied slots load with animations.*

**Why it's easy but strong:** It's just a simple `GET` request, but it relies heavily on database abstraction.

* **Dependency Inversion Principle (DIP):** Our `ParkingSlotService` relies on the `ParkingSlotRepository` **interface**, not a concrete database connection. This means our high-level service doesn't care if the underlying database is PostgreSQL or MySQL.
* **Adapter Pattern:** Spring Data JPA (our repository interface) acts as an Adapter. It adapts our Java `ParkingSlot` objects into raw SQL queries that the database can understand, so we never had to write manual `SELECT * FROM slots` queries.

---

## 4. Feature: Adding a New Parking Slot (Admin Panel)
*To demonstrate, log in as an Admin, go to "Manage Slots", type "A-101", and click Add.*

**Why it's easy but strong:** It is a basic CRUD (Create) operation, which is very easy to explain and visually obvious when the new slot appears on the screen.

* **Singleton Pattern:** Our `ParkingSlotService` is a Singleton. There is only one instance of this service running in the application's memory, efficiently handling slot creations for every single admin logged into the system.
* **Simple Factory Pattern:** When the slot is saved to the database, we don't send the raw database entity back to the frontend. Instead, we use a Simple Factory approach (a DTO mapper) to create a clean, safe `ParkingSlotDto` to return to the React frontend.
