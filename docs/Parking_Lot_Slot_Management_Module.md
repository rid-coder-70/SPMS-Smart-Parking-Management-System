# Parking Lot & Slot Management Module Documentation

## 1. Module Overview
The **Parking Lot & Slot Management** module is a core component of the Smart Parking Management System (SPMS). It handles the physical hierarchy and layout of parking facilities.

It provides administrative interfaces to manage physical parking locations (`ParkingLot`) and the specific spaces within them (`ParkingSlot`), dynamically calculating occupancy rates and validating slot capacities. Domain enumerations are standardized across modules to seamlessly support booking and fee calculation logic.

---

## 2. Backend Architecture (`Spring Boot 3 + Java 17`)

### 2.1. Entities
- **`ParkingLot`**: Represents a physical parking lot facility.
  - Attributes: `id`, `lotName`, `location`, `totalCapacity`, `status` (`ACTIVE`/`INACTIVE`), `createdDate`, and a `OneToMany` relationship mapping slots.
- **`ParkingSlot`**: Represents an individual parking space.
  - Attributes: `id`, `slotNumber`, `slotType`, `status`, and a `ManyToOne` relationship to a `ParkingLot`.
  - Database constraint: A unique constraint on `(lot_id, slot_number)` prevents duplicate slot numbers within the same lot.

### 2.2. Shared Domain Enums
- `VehicleType`: `STANDARD`, `MOTORCYCLE`, `LARGE`
- `SlotStatus`: `AVAILABLE`, `RESERVED`, `OCCUPIED`, `OUT_OF_SERVICE`
- `LotStatus`: `ACTIVE`, `INACTIVE`

### 2.3. Service Layer Logic
- **Occupancy Calculation**: `ParkingLotService.getOccupancyRate(lotId)` calculates utilization by dividing non-available slots by `totalCapacity`.
- **Deactivation**: Deactivating a lot prevents new reservations while preserving slot data for historical audit records.
- **Interoperability**: `ParkingSlotService.updateSlotStatus(slotId, newStatus)` allows the Reservation module to update slot statuses directly during check-in, check-out, and auto-cancellations.

### 2.4. Key API Endpoints
- `GET /api/v1/lots` (Public) - Retrieves active parking lots.
- `POST /api/v1/lots` (Admin) - Creates a new parking lot.
- `PUT /api/v1/lots/{id}/deactivate` (Admin) - Deactivates a parking lot.
- `GET /api/v1/lots/{lotId}/slots` (Public) - Retrieves slots for live grid views.
- `POST /api/v1/lots/{lotId}/slots` (Admin) - Adds a slot to a parking lot.
- `POST /api/v1/lots/{lotId}/slots/bulk` (Admin) - Bulk adds slots to a parking lot.
- `PUT /api/v1/slots/{id}/out-of-service` (Admin) - Marks a slot out of service.

---

## 3. Frontend Architecture (`React 18 + Vite + Tailwind CSS`)

### 3.1. Reusable UI Components
- **`SlotGrid.tsx`**: Visual grid representation of slots, color-coded by status (Green=Available, Yellow=Reserved, Red=Occupied, Grey=Out of Service).
- **`LotSelector.tsx`**: Dropdown component fetching and displaying active parking lots.

### 3.2. Admin Pages
- **`AdminLotsPage.tsx`**: Management dashboard for parking lots.
- **`AdminSlotsPage.tsx`**: Management dashboard for adding single or bulk slots and marking slots out of service.
- **`AdminPricingPage.tsx`**: Configuration interface for base rates, extended rates, multipliers, and daily caps in BDT (৳).

---

## 4. How to Run

### 4.1. Option A: Single Command with Docker
```bash
docker compose up --build
```
Access the frontend on `http://localhost` and the backend on `http://localhost:8080/api/v1`.

### 4.2. Option B: Manual Execution
1. **Backend**:
   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```
2. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
