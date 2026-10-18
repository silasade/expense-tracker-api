import { describe, it, expect, vi, beforeEach } from "vitest";
import { reportService } from "../src/services/report.service";
import { Transaction } from "../src/models/Transaction.models";

describe("ReportService Unit Tests", () => {
  const userId = "660000000000000000000001";

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("getCategoryBreakdown", () => {
    it("should calculate category total and percentage properly", async () => {
      vi.spyOn(Transaction, "aggregate")
        .mockResolvedValueOnce([{ _id: null, total: 1000 }]) // overall expenses
        .mockResolvedValueOnce([{ _id: "Food", total: 250 }]); // food expenses

      const result = await reportService.getCategoryBreakdown(userId, "Food");

      expect(result).toEqual({
        total: 250,
        percentage: 25,
      });
    });

    it("should return 0 percentage when overallTotal is 0", async () => {
      vi.spyOn(Transaction, "aggregate")
        .mockResolvedValueOnce([]) // empty overall
        .mockResolvedValueOnce([]); // empty category

      const result = await reportService.getCategoryBreakdown(userId, "Food");

      expect(result).toEqual({
        total: 0,
        percentage: 0,
      });
    });
  });

  describe("getCategories", () => {
    it("should aggregate categories and calculate percentage of total", async () => {
      const mockCategoryTotals = [
        { _id: "Food", total: 400 },
        { _id: "Rent", total: 600 },
      ];

      vi.spyOn(Transaction, "aggregate").mockResolvedValueOnce(
        mockCategoryTotals,
      );

      const result = await reportService.getCategories(userId);

      expect(result).toEqual([
        { category: "Food", total: 400, percentage: 40 },
        { category: "Rent", total: 600, percentage: 60 },
      ]);
    });

    it("should handle empty categories", async () => {
      vi.spyOn(Transaction, "aggregate").mockResolvedValueOnce([]);

      const result = await reportService.getCategories(userId);

      expect(result).toEqual([]);
    });
  });

  describe("getTrends", () => {
    it("should aggregate trends and map year, month, day, income, expense, and net", async () => {
      const mockTrendResults = [
        {
          _id: { year: 2026, month: 10, day: 14 },
          income: 2000,
          expense: 500,
        },
      ];

      vi.spyOn(Transaction, "aggregate").mockResolvedValueOnce(
        mockTrendResults,
      );

      const result = await reportService.getTrends(userId, "7");

      expect(result).toEqual([
        {
          year: 2026,
          month: 10,
          day: 14,
          income: 2000,
          expense: 500,
          net: 1500,
        },
      ]);
    });
  });

  describe("getSummary", () => {
    it("should aggregate total income and expense and combine with category breakdown", async () => {
      const mockSummaryAggregation = [
        {
          _id: null,
          totalIncome: 10000,
          totalExpense: 4000,
          transactionCount: 20,
        },
      ];

      const mockCategories = [{ category: "Bills", total: 4000, percentage: 100 }];

      vi.spyOn(Transaction, "aggregate").mockResolvedValueOnce(
        mockSummaryAggregation,
      );
      vi.spyOn(reportService, "getCategories").mockResolvedValueOnce(
        mockCategories,
      );

      const result = await reportService.getSummary(userId, {
        startDate: new Date("2026-01-01"),
        endDate: new Date("2026-01-31"),
      });

      expect(result).toEqual({
        totalIncome: 10000,
        totalExpense: 4000,
        netSavings: 6000,
        savingsRate: 60,
        transactionCount: 20,
        categoryBreakdown: mockCategories,
      });
    });

    it("should handle empty summary results with zeroes", async () => {
      vi.spyOn(Transaction, "aggregate").mockResolvedValueOnce([]);
      vi.spyOn(reportService, "getCategories").mockResolvedValueOnce([]);

      const result = await reportService.getSummary(userId, {});

      expect(result).toEqual({
        totalIncome: 0,
        totalExpense: 0,
        netSavings: 0,
        savingsRate: 0,
        transactionCount: 0,
        categoryBreakdown: [],
      });
    });
  });
});
