import {
  ICategoryBreakdown,
  IMonthlyTrend,
  IReportSummary,
} from "../models/Report.models";
import { toObjectId, Transaction } from "../models/Transaction.models";
class ReportService {
  public getCategoryBreakdown = async (
    userId: string,
    category: string,
  ): Promise<Omit<ICategoryBreakdown, "category">> => {
    const breakdown: Omit<ICategoryBreakdown, "category"> = {
      total: 0,
      percentage: 0,
    };
    const totalExpenseResult = await Transaction.aggregate([
      {
        $match: {
          user: toObjectId(userId),
          type: "expense",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    const categoryResult = await Transaction.aggregate([
      {
        $match: {
          user: toObjectId(userId),
          type: "expense",
          category: category,
        },
      },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
        },
      },
    ]);
    const overallTotal = totalExpenseResult[0]?.total || 0;
    const categoryTotal = categoryResult[0]?.total || 0;

    breakdown.total = categoryTotal;
    breakdown.percentage =
      overallTotal > 0 ? (categoryTotal / overallTotal) * 100 : 0;
    return breakdown;
  };

  public getCategories = async (
    userId: string,
  ): Promise<ICategoryBreakdown[]> => {
    let breakdown: ICategoryBreakdown[] = [];

    const categoryTotal = await Transaction.aggregate([
      {
        $match: {
          user: toObjectId(userId),
          type: "expense",
        },
      },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
        },
      },
    ]);
    const grandTotal = categoryTotal.reduce((sum, item) => sum + item.total, 0);
    breakdown = categoryTotal.map((item) => ({
      category: item._id,
      total: item.total,
      percentage: grandTotal > 0 ? (item.total / grandTotal) * 100 : 0,
    }));
    return breakdown;
  };
  public getTrends = async (
    userId: string,
    filterBy?: 7 | 30 | 365,
  ): Promise<IMonthlyTrend[]> => {
    const matchStage: any = {
      user: toObjectId(userId),
    };

    if (filterBy) {
      const now = new Date();
      const pastDate = new Date();
      pastDate.setDate(now.getDate() - filterBy);

      matchStage.date = {
        $gte: pastDate, // from 7 days ago
        $lte: now, // up to right now
      };
    }

    const trend = await Transaction.aggregate([
      {
        $match: matchStage,
      },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
            day: { $dayOfMonth: "$date" },
          },
          income: {
            $sum: {
              $cond: [{ $eq: ["$type", "income"] }, "$amount", 0],
            },
          },
          expense: {
            $sum: {
              $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0],
            },
          },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);

    return trend.map((item) => ({
      year: item._id.year,
      month: item._id.month,
      day: item._id.day,
      income: item.income,
      expense: item.expense,
      net: item.income - item.expense,
    }));
  };
  public getSummary = async (
    date: { startDate?: Date; endDate?: Date },
    userId: string,
  ): Promise<Omit<IReportSummary, "period">> => {
    const matchStage: any = { user: toObjectId(userId) };
    if (date.startDate || date.endDate) {
      matchStage.date = {};
      if (date.startDate) matchStage.date.$gte = date.startDate;
      if (date.endDate) matchStage.date.$lte = date.endDate;
    }
    const [summaryResult] = await Transaction.aggregate([
      {
        $match: matchStage,
      },
      {
        $group: {
          _id: null,
          totalIncome: {
            $sum: {
              $cond: [{ $eq: ["$type", "income"] }, "$amount", 0],
            },
          },
          totalExpense: {
            $sum: {
              $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0],
            },
          },
          transactionCount: { $sum: 1 },
        },
      },
    ]);
    const totalIncome = summaryResult?.totalIncome || 0;
    const totalExpense = summaryResult?.totalExpense || 0;
    const netSavings = totalIncome - totalExpense;
    const savingsRate =
      totalIncome > 0
        ? Number(((netSavings / totalIncome) * 100).toFixed(2))
        : 0;
    const transactionCount = summaryResult?.transactionCount || 0;
    const categoryBreakdown = await this.getCategories(userId);
    return {
      totalIncome,
      totalExpense,
      netSavings,
      savingsRate,
      transactionCount,
      categoryBreakdown,
    };
  };
}

export const reportService = new ReportService();
