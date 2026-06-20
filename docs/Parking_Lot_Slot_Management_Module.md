# Parking Lot & Slot Management Module Documentation

## 1. Module Overview
The **Parking Lot & Slot Management** module is a core component of the SPMS (Smart Parking Management System) monolith. It is responsible for handling the physical hierarchy of the parking facilities. 

It provides an administrative interface to map out physical parking locations (`ParkingLot`) and the specific spaces within them (`ParkingSlot`), dynamically calculating occupancy rates and validating slot capacities. It relies heavily on standardizing responses using shared domain enumerations to seamlessly integrate with other modules (such as the Reservation module).

---

## 2. Backend Architecture (`Spring Boot 3 + Java 17`)

### 2.1. Entities
* **`ParkingLot`**: Represents a physical parking area.
  * Fields: `id`, `lotName`, `location`, `totalCapacity`, `status` (`ACTIVE`/`INACTIVE`), `createdDate`, and a `OneToMany` relationship with its slots.
* **`ParkingSlot`**: Represents an individual parking space.
  * Fields: `id`, `slotNumber`, `slotType`, `status`, and a `ManyToOne` relationship tying it back to a `ParkingLot`.
  * **Constraints**: A unique database constraint on `(lot_id, slot_number)` prevents admins from accidentally creating duplicate slots in the same physical lot.

### 2.2. Shared Domain Enums
To keep the monolith decoupled but consistent, the module reuses core enums from `com.spms.common.enums`:
* `VehicleType`: `STANDARD`, `MOTORCYCLE`, `LARGE`
* `SlotStatus`: `AVAILABLE`, `RESERVED`, `OCCUPIED`, `OUT_OF_SERVICE`
* We additionally introduced `LotStatus` (`ACTIVE`, `INACTIVE`) locally inside the `com.spms.parking.enums` package.

### 2.3. Service Layer Logic
* **Occupancy Calculation**: The `ParkingLotService.getOccupancyRate(lotId)` dynamically calculates the current utilization by dividing the number of non-available slots by the `totalCapacity` of the lot.
* **Safe Deactivation**: Deactivating a lot prevents new reservations but deliberately does *not* cascade-delete the slots, keeping historical data intact.
* **Module Interoperability**: `ParkingSlotService` exposes a clean public method `updateSlotStatus(slotId, newStatus)` designed specifically so the independent Reservation module can `@Autowire` it and update slot statuses natively, skipping HTTP overhead.

### 2.4. API Endpoints
* `GET /api/v1/lots` (Public) - Retrieves active lots.
* `POST /api/v1/lots` (Admin) - Creates a new parking lot.
* `PUT /api/v1/lots/{id}/deactivate` (Admin) - Safely deactivates a lot.
* `GET /api/v1/lots/{lotId}/slots` (Public) - Retrieves slots for the live grid.
* `POST /api/v1/lots/{lotId}/slots` (Admin) - Adds a new slot to a lot (returns `409 Conflict` on duplicates).
* `PUT /api/v1/slots/{id}/out-of-service` (Admin) - Locks a slot for maintenance.

---

## 3. Frontend Architecture (`React 18 + Vite + Tailwind CSS`)

### 3.1. Reusable UI Components
* **`SlotGrid.tsx`**: A highly responsive, visual representation of a parking lot. It automatically color-codes slots based on their exact status (Green=Available, Yellow=Reserved, Red=Occupied, Grey=Maintenance). It utilizes `setInterval` to poll the API every 10 seconds for real-time live updates on the grid.
* **`LotSelector.tsx`**: A headless-style dropdown component that automatically fetches and populates the list of active parking lots.

### 3.2. Admin Pages (Protected via `<AdminRoute>`)
* **`AdminLotsPage.tsx`**: A complete CRUD dashboard for parking lots. It includes a modern form for adding new lots and a table to view and deactivate existing ones.
* **`AdminSlotsPage.tsx`**: An interactive dashboard where an Admin first selects a lot, and then is presented with a table of its slots and a form to physically map out new slots (`slotNumber`, `slotType`).

---

## 4. How to Run the Application

### 4.1. Starting the Backend
1. Open a terminal and navigate to the `backend` directory.
2. Run the Maven wrapper to boot the Spring application:
   * **Windows**: `.\mvnw.cmd spring-boot:run`
   * **Mac/Linux**: `./mvnw spring-boot:run`
3. The server will start on `http://localhost:8080`. (By default, it utilizes an in-memory H2 database).

### 4.2. Starting the Frontend
1. Open a new terminal and navigate to the `frontend` directory.
2. Install dependencies (if you haven't already): `npm install`
3. Start the Vite development server: `npm run dev`
4. The frontend will be accessible at `http://localhost:5173`.

---

## 5. Manual Testing Guide

### 5.1. Testing via the Frontend UI
1. **Login**: Go to `http://localhost:5173/login` and log in with an `ADMIN` account.
2. **Create a Lot**: Navigate to the Admin Lots page. Use the form to create a lot (e.g., "North Wing", Capacity: 50).
3. **Map Slots**: Navigate to the Admin Slots page. Select "North Wing" from the dropdown. Add a few slots (e.g., `A-01` as `STANDARD`, `A-02` as `LARGE`).
4. **Test Duplicates**: Try to add `A-01` again. You should see a red error banner catching the `409 Conflict` response.
5. **View Live Grid**: Import the `SlotGrid` component into any user-facing page, pass it the `lotId`, and watch it poll the color-coded UI every 10 seconds.
6. **Mark Out of Service**: Back on the Admin Slots page, click "Mark Out of Service" on `A-02`. The grid will instantly update `A-02` to grey.

### 5.2. Testing via Postman / cURL
If you want to test the raw backend directly, ensure you pass your JWT Token in the `Authorization: Bearer <token>` header for Admin routes.

**1. Create a Parking Lot:**
```bash
curl -X POST http://localhost:8080/api/v1/lots \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer <ADMIN_JWT_TOKEN>" \
     -d '{"lotName":"VIP Lot", "location":"South", "totalCapacity": 5}'
```

**2. Add a Parking Slot:**
```bash
curl -X POST http://localhost:8080/api/v1/lots/1/slots \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer <ADMIN_JWT_TOKEN>" \
     -d '{"slotNumber":"V-01", "slotType":"STANDARD"}'
```

**3. Test Duplicate Slot Rejection (Should return HTTP 409):**
```bash
curl -X POST http://localhost:8080/api/v1/lots/1/slots \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer <ADMIN_JWT_TOKEN>" \
     -d '{"slotNumber":"V-01", "slotType":"LARGE"}'
```

**4. Fetch the Live Grid Slots:**
```bash
curl -X GET http://localhost:8080/api/v1/lots/1/slots \
     -H "Content-Type: application/json"
```
