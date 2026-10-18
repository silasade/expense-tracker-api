import { Response, NextFunction } from "express";
import { AuthenticateRequest } from "../middlewares/validateUser.middlewares";
import { reportService } from "../services/report.service";
import {
  TGetCategoryBreakdown,
  TGetSummary,
  TGetTrends,
} from "../routes/report.routes";
import { aiService } from "../services/ai.service";

const getCategoryBreakdown = async (
  req: AuthenticateRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { query } = res.locals.validated as TGetCategoryBreakdown;
    const categoryBreakdown = await reportService.getCategoryBreakdown(
      String(req.user?._id),
      query.category,
    );
    return res.status(200).json({
      message: `${query.category} breakdown fetched successfully`,
      success: true,
      data: categoryBreakdown,
    });
  } catch (error) {
    next(error);
  }
};

const getCategories = async (
  req: AuthenticateRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const categories = await reportService.getCategories(String(req.user?._id));
    return res.status(200).json({
      message: `categories breakdown fetched successfully`,
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

const getTrends = async (
  req: AuthenticateRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { query } = res.locals.validated as TGetTrends;
    const trends = await reportService.getTrends(
      String(req.user?._id),
      query.filterBy,
    );
    return res.status(200).json({
      message: `transaction trends fetched successfully`,
      success: true,
      data: trends,
    });
  } catch (error) {
    next(error);
  }
};

const getSummary = async (
  req: AuthenticateRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { query } = res.locals.validated as TGetSummary;
    const summary = await reportService.getSummary(
      String(req.user?._id),
      query,
    );
    return res.status(200).json({
      message: `transaction summary fetched successfully`,
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

const getAiInsights = async (
  req: AuthenticateRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { query } = res.locals.validated as TGetSummary;
    const summary = await reportService.getSummary(
      String(req.user?._id),
      query,
    );
    if (summary.transactionCount === 0) {
      return res.status(400).json({
        success: false,
        message: "No transactions recorded yet to generate AI insights",
      });
    }

    const insights = await aiService.getAIInsights(summary);
    return res.status(200).json({
      success: true,
      message: "AI Insight generated",
      data: insights,
    });
  } catch (error) {
    next(error);
  }
};

export {
  getCategories,
  getCategoryBreakdown,
  getSummary,
  getTrends,
  getAiInsights,
};
