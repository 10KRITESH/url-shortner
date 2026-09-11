# 🚀 URL Shortener & Analytics Platform

A full-stack URL shortening service built with **React**, **Node.js**, and **PostgreSQL**. Generate short links, track clicks over time, and manage all your links from a clean dashboard.

---

## 🏗️ Architecture

```mermaid
graph TD
    User([User Browser]) <--> Frontend[Frontend - React/Vite]
    Frontend <--> API[Backend API - Express.js]
    API <--> DB[(PostgreSQL Database)]
    API <--> Auth[Auth Middleware - JWT]
    
    subgraph "Backend Services"
        URL[URL Shortening]
        ANLY[Analytics Tracking]
        AUTH_S[User Authentication]
    end
    
    API --- URL
    API --- ANLY
    API --- AUTH_S
```

---

## ✨ Features

-   **Shorten URLs**: Quickly generate short, shareable links.
-   **Custom Aliases**: Create easy-to-remember custom URLs (e.g., `link.com/my-portfolio`).
-   **Link Expiration**: Set expiration dates for links (optional).
-   **Analytics & Trends**:
    -   Total click counts.
    -   Clicks over time (30-day timeline visualization).
-   **User Dashboard**: Manage your links, see stats, and delete old URLs.
-   **Secure Authentication**: JWT-based login and registration.
-   **Rate Limiting**: Protection against brute-force and spam.

---

## 🛠️ Tech Stack

### Frontend
-   **Framework**: React 18
-   **Styling**: Vanilla CSS (Modern Aesthetics)
-   **State Management**: Context API
-   **Routing**: React Router
-   **Charts**: Analytics visualization via custom components.

### Backend
-   **Runtime**: Node.js
-   **Framework**: Express.js
-   **Database**: PostgreSQL
-   **Auth**: JSON Web Tokens (JWT) & bcrypt
-   **Middlewares**: CORS, Express Rate Limit.

---

## 📂 Project Structure

```text
├── backend/
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── controllers/    # Request handlers (logic)
│   │   ├── middleware/     # Auth guards
│   │   ├── models/         # SQL schemas
│   │   ├── routes/         # Express API endpoints
│   │   └── utils/          # Helper functions
│   └── .env                # Environment variables
├── frontend/
│   ├── src/
│   │   ├── api/            # API service calls
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # Global state (Auth)
│   │   ├── pages/          # Main application views
│   │   └── index.css       # Core design system
│   └── vite.config.js      # Vite dev server & proxy config
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
-   [Node.js](https://nodejs.org/) (v18 or higher)
-   [PostgreSQL](https://www.postgresql.org/) running locally

### 1. Clone the repository
```bash
git clone https://github.com/10KRITESH/url-shortner.git
cd url-shortner
```

### 2. Set up the Database
Create a PostgreSQL database and run the schema:
```bash
psql -U postgres -c "CREATE DATABASE urlshortener;"
psql -U postgres -d urlshortener -f backend/src/models/schema.sql
```

### 3. Configure Environment Variables
Create a `.env` file inside the `backend/` folder:
```env
POSTGRES_URL=postgresql://postgres:your_password@localhost:5432/urlshortener
JWT_SECRET=your_super_secret_key
PORT=5000
BASE_URL=http://localhost:3000
```

### 4. Start the Backend
```bash
cd backend
npm install
npm run dev
```

### 5. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```

### 6. Access the application
-   **Frontend**: `http://localhost:3000`
-   **Backend API**: `http://localhost:5000`

> The frontend's Vite dev server automatically proxies `/api` requests to the backend on port 5000.

---

## 🔒 Security

-   **Password Hashing**: Bcrypt is used for secure password storage.
-   **Protected Routes**: Sensitive API actions require a valid JWT bearer token.
-   **Rate Limiting**: 100 requests per 15 minutes per IP on all API endpoints.

## 📈 Database Schema

The system uses three tables:
1.  `users`: Stores user credentials.
2.  `urls`: Stores original URLs, short codes, and associations.
3.  `clicks`: Stores a timestamp record for every redirect.

---

Developed by [Kritesh Goud](https://github.com/10KRITESH)
