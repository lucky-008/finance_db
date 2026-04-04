# Finance Dashboard

A full-stack finance management application for tracking income, expenses, and viewing analytics with role-based access control.

## Tech Stack

- **Frontend:** React 19, Vite, Axios
- **Backend:** Node.js, Express, MongoDB (Mongoose)
- **Authentication:** JWT (JSON Web Tokens), bcryptjs

## Features

- **User Registration & Login** — Secure authentication with JWT tokens and strong password validation
- **Financial Records** — Create, view, update, and soft-delete income/expense records
- **Dashboard Analytics** — View total income, total expense, net balance, category-wise breakdown, recent activity, and monthly/weekly trends
- **Search & Filter** — Search records by category or note keyword, filter by type and category
- **Pagination** — Records are paginated (10 per page) with page navigation controls
- **Role-Based Access** — Three roles (viewer, analyst, admin) with different permission levels
- **User Management** — Admin panel to view all registered users
- **Rate Limiting** — API rate limiting (100 requests per 15 minutes per IP)
- **Error Handling** — All API endpoints wrapped in try-catch with proper error responses

## Roles & Permissions

| Role | Permissions |
|------|-------------|
| **Viewer** | Register, login, view records |
| **Analyst** | All viewer permissions + dashboard access (summary & category analytics) |
| **Admin** | Full access: create/edit/delete records, dashboard, view all users |

## API Endpoints

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| POST | `/api/users/register` | No | — | Register a new user |
| POST | `/api/users/login` | No | — | Login and receive JWT token |
| GET | `/api/users` | Yes | Admin | List all users |
| POST | `/api/records` | Yes | Admin | Create a financial record |
| GET | `/api/records` | Yes | Any | Get records (filterable, searchable, paginated) |
| PUT | `/api/records/:id` | Yes | Admin | Update a record |
| DELETE | `/api/records/:id` | Yes | Admin | Soft-delete a record |
| GET | `/api/dashboard/summary` | Yes | Analyst, Admin | Get income/expense totals & net balance |
| GET | `/api/dashboard/category` | Yes | Analyst, Admin | Get totals grouped by category |
| GET | `/api/dashboard/recent` | Yes | Analyst, Admin | Get 10 most recent records |
| GET | `/api/dashboard/trends` | Yes | Analyst, Admin | Get monthly/weekly income & expense trends |

### Query Parameters for GET `/api/records`

| Parameter | Type | Description |
|-----------|------|-------------|
| `type` | string | Filter by `income` or `expense` |
| `category` | string | Filter by category name |
| `search` | string | Search in category and note fields |
| `page` | number | Page number (default: 1) |
| `limit` | number | Records per page (default: 10, max: 100) |

### Query Parameters for GET `/api/dashboard/trends`

| Parameter | Type | Description |
|-----------|------|-------------|
| `period` | string | `monthly` (default) or `weekly` |

## Password Rules

- Must be greater than 6 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one digit
- At least one special character
- Must not be similar to the user's name

## How It Works

1. **Register** — Users create an account with name, email, password, and role selection
2. **Login** — Authenticated users receive a JWT token stored in localStorage
3. **Records** — Admins can add income/expense records with amount, type, category, and notes; all users can view, search, and filter records with pagination
4. **Dashboard** — Analysts and admins can view summary cards (total income, total expense, net balance), category-wise breakdowns, recent activity, and monthly/weekly trends
5. **User Management** — Admins can view a list of all registered users

## Getting Started

### Backend
```bash
cd backend
npm install
# Create a .env file with MONGO_URI and JWT_SECRET
npm start
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```
