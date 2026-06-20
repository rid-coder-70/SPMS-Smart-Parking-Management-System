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

##  How to Run the Project (A to Z)

You will need two terminal windows open: one for the backend, and one for the frontend.

### Prerequisites
- **Java 17** installed (`java -version`)
- **Node.js** (v18+) and **npm** installed (`node -v`)

---

### Step 1: Start the Spring Boot Backend

1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd SPMS-Smart-Parking-Management-System/backend
   ```
2. Run the application using the Maven wrapper:
   - **Linux/Mac:** `./mvnw spring-boot:run`
   - **Windows:** `mvnw.cmd spring-boot:run`
   
   *(Note: If you don't have Maven installed globally, the wrapper script will automatically download what it needs.)*
   
3. Wait for the Spring Boot logo to appear and look for this line at the bottom:
   `Started SpmsApplication in X.XXX seconds`

The backend is now running on **http://localhost:8080** and connected to an in-memory H2 database. 

*Note: Because it uses H2 in-memory mode (`mem:spmsdb`), the database is completely wiped and reset every time you restart the backend.*

---

### Step 2: Start the React Frontend

1. Open a **second** terminal window and navigate to the `frontend` directory:
   ```bash
   cd SPMS-Smart-Parking-Management-System/frontend
   ```
2. Install the Node dependencies (only needed the first time):
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Look for the local URL in your terminal:
   `➜  Local:   http://localhost:5173/`

### Step 3: View the App
Open your browser and navigate to: **http://localhost:5173**

You can immediately test the fully integrated Authentication module:
1. Click **Register** to create a new account.
2. Sign in with your new credentials.
3. Test the **account lockout feature** by intentionally entering the wrong password 3 times in a row.

---

## Project Structure

```
SPMS-Smart-Parking-Management-System/
├── backend/
│   ├── mvnw               # Maven wrapper (run this!)
│   ├── pom.xml
│   └── src/main/java/com/spms/
│       ├── auth/          # Module 1: Authentication & User Mgmt
│       ├── parking/       # Module 2: Parking (Pending)
│       ├── reservation/   # Module 3: Reservations (Pending)
│       ├── billing/       # Module 4: Billing (Pending)
│       ├── admin/         # Module 5: Admin (Pending)
│       └── common/        # Shared enums, exception handlers, JWT util
│
└── frontend/
    ├── package.json
    ├── vite.config.ts
    └── src/
        ├── common/        # Axios interceptors, protected routes, types
        └── features/
            ├── auth/      # Login, Register, Profile components
            ├── parking/
            ├── reservations/
            ├── billing/
            └── admin/
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
