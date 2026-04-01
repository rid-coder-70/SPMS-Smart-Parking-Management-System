# SPMS Frontend

Built with:
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS

##  Folder Structure

```
src/

 app/          # App router pages, layouts and routes
 components/   # Shared UI components (Atomic design)
    ui/       # Basic UI elements (Button, Input, etc.)
    common/   # Reusable layouts/widgets
    icons/    # SVG Icons
 features/     # Feature-based modular logic
    auth/     # Login, Register, Auth Guards
    dashboard/ # User/Admin dashboard modules
    parking/   # Slot booking, tracking
    billing/   # Invoices, payments
 services/     # API service layer (Axios/Fetch)
 hooks/        # Custom React hooks
 store/        # State management (Zustand/Redux)
 types/        # TypeScript interfaces/types
 utils/        # Generic helper functions
```

##  Running Project

```bash
npm install
npm run dev
```

Runs on:
[http://localhost:3000](http://localhost:3000)

##  Features

-  Login/Register UI with RBAC
-  Real-time Slot Reservation UI
-  Admin Dashboard for monitoring
-  Automated Billing & Invoicing
-  Seamless REST API Integration
