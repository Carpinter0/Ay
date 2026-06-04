# Ay Amor Backend — Node.js + Express + Prisma + Neon PostgreSQL

This is the backend API for the Ay Amor romantic subscription platform.

## Stack

- **Runtime:** Node.js 18+
- **Framework:** Express 4.x with TypeScript
- **Database:** PostgreSQL via Neon
- **ORM:** Prisma
- **Auth:** JWT (JSON Web Tokens)
- **Payments:** Stripe
- **Validation:** Zod
- **Hosting:** Vercel (serverless)

## Setup

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

Required variables:
- `DATABASE_URL`: PostgreSQL connection string from Neon
- `JWT_SECRET`: A strong secret for signing tokens
- `STRIPE_SECRET_KEY`: Your Stripe API key
- `STRIPE_WEBHOOK_SECRET`: Your Stripe webhook signing secret
- `FRONTEND_URL`: Your frontend URL

### 3. Set up the database

```bash
npm run prisma:generate
npm run prisma:migrate
```

### 4. Start the development server

```bash
npm run dev
```

The server will run on `http://localhost:3000`.

## API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/sync` - Sync user profile (requires auth)
- `GET /api/v1/auth/me` - Get current user (requires auth)

### Plans

- `GET /api/v1/planes` - Get all available plans

### Surprises

- `GET /api/v1/sorpresas` - Get all surprises (paginated, requires auth)
- `GET /api/v1/sorpresas/del-mes` - Get surprises for this month (requires auth)
- `GET /api/v1/sorpresas/:id` - Get surprise details (requires auth)

### Subscriptions

- `POST /api/v1/suscripciones/checkout` - Create checkout session (requires auth)
- `GET /api/v1/suscripciones/mia` - Get user's active subscription (requires auth)
- `GET /api/v1/suscripciones/status` - Get subscription status (requires auth)
- `POST /api/v1/suscripciones/cancelar` - Cancel subscription (requires auth)

### Webhooks

- `POST /api/v1/webhook/stripe` - Stripe webhook handler

## Database Schema

See `prisma/schema.prisma` for the complete data model.

## Deployment to Vercel

1. Push your code to GitHub
2. Connect the repository to Vercel
3. Add environment variables in Vercel dashboard
4. Vercel will automatically build and deploy on push to main

## Testing

```bash
npm run test
```

## Linting

```bash
npm run lint
```
