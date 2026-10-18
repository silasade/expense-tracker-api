import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import { createApp } from "../src/app";
import { userService } from "../src/services/user.services";
import { reportService } from "../src/services/report.service";
import { aiService } from "../src/services/ai.service";

describe("Report Routes (/api/reports)", () => {
  const app = createApp();
  process.env.JWT_SECRET = process.env.JWT_SECRET || "fallBackSecret";
  const secretKey = process.env.JWT_SECRET;

  const mockUser = {
    _id: "660000000000000000000001",
    email: "silas@example.com",
    firstName: "Silas",
    lastName: "Ade",
  };

  const validToken = jwt.sign(
    { id: mockUser._id, email: mockUser.email },
    secretKey,
  );

  const authHeader = `Bearer ${validToken}`;

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(userService, "findUserById").mockResolvedValue(mockUser as any);
  });

  describe("Authentication Guard", () => {
    it("should reject requests without token with 401", async () => {
      const response = await request(app).get("/api/reports/summary");

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        success: false,
        message: "Request must be Authorized",
      });
    });

    it("should reject requests with invalid token with 401", async () => {
      const response = await request(app)
        .get("/api/reports/summary")
        .set("Authorization", "Bearer invalid.token");

      expect(response.status).toBe(401);
      expect(response.body).toEqual(
        expect.objectContaining({
          success: false,
          message: "Invalid or expired token",
        }),
      );
    });
  });

  describe("GET /api/reports/summary", () => {
    it("should fetch summary successfully without date query", async () => {
      const mockSummary = {
        totalIncome: 5000,
        totalExpense: 2000,
        netSavings: 3000,
        savingsRate: 60,
        transactionCount: 15,
        categoryBreakdown: [
          { category: "Food", total: 1200, percentage: 60 },
          { category: "Rent", total: 800, percentage: 40 },
        ],
      };

      const getSummarySpy = vi
        .spyOn(reportService, "getSummary")
        .mockResolvedValue(mockSummary);

      const response = await request(app)
        .get("/api/reports/summary")
        .set("Authorization", authHeader);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: "transaction summary fetched successfully",
        data: mockSummary,
      });
      expect(getSummarySpy).toHaveBeenCalledWith(mockUser._id, {});
    });

    it("should parse and pass startDate and endDate query params", async () => {
      const mockSummary = {
        totalIncome: 1000,
        totalExpense: 500,
        netSavings: 500,
        savingsRate: 50,
        transactionCount: 4,
        categoryBreakdown: [],
      };

      const getSummarySpy = vi
        .spyOn(reportService, "getSummary")
        .mockResolvedValue(mockSummary);

      const response = await request(app)
        .get("/api/reports/summary?startDate=2026-01-01&endDate=2026-01-31")
        .set("Authorization", authHeader);

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockSummary);
      expect(getSummarySpy).toHaveBeenCalledWith(
        mockUser._id,
        expect.objectContaining({
          startDate: expect.any(Date),
          endDate: expect.any(Date),
        }),
      );
    });
  });

  describe("GET /api/reports/trends", () => {
    it("should return 400 when filterBy is missing", async () => {
      const response = await request(app)
        .get("/api/reports/trends")
        .set("Authorization", authHeader);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should return 400 when filterBy is invalid value", async () => {
      const response = await request(app)
        .get("/api/reports/trends?filterBy=90")
        .set("Authorization", authHeader);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should fetch trends successfully with valid filterBy", async () => {
      const mockTrends = [
        {
          year: 2026,
          month: 10,
          day: 14,
          income: 1000,
          expense: 200,
          net: 800,
        },
      ];

      const getTrendsSpy = vi
        .spyOn(reportService, "getTrends")
        .mockResolvedValue(mockTrends);

      const response = await request(app)
        .get("/api/reports/trends?filterBy=7")
        .set("Authorization", authHeader);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: "transaction trends fetched successfully",
        data: mockTrends,
      });
      expect(getTrendsSpy).toHaveBeenCalledWith(mockUser._id, "7");
    });
  });

  describe("GET /api/reports/categories", () => {
    it("should fetch all categories breakdown successfully", async () => {
      const mockCategories = [
        { category: "Groceries", total: 450, percentage: 45 },
        { category: "Entertainment", total: 550, percentage: 55 },
      ];

      const getCategoriesSpy = vi
        .spyOn(reportService, "getCategories")
        .mockResolvedValue(mockCategories);

      const response = await request(app)
        .get("/api/reports/categories")
        .set("Authorization", authHeader);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: "categories breakdown fetched successfully",
        data: mockCategories,
      });
      expect(getCategoriesSpy).toHaveBeenCalledWith(mockUser._id);
    });
  });

  describe("GET /api/reports/breakdown", () => {
    it("should return 400 when category query parameter is missing", async () => {
      const response = await request(app)
        .get("/api/reports/breakdown")
        .set("Authorization", authHeader);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should fetch category breakdown successfully when valid", async () => {
      const mockBreakdown = {
        total: 750,
        percentage: 35,
      };

      const getCategoryBreakdownSpy = vi
        .spyOn(reportService, "getCategoryBreakdown")
        .mockResolvedValue(mockBreakdown);

      const response = await request(app)
        .get("/api/reports/breakdown?category=Utilities")
        .set("Authorization", authHeader);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: "Utilities breakdown fetched successfully",
        data: mockBreakdown,
      });
      expect(getCategoryBreakdownSpy).toHaveBeenCalledWith(
        mockUser._id,
        "Utilities",
      );
    });
  });

  describe("GET /api/reports/insights", () => {
    it("should return 400 if user has no transactions to analyze", async () => {
      vi.spyOn(reportService, "getSummary").mockResolvedValue({
        totalIncome: 0,
        totalExpense: 0,
        netSavings: 0,
        savingsRate: 0,
        transactionCount: 0,
        categoryBreakdown: [],
      });

      const response = await request(app)
        .get("/api/reports/insights")
        .set("Authorization", authHeader);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        message: "No transactions recorded yet to generate AI insights",
      });
    });

    it("should generate and return AI insights when transactions exist", async () => {
      const mockSummary = {
        totalIncome: 5000,
        totalExpense: 2000,
        netSavings: 3000,
        savingsRate: 60,
        transactionCount: 10,
        categoryBreakdown: [{ category: "Food", total: 1000, percentage: 50 }],
      };

      const mockInsights = {
        healthScore: 85,
        summaryAssessment: "Great job maintaining a 60% savings rate.",
        spendingClues: ["50% of your expenses go towards Food."],
        actionableTips: ["Consider buying groceries in bulk to lower food costs."],
        potentialMonthlySavings: 200,
      };

      vi.spyOn(reportService, "getSummary").mockResolvedValue(mockSummary);
      const getAIInsightsSpy = vi
        .spyOn(aiService, "getAIInsights")
        .mockResolvedValue(mockInsights);

      const response = await request(app)
        .get("/api/reports/insights")
        .set("Authorization", authHeader);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: "AI Insight generated",
        data: mockInsights,
      });
      expect(getAIInsightsSpy).toHaveBeenCalledWith(mockSummary);
    });
  });
});
