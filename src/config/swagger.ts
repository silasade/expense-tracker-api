export const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "Expense Tracker API",
    version: "1.0.0",
    description:
      "A complete REST API for managing personal expenses, generating dynamic financial reports, and receiving AI-powered spending insights via Google Gemini.",
  },
  servers: [
    {
      url: "http://localhost:5000",
      description: "Local development server",
    },
  ],
  tags: [
    { name: "Health", description: "API health and uptime checks" },
    { name: "Auth", description: "User registration and authentication" },
    { name: "Transactions", description: "Income and expense transactions CRUD" },
    { name: "Reports", description: "Dynamic financial reports and aggregations" },
    { name: "AI Insights", description: "Smart financial tips and clues powered by Gemini" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Enter your JWT token obtained from /api/auth/login",
      },
    },
    schemas: {
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string", example: "Error message details" },
        },
      },
      RegisterInput: {
        type: "object",
        required: ["firstName", "lastName", "email", "password"],
        properties: {
          firstName: { type: "string", example: "Silas" },
          lastName: { type: "string", example: "Ade" },
          email: { type: "string", format: "email", example: "silas@example.com" },
          password: { type: "string", minLength: 6, example: "Secret123" },
        },
      },
      LoginInput: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "silas@example.com" },
          password: { type: "string", example: "Secret123" },
        },
      },
      TransactionInput: {
        type: "object",
        required: ["type", "amount", "category", "description", "date"],
        properties: {
          type: { type: "string", enum: ["income", "expense"], example: "expense" },
          amount: { type: "number", minimum: 0.01, example: 1500.5 },
          currency: { type: "string", example: "NGN", default: "NGN" },
          category: { type: "string", example: "Groceries" },
          description: { type: "string", example: "Weekly supermarket shopping" },
          date: { type: "string", format: "date-time", example: "2026-10-14T10:00:00.000Z" },
        },
      },
      Transaction: {
        type: "object",
        properties: {
          _id: { type: "string", example: "660000000000000000000001" },
          type: { type: "string", enum: ["income", "expense"] },
          amount: { type: "number", example: 1500.5 },
          currency: { type: "string", example: "NGN" },
          category: { type: "string", example: "Groceries" },
          description: { type: "string", example: "Weekly shopping" },
          date: { type: "string", format: "date-time" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      CategoryBreakdown: {
        type: "object",
        properties: {
          category: { type: "string", example: "Food" },
          total: { type: "number", example: 12000 },
          percentage: { type: "number", example: 45.5 },
        },
      },
      Trend: {
        type: "object",
        properties: {
          year: { type: "number", example: 2026 },
          month: { type: "number", example: 10 },
          day: { type: "number", example: 14 },
          income: { type: "number", example: 20000 },
          expense: { type: "number", example: 5000 },
          net: { type: "number", example: 15000 },
        },
      },
      ReportSummary: {
        type: "object",
        properties: {
          totalIncome: { type: "number", example: 100000 },
          totalExpense: { type: "number", example: 45000 },
          netSavings: { type: "number", example: 55000 },
          savingsRate: { type: "number", example: 55 },
          transactionCount: { type: "number", example: 24 },
          categoryBreakdown: {
            type: "array",
            items: { $ref: "#/components/schemas/CategoryBreakdown" },
          },
        },
      },
      AIInsights: {
        type: "object",
        properties: {
          healthScore: { type: "number", example: 85 },
          summaryAssessment: {
            type: "string",
            example: "You are maintaining a strong 55% savings rate with balanced expenses.",
          },
          spendingClues: {
            type: "array",
            items: { type: "string" },
            example: ["Housing accounts for 40% of all expenses."],
          },
          actionableTips: {
            type: "array",
            items: { type: "string" },
            example: ["Meal prep twice a week to reduce dining out costs."],
          },
          potentialMonthlySavings: { type: "number", example: 15000 },
        },
      },
    },
  },
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Check API health",
        responses: {
          200: {
            description: "Server is online and healthy",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    status: { type: "string", example: "OK" },
                    timeStamp: { type: "string", format: "date-time" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterInput" },
            },
          },
        },
        responses: {
          201: { description: "User registered successfully" },
          400: {
            description: "Validation error or email already in use",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
          },
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Log in with email and password",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginInput" },
            },
          },
        },
        responses: {
          200: { description: "Login successful (returns token and user details)" },
          401: {
            description: "Invalid credentials",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
          },
        },
      },
    },
    "/api/transactions": {
      get: {
        tags: ["Transactions"],
        summary: "List transactions with optional filtering",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "type",
            in: "query",
            schema: { type: "string", enum: ["income", "expense"] },
            description: "Filter by transaction type",
          },
          {
            name: "minDate",
            in: "query",
            schema: { type: "string", format: "date" },
            description: "Minimum date filter",
          },
          {
            name: "maxDate",
            in: "query",
            schema: { type: "string", format: "date" },
            description: "Maximum date filter",
          },
        ],
        responses: {
          200: {
            description: "List of transactions",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string" },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Transaction" },
                    },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized" },
        },
      },
      post: {
        tags: ["Transactions"],
        summary: "Create a new transaction",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/TransactionInput" },
            },
          },
        },
        responses: {
          201: { description: "Transaction created successfully" },
          400: { description: "Validation error" },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/api/transactions/{transactionId}": {
      get: {
        tags: ["Transactions"],
        summary: "Get a transaction by ID",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "transactionId",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "MongoDB 24-character ObjectId",
          },
        ],
        responses: {
          200: { description: "Transaction fetched successfully" },
          404: { description: "Transaction not found" },
          401: { description: "Unauthorized" },
        },
      },
      patch: {
        tags: ["Transactions"],
        summary: "Update an existing transaction",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "transactionId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  type: { type: "string", enum: ["income", "expense"] },
                  amount: { type: "number", minimum: 0.01 },
                  currency: { type: "string" },
                  category: { type: "string" },
                  description: { type: "string" },
                  date: { type: "string", format: "date-time" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Transaction updated successfully" },
          404: { description: "Transaction not found" },
          401: { description: "Unauthorized" },
        },
      },
      delete: {
        tags: ["Transactions"],
        summary: "Delete a transaction by ID",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "transactionId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Transaction deleted successfully" },
          404: { description: "Transaction not found" },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/api/reports/summary": {
      get: {
        tags: ["Reports"],
        summary: "Get overall financial summary (totals, savings rate, breakdown)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "startDate",
            in: "query",
            schema: { type: "string", format: "date" },
            description: "Optional start date filter",
          },
          {
            name: "endDate",
            in: "query",
            schema: { type: "string", format: "date" },
            description: "Optional end date filter",
          },
        ],
        responses: {
          200: {
            description: "Financial summary",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string" },
                    data: { $ref: "#/components/schemas/ReportSummary" },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/api/reports/trends": {
      get: {
        tags: ["Reports"],
        summary: "Get daily trends over a time window",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "filterBy",
            in: "query",
            required: true,
            schema: { type: "string", enum: ["7", "30", "365"] },
            description: "Window in days (7, 30, or 365)",
          },
        ],
        responses: {
          200: {
            description: "Chronological daily trends",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string" },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Trend" },
                    },
                  },
                },
              },
            },
          },
          400: { description: "Invalid or missing filterBy" },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/api/reports/categories": {
      get: {
        tags: ["Reports"],
        summary: "Get spending breakdown for all categories with percentages",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "List of all categories with total and percentage",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string" },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/CategoryBreakdown" },
                    },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/api/reports/breakdown": {
      get: {
        tags: ["Reports"],
        summary: "Get spending metrics for a specific single category",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "category",
            in: "query",
            required: true,
            schema: { type: "string" },
            description: "Category name to inspect",
          },
        ],
        responses: {
          200: {
            description: "Category total and percentage of all expenses",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string" },
                    data: {
                      type: "object",
                      properties: {
                        total: { type: "number", example: 15000 },
                        percentage: { type: "number", example: 33.33 },
                      },
                    },
                  },
                },
              },
            },
          },
          400: { description: "Missing category parameter" },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/api/reports/insights": {
      get: {
        tags: ["AI Insights"],
        summary: "Generate AI spending clues, health rating, and tips using Gemini",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "startDate",
            in: "query",
            schema: { type: "string", format: "date" },
            description: "Optional start date filter",
          },
          {
            name: "endDate",
            in: "query",
            schema: { type: "string", format: "date" },
            description: "Optional end date filter",
          },
        ],
        responses: {
          200: {
            description: "AI-generated financial insights and tips",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "AI Insight generated" },
                    data: { $ref: "#/components/schemas/AIInsights" },
                  },
                },
              },
            },
          },
          400: { description: "No transactions recorded yet to generate AI insights" },
          401: { description: "Unauthorized" },
        },
      },
    },
  },
};
