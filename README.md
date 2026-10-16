# InsureFlow — Insurance Operations Portfolio

InsureFlow is a full-stack portfolio project demonstrating an insurance operations workspace. It is an independent demo and is **not** an official iptiQ or Swiss Re product. It is not designed for processing real insurance customer data.

## Features

- Responsive React + TypeScript operations dashboard.
- Overview metrics for customers, pending applications, active policies, premiums, and upcoming renewals.
- Customer directory with create, read, update, delete, search, duplicate-email protection, and validation.
- Insurance application submission and status workflow: `SUBMITTED`, `IN_REVIEW`, `APPROVED`, `DECLINED`.
- Policy create, read, update, delete, duplicate-policy-number protection, and renewal tracking for active policies expiring within 60 days.
- Spring Boot REST API, Spring Data JPA persistence, and Bean Validation.
- HTTP Basic authentication for the API and a sign-in screen in the frontend. Credentials are configurable with environment variables.
- Local H2 file database by default; optional MariaDB + Docker Compose setup.
- Demo records are seeded only when each corresponding table is empty. Existing records are not deleted by the seeder.
- Backend integration tests and a GitHub Actions CI workflow for backend tests and frontend build.
- Document center is explicitly marked as planned, not implemented.

## Technology

- Frontend: React 18, TypeScript, Vite, Lucide React, CSS
- Backend: Java 21, Spring Boot 3.5, Spring Security, Spring Web, Spring Data JPA, Bean Validation
- Persistence: H2 (local default) or MariaDB (Docker profile)
- Tests: JUnit 5, Spring Boot Test, MockMvc, Spring Security Test
- CI: GitHub Actions

## Run locally

Requirements: Java 21, Maven 3.9+, Node.js 20+ (Node 22 recommended), and npm.

### 1. Start the backend

```bash
cd backend
mvn spring-boot:run
```

The API starts at `http://localhost:8080`. Health is public at `http://localhost:8080/api/health`. All customer, application, policy, and session endpoints require authentication.

### 2. Start the frontend in a second terminal

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` and sign in with the local demo credentials below.

### Local demo credentials

- Username: `portfolio-admin`
- Password: `InsureFlowDemo2026!`

These defaults are for local demonstration only. Override them before sharing or deploying the app:

```bash
export INSUREFLOW_SECURITY_USERNAME='your-admin-user'
export INSUREFLOW_SECURITY_PASSWORD='use-a-long-unique-password'
```

Then restart the backend. The frontend keeps the Basic-auth credential in `sessionStorage` for the current browser tab/session and offers a sign-out button. This is a portfolio-grade demonstration, not a substitute for a production identity provider, MFA, HTTPS, rate limiting, account lifecycle management, or a formal security review.

### Database

The default H2 database is stored in `backend/data/` and persists across restarts. The H2 console is disabled. To use a different API URL, create `frontend/.env.local`:

```dotenv
VITE_API_URL=http://localhost:8080/api
```

### Optional Docker + MariaDB

Copy `.env.example` to `.env` and replace every placeholder with unique strong values, including `INSUREFLOW_SECURITY_PASSWORD`. Then run:

```bash
docker compose up --build
```

Open `http://localhost:8081`. The MariaDB volume persists data. Do not commit `.env` or real secrets.

## API reference

All endpoints except `GET /api/health` require HTTP Basic authentication.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Public health check |
| GET | `/api/auth/session` | Validate credentials and return current user |
| GET | `/api/customers` | List customers |
| GET | `/api/customers/{id}` | Read a customer |
| POST | `/api/customers` | Create a customer |
| PUT | `/api/customers/{id}` | Update a customer |
| DELETE | `/api/customers/{id}` | Delete a customer |
| GET | `/api/applications` | List applications |
| POST | `/api/applications` | Submit an application |
| PATCH | `/api/applications/{id}/status` | Update application status |
| GET | `/api/policies` | List policies |
| POST | `/api/policies` | Create a policy |
| PUT | `/api/policies/{id}` | Update a policy |
| DELETE | `/api/policies/{id}` | Delete a policy |

Example customer payload:

```json
{
  "fullName": "Alex Morgan",
  "email": "alex@example.com",
  "phone": "+34 600 000 000",
  "status": "ACTIVE"
}
```

Example policy payload:

```json
{
  "policyNumber": "POL-2026-0003",
  "holder": "Alex Morgan",
  "product": "Life Protect",
  "status": "ACTIVE",
  "annualPremium": 520.0,
  "startDate": "2026-01-01",
  "expiryDate": "2027-01-01"
}
```

## Tests and build

Backend tests:

```bash
mvn -f backend/pom.xml test
```

Frontend production build:

```bash
cd frontend
npm install
npm run build
```

GitHub Actions runs both on pushes and pull requests. Confirm the CI workflow is green before describing the build as verified.

## Publish to GitHub

1. Create a new **public** repository on GitHub, for example `insureflow-insurance-operations`.
2. From this project root, run:

```bash
git init
git add .
git status
git commit -m "Build InsureFlow insurance operations portfolio"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/insureflow-insurance-operations.git
git push -u origin main
```

3. Check `git status` and confirm `.env`, `backend/data/`, `node_modules/`, and build output are not included. Never commit real credentials or customer data.
4. Wait for the GitHub Actions checks to finish and fix any failures before adding the project to your CV/portfolio.

## Honest project status / limitations

This is a portfolio demonstration. The authentication implementation uses a single configurable in-memory admin user and HTTP Basic auth. Before any real deployment, replace it with a proper identity provider and role-based access control, enforce HTTPS, add audit trails, backups, production database migrations, stronger API error handling, rate limiting, and broader tests. The document center is a placeholder. No real customer or policy data should be used.
