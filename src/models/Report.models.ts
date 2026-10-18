export interface ICategoryBreakdown {
  category: string;
  total: number;
  percentage: number;
  count: number;
}

export interface IMonthlyTrend {
  year: number;
  month: number;
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
