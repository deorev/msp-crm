# MSP CRM

Local development scaffold for the MSP CRM. The repository contains an API
workspace (`api`) and a web workspace (`web`).

## Prerequisites

- Node.js 20 or newer and npm
- Docker Desktop with Docker Compose

## Windows setup

Run these commands in PowerShell from the repository root:

```powershell
Copy-Item .env.example .env
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Copy the generated 64-character value into `SESSION_KEY` in `.env`. Replace
`SEED_ADMIN_PASSWORD` with a local development password. The example values
are placeholders, not production credentials.

Install dependencies and start PostgreSQL. Compose publishes the database on
host port `5434` to avoid conflicts with a PostgreSQL server already installed
on Windows:

```powershell
npm install
docker compose up -d db
```

Create the database tables and the initial Admin account:

```powershell
npm run db:migrate --workspace @msp-crm/api
npm run db:seed --workspace @msp-crm/api
```

Start the API and web app in two separate PowerShell windows, both from the
repository root:

```powershell
npm run dev --workspace @msp-crm/api
```

```powershell
npm run dev --workspace @msp-crm/web
```

Open <http://localhost:5173> and sign in with `SEED_ADMIN_EMAIL` and
`SEED_ADMIN_PASSWORD` from `.env`. The API health check is at
<http://localhost:3001/health>.

Run the API and web tests:

```powershell
npm test --workspaces
```

Stop PostgreSQL when finished:

```powershell
docker compose down
```

## Local configuration

All runtime settings are read from `.env`. The API requires `DATABASE_URL`,
`TENANT_ID`, and a 32-byte hexadecimal `SESSION_KEY`. The seed script also
requires `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD`; `SEED_ADMIN_NAME` and
`TENANT_NAME` have local-development defaults.

The session cookie is encrypted, HTTP-only, and SameSite strict. It is marked
Secure when `NODE_ENV=production`; use HTTPS in production. This scaffold is
for local development and is not a production deployment recipe.
