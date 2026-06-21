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
- **Mentor discovery** — Browse and search mentors, view profiles with ratings
- **Booking system** — Schedule 1-on-1 mentoring sessions with Stripe payments
- **Real-time chat & file sharing** — Socket.io-powered messaging with document uploads
- **Video calls** — In-session WebRTC video calling
- **Session management** — Start, join, postpone, and end sessions
- **Session reviews** — Rate and review completed sessions
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
│   │   │   ├── my-bookings/     # Booking list
│   │   │   ├── my-sessions/     # Session list
│   │   │   ├── session/         # Live session (chat, video, file upload)
│   │   │   ├── payment/         # Checkout page
│   │   │   ├── review/          # Session review
│   │   │   └── components/      # Shared UI components (Navbar, Footer, LoadingSkeleton, etc.)
│   │   ├── lib/
│   │   │   ├── store/           # Zustand stores
│   │   │   ├── hooks/           # TanStack Query hooks
│   │   │   └── axios.js         # Axios instance with httpOnly cookies
│   │   └── middleware.js        # Route protection middleware
│   └── package.json
│
├── backend/                     # Express.js 5 API
│   ├── src/
│   │   ├── controllers/         # Route handlers (auth, booking, mentor, session, payment, review, upload)
│   │   ├── middleware/          # Auth, rate limiting, error handling
│   │   ├── models/              # Mongoose schemas (User, RefreshToken, Booking, Session, Message, etc.)
│   │   ├── routes/              # Express routers
│   │   ├── services/            # Business logic
│   │   ├── socket/              # Socket.io handlers
│   │   ├── utils/               # Password validator, etc.
│   │   ├── config/              # DB connection
│   │   └── __tests__/           # Integration tests
│   ├── server.js                # App entrypoint
│   └── package.json
│
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
| GET | `/api/mentors/:id` | Get mentor profile |
| POST | `/api/bookings` | Create booking |
| POST | `/api/payments/create-payment-intent` | Create Stripe payment intent |
| POST | `/api/payments/confirm` | Confirm payment |
| POST | `/api/upload` | Upload file (image, doc, pdf, etc.) |
| PUT | `/api/sessions/:id/start` | Start session (mentor only) |
| PUT | `/api/sessions/:id/end` | End session (mentor only) |
| PUT | `/api/sessions/:id/postpone` | Reschedule session |
| POST | `/api/reviews/:bookingId` | Submit session review |

## Security

- **httpOnly cookies** — Tokens are never exposed to JavaScript (no localStorage)
- **Token rotation** — Refresh token is rotated on every use; old token is revoked
- **Rate limiting** — 5 attempts/15min for register, 10/15min for login, with exponential backoff (2^n seconds, capped at 1 hour)
- **Timing attack prevention** — Constant-time bcrypt comparison with dummy hash for non-existent users
- **User blocking** — Blocked users' tokens are immediately revoked
- **Race condition protection** — Atomic `findOneAndUpdate` ensures only one refresh succeeds
- **Stripe webhook verification** — Raw body parsing for webhook signature validation
- **Payment integrity** — Server-side PaymentIntent verification before marking payments complete
- **Socket authorization** — Participant-only access to session rooms and messages
- **Session escrow** — Atomic escrow release prevents TOCTOU race conditions in payouts

## Testing

```bash
cd backend
npm test                  # Run tests
npm run test:coverage     # With coverage report
```

Tests cover: register, login, token refresh, logout, error codes, rate limiting, timing attack prevention, user block, and race condition prevention.

## Author

**Atiya Inayat**

## License

MIT
