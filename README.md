# Porthaven Delivery Tracking System

A modern international air and sea freight tracking application with real-time shipment tracking, customer dashboards, and admin management.

## Features

- **Public Tracking**: Track shipments by tracking number without login
- **Customer Dashboard**: View and manage linked shipments
- **Admin Panel**: Create shipments, update tracking events, edit/delete shipments
- **Authentication**: Admin-created accounts with role-based access (CUSTOMER/ADMIN)
- **WhatsApp Integration**: Customer support via WhatsApp
- **Real-time Status Updates**: 8-stage tracking workflow

## Tech Stack

### Frontend
- React 19 with TypeScript
- Vite 8
- Tailwind CSS v4
- React Router v7

### Backend
- Express.js
- PostgreSQL (Neon)
- Prisma ORM
- JWT Authentication
- bcryptjs for password hashing

## Setup Instructions

### Prerequisites
- Node.js 18+
- PostgreSQL database (or Neon account)

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd build-package-tracking-website
```

2. Install dependencies
```bash
# Frontend
npm install

# Backend
cd server
npm install
```

3. Configure environment variables

Create `server/.env`:
```env
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"
JWT_SECRET="your-random-jwt-secret-here"
FRONTEND_URL="http://localhost:8443"
PORT=3001
```

4. Set up database
```bash
cd server
npx prisma migrate dev --name init
npx tsx prisma/seed.ts
```

5. Create the admin account
```bash
cd server
ADMIN_EMAIL="admin@example.com" ADMIN_PASSWORD="strong-unique-password" npm run seed:admin
```

6. Start the servers

Backend (in `server/` directory):
```bash
npm run dev
```

Frontend (in root directory):
```bash
npm run dev
```

7. Access the application
- Frontend: http://localhost:8443
- Backend API: http://localhost:3001

## Admin Account

Create or rotate the production admin account with `npm run seed:admin` from the `server/` directory. The script reads `ADMIN_EMAIL` and `ADMIN_PASSWORD`, creates or updates that account as `ADMIN`, and demotes any other admin accounts to `CUSTOMER`.

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with an admin-created account

### Shipments
- `GET /api/shipments/:trackingNumber` - Public tracking
- `GET /api/shipments` - Get user's shipments (authenticated)
- `POST /api/shipments` - Create shipment (admin only)
- `PUT /api/shipments/:id` - Update shipment (admin only)
- `DELETE /api/shipments/:id` - Delete shipment (admin only)
- `PUT /api/shipments/:id/link` - Link shipment to account (customer)
- `POST /api/shipments/:id/events` - Add tracking event (admin only)

## Shipment Status Flow

1. ORDER_CREATED
2. PICKED_UP
3. IN_TRANSIT
4. ARRIVED_AT_FACILITY
5. CUSTOMS_CLEARANCE
6. OUT_FOR_DELIVERY
7. DELIVERED
8. EXCEPTION

## Development

### Database Migrations
```bash
cd server
npx prisma migrate dev --name migration-name
```

Production deploys should use:
```bash
cd server
npm run db:migrate
```

### Generate Prisma Client
```bash
cd server
npx prisma generate
```

### View Database
```bash
cd server
npx prisma studio
```

## Project Structure

```
├── src/
│   ├── components/    # Reusable UI components
│   ├── pages/         # Page components
│   ├── api.ts         # API client functions
│   ├── App.tsx        # Main app component
│   └── main.tsx       # Entry point
├── server/
│   ├── src/
│   │   ├── routes/    # API routes
│   │   ├── middleware/# Auth middleware
│   │   └── utils/     # Utility functions
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts    # Database seed script
│   └── .env           # Environment variables
└── vite.config.ts     # Vite configuration
```

## Security Notes

⚠️ **This is a development prototype and NOT production-ready.**

For production deployment, you need to implement:
- Strong JWT secrets
- Rate limiting
- HTTPS enforcement
- CSRF protection
- Input sanitization
- Password reset functionality
- Email verification
- Two-factor authentication
- Error logging/monitoring
- Database backups
- CI/CD pipeline

## License

Proprietary - All rights reserved
