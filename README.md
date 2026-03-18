# UniStay

A secure, role-based university hostel management platform built to replace manual hostel operations with a digital system. UniStay handles gatepass verification, visitor accommodation, mess and hostel fee management, and warden-level oversight -- all with proper authentication, authorization, and audit logging.

The system is designed around four distinct user roles, each with its own dashboard and set of permissions. Backend-level ownership checks prevent IDOR vulnerabilities and privilege escalation.

## The Problem

Most university hostel portals rely on manual gatepasses, paper-based visitor logs, and spreadsheets for fee tracking. This creates delays at hostel gates, makes audit trails unreliable, and opens the door to access-control issues where students or staff can view or modify records they should not have access to.

## What UniStay Does

**Student Panel** -- Students can apply for gatepasses (day, overnight, emergency), request visitor/parent accommodation, view and pay hostel and mess fees, and manage their profile and parent contact details.

**Warden Panel** -- Wardens see only the students assigned to their hostel. They can approve or reject gatepass requests with mandatory rejection reasons, review accommodation requests and assign rooms, and monitor fee payment status across their hostel.

**Security Panel** -- Security guards at the hostel gate can look up approved gatepasses by student name or roll number, mark students as checked out or checked in with timestamps, and flag late returns automatically. A full audit log records every gate transaction.

**Admin Panel** -- Admins have full CRUD control over users, hostels, students, gatepasses, and fees. They can create users individually or in bulk (up to 100 at a time via JSON), assign wardens to hostels, assign students to hostels and rooms, and generate hostel-wide fee records in a single action. A dashboard provides system-wide statistics.

## Tech Stack

**Backend:** Node.js, Express 5, MongoDB, Mongoose 9, JWT authentication, bcrypt

**Frontend:** React 19, Vite, Tailwind CSS 4, React Router, Axios, Lucide icons

## Project Structure

```
unistay/
├── backend/
│   ├── server.js
│   ├── configs/
│   │   └── db.js
│   ├── middlewares/
│   │   ├── auth.js              # JWT verification + role-based authorization
│   │   ├── errorHandler.js      # Centralized error handling
│   │   └── logger.js            # Request logging
│   ├── modules/
│   │   ├── user/                # User model (base), auth controller + routes
│   │   ├── student/             # Student model (discriminator), controller + routes
│   │   ├── warden/              # Warden model (discriminator), controller + routes
│   │   ├── hostel/              # Hostel model
│   │   ├── gatepass/            # Gatepass model, security controller + routes
│   │   ├── accommodation/       # Accommodation model
│   │   ├── fee/                 # Fee model
│   │   └── admin/               # Admin controller + routes (all CRUD operations)
│   └── utils/
│       ├── jwt.js               # Token generation and verification
│       ├── ApiError.js          # Custom error class
│       ├── asyncHandler.js      # Async route wrapper
│       └── seed.js              # Database seeder with sample data
│
└── frontend/
    └── src/
        ├── api/                 # Axios instance with JWT interceptor
        ├── context/             # AuthContext, ThemeContext (dark/light mode)
        ├── components/
        │   ├── ui/              # Button, Input, Select, Table, Modal, Badge, etc.
        │   └── layout/          # Sidebar, Navbar, DashboardLayout
        └── pages/
            ├── Login.jsx
            ├── student/         # Dashboard, Gatepasses, Accommodation, Fees, Profile
            ├── warden/          # Dashboard, Students, Gatepasses, Accommodation, Fees
            ├── security/        # Dashboard, Verify Gatepass, Audit Log
            └── admin/           # Dashboard, Users, Hostels, Students, Gatepasses, Fees
```

## Getting Started

### Prerequisites

- Node.js 18 or higher
- MongoDB (local or Atlas)

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file by copying the example:

```bash
cp .env.example .env
```

Then fill in your values:

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/unistay
JWT_SECRET=pick_a_strong_random_string
JWT_EXPIRES_IN=7d
```

Seed the database with sample data (1 admin, 2 security guards, 8 wardens, 4 hostels, 100 students, fees, and gatepasses):

```bash
node utils/seed.js
```

Start the server:

```bash
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` and proxies API requests to the backend on port 3000.

### Default Login Credentials

After running the seed script, you can log in with any of the following accounts. All accounts use the password `password123`.

| Role     | Email                          |
|----------|--------------------------------|
| Admin    | admin@unistay.com              |
| Warden   | warden1@unistay.com through warden8@unistay.com |
| Security | security1@unistay.com          |
| Student  | student1@unistay.com through student100@unistay.com |

## API Routes

All routes are prefixed with `/api`.

**Auth** -- `POST /auth/login`, `GET /auth/me`, `PATCH /auth/change-password`

**Student** -- `GET|PATCH /student/profile`, `GET|POST /student/gatepasses`, `GET|POST /student/accommodation`, `GET /student/fees`, `POST /student/fees/:id/pay`

**Warden** -- `GET /warden/students`, `GET|PATCH /warden/gatepasses/:id`, `GET|PATCH /warden/accommodation/:id`, `GET /warden/fees`

**Security** -- `GET /security/gatepasses`, `GET /security/gatepasses/:id`, `PATCH /security/gatepasses/:id/out`, `PATCH /security/gatepasses/:id/in`, `GET /security/audit-log`

**Admin** -- Full CRUD on `/admin/users`, `/admin/hostels`, `/admin/students`, `/admin/gatepasses`, `/admin/fees`. Includes `POST /admin/users/bulk` for batch user creation, `POST /admin/fees/bulk` for hostel-wide fee generation, `PATCH /admin/hostels/:id/assign-warden`, `PATCH /admin/students/:id/assign-hostel`, and `GET /admin/dashboard` for system statistics.

## Security Considerations

- Passwords are hashed with bcrypt (12 salt rounds) and never returned in API responses
- JWT tokens are validated on every protected request with automatic expiry handling
- Role-based middleware restricts each route to its intended user type
- Student routes enforce ownership checks so a student can only access their own data
- Warden routes are scoped to their assigned hostel only
- The register endpoint does not exist publicly; only admins can create user accounts
- Input validation runs on all request bodies with Mongoose schema validators
- CORS is restricted to the configured frontend origin
