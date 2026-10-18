# Expense Tracker API

A production-ready, highly structured RESTful API built with **Node.js**, **Express 5**, **TypeScript**, and **MongoDB**. Features dynamic on-the-fly financial reporting, AI-powered spending insights via **Google Gemini**, comprehensive **Swagger / OpenAPI** documentation, and enforced database architectural boundaries.

---

## Key Features

- **Authentication & Security**: JWT-based authentication with bcrypt password hashing, `helmet` security headers, and strict CORS policies.
- **Transaction Management**: Full CRUD operations for income and expense transactions with date, category, and type filtering.
- **Dynamic Reporting (No Stale Data)**: High-performance MongoDB aggregation pipelines computing summaries, category distributions, and daily cash flow trends on the fly.
- **AI Financial Insights**: Intelligent financial health scoring, spending clues, and actionable savings advice powered by **Google Gemini** (`gemini-2.5-flash`).
- **Interactive Swagger Docs**: Live API testing and OpenAPI 3.0 documentation served at `/api-docs`.
- **Architectural Boundary Enforcement**: Automated CI script enforcing clean separation of concerns (only services interact with database models).
- **100% Test Coverage**: Comprehensive integration and unit testing suite powered by **Vitest** and **Supertest** (63+ tests).

---

## Request & Response Lifecycle

The diagram below illustrates how an incoming HTTP request flows through authentication guards, input validation, the service layer, and down to MongoDB and Gemini AI before returning a structured JSON response:

```mermaid
sequenceDiagram
    autonumber
    actor Client as Client / Frontend
    participant App as Express Middleware (CORS / Helmet / JSON)
    participant Auth as Auth Guard (validateUser)
    participant Validator as Validation (Zod)
    participant Controller as Controller
    participant Service as Service Layer
    participant DB as MongoDB (Aggregation)
    participant Gemini as Google Gemini AI
    participant ErrorHandler as Error Handler

    Client->>App: HTTP Request (e.g., GET /api/reports/insights)
    App->>Auth: Pass through security headers & JSON parser

    alt Route requires Authentication
        Auth->>Auth: Verify JWT Bearer Token & fetch User
        alt Invalid or Missing Token
            Auth-->>Client: 401 Unauthorized { success: false, message: ... }
        end
    end

    Auth->>Validator: Validate Request Body / Query Params (Zod)
    alt Validation Fails
        Validator-->>Client: 400 Bad Request { success: false, errors: [...] }
    end

    Validator->>Controller: Invokes Controller Handler
    Controller->>Service: Call business logic (e.g. getSummary / getAIInsights)

    alt Database Query
        Service->>DB: Execute query or aggregation pipeline
        DB-->>Service: Return documents or aggregation result
    end

    alt AI Insights Requested
        Service->>Gemini: Send prompt with financial metrics (JSON mode)
        Gemini-->>Service: Return structured financial tips & clues
    end

    alt Uncaught Exception
        Service-->>ErrorHandler: Error propagated via next(error)
        ErrorHandler-->>Client: 500 / Custom status { success: false, message: ... }
    end

    Service-->>Controller: Return formatted DTO result
    Controller-->>Client: 200 / 201 OK { success: true, message: ..., data: ... }
```

---

## Architectural Boundaries

To prevent tight coupling and maintain clean separation of concerns, this project strictly enforces layered architecture via automated tests (`tests/architecture.test.ts`):

```mermaid
flowchart TD
    Client["Client Request"] --> Routes["Routes (Validation & Guards)"]
    Routes --> Controllers["Controllers (Req/Res Handling)"]
    Controllers --> Services["Services (Business Logic)"]
    Services --> Models["Models (Mongoose Schemas & Aggregations)"]
    Services --> Gemini["AI Service (Google Gemini)"]
    Models --> MongoDB[("MongoDB Database")]

    style Routes fill:#3b82f6,stroke:#1d4ed8,color:#fff
    style Controllers fill:#8b5cf6,stroke:#6d28d9,color:#fff
    style Services fill:#10b981,stroke:#047857,color:#fff
    style Models fill:#f59e0b,stroke:#b45309,color:#fff
    style Gemini fill:#ec4899,stroke:#be185d,color:#fff
```

- **Controllers** are never permitted to import or query database models directly.
- **Services** are the sole layer permitted to interface with database models.
- **Direct `mongoose` imports** are restricted exclusively to `src/models/` and `src/config/db.ts`.

---

## API Reference

Interactive documentation is available at **`/api-docs`**. Below is a summary of all available routes:

### 1. Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Register a new user | No |
| `POST` | `/api/auth/login` | Authenticate and obtain JWT token | No |

### 2. Transactions (`/api/transactions`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/transactions` | List transactions (supports `type`, `minDate`, `maxDate` filters) | Yes |
| `POST` | `/api/transactions` | Create an income or expense transaction | Yes |
| `GET` | `/api/transactions/:id` | Get single transaction details | Yes |
| `PATCH` | `/api/transactions/:id` | Update transaction fields | Yes |
| `DELETE` | `/api/transactions/:id` | Delete a transaction | Yes |

### 3. Reports & Analytics (`/api/reports`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/reports/summary` | Financial overview (`totalIncome`, `totalExpense`, `netSavings`, `savingsRate`, breakdown) | Yes |
| `GET` | `/api/reports/trends` | Daily cash flow trends (`filterBy=7`, `30`, or `365`) | Yes |
| `GET` | `/api/reports/categories` | Spending distribution across all categories with percentages | Yes |
| `GET` | `/api/reports/breakdown` | Metrics for a single category (`?category=Food`) | Yes |
| `GET` | `/api/reports/insights` | AI-generated financial clues, health score, and saving tips | Yes |

### 4. Health & Docs
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/health` | Server uptime and health status | No |
| `GET` | `/api-docs` | Interactive Swagger UI documentation | No |

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas URI)
- [Google AI Studio API Key](https://aistudio.google.com/) (Free)

### 1. Clone the repository
```bash
git clone https://github.com/silasade/expense-tracker-api.git
cd expense-tracker-api
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Copy the example environment file and fill in your credentials:
```bash
cp .env.example .env
```
Edit `.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/expense-tracker
JWT_SECRET=your_super_secret_jwt_key
GEMINI_API_KEY=your_google_gemini_api_key
```

### 4. Start the application
```bash
# Development mode (with live reload via tsx)
npm run dev

# Production build & run
npm run build
npm start
```

---

## Testing

The test suite runs with **Vitest** and validates unit logic, integration routes, middleware, and architecture boundaries:

```bash
# Run all test suites
npm test

# Run tests in watch mode
npm run test:watch

# Enforce database boundary checks independently
npm run check:db-boundary
```

---

## License
This project is open-source under the [ISC License](LICENSE).
