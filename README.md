# Mentora — Mentorship Platform

A full-stack mentorship marketplace connecting learners with industry professionals. Built with Next.js 16, Express.js 5, and MongoDB.

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 16, React 19, Tailwind CSS, Zustand, TanStack Query, Axios, React Hook Form + Zod, Socket.IO Client, WebRTC |
| **Backend** | Express.js 5, Mongoose, JWT, bcryptjs, Socket.IO, Stripe, Cloudinary, Nodemailer |
| **Database** | MongoDB Atlas |
| **Testing** | Jest, Supertest |

## Features

- **Authentication** — Register/login with httpOnly cookie-based JWT, refresh token rotation with family-based replay detection, rate limiting with exponential backoff, timing attack prevention
- **Role-based access** — Admin, Mentor, Mentee roles with route-level protection (Next.js middleware + Express JWT middleware)
- **Mentor discovery** — Browse/search/filter mentors by skill, rate, rating; view profiles with availability summaries and next available slot
- **Booking system** — Mentor availability management, weekly slot generation, 15-minute reservation hold during Stripe checkout
- **Host-controlled sessions** — Google Meet–style admission flow: mentor joins first (waiting room), mentee requests entry, mentor admits/declines. Video/chat only activate after admission
- **Real-time chat & file sharing** — Socket.IO-powered messaging with file uploads (PDF, docs, images) within live sessions
- **Video calls** — In-session WebRTC peer-to-peer video calling with STUN signaling via Socket.IO
- **Payment processing** — Stripe Checkout with webhook-based booking creation, automatic payout release to mentors on session completion
- **Session reviews** — Rate (1–5) and review completed sessions; mentor profiles display average rating
- **Admin panel** — User management (search, block/unblock), mentor approvals
- **Notifications** — In-app notifications for booking confirmations, session events, review requests
- **Password reset** — Forgot/reset password flow via email (Nodemailer)

## Project Structure

```
mentora/
├── frontend/                        # Next.js 16 application
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/              # Login, Register pages
│   │   │   ├── admin/               # Admin panel (users, approvals)
│   │   │   ├── bookings/            # Booking list with session status
│   │   │   ├── dashboard/           # Mentee dashboard
│   │   │   ├── mentor/              # Mentor dashboard, availability, profile creation
│   │   │   ├── mentors/             # Mentor discovery (browse, detail)
│   │   │   ├── my-sessions/         # Session list
│   │   │   ├── session/             # Live session (admission, video call, chat, file upload)
│   │   │   ├── payment/             # Payment success page
│   │   │   ├── review/              # Session rating & review
│   │   │   ├── settings/            # Account settings
│   │   │   ├── forgot-password/     # Password reset request
│   │   │   ├── reset-password/      # Password reset with token
│   │   │   ├── components/          # Shared UI (Navbar, Footer, VideoCall, etc.)
│   │   │   └── providers/           # React Query provider
│   │   ├── lib/
│   │   │   ├── store/               # Zustand auth store
│   │   │   ├── hooks/               # TanStack Query hooks (useSession, useBookings, etc.)
│   │   │   ├── axios.js             # Axios instance with httpOnly cookies + 401 refresh interceptor
│   │   │   └── socket.js            # Socket.IO client singleton
│   │   ├── components/              # AuthProvider (hydration)
│   │   └── middleware.js            # Next.js edge route protection
│   ├── next.config.mjs              # Rewrites (/api/*, /socket.io/* → backend)
│   └── package.json
│
├── backend/                         # Express.js 5 API
│   ├── src/
│   │   ├── controllers/             # Route handlers (auth, booking, mentor, session, payment, review, etc.)
│   │   ├── middleware/              # Auth (JWT), rate limiting, validation, error handling
│   │   ├── models/                  # Mongoose schemas (User, RefreshToken, Booking, Session, Message, etc.)
│   │   ├── routes/                  # Express routers
│   │   ├── services/                # Stripe + Cloudinary service wrappers
│   │   ├── socket/                  # Socket.IO auth middleware + event handlers
│   │   ├── utils/                   # Password validator
│   │   ├── validators/              # Express-validator chains
│   │   ├── config/                  # DB, Stripe, Cloudinary connections
│   │   ├── uploads/                 # Uploaded files (avatars, chat attachments)
│   │   └── __tests__/               # Integration tests (auth, booking, mentor)
│   ├── server.js                    # Entry point (Express + Socket.IO on same HTTP server)
│   └── package.json
│
└── README.md
```

## Setup

### Prerequisites

- Node.js 20+
- MongoDB (local or Atlas)
- Stripe account (for payments)
- Cloudinary account (for image uploads)

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
cp .env.example .env
npm install
npm run dev               # Starts on port 3000
```

### Environment Variables

**Backend `.env`**

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `PORT` | Server port (default 5000) |
| `NODE_ENV` | `development` or `production` |
| `JWT_SECRET` | Secret for signing access tokens |
| `JWT_REFRESH_SECRET` | Different secret for refresh tokens |
| `SECURE_COOKIES` | Set `true` for HTTPS (ngrok testing) |
| `CORS_ORIGIN` | Comma-separated allowed origins |
| `STRIPE_SECRET_KEY` | Stripe API secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

**Frontend `.env`**

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_STRIPE_KEY` | Stripe publishable key |
| `BACKEND_URL` | Backend URL for rewrites (default: `http://localhost:5000`) |

## API Endpoints

### Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | Public | Create account (password: 8+ chars, upper, lower, number, special) |
| POST | `/api/auth/login` | Public (rate-limited) | Authenticate, sets httpOnly cookies |
| POST | `/api/auth/refresh` | Public (cookie) | Rotate refresh token pair |
| POST | `/api/auth/logout` | Protected | End session, revoke token, clear cookies |
| GET | `/api/auth/me` | Protected | Get current user (session hydration) |
| GET | `/api/auth/sessions` | Protected | List active refresh token sessions |
| POST | `/api/auth/sessions/revoke-all` | Protected | Revoke all sessions, clear cookies |

### Mentors

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/mentors/profile` | Protected (mentor) | Create mentor profile |
| GET | `/api/mentors/my-profile` | Protected (mentor) | Get own profile |
| GET | `/api/mentors` | Public | Browse mentors (search, skill, rate, rating filters, paginated) |
| GET | `/api/mentors/:id` | Public | Get mentor detail with next available slot |

### Bookings

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/bookings/my` | Protected | List user's bookings with session + review status |

### Sessions

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/sessions/:bookingId/join` | Protected | Enter meeting (mentor → host_joined, mentee → guest_waiting + admission_request) |
| POST | `/api/sessions/:sessionId/admit` | Protected (mentor) | Admit mentee (status → live, emits guest_admitted) |
| POST | `/api/sessions/:sessionId/decline` | Protected (mentor) | Decline mentee (status → host_joined, emits admission_declined) |
| PUT | `/api/sessions/:bookingId/end` | Protected (mentor) | End session, release payment |
| GET | `/api/sessions/:sessionId` | Protected | Get session with computed time status |

### Payments

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/payments/create-checkout` | Protected | Create Stripe Checkout session |
| POST | `/api/payments/webhook` | Stripe signature | Stripe webhook (creates booking on payment success) |
| POST | `/api/payments/confirm` | Protected | Confirm payment + create booking (polling fallback) |
| GET | `/api/payments/success` | Protected | Get payment + booking details for success page |
| POST | `/api/payments/:bookingId/release` | Protected (mentor) | Transfer payment to mentor's Stripe account |

### Slots

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/slots/generate` | Protected (mentor) | Generate 1-hour slots from weekly availability |
| GET | `/api/slots/available` | Public | Get available slots for a mentor+date |
| POST | `/api/slots/:slotId/reserve` | Protected (mentee) | Reserve a slot (15-min hold during checkout) |
| POST | `/api/slots/:slotId/release` | Protected | Release a reserved slot |

### Reviews

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/reviews` | Protected | Submit session review (body: mentorId, bookingId, rating, comment) |
| GET | `/api/reviews/:mentorId` | Public | Get mentor reviews (paginated) |

### Notifications

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/notifications` | Protected | List user's notifications (paginated) |
| PATCH | `/api/notifications/:id/read` | Protected | Mark notification as read |
| PATCH | `/api/notifications/read-all` | Protected | Mark all notifications as read |

### Admin

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/admin/users` | Protected (admin) | List users with search |
| PATCH | `/api/admin/users/:userId/block` | Protected (admin) | Block/unblock user |
| PATCH | `/api/admin/mentors/:userId/approve` | Protected (admin) | Approve/reject mentor profile |

### Uploads

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/upload` | Protected | Upload file (chat attachments) |
| POST | `/api/users/photo` | Protected | Upload profile photo (→ Cloudinary) |

## Security

- **httpOnly cookies** — Access and refresh tokens are never exposed to JavaScript (no localStorage)
- **Refresh token rotation** — Old token revoked on every refresh; replay detection via token family (all devices logged out on compromise)
- **SHA-256 hashing** — Refresh tokens are hashed before storage in MongoDB
- **Rate limiting** — 5 attempts/15min for register, 10/15min for login, 100/15min general; exponential backoff (2^n × 2s, capped at 1 hour) on repeated auth failures
- **Timing attack prevention** — Constant-time bcrypt comparison with dummy hash for non-existent users
- **User blocking** — Blocked users' tokens are immediately revoked via family-wide revocation
- **Race condition protection** — Atomic `findOneAndUpdate` ensures only one refresh succeeds per token
- **Stripe webhook verification** — Raw body parsing with signature validation
- **Socket.IO authentication** — JWT verification in Socket.IO middleware; participant-only access to session rooms
- **CORS whitelist** — Explicit origin allowlist; credentials included only for trusted origins

## Real-Time Architecture (Socket.IO)

| Event | Direction | Purpose |
|-------|-----------|---------|
| `join_session` | Client → Server | Join Socket.IO room, load chat history, notify peer |
| `send_message` / `receive_message` | Bidirectional | Real-time chat within live sessions |
| `admission_request` | Server → Mentor | Mentee requests to join (emitted to `user:${mentorId}` room) |
| `guest_admitted` | Server → Room | Mentor admitted mentee, session is now live |
| `admission_declined` | Server → Mentee | Mentor declined the join request |
| `video-offer` / `video-answer` / `ice-candidate` | Bidirectional | WebRTC signaling relay |
| `session_ended` | Server → Room | Mentor ended the session |

## Testing

```bash
cd backend
npm test                  # Run integration tests
npm run test:coverage     # With coverage report
```

Tests cover: register, login, token refresh, logout, error codes, rate limiting, timing attack prevention, user block, race condition prevention, mentor profile CRUD, and booking retrieval.

## Author

**Atiya Inayat**

## License

MIT
