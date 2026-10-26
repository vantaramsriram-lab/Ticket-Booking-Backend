# Ticket Booking Backend

A REST API for managing venues, events, seat availability, bookings, and payments. Built with Node.js, Express, and PostgreSQL, this project uses Redis and BullMQ to process background jobs.

## Tech Stack

- Node.js and Express
- PostgreSQL and `node-pg-migrate`
- Redis with Docker Compose
- BullMQ for background jobs
- JWT authentication and bcrypt password hashing
- Nodemailer for email notifications
- HMAC-SHA256 for webhook signature verification
- Zod for request validation

## Prerequisites

Install Node.js, npm, PostgreSQL, Docker Desktop (or Docker Engine with the Compose plugin), and Git.

**Important:** PostgreSQL runs locally on your machine. Docker Compose starts Redis only.

## 1. Clone the Repository

```bash
git clone https://github.com/vantaramsriram-lab/Ticket-Booking-Backend.git
cd Ticket-Booking-Backend/Backend
npm install
```

## 2. Configure PostgreSQL

Make sure your local PostgreSQL service is running. Create a database and a dedicated application user using a PostgreSQL admin session:

```sql
CREATE USER ticket_app WITH PASSWORD 'replace_with_a_strong_password';
CREATE DATABASE ticket_booking_backend OWNER ticket_app;
```

You can use an existing database and user instead.

## 3. Configure Environment Variables

Create a `.env` file from the provided example.

**Windows PowerShell:**

```powershell
Copy-Item .env.example .env
```

**macOS / Linux:**

```bash
cp .env.example .env
```

Update `.env` with your local configuration:

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=ticket_booking_backend
DB_USER=ticket_app
DB_PASSWORD=replace_with_a_strong_password

JWT_KEY=replace_with_a_long_random_secret
JWT_EXPIRES_IN=1h

ADMIN_NAME=Project Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=replace_with_a_strong_admin_password

WEBHOOK_KEY=replace_with_a_long_random_webhook_secret
WEBHOOK_URL=http://localhost:5000/api/webhook/payment

REDIS_URL=redis://127.0.0.1:6379

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASS=your_smtp_app_password
MAIL_FROM="Ticket Booking <your_email@example.com>"
```

These are example values. Use strong, private secrets and your own credentials. Keep `.env` out of Git.

## 4. Start Redis Using Docker

Run this from the `Backend` directory:

```bash
docker compose up -d
```

Verify that Redis is running:

```bash
docker compose ps
docker compose logs redis
```

To stop Redis:

```bash
docker compose down
```

The Docker Compose configuration publishes Redis at `127.0.0.1:6379` and uses a named volume for data persistence. It does not start PostgreSQL.

## 5. Run Database Migrations

After confirming your `.env` database settings, run:

```bash
npx node-pg-migrate up
```

This applies the migrations in the `migrations` directory to your local database. Run migrations against a database you control, and review any rollback before using it on important data.

## 6. Start the API Server

For development:

```bash
npm run dev
```

Or use:

```bash
npm start
```

The server defaults to port `5000`.

Check the health endpoint:

```text
GET http://localhost:5000/health
```

A successful response indicates that the API can query PostgreSQL. Check Redis and the background worker separately.

## 7. Start the Background Worker

Open a second terminal and navigate to `Ticket-Booking-Backend/Backend`:

```bash
npm run worker
```

Keep the API and worker running in separate terminals.

The API adds jobs to BullMQ, Redis stores queue state, and the worker processes jobs from the `booking-jobs` queue.

Current job types include:

- `release-expired-hold` — attempts to release a seat when its hold expires.
- `send-booking-confirmation` — sends a booking confirmation email.

Jobs require a reachable Redis instance and a running worker to be processed.

## Optional Commands

Create an admin account using the credentials in `.env`:

```bash
node scripts/create-admin.js
```

Run the queue test script:

```bash
npm run test:queue
```

Use a development database and test credentials when running these utilities.

## API Route Groups

| Prefix | Purpose |
|---|---|
| `/api/auth` | Registration, login, and authentication |
| `/api/events` | Event management |
| `/api/venues` | Venue management |
| `/api/bookings` | Bookings and temporary seat holds |
| `/api/payments` | Payment initiation |
| `/api/webhook` | Payment webhook receiver |
| `/health` | API and PostgreSQL connectivity check |

Refer to the files in `src/routes` for the exact endpoints, HTTP methods, and request formats.

## How Docker, Redis, and BullMQ Work Together

Docker runs Redis without requiring each developer to install Redis directly on their operating system.

BullMQ manages background jobs, Redis stores queue state, and a separate Node.js worker processes queued jobs. PostgreSQL remains the primary database for users, venues, events, seats, bookings, and payments.

This separation keeps background tasks such as expiring seat holds and sending emails from being tied directly to the lifetime of an API request.

## Troubleshooting

- **PostgreSQL connection errors:** Check that PostgreSQL is running and that the database credentials match `.env`.
- **Redis connection errors:** Check `docker compose ps`, inspect Redis logs, and verify `REDIS_URL`.
- **Jobs are not processing:** Ensure the worker is running with `npm run worker`.
- **Migration failures:** Check database permissions and run migration commands from the `Backend` directory.
- **Email failures:** Verify the SMTP settings and credentials. Gmail may require an app password.

## Security

- Never commit `.env` or private credentials.
- Use strong, unique JWT and webhook secrets.
- Do not expose Redis publicly.
- Do not use example credentials for production.
- Configure deployment secrets in the hosting provider's environment settings.

## License

No license file is currently specified in this repository.
