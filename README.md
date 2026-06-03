# Mentora — Mentorship Platform

A full-stack mentorship marketplace connecting learners with industry professionals. Built with Next.js 16, Express.js 5, and MongoDB.

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 16, React 19, Tailwind CSS, Zustand, TanStack Query, Axios, React Hook Form + Zod |
| **Backend** | Express.js 5, Mongoose, JWT, bcryptjs, Socket.io, Stripe |
| **Database** | MongoDB Atlas |
| **Testing** | Jest, Supertest |

## Features

- **Authentication** — Register/login with httpOnly cookie-based JWT, token rotation, rate limiting with exponential backoff, timing attack prevention
- **Role-based access** — Admin, Mentor, Mentee roles with protected routes
- **Mentor discovery** — Browse and search mentors, view profiles
- **Booking system** — Schedule 1-on-1 mentoring sessions
- **Real-time chat** — Socket.io-powered messaging
- **Payments** — Stripe integration for session payments
- **Session management** — View and revoke active sessions
- **User blocking** — Admin can block users with immediate token revocation

## Project Structure

```
mentora/
├── frontend/                    # Next.js 16 application
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/          # Login, Register pages
│   │   │   ├── admin/           # Admin dashboard
│   │   │   ├── dashboard/       # Mentee dashboard
│   │   │   ├── mentor/          # Mentor dashboard
│   │   │   ├── mentors/         # Mentor discovery
│   │   │   ├── session/         # Session management
│   │   │   └── components/      # Shared UI components
│   │   └── lib/
│   │       ├── store/           # Zustand stores
│   │       └── axios.js         # Axios instance with httpOnly cookies
│   └── package.json
│
├── backend/                     # Express.js 5 API
│   ├── src/
│   │   ├── controllers/         # Route handlers (auth, booking, mentor, etc.)
│   │   ├── middleware/          # Auth, rate limiting, error handling
│   │   ├── models/              # Mongoose schemas (User, RefreshToken, etc.)
│   │   ├── routes/              # Express routers
│   │   ├── services/            # Business logic
│   │   ├── socket/              # Socket.io handlers
│   │   ├── utils/               # Password validator, etc.
│   │   ├── config/              # DB connection
│   │   └── __tests__/           # Integration tests
   │   ├── server.js             # App entrypoint
│   └── package.json
│
├── AUTHENTICATION_IMPLEMENTATION_PLAN.md
├── IMPLEMENTATION_CHECKLIST.md
├── QUICK_START.md
└── README.md
```

## Setup

### Prerequisites

- Node.js 20+
- MongoDB (local or Atlas)
- Stripe account (for payments)

### Backend

```bash
cd backend
cp .env.example .env      # Fill in your environment variables
npm install
npm run dev               # Starts on port 5000
```

### Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev               # Starts on port 3000
```

### Environment Variables

**Backend `.env`**
```
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.xxxxx.mongodb.net/
PORT=5000
NODE_ENV=development
JWT_SECRET=<32-byte-hex>
JWT_REFRESH_SECRET=<different-32-byte-hex>
SECURE_COOKIES=false
CORS_ORIGIN=http://localhost:3000
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Frontend `.env.local`**
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## API Endpoints

### Auth (Public)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Create account (password: 8+ chars, upper, lower, number) |
| POST | `/api/auth/login` | Authenticate, sets httpOnly cookies |
| POST | `/api/auth/refresh` | Rotate refresh token |
| POST | `/api/auth/logout` | End session, clear cookies |

### Auth (Protected — requires valid access token cookie)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/auth/me` | Get current user (session hydration) |
| GET | `/api/auth/sessions` | List active sessions |
| POST | `/api/auth/sessions/revoke` | Revoke all sessions |

### Other

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/mentors` | Browse mentors |
| POST | `/api/bookings` | Create booking |
| POST | `/api/payments` | Process payment |

## Authentication Architecture

- **httpOnly cookies** — Tokens are never exposed to JavaScript (no localStorage)
- **Token rotation** — Refresh token is rotated on every use; old token is revoked
- **Token families** — Track token lineage to revoke entire session chains
- **Rate limiting** — 5 attempts/15min for register, 10/15min for login, with exponential backoff (2^n seconds, capped at 1 hour)
- **Timing attack prevention** — Constant-time bcrypt comparison with dummy hash for non-existent users
- **User blocking** — Blocked users' tokens are immediately revoked on any request
- **Race condition protection** — Atomic `findOneAndUpdate` ensures only one refresh succeeds
- **CORS** — Environment-based, supports comma-separated multiple origins

## Error Codes

| Code | Meaning |
|------|---------|
| `MISSING_FIELDS` | Required fields not provided |
| `WEAK_PASSWORD` | Password doesn't meet strength requirements |
| `USER_EXISTS` | Email already registered |
| `INVALID_CREDENTIALS` | Wrong email or password |
| `USER_BLOCKED` | Account suspended |
| `NO_TOKEN` | No access token cookie |
| `TOKEN_EXPIRED` | Access token expired |
| `NO_REFRESH_TOKEN` | No refresh token cookie |
| `INVALID_REFRESH_TOKEN` | Refresh token invalid/expired |
| `TOKEN_REVOKED` | Token already used (replay detected) |
| `TOKEN_ROTATION_ERROR` | Race condition — token already rotated |
| `JWT_ERROR` | General JWT error |
| `DATABASE_ERROR` | Internal server/database error |
| `RATE_LIMITED` | Too many requests |

## Testing

```bash
cd backend
npm test                  # Run tests
npm run test:coverage     # With coverage report
npm run test:watch        # Watch mode
```

Tests cover: register, login, token refresh, logout, error codes, rate limiting, timing attack prevention, user block, and race condition prevention.

## Author

**Atiya Inayat**

## License

MIT
