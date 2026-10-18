import { describe, it, expect, vi, beforeEach } from "vitest";
import { aiService } from "../src/services/ai.service";

describe("AIService Unit Tests", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const mockSummary = {
    totalIncome: 10000,
    totalExpense: 4000,
    netSavings: 6000,
    savingsRate: 60,
    transactionCount: 20,
    categoryBreakdown: [
      { category: "Housing", total: 2500, percentage: 62.5 },
      { category: "Food", total: 1500, percentage: 37.5 },
    ],
  };

  it("should generate and parse insights successfully from Gemini response", async () => {
    const mockInsightData = {
      healthScore: 82,
      summaryAssessment: "Strong financial foundation with a 60% savings rate.",
      spendingClues: [
        "Housing represents the majority of your expenses at 62.5%.",
      ],
      actionableTips: [
        "Review recurring utilities to find minor savings.",
        "Maintain current savings pace into high-yield accounts.",
      ],
      potentialMonthlySavings: 150,
    };

    vi.spyOn((aiService as any).ai.models, "generateContent").mockResolvedValue({
      text: JSON.stringify(mockInsightData),
    });

    const result = await aiService.getAIInsights(mockSummary);

    expect(result).toEqual(mockInsightData);
    expect((aiService as any).ai.models.generateContent).toHaveBeenCalledWith({
      model: "gemini-2.5-flash",
      config: { responseMimeType: "application/json" },
      contents: expect.stringContaining("Total Income: 10000"),
    });
  });

  it("should throw an error if response text is missing", async () => {
    vi.spyOn((aiService as any).ai.models, "generateContent").mockResolvedValue({
      text: null,
    });

    await expect(aiService.getAIInsights(mockSummary)).rejects.toThrow(
      "Failed to generate AI insights from Gemini",
    );
  });
});
