import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import {
  IAIInsights,
  IReportSummary,
} from "../models/Report.models";
dotenv.config();

class AIService {
  private GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  private ai = new GoogleGenAI({ apiKey: this.GEMINI_API_KEY });

  public getAIInsights = async (
    reportSummary: Omit<IReportSummary,"period">,
  ): Promise<IAIInsights> => {
    const prompt = `
You are an expert personal financial advisor. Analyze the following user financial summary and category breakdown to provide actionable insights.

Financial Overview:
- Total Income: ${reportSummary.totalIncome}
- Total Expense: ${reportSummary.totalExpense}
- Net Savings: ${reportSummary.netSavings}
- Savings Rate: ${reportSummary.savingsRate}%
- Transaction Count: ${reportSummary.transactionCount}

Category Spending Breakdown:
${JSON.stringify(reportSummary.categoryBreakdown, null, 2)}

Provide your response strictly as a JSON object adhering to this schema:
{
  "healthScore": <number between 1 and 100 based on savings rate and spending balance>,
  "summaryAssessment": "<concise 2-sentence summary of their financial health>",
  "spendingClues": ["<key observation 1>", "<key observation 2>"],
  "actionableTips": ["<specific tip 1>", "<specific tip 2>", "<specific tip 3>"],
  "potentialMonthlySavings": <estimated number they could save by following tips>
}
`;

    const response = await this.ai.models.generateContent({
      model: "gemini-3.8-flash",
      config: { responseMimeType: "application/json" },
      contents: prompt,
    });
    if (!response.text) {
      throw new Error("Failed to generate AI insights from Gemini");
    }
    return JSON.parse(response.text) as IAIInsights;
  };
}

export const aiService = new AIService();
