# Finance Dashboard — Backend Documentation

## Overview

A RESTful API built with **Node.js**, **Express**, **MongoDB (Mongoose)**, **JWT**, and **Role-Based Access Control (RBAC)** for managing financial records, user authentication, and dashboard analytics.

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Node.js | Runtime |
| Express.js | Web framework |
| MongoDB | Database |
| Mongoose | ODM for MongoDB |
| JWT | Authentication tokens |
| bcryptjs | Password hashing |
| cors | Cross-origin support |
| dotenv | Environment variables |

---

## Project Structure

```
backend/
├── config/
│   └── db.js                  # MongoDB connection
├── controllers/
│   ├── user.controller.js     # Register, Login, Get Users
│   ├── record.controller.js   # CRUD for financial records
│   └── dashboard.controller.js # Summary & category analytics
├── middleware/
│   ├── auth.js                # JWT token verification
│   └── role.js                # Role-based access control
├── models/
│   ├── User.js                # User schema
│   └── Record.js              # Financial record schema
├── routes/
│   ├── user.routes.js         # /api/users
│   ├── record.routes.js       # /api/records
│   └── dashboard.routes.js    # /api/dashboard
├── server.js                  # Entry point
└── .env                       # Environment config
```

---

## Environment Variables (`.env`)

```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/financeDB?retryWrites=true&w=majority
JWT_SECRET=secret123
```

---

## Database Models

### User (`models/User.js`)

| Field | Type | Details |
|-------|------|---------|
| name | String | User's full name |
| email | String | Unique email address |
| password | String | Bcrypt-hashed password |
| role | String | `viewer`, `analyst`, or `admin` |
| isActive | Boolean | Default `true` |

### Record (`models/Record.js`)

| Field | Type | Details |
|-------|------|---------|
| userId | ObjectId | Reference to User |
| amount | Number | Transaction amount |
| type | String | `income` or `expense` |
| category | String | Free text (e.g., Salary, Food) |
| date | Date | Defaults to current date |
| note | String | Optional description |
| isDeleted | Boolean | Soft delete flag (default `false`) |

---

## API Endpoints

### Authentication (`/api/users`)

| Method | Route | Auth | Role | Description |
|--------|-------|------|------|-------------|
| POST | `/api/users/register` | No | — | Register a new user |
| POST | `/api/users/login` | No | — | Login and get JWT token |
| GET | `/api/users` | Yes | admin | List all users |

### Records (`/api/records`)

| Method | Route | Auth | Role | Description |
|--------|-------|------|------|-------------|
| POST | `/api/records` | Yes | admin | Create a record |
| GET | `/api/records` | Yes | any | Get records (with optional `?type=` and `?category=` filters) |
| PUT | `/api/records/:id` | Yes | admin | Update a record |
| DELETE | `/api/records/:id` | Yes | admin | Soft-delete a record |

### Dashboard (`/api/dashboard`)

| Method | Route | Auth | Role | Description |
|--------|-------|------|------|-------------|
| GET | `/api/dashboard/summary` | Yes | analyst, admin | Total income, expense, net balance |
| GET | `/api/dashboard/category` | Yes | analyst, admin | Totals grouped by category |

---

## Middleware

### `auth.js` — JWT Verification

- Reads `Authorization` header (supports both raw token and `Bearer <token>` format)
- Verifies token using `JWT_SECRET`
- Attaches decoded payload (`id`, `role`) to `req.user`
- Returns `401` if missing or invalid

### `role.js` — Role-Based Access Control

- Accepts allowed roles as arguments: `role("admin")`, `role("analyst", "admin")`
- Compares `req.user.role` against allowed list
- Returns `403 Access Denied` if role not permitted

---

## How to Run

```bash
cd backend
npm install
node server.js
```

Server starts on `http://localhost:5000`.

---

## Test Flow

1. `POST /api/users/register` — create a user with role `admin`
2. `POST /api/users/login` — get JWT token
3. Use token in `Authorization` header for all other requests
4. `POST /api/records` — create income/expense records
5. `GET /api/records` — view records
6. `GET /api/dashboard/summary` — view totals
7. `GET /api/dashboard/category` — view category breakdown
