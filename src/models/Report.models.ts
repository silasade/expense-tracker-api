export interface ICategoryBreakdown {
  category: string;
  total: number;
  percentage: number;
}

export interface IMonthlyTrend {
  year: number;
  month: number;
  day: number;
  income: number;
  expense: number;
  net: number;
}

export interface IReportSummary {
  period: {
    startDate?: Date;
    endDate?: Date;
  };
  totalIncome: number;
  totalExpense: number;
  netSavings: number; // totalIncome - totalExpense
  savingsRate: number; // percentage of income saved (0 if totalIncome <= 0)
  transactionCount: number;
  categoryBreakdown: ICategoryBreakdown[];
}

export interface IAIInsights {
  healthScore: number; // 1 - 100 rating
  summaryAssessment: string;
  spendingClues: string[]; // Patterns detected (e.g. "Dining out represents 42% of total spend")
  actionableTips: string[]; // Specific tips to reduce spending
  potentialMonthlySavings?: number;
}
