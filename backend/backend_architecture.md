# 🚀 URL Shortener Backend: Architectural Overview & Guide

Welcome to the backend architecture guide! This backend is a high-performance **URL Shortener API** built using **Node.js (Express)**, **PostgreSQL** for storage, and **JSON Web Tokens (JWT)** for secure, stateless authentication. It features rate-limiting, custom alias creation, expiration dates, and real-time 30-day click analytics.

---

## 🏗️ Core Architecture & Tech Stack

```mermaid
graph TD
    Client[Client Browser / Frontend] -->|HTTP Requests| API_Gateway[Express Server app.js]
    API_Gateway -->|Rate Limiting / CORS| Router[Express Router]
    
    Router -->|/api/auth/*| AuthController[Auth Controller]
    Router -->|/api/urls/*| URLController[URL Controller]
    Router -->|/api/analytics/*| AnalyticsController[Analytics Controller]
    Router -->|/:code| RedirectHandler[Redirect Controller]

    AuthController -->|bcrypt / jwt| DB[(PostgreSQL Database)]
    URLController -->|nanoid / validation| DB
    AnalyticsController -->|aggregations| DB
    RedirectHandler -->|async telemetry| DB
```

### Key Libraries & Tech
*   **Express**: Lightweight web framework for handling routing, middleware, and request/response lifecycles.
*   **PostgreSQL (`pg` pool)**: Relational database storing users, URLs, and redirect clicks.
*   **JWT (`jsonwebtoken`)**: Stateless user authentication.
*   **bcryptjs**: Safe, slow hashing algorithm for storing user passwords securely.
*   **nanoid**: Generates short, URL-safe random string identifiers.
*   **express-rate-limit**: Safeguards endpoints (e.g., maximum 100 requests per 15 minutes per IP).

---

## 🗄️ Database Design (`schema.sql`)

The database consists of three relational tables optimized with indexes:

```mermaid
erDiagram
    USERS {
        uuid id PK
        string email UK
        string password_hash
        timestamp created_at
    }
    URLS {
        uuid id PK
        uuid user_id FK
        string short_code UK
        string original_url
        string custom_alias UK
        timestamp expires_at
        timestamp created_at
    }
    CLICKS {
        uuid id PK
        uuid url_id FK
        timestamp clicked_at
    }
    USERS ||--o{ URLS : "creates"
    URLS ||--o{ CLICKS : "receives"
```

