# CareShare – Frontend Application

> **“Share Care. Support Recovery.”**  
> Community Medical Equipment Sharing Bank – Modern React & Tailwind Web Application

CareShare's frontend is a responsive single-page application built with React, Vite, and Tailwind CSS. It connects seamlessly to the CareShare Express & MongoDB REST API.

---

## 1. Features & Architectural Overview

- **Security-First Architecture**:
  - Authentication is managed through secure HTTP-only cookies with `withCredentials: true`.
  - Zero storage of JWT tokens in `localStorage` or `sessionStorage` (preventing XSS token leakage).
  - Backend validation synchronization and non-trust of client roles.
- **Role-Based Routing**:
  - Public routes accessible to everyone (browsing, details, how it works, auth).
  - `ProtectedRoute` for user workspaces (profile, listings, requests, returns, notifications).
  - `AdminRoute` for administrative oversight (verification, inspections, sanitization, user moderation).
- **Medical Equipment Discovery**:
  - Full-text search with live debounce and URL search param persistence.
  - Multi-attribute filtering (category, condition, location, availability).
  - Paginated results with modern card grids.
- **End-to-End Borrowing & Returns**:
  - Direct borrow requests with conflict-prevention date validation.
  - Tracking through the complete 6-stage lifecycle:
    `Pending ➔ Approved / Reserved ➔ Active Handover ➔ Return Requested ➔ Safety Inspection ➔ Sanitization ➔ Available`.
- **Administrative Operations Panel**:
  - Verification queue for newly listed medical gear with approval/rejection notes.
  - Multi-point damage & quality inspection form (auto-routes to Maintenance or Sanitization).
  - Sanitization completion workflow that restores equipment to `AVAILABLE`.
  - User directory with activation/deactivation controls.
- **Design System**:
  - Clean medical aesthetic utilizing soft medical teal (`brand-600`) and recovery green (`health-600`).
  - Accessible contrast, rounded cards (`rounded-2xl`, `rounded-3xl`), soft shadows (`shadow-card`).
  - Mobile-responsive navigation drawer, dialog modals, and feedback toasts/alerts.

---

## 2. Directory Structure

