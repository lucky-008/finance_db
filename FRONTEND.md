# Finance Dashboard — Frontend Documentation

## Overview

A **React** single-page application built with **Vite** that provides a role-based UI for user authentication, financial record management, and dashboard analytics. Communicates with the Express backend via **Axios**.

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| React | UI library |
| Vite | Dev server & bundler |
| Axios | HTTP client for API calls |

---

## Project Structure

```
frontend/
├── public/
├── src/
│   ├── api.js        # All API call functions (Axios)
│   ├── App.jsx       # Main application component
│   ├── index.css     # Global styles
│   └── main.jsx      # React entry point
├── .env              # API base URL config
├── index.html
├── package.json
└── vite.config.js
```

---

## Environment Variables (`.env`)

```
VITE_API_BASE_URL=http://localhost:5000/api
```

Change this to point to your deployed backend in production.

---

## Features by Role

| Feature | viewer | analyst | admin |
|---------|--------|---------|-------|
| Register | Yes | Yes | Yes |
| Login / Logout | Yes | Yes | Yes |
| View Records | Yes | Yes | Yes |
| Filter Records | Yes | Yes | Yes |
| Create Record | — | — | Yes |
| Edit Record | — | — | Yes |
| Delete Record | — | — | Yes |
| Dashboard Summary | — | Yes | Yes |
| Category Breakdown | — | Yes | Yes |
| View All Users | — | — | Yes |

---

## Pages / Sections

### 1. Auth Screen (not logged in)

Two side-by-side forms:

- **Register** — name, email, password, role (dropdown: viewer/analyst/admin)
- **Login** — email, password → returns JWT token, stores in `localStorage`

### 2. Records Tab (all roles)

- **Filters** — type (`income`/`expense`) and category (free text), then click "Load Records"
- **Records Table** — shows amount, type, category, note
- **Create/Edit Form** (admin only) — amount, type dropdown, category, note
- **Actions** (admin only) — Edit and Delete buttons per row
- Records auto-load after login

### 3. Dashboard Tab (analyst & admin)

- **Summary Card** — total income, total expense, net balance (positive/negative indicator)
- **Category Card** — list of categories with their totals

### 4. Users Tab (admin only)

- **Users Table** — name, email, role, active status
- Click "Load Users" to fetch from API

---

## API Integration (`src/api.js`)

| Function | Method | Endpoint | Auth |
|----------|--------|----------|------|
| `registerUser(payload)` | POST | `/users/register` | No |
| `loginUser(payload)` | POST | `/users/login` | No |
| `getUsers(token)` | GET | `/users` | Yes |
| `createRecord(token, payload)` | POST | `/records` | Yes |
| `getRecords(token, filters)` | GET | `/records` | Yes |
| `updateRecord(token, id, payload)` | PUT | `/records/:id` | Yes |
| `deleteRecord(token, id)` | DELETE | `/records/:id` | Yes |
| `getDashboardSummary(token)` | GET | `/dashboard/summary` | Yes |
| `getDashboardCategory(token)` | GET | `/dashboard/category` | Yes |

All authenticated requests send `Authorization: Bearer <token>` header.

---

## State Management

Uses React `useState` hooks (no external state library). Key state:

- `token` / `role` — stored in `localStorage` for persistence across page reloads
- `records` — fetched array of financial records
- `users` — fetched array of users (admin only)
- `summary` / `categoryData` — dashboard analytics
- `activeTab` — current view (`records`, `dashboard`, `users`)
- `editRecordId` — tracks which record is being edited

---

## Styling

Minimal CSS in `src/index.css`:

- Card-based layout with grid
- Responsive two-column grid for forms
- Clean table styling for records and users
- Tab navigation with active state highlight
- Dark buttons, rounded inputs

---

## How to Run

```bash
cd frontend
npm install
npm run dev
```

Opens at `http://localhost:5173`.

Make sure the backend is running on port `5000` first.

---

## Usage Flow

1. Open `http://localhost:5173`
2. **Register** a user (choose role: admin for full access)
3. **Login** with the registered email and password
4. Browse **Records** tab — load, filter, create (admin), edit, delete
5. Open **Dashboard** tab (analyst/admin) — view income/expense summary
6. Open **Users** tab (admin) — view all registered users
7. Click **Logout** to clear session
