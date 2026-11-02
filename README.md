# CareShare – Community Medical Equipment Sharing Bank

> **“Share Care. Support Recovery.”**

CareShare is a production-quality MERN stack backend that connects people who own medical equipment they no longer need with patients, caregivers, and families requiring medical equipment for temporary recovery periods.

The system ensures community safety, transparency, and accountability by enforcing a rigorous lifecycle:
**Listing & Verification ➔ Borrowing & Reservations ➔ Active Handover ➔ Return Initiation ➔ Sanitization & Damage Inspection ➔ Re-listing as Available.**

---

## Table of Contents

1. [Features](#features)
2. [Technology Stack](#technology-stack)
3. [Folder Structure](#folder-structure)
4. [Installation & Setup](#installation--setup)
5. [Environment Variables](#environment-variables)
6. [Database Indexes & Modeling](#database-indexes--modeling)
7. [Authentication & Authorization](#authentication--authorization)
8. [Equipment Lifecycle & State Machine](#equipment-lifecycle--state-machine)
9. [API Endpoints Reference](#api-endpoints-reference)
10. [Standard API Response Format](#standard-api-response-format)
11. [Running Integration Tests](#running-integration-tests)
12. [License](#license)

---

## 1. Features

- **Authentication & Security**: Secure HTTP-only cookies storing JWTs, password hashing with `bcryptjs` (salt rounds 12), token expiration, crypto-based password reset, account activation checks.
- **Role-Based Access Control (RBAC)**: Distinct permissions for `USER` and `ADMIN`. Users can both donate and borrow equipment.
- **Equipment Management**: Multi-image file uploads via Multer, filtering by category, condition, location (city), full-text search, and pagination.
- **Admin Verification Workflow**: Every newly listed medical item starts as `PENDING` and `UNAVAILABLE`. Only approved listings are published to the public catalog.
- **Conflict-Free Borrowing**: Overlap prevention prevents two borrowers from reserving or checking out the same equipment during identical dates.
- **End-to-End Return & Quality Control**:
  - Return requests initiated by borrowers.
  - Return received confirmation by owners.
  - Mandatory safety inspection logged by staff/admins (`PASSED` or `DAMAGE_FOUND`).
  - Maintenance routing for damaged equipment.
  - Mandatory sanitization log before equipment is restored to `AVAILABLE`.
- **In-App Notifications**: Real-time audit notifications dispatched on requests, approvals, handovers, returns, and inspection outcomes.
- **Admin Dashboard**: System-wide statistics for users, active items, borrow statuses, and pending operational tasks.
- **Hardened Production Security**: HTTP security headers (`Helmet`), CORS protection, request rate limiting, Zod schema validation, centralized error handling, and safe query handling.

---

## 2. Technology Stack

- **Runtime**: Node.js (ES Modules, async/await)
- **Framework**: Express.js 4
- **Database**: MongoDB with Mongoose 8
- **Authentication**: JSON Web Tokens (`jsonwebtoken`) & `cookie-parser`
- **Security & Validation**:
  - `bcryptjs`
  - `zod`
  - `helmet`
  - `cors`
  - `express-rate-limit`
- **File Uploads**: `multer`
- **Configuration**: `dotenv`

---

## 3. Folder Structure

```
backend/
├── src/
│   ├── app.js                      # Express configuration & middleware pipeline
│   ├── server.js                   # MongoDB connection & HTTP server bootstrap
│   ├── config/
│   │   ├── db.js                   # Mongoose database connection
│   │   └── env.js                  # Environment variable configuration & checks
│   ├── controllers/
│   │   ├── admin.controller.js
│   │   ├── auth.controller.js
│   │   ├── borrow.controller.js
│   │   ├── equipment.controller.js
│   │   ├── inspection.controller.js
│   │   ├── notification.controller.js
│   │   ├── return.controller.js
│   │   ├── sanitization.controller.js
│   │   └── user.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js      # JWT cookie authentication
│   │   ├── error.middleware.js     # Centralized error handler
│   │   ├── notFound.middleware.js  # 404 handler
│   │   ├── rateLimit.middleware.js # Express rate limiters
│   │   ├── role.middleware.js      # Role authorization (ADMIN/USER)
│   │   └── upload.middleware.js    # Multer image upload engine
│   ├── models/
│   │   ├── BorrowRequest.js
│   │   ├── Equipment.js
│   │   ├── Inspection.js
│   │   ├── Notification.js
│   │   ├── Return.js
│   │   ├── Sanitization.js
│   │   └── User.js
│   ├── routes/
│   │   ├── admin.routes.js
│   │   ├── auth.routes.js
│   │   ├── borrow.routes.js
│   │   ├── equipment.routes.js
│   │   ├── inspection.routes.js
│   │   ├── notification.routes.js
│   │   ├── return.routes.js
│   │   ├── sanitization.routes.js
│   │   └── user.routes.js
│   ├── services/
│   │   ├── admin.service.js
│   │   ├── auth.service.js
│   │   ├── borrow.service.js
│   │   ├── equipment.service.js
│   │   ├── inspection.service.js
│   │   ├── notification.service.js
│   │   ├── return.service.js
│   │   ├── sanitization.service.js
│   │   └── user.service.js
│   ├── utils/
│   │   ├── apiResponse.js          # Standardized response format
│   │   ├── AppError.js             # Operational error class
│   │   ├── asyncHandler.js         # Async error wrapper
│   │   ├── jwt.js                  # JWT token signing & cookies
│   │   ├── pagination.js           # Reusable pagination helpers
│   │   └── password.js             # Bcrypt and crypto reset tokens
│   └── validators/
│       ├── auth.validator.js
│       ├── borrow.validator.js
│       ├── equipment.validator.js
│       ├── inspection.validator.js
│       ├── return.validator.js
│       ├── sanitization.validator.js
│       └── user.validator.js
├── uploads/                        # Static stored equipment & profile images
├── app.js                          # Root re-export of app
├── server.js                       # Root entry point
├── test-suite.js                   # 17-step end-to-end integration test suite
├── .env.example
├── .gitignore
└── package.json
```

---

## 4. Installation & Setup

### Prerequisites
- Node.js (v18 or higher recommended)
- MongoDB Atlas cluster

### Steps

1. **Clone or navigate to the directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and configure your settings:
   ```bash
   cp .env.example .env
   ```

4. **Set the Atlas connection string** in `.env`, using the `careshare` database name:
  ```env
  MONGO_URI=mongodb+srv://<username>:<password>@cluster0.kgemlno.mongodb.net/careshare
  ```

5. **Start the Development Server**:
   ```bash
   npm run dev
   ```

6. **Start in Production Mode**:
   ```bash
   npm start
   ```

7. **Verify the database connection**:
  ```bash
  curl http://localhost:5000/api/health
  ```
  The endpoint returns HTTP 200 only when MongoDB is connected; otherwise it returns HTTP 503.

---

## 5. Environment Variables

| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | Port the Express application listens on | `5000` |
| `NODE_ENV` | Application environment (`development` or `production`) | `development` |
| `MONGO_URI` | MongoDB Atlas connection string for the `careshare` database | Required |
| `JWT_SECRET` | Secret key used to sign and verify JSON Web Tokens | Required |
| `JWT_EXPIRES_IN` | Validity duration of signed tokens | `7d` |
| `CLIENT_URL` | Frontend origin for CORS and cookie trust | `http://localhost:5173` |

---

## 6. Database Indexes & Modeling

- **User**: Unique index on `email`.
- **Equipment**: Indexes on `category`, `availabilityStatus`, `verificationStatus`, `owner`, and `location.city`.
- **BorrowRequest**: Indexes on `borrower`, `owner`, `equipment`, and `status`.
- **Notification**: Indexes on `user` and `isRead`.

---

## 7. Authentication & Authorization

Authentication is executed via **HTTP-only, SameSite cookies**:
1. When a user registers or logs in, a cryptographically signed JWT is placed inside an HTTP-only cookie named `token`.
2. For testing via REST clients, the server also accepts `Authorization: Bearer <token>` fallback.
3. Passwords are never returned in JSON responses (handled via Mongoose `select: false` and `user.toSafeObject()`).
4. Role-based authorization is enforced on all administrative endpoints (`authorizeRoles('ADMIN')`).

---

## 8. Equipment Lifecycle & State Machine

```
[ New Listing Created ]
          ↓
  verificationStatus = PENDING
  availabilityStatus = UNAVAILABLE
          ↓
[ Admin Verification ]
    ├── Approved  ➔ verificationStatus = APPROVED, availabilityStatus = AVAILABLE
    └── Rejected  ➔ verificationStatus = REJECTED (reason stored)
          ↓
[ Borrow Request Approved ]
          ↓
  availabilityStatus = RESERVED
          ↓
[ Pickup Completed ]
          ↓
  availabilityStatus = BORROWED
  requestStatus = ACTIVE
          ↓
[ Return Initiated by Borrower ]
          ↓
  returnStatus = REQUESTED
          ↓
[ Return Received by Owner ]
          ↓
  returnStatus = INSPECTION_PENDING
  availabilityStatus = UNAVAILABLE
          ↓
[ Safety Inspection ]
    ├── PASSED ➔ availabilityStatus = SANITIZATION
    └── DAMAGE_FOUND ➔ availabilityStatus = MAINTENANCE
          ↓
[ Sanitization Completed ]
          ↓
  availabilityStatus = AVAILABLE (Ready for community borrowing)
```

---

## 9. API Endpoints Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user account | No |
| `POST` | `/api/auth/login` | Login and receive HTTP-only cookie | No |
| `POST` | `/api/auth/logout` | Clear auth cookie | Yes |
| `GET` | `/api/auth/me` | Fetch authenticated user data | Yes |
| `POST` | `/api/auth/forgot-password`| Request password reset | No |
| `POST` | `/api/auth/reset-password/:token` | Reset password using token | No |

### User Profile (`/api/users`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users/profile` | Retrieve profile information | Yes |
| `PUT` | `/api/users/profile` | Update profile information & image | Yes |
| `PATCH`| `/api/users/change-password` | Change password with current check | Yes |

### Equipment Catalog (`/api/equipment`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/equipment` | Search & filter approved equipment | Optional |
| `GET` | `/api/equipment/:id` | Get equipment details | Optional |
| `GET` | `/api/equipment/my/listings` | Get current user's equipment listings | Yes |
| `POST` | `/api/equipment` | List new equipment (multipart/form-data) | Yes |
| `PUT` | `/api/equipment/:id` | Update equipment listing | Owner/Admin |
| `DELETE`| `/api/equipment/:id` | Delete equipment listing | Owner/Admin |

### Borrow Requests (`/api/borrow-requests`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/borrow-requests` | Create borrow request | Yes |
| `GET` | `/api/borrow-requests/my` | Get requests submitted by current user | Yes |
| `GET` | `/api/borrow-requests/received` | Get requests received by current user | Yes |
| `GET` | `/api/borrow-requests/:id` | Get borrow request by ID | Yes |
| `PATCH`| `/api/borrow-requests/:id/approve` | Approve request (Sets to RESERVED) | Owner/Admin |
| `PATCH`| `/api/borrow-requests/:id/reject` | Reject request | Owner/Admin |
| `PATCH`| `/api/borrow-requests/:id/cancel` | Cancel request | Borrower |
| `PATCH`| `/api/borrow-requests/:id/pickup` | Confirm pickup (Sets to ACTIVE/BORROWED)| Yes |

### Returns (`/api/returns`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/returns` | Initiate return of active borrowing | Borrower |
| `GET` | `/api/returns` | List returns | Yes |
| `GET` | `/api/returns/:id` | Get return details | Yes |
| `PATCH`| `/api/returns/:id/receive` | Owner confirms return receipt | Owner/Admin |

### Inspections (`/api/inspections`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/inspections` | List inspection logs | Admin |
| `POST` | `/api/inspections` | Record safety & condition inspection | Admin |
| `GET` | `/api/inspections/:id` | Get inspection record | Yes |
| `PATCH`| `/api/inspections/:id` | Update inspection record | Admin |

### Sanitization (`/api/sanitization`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/sanitization` | List sanitization logs | Admin |
| `POST` | `/api/sanitization` | Record start of sanitization | Admin |
| `GET` | `/api/sanitization/:id` | Get sanitization record | Admin |
| `PATCH`| `/api/sanitization/:id/complete` | Complete sanitization ➔ AVAILABLE | Admin |

### Notifications (`/api/notifications`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/notifications` | Get user notifications & unread count | Yes |
| `PATCH`| `/api/notifications/:id/read` | Mark notification as read | Yes |
| `PATCH`| `/api/notifications/read-all` | Mark all notifications as read | Yes |

### Admin Operations (`/api/admin`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/equipment/pending`| Get pending equipment for verification | Admin |
| `PATCH`| `/api/admin/equipment/:id/approve` | Approve equipment listing | Admin |
| `PATCH`| `/api/admin/equipment/:id/reject` | Reject equipment listing with reason | Admin |
| `GET` | `/api/admin/stats` | Dashboard statistics & summaries | Admin |
| `GET` | `/api/admin/users` | List all registered users | Admin |
| `PATCH`| `/api/admin/users/:id/toggle-status` | Activate/deactivate user account | Admin |

---

## 10. Standard API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

### Error Response
```json
{
  "success": false,
  "message": "Detailed error message",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    }
  ]
}
```

---

## 11. Running Integration Tests

An automated, 17-step end-to-end integration test suite is included to verify the complete medical equipment lifecycle.

To execute the test suite:
```bash
npm test
```

### Test Coverage Summary:
- [x] Donor, Borrower, and Admin Registration
- [x] Login and JWT issuance
- [x] Password recovery and reset cycle
- [x] User profile update
- [x] Equipment listing creation (PENDING / UNAVAILABLE)
- [x] Admin verification & approval (APPROVED / AVAILABLE)
- [x] Equipment discovery, search keyword, and category filters
- [x] Self-borrow prevention rule
- [x] Borrow request creation & owner notification
- [x] Overlapping booking prevention & reservation
- [x] Physical handover / pickup confirmation (ACTIVE / BORROWED)
- [x] Return initiation by borrower
- [x] Return receipt by owner (INSPECTION_PENDING)
- [x] Medical safety inspection (PASSED ➔ SANITIZATION)
- [x] Hospital-grade sanitization completion (Restored to AVAILABLE)
- [x] Audit notification delivery
- [x] Admin dashboard analytics and metrics aggregation

---

## 12. License

MIT License. Designed and engineered for community healthcare and medical equipment recovery.