```text
frontend/
├── src/
│   ├── assets/                       # Static brand graphics
│   ├── components/
│   │   ├── ConfirmDialog.jsx         # Modal dialog for destructive/confirm actions
│   │   ├── EmptyState.jsx            # Standardized empty state presentation
│   │   ├── ErrorMessage.jsx          # Friendly error alerts with retry handlers
│   │   ├── Footer.jsx                # Multi-column public footer
│   │   ├── Loading.jsx               # Spinners & full-screen loading states
│   │   ├── Modal.jsx                 # Accessible backdrop modal with escape listeners
│   │   ├── Navbar.jsx                # Responsive header with notification counter
│   │   ├── Pagination.jsx            # Reusable pagination component
│   │   ├── borrowing/
│   │   │   └── BorrowRequestModal.jsx# Date-validated borrow request submission
│   │   └── equipment/
│   │       └── EquipmentCard.jsx     # Reusable equipment preview card
│   ├── context/
│   │   └── AuthContext.jsx           # Global user state, login, register, logout, refresh
│   ├── hooks/
│   │   └── useAuth.js                # Convenience hook for AuthContext
│   ├── layouts/
│   │   ├── AdminLayout.jsx           # Admin sidebar & operational sub-nav
│   │   ├── PublicLayout.jsx          # Standard navbar + footer wrapper
│   │   └── UserLayout.jsx            # User workspace sidebar & sub-nav
│   ├── pages/
│   │   ├── About.jsx                 # Mission, 6-step lifecycle & FAQs
│   │   ├── AddEquipment.jsx          # Equipment donation form with multi-image upload
│   │   ├── BorrowRequestDetails.jsx  # Detailed borrow audit view
│   │   ├── BorrowRequestsReceived.jsx# Incoming requests management for owners
│   │   ├── EditEquipment.jsx         # Equipment editor
│   │   ├── EditProfile.jsx           # Profile and avatar updater
│   │   ├── Equipment.jsx             # Searchable, filterable catalog
│   │   ├── EquipmentDetails.jsx      # Image gallery, specs & borrow button
│   │   ├── ForgotPassword.jsx        # Password reset request
│   │   ├── Home.jsx                  # Hero, featured items, workflow & community impact
│   │   ├── Login.jsx                 # Sign in with password toggle
│   │   ├── MyBorrowRequests.jsx      # Outgoing requests & return trigger
│   │   ├── MyEquipment.jsx           # User listings & deletion management
│   │   ├── MyReturns.jsx             # Return confirmations & receipt
│   │   ├── Notifications.jsx         # Notification center with mark read
│   │   ├── Profile.jsx               # User profile & security change password
│   │   ├── Register.jsx              # Community signup with validation
│   │   ├── ResetPassword.jsx         # Password update using reset token
│   │   └── admin/
│   │       ├── AdminDashboard.jsx    # Real-time metrics and pipeline counts
│   │       ├── Inspections.jsx       # Physical safety & condition evaluation
│   │       ├── ManageBorrowRequests.jsx# Bank-wide reservation oversight
│   │       ├── ManageEquipment.jsx   # Inventory control
│   │       ├── PendingEquipment.jsx  # Verification queue
│   │       ├── Sanitization.jsx      # Decontamination logs & restore available
│   │       └── Users.jsx             # Member directory & moderation
│   ├── routes/
│   │   ├── AdminRoute.jsx            # Role guard for admin views
│   │   ├── AppRoutes.jsx             # Master route definitions
│   │   └── ProtectedRoute.jsx        # Authentication session guard
│   ├── services/
│   │   ├── admin.service.js          # Admin endpoints
│   │   ├── api.js                    # Axios instance with credentials
│   │   ├── auth.service.js           # Auth operations
│   │   ├── borrow.service.js         # Borrow operations
│   │   ├── equipment.service.js      # Equipment catalog operations
│   │   ├── inspection.service.js     # Inspection records
│   │   ├── notification.service.js   # Notification operations
│   │   ├── return.service.js         # Return records
│   │   ├── sanitization.service.js   # Sanitization logs
│   │   └── user.service.js           # User profile & credentials
│   ├── utils/
│   │   ├── constants.js              # Categories, conditions & status maps
│   │   ├── formatDate.js             # Date/time formatting helpers
│   │   └── formatStatus.js           # Badge colors & asset URL resolution
│   ├── App.jsx                       # Root React provider setup
│   ├── index.css                     # Tailwind directives & styles
│   └── main.jsx                      # Vite entry point
├── .env                              # Environment configuration
├── .env.example                      # Template configuration
├── index.html                        # HTML template with Google Fonts
├── package.json                      # Scripts & dependencies
├── postcss.config.js                 # PostCSS setup
├── tailwind.config.js                # Custom medical theme colors & shadows
└── vite.config.js                    # Vite bundler configuration
```

---

## 3. Installation & Setup

### Prerequisites
- Node.js (v18+ recommended)
- CareShare backend running at `http://localhost:5000`

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Configure Environment
Verify `.env` has the correct API URL:
```bash
VITE_API_URL=http://localhost:5000/api
VITE_SERVER_URL=http://localhost:5000
```

### 3. Start Development Server
```bash
npm run dev
```
The application will launch at `http://localhost:5173`.

### 4. Build for Production
```bash
npm run build
```
Creates an optimized, production-ready bundle in `dist/`.

---

## 4. End-to-End Workflow Instructions

To test the entire application between donor, borrower, and administrator:

1. **Start the Backend**:
   ```bash
   cd backend
   npm run dev
   ```
2. **Start the Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```
3. **Register an Account**:
   Navigate to `http://localhost:5173/register` and create an account.
4. **List Equipment**:
   Click **Donate Equipment** in the navbar to list a wheelchair, walker, or bed with photos. The equipment will start with status `PENDING`.
5. **Verify as Admin**:
   Log in with an administrator account (or promote your user to `role: 'ADMIN'` in MongoDB), open the **Admin Operations Panel** at `/admin/pending-equipment`, and click **Approve & Publish**. The item becomes `AVAILABLE` in the public catalog.
6. **Borrow & Return**:
   Log in as another user, find the equipment, submit a borrow request, approve it from the owner's dashboard, mark pickup, and proceed through return, inspection, and sanitization!
