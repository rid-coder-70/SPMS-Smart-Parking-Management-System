# Smart Parking Management System (SPMS)

A full-stack Smart Parking Management System built using a modular monolithic architecture.

##  Tech Stack

**Frontend:**
- React 18
- TypeScript
- Vite
- Tailwind CSS 3
- Axios
- React Router 6

**Backend:**
- Java 17
- Spring Boot 3
- Spring Security 6 (Stateless JWT)
- Spring Data JPA
- H2 Database (in-memory, for local development)
- Maven

---

## 🚀 How to Run the Project (A to Z)

### Prerequisites (Mandatory)
Before you begin, ensure you have the following installed on your machine:
1. **Java Development Kit (JDK) 17**:
   - Verify installation: Open a terminal and run `java -version`.
   - If not installed, download it from [Oracle](https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html) or [Adoptium (Eclipse Temurin)](https://adoptium.net/temurin/releases/?version=17).
   - *Ensure Java is added to your system's PATH variable.*
2. **Node.js (v18 or higher) and npm**:
   - Verify installation: Run `node -v` and `npm -v`.
   - If not installed, download the LTS version from [Node.js Official Website](https://nodejs.org/).
3. **Git** (Optional but recommended for cloning):
   - Download from [git-scm.com](https://git-scm.com/).

---

### Method 1: Quick Start (Windows Only)
If you are on Windows, we've provided an automated script to launch both the backend and frontend simultaneously!
1. Open the project root folder `SPMS-Smart-Parking-Management-System` in your File Explorer.
2. Right-click on the `run_all.ps1` file and select **Run with PowerShell**.
   *(If prompted about execution policies, press `Y` to allow the script to run).*
3. The script will automatically open two new command windows, install necessary dependencies, and start both servers.
4. Once both are running, open your browser and go to **http://localhost:5173**.

---

### Method 2: Manual Start (All Operating Systems)
If you prefer to start the servers manually, you will need **two separate terminal windows**.

#### Step 1: Start the Spring Boot Backend
1. Open your first terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Run the Spring Boot application using the included Maven wrapper (no need to install Maven yourself):
   - **Windows:**
     ```cmd
     mvnw.cmd spring-boot:run
     ```
   - **Mac/Linux:**
     ```bash
     ./mvnw spring-boot:run
     ```
3. Wait for the Spring Boot logo to appear. Once you see `Started SpmsApplication in ... seconds`, the backend is successfully running on **http://localhost:8080**.
   *(Note: The system uses an in-memory H2 database. Every time you stop and restart the backend, the database is wiped clean).*

#### Step 2: Start the React Frontend
1. Open your **second** terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install all required Node packages (you only need to do this the very first time you run the project):
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. The terminal will output a local URL, typically: `➜  Local:   http://localhost:5173/`

#### Step 3: View the App
Open your web browser and navigate to: **http://localhost:5173**

You can immediately test the fully integrated system:
1. **Admin Setup**: Log in with username `admin` and password `admin123`. Navigate to the **Admin Dashboard** and add a new Parking Lot and some Slots.
2. **User Flow**: Register a new account, log in, and browse the **Parking Map**. Select an available slot to reserve it.
3. **Billing Flow**: Navigate to **My Reservations** to check in, and then to **My Billing** to check out and pay.

---

### 🛠️ Troubleshooting Common Issues

- **Port 8080 is already in use (Backend fails to start):**
  Another application is using port 8080. You can either close that application, or change the backend port in `backend/src/main/resources/application.properties` by adding `server.port=8081`. *(If you change the backend port, you MUST also update the proxy target in `frontend/vite.config.ts` to match!)*
- **'mvnw' is not recognized as an internal or external command:**
  Make sure you are exactly inside the `backend` directory when running the command.
- **npm install fails or hangs:**
  Try cleaning your npm cache with `npm cache clean --force` and then run `npm install` again. Ensure you have a stable internet connection.
- **Frontend shows a blank page or Network Error on login:**
  Make sure your backend is fully running in the other terminal. Vite proxies API requests to `localhost:8080`, so if the backend is down, the API calls will fail.


---

## Project Structure

```
SPMS-Smart-Parking-Management-System/
├── backend/
│   ├── mvnw               # Maven wrapper (run this!)
│   ├── pom.xml
│   └── src/main/java/com/spms/
│       ├── auth/          # Module 1: Authentication & User Mgmt (Completed)
│       ├── parking/       # Module 2: Parking Lots & Slots (Completed)
│       ├── reservation/   # Module 3: Reservations (Completed)
│       ├── billing/       # Module 4: Billing & Transactions (Completed)
│       ├── reporting/     # Module 5: Admin Reports (Completed)
│       └── common/        # Shared enums, exception handlers, JWT util
│
└── frontend/
    ├── package.json
    ├── vite.config.ts
    └── src/
        ├── common/        # Axios interceptors, protected routes, Dashboard layout
        └── features/
            ├── auth/      # Login, Register, Profile components
            ├── parking/   # Parking Map, Lot Selector, Slot Grid, Admin Management
            ├── reservations/ # Reservations Dashboard, Check-in flow
            ├── billing/   # Transactions, Receipts, Check-out flow
            ├── dashboard/ # User Dashboard
            └── admin/     # Admin Dashboard, Revenue & Occupancy Reports
```

---

##  Team Members & Responsibilities

| Name | Role | Responsibility |
|------|------|----------------|
| **Ridoy Baidya** | Backend Lead | Module 1: Auth, Security (JWT), RBAC |
| **Priom Chakraborty** | Backend Dev | Module 2: Parking & Slot APIs |
| **Nahid Gazi** | Frontend Lead | Dashboard & UI |
| **Rahat Ahmed** | Backend Dev | Module 4/5: Reporting & Analytics APIs |
| **Mahdiul Hasan** | Database Engineer | Schema Design, ER Model, JPA Entities |

---

##  Branch Strategy

We follow a **Feature Branch Workflow**:

1. `main` → Production-ready code
2. `develop` → Integration branch
3. `feature/*` → Individual development branches

**How to contribute:**
```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name

# ... write code ...

git add .
git commit -m "Added new feature"
git push origin feature/your-feature-name
```
Then create a Pull Request to merge into `develop`.