*   [schema.sql](file:///home/kriteshgoud/Documents/NMIMS/projects/url_shortener/backend/src/models/schema.sql) defines:
    *   **`users`**: Manages credentials.
    *   **`urls`**: Associates shortened links with users. Supports expiration (`expires_at`) and custom URL slugs (`custom_alias`).
    *   **`clicks`**: Telemetry records tracking every click redirect timestamp.
    *   **Performance Indexes**: Indexes are placed on `short_code`, `custom_alias`, `user_id`, `url_id`, and `clicked_at` to ensure fast redirect lookups and timeline aggregations.

---

## 🚦 Request & Data Flows

### 1. User Authentication Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Client
    participant Auth as Auth Controller
    participant DB as PostgreSQL
    
    User->>Auth: POST /api/auth/register (email, password)
    Auth->>DB: Check if email exists
    Note over Auth: Hash password using bcrypt
    Auth->>DB: Insert new user record
    Auth->>User: Sign & return JWT Token + User info
```

*   **Registration** ([auth.controller.js:L5-52](file:///home/kriteshgoud/Documents/NMIMS/projects/url_shortener/backend/src/controllers/auth.controller.js#L5-52)): Checks password criteria, hashes the password via `bcrypt.hash` (10 rounds), saves it, signs a 7-day token, and returns it.
*   **Login** ([auth.controller.js:L54-93](file:///home/kriteshgoud/Documents/NMIMS/projects/url_shortener/backend/src/controllers/auth.controller.js#L54-93)): Fetches the database user, performs `bcrypt.compare` to verify credentials, and issues a 7-day JWT.
*   **Access Control Middleware** ([auth.middleware.js](file:///home/kriteshgoud/Documents/NMIMS/projects/url_shortener/backend/src/middleware/auth.middleware.js)): Inspects the HTTP request `Authorization: Bearer <token>` header, decodes user credentials, and puts it in `req.user`.

---

### 2. URL Shortening Flow

When creating a short URL via `POST /api/urls/shorten`:

```mermaid
flowchart TD
    Start([Request received]) --> AuthCheck{Is User Authenticated?}
    AuthCheck -->|No| Reject[401 Access Denied]
    AuthCheck -->|Yes| ValidURL{Is originalUrl valid URL?}
    
    ValidURL -->|No| BadReq[400 Invalid URL Format]
    ValidURL -->|Yes| Custom{Is customAlias provided?}
    
    Custom -->|Yes| AliasValid{Alias 3-50 chars & alphanumeric?}
    AliasValid -->|No| BadReq2[400 Invalid Alias Format]
    AliasValid -->|Yes| AliasTaken{Alias exists in database?}
    AliasTaken -->|Yes| Conflict[409 Alias Already Taken]
    AliasTaken -->|No| DBInsert[Save URL to Database]
    
    Custom -->|No| GenCode[Generate random nanoid]
    GenCode --> CodeTaken{Code exists in database?}
    CodeTaken -->|Yes| GenCode
    CodeTaken -->|No| DBInsert
    
    DBInsert --> Success([Return 201 Created & Short Link])
```

*   **Controller code**: Check out `shortenUrl` in [url.controller.js:L7-80](file:///home/kriteshgoud/Documents/NMIMS/projects/url_shortener/backend/src/controllers/url.controller.js#L7-80).
*   **Link format**: Formatted short links default to `BASE_URL` or dynamically fallback to standard request protocol/host details.

---

### 3. Redirection & Async Click Logging Flow

The redirection route `GET /:code` is critical. It must be blazing fast so that visitors redirect immediately. Therefore, click tracking is handled asynchronously.

```mermaid
sequenceDiagram
    autonumber
    actor Visitor as Visitor Client
    participant Redir as Redirect Route
    participant DB as PostgreSQL
    
    Visitor->>Redir: GET /:short_code
    Redir->>DB: Query URL metadata (originalUrl, expires_at)
    
    alt Short Code Not Found
        Redir->>Visitor: 404 Not Found
    else Link Expired
        Redir->>Visitor: 410 Link Gone
    else Valid Link
        par Async Click Log (Fire-and-Forget)
            Redir-->>DB: INSERT INTO clicks (url_id)
        and Immediate Redirect
            Redir->>Visitor: HTTP 302 Redirect to originalUrl
        end
    end
```

*   **Redirection Mechanism** ([url.controller.js:L127-160](file:///home/kriteshgoud/Documents/NMIMS/projects/url_shortener/backend/src/controllers/url.controller.js#L127-160)):
    1.  Validates and fetches short link info. If expired (`expires_at` is in the past), returns a `410 Gone` status code.
    2.  Fires an async database insert query into `clicks` without awaiting (`.catch(err => ...)` prevents unhandled errors), and immediately sends an HTTP `302 Redirect` back to the visitor.

---

### 4. Analytics Visualization Endpoints

The backend exposes an analytical endpoint for the user dashboard, verified by authentication:

*   **Overview Analytics** `GET /api/analytics/:code` ([analytics.controller.js](file:///home/kriteshgoud/Documents/NMIMS/projects/url_shortener/backend/src/controllers/analytics.controller.js)):
    *   Returns URL configuration metadata.
    *   Provides total click count (`COUNT(*)` on `clicks` for that `url_id`).
    *   Performs grouped query for traffic logs over the **last 30 days** (`GROUP BY DATE(clicked_at)`) to display timeline trends on the frontend.

---

## 🛠️ File Structure Reference

Here is a map of the backend directories:

```
backend/
├── package.json                # Project script dependencies
├── src/
│   ├── app.js                  # Express Entry point & main middleware stack
│   ├── config/
│   │   └── db.js               # Database Pool initialization & error listeners
│   ├── controllers/
│   │   ├── analytics.controller.js   # Grouped SQL queries for URL usage telemetry
│   │   ├── auth.controller.js        # User signup/signin & token authentication
│   │   └── url.controller.js         # Core shortening, redirection, and validation
│   ├── middleware/
│   │   └── auth.middleware.js        # JWT header validation middleware
│   ├── models/
│   │   └── schema.sql                # SQL definition for tables and indexing
│   ├── routes/
│   │   ├── analytics.routes.js       # Router registration for analytics charts
│   │   ├── auth.routes.js            # Router registration for register & login
│   │   └── url.routes.js             # Router registration for shortening actions
│   └── utils/
│       └── generateCode.js     # Helper function mapping to nanoid code generator
```

---

> [!TIP]
> **Performance Optimization**: 
> Notice how `redirectUrl` does not `await` the PostgreSQL log insertion block! It executes `pool.query('INSERT INTO clicks (url_id)...')` in the background and issues `res.redirect(302, ...)` right away. This speeds up redirects dramatically, keeping response latency under 10ms.
